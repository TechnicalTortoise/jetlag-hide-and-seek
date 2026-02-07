import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
import type { Color, type Feature, type MapMouseEvent, MarkerOptions, Popup } from 'maplibre-gl'
// import { map } from '@indoorequal/vue-maplibre-gl'
import { buffer, circle, difference, featureCollection, intersect, simplify, union } from '@turf/turf'
import { Marker } from 'maplibre-gl'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)
  const mapLoaded = ref<boolean>(false)
  const markers: { [id: string]: Marker } = []

  let colorIndex: number = 0

  async function onMapLoaded() {
    const map = getMap()
    const image = await map.loadImage('hatch_pattern.png')
    map.addImage('hatch-pattern', image.data)
  }

  function getMap() {
    if (mapInstance.value === undefined) {
      throw new Error('map instance was undefined')
    }
    if (mapInstance.value.map === undefined) {
      throw new Error('map was undefined')
    }
    return mapInstance.value?.map
  }

  function setMapInstance(theMapInstance: MapInstance) {
    mapInstance.value = theMapInstance
  }
  function invertGeometry(feature: GeoJsonProperties) {
    const coords = feature.geometry.coordinates

    // Check if already inverted (first ring is the world boundary)
    const firstRing = coords[0]
    const isWorldBoundary
      = firstRing.length === 5
        && firstRing[0][0] === -180 && firstRing[0][1] === -90
        && firstRing[1][0] === 180 && firstRing[1][1] === -90
        && firstRing[2][0] === 180 && firstRing[2][1] === 90
        && firstRing[3][0] === -180 && firstRing[3][1] === 90

    if (isWorldBoundary && coords.length > 1) {
      // Already inverted - extract the original polygon (second ring)
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords[1]], // Return the hole as the main polygon
        },
      }
    }
    else {
      // Not inverted - wrap with world boundary
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
            coords[0],
          ],
        },
      }
    }
  }

  function createRadarPolygon(radius: number, units: Units, lnglat: [number, number], hit: boolean): GeoJsonProperties {
    const c: GeoJsonProperties = circle(lnglat, radius, { steps: 64, units })
    return hit ? c : invertGeometry(c)
  }

  function drawQuestion(q: Question) {
    const map = getMap()
    if (map === undefined) {
      return
    }
    if (map.getSource(q.mapLayerId) === undefined) {
      addQuestionSource(q)
    }
    if (map.getLayer(q.mapLayerId) === undefined) {
      addQuestionLayer(q)
    }
  }

  function hideQuestion(q: Question) {
    const map = getMap()
    if (map === undefined) {
      return
    }
    if (map.getLayer(q.mapLayerId) !== undefined) {
      removeQuestionLayer(q)
    }
  }

  function addQuestionSource(q: Question) {
    const map = getMap()
    let source = map.getSource(q.mapLayerId)
    if (source === undefined) {
      map.addSource(q.mapLayerId, { type: 'geojson', data: q.cumulativePolygon })
      return
    }
    source.setData(q.cumulativePolygon)
  }

  function removeQuestionSource(q: Question) {
    const map = getMap()
    map.removeSource(q.mapLayerId)
  }

  function addQuestionLayer(q: Question) {
    const map = getMap()
    // const colors = ['#000000', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF']
    const colors = ['#000050']

    colorIndex = (q.id) % colors.length
    map.addLayer({
      id: q.mapLayerId,
      type:
        'fill',
      source: q.mapLayerId,
      paint: {
        'fill-color': colors[colorIndex],
        'fill-opacity': 0.5,
        // 'fill-pattern': 'hatch-pattern',

      },
    })
  }

  function removeQuestionLayer(q: Question) {
    const map = getMap()
    if (map.getLayer(q.mapLayerId)) {
      map.removeLayer(q.mapLayerId)
    }
  }

  function calculatePolygons(questions: Question[]) {
    const fullWorld: GeoJsonProperties = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          // Outer ring - covers the world
          [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ],
        ],
      },
    }
    let currentRemainingArea: GeoJsonProperties = fullWorld
    let cumulativePolygon: GeoJsonProperties | undefined
    for (let i = 0; i < questions.length; i += 1) {
      const q: Question | undefined = questions[i]
      if (q === undefined) {
        continue
      }

      if (q.fullPolygon === undefined) {
        continue
      }

      // q.exclusivePolygon = difference(featureCollection([currentRemainingArea, q.fullPolygon]))
      // currentRemainingArea = difference(featureCollection([currentRemainingArea, q.exclusivePolygon]))

      if (cumulativePolygon === undefined) {
        cumulativePolygon = invertGeometry(q.fullPolygon)
      }
      else {
        cumulativePolygon = union(featureCollection([cumulativePolygon, invertGeometry(q.fullPolygon)]))
      }
      q.cumulativePolygon = cumulativePolygon
      addQuestionSource(q)
    }
  }

  function addMarker(id: string, lnglat: [number, number], draggable: boolean, dragCallback: () => void | undefined = undefined, color: string = '#52c5ff', clickCallback: () => void | undefined = undefined) {
    const map = getMap()
    if (map === undefined) {
      return
    }
    const m = new Marker({ draggable, color }).setLngLat(lnglat).addTo(map)
    if (draggable && dragCallback !== undefined) {
      m.on('drag', () => {
        dragCallback()
      })
    }

    if (clickCallback !== undefined) {
      m.getElement().addEventListener('click', (e) => {
        clickCallback()
        e.stopImmediatePropagation()
        // tood not working
      })
    }

    markers[id] = m
  }

  function moveMarker(id: string, lnglat: [number, number]) {
    markers[id]?.setLngLat(lnglat)
  }

  function removeMarker(id: string) {
    markers[id]?.remove()
  }

  function getMarker(id: string): Marker {
    return markers[id]
  }

  function setBearing(bearing: number) {
    const map = getMap()
    map.setBearing(bearing)
  }

  function resetOrientation() {
    const map = getMap()
    map.setBearing(0)
    map.setPitch(0)
  }

  return { mapInstance, mapLoaded, getMap, setMapInstance, calculatePolygons, drawQuestion, hideQuestion, onMapLoaded, addMarker, removeMarker, getMarker, setBearing, resetOrientation, invertGeometry, removeQuestionSource, removeQuestionLayer, moveMarker }
})
