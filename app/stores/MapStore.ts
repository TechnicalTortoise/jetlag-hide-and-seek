import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
import type { Feature, MapMouseEvent } from 'maplibre-gl'
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
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          feature.geometry.coordinates[0],
        ],
      },
    }
  }

  function drawQuestion(q: Question) {
    const map = getMap()
    if (map.getLayer(q.mapLayerId) === undefined) {
      addQuestionLayer(q)
    }
  }

  function hideQuestion(q: Question) {
    const map = getMap()
    if (map.getLayer(q.mapLayerId) !== undefined) {
      removeQuestionLayer(q)
    }
  }

  function addQuestionSource(q: Question) {
    const map = getMap()
    let source = map.getSource(q.mapLayerId)
    if (source === undefined) {
      map.addSource(q.mapLayerId, { type: 'geojson', data: q.exclusivePolygon })
      return
    }
    source.setData(q.exclusivePolygon)
  }

  function removeQuestionSource(q: Question) {
    const map = getMap()
    map.removeSource(q.mapLayerId)
  }

  function addQuestionLayer(q: Question) {
    const map = getMap()
    // const colors = ['#000000', '#00FF00', '#FF0000', '#0000FF', '#FFFF00', '#FF00FF']
    const colors = ['#000000']

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
    map.removeLayer(q.mapLayerId)
  }

  function calculatePolygons(questions: Question[]) {
    console.warn('questions length = ', questions.length)
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
    for (let i = 0; i < questions.length; i += 1) {
      const q: Question | undefined = questions[i]
      if (q === undefined) {
        continue
      }

      if (q.type === 'Radar') {
        const r = q.question
        if (r !== undefined) {
          if (q.fullPolygon !== undefined) {
            if (r.hit) {
              q.exclusivePolygon = difference(featureCollection([currentRemainingArea, q.fullPolygon]))
            }
            else {
              q.exclusivePolygon = difference(featureCollection([currentRemainingArea, invertGeometry(q.fullPolygon)]))
            }
            addQuestionSource(q)

            currentRemainingArea = difference(featureCollection([currentRemainingArea, q.exclusivePolygon]))
          }
        }
      }
      else if (q.type === 'Thermometer') {
        q.exclusivePolygon = difference(featureCollection([currentRemainingArea, q.fullPolygon]))

        // q.exclusivePolygon = q.fullPolygon
        addQuestionSource(q)
        currentRemainingArea = difference(featureCollection([currentRemainingArea, q.exclusivePolygon]))
      }
      // const buffered = buffer(currentRemainingArea as Feature, 100, { units: 'meters' })
      // currentRemainingArea = buffered
      // simplify(currentRemainingArea, { tolerance: 0.0001, highQuality: false, mutate: true })
    }
  }

  function addMarker(id: string, lnglat: [number, number], draggable: boolean, dragCallback: () => void | undefined = undefined) {
    const map = getMap()
    const m = new Marker({ draggable }).setLngLat(lnglat).addTo(map)
    if (draggable && dragCallback !== undefined) {
      m.on('drag', () => {
        dragCallback()
      })
    }

    markers[id] = m
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

  return { mapInstance, mapLoaded, getMap, setMapInstance, calculatePolygons, drawQuestion, hideQuestion, onMapLoaded, addMarker, removeMarker, getMarker, setBearing, resetOrientation }
})
