import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
import type { Color, type Feature, type MapMouseEvent, MarkerOptions, Popup, Source, StyleLayer } from 'maplibre-gl'
import { Marker } from 'maplibre-gl'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)
  const mapLoaded = ref<boolean>(false)
  const markers: { [id: string]: Marker } = []

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

  function removeGamePolygon() {
    const map = getMap()
    const sourceId = 'GamePolygonSource'
    const layerId = 'GamePolygonLayer'
    const layer: StyleLayer | undefined = map.getLayer(layerId)
    if (layer !== undefined) {
      map.removeLayer(layerId)
    }
    const source: Source | undefined = map.getSource(sourceId)
    if (source !== undefined) {
      map.removeSource(sourceId)
    }
  }

  function drawGamePolygon(polygon: GeoJsonProperties | undefined) {
    if (polygon === undefined) {
      removeGamePolygon()
      return
    }

    const sourceId = 'GamePolygonSource'
    const layerId = 'GamePolygonLayer'
    const map = getMap()
    const source: Source | undefined = map.getSource(sourceId)
    if (source === undefined) {
      map.addSource(sourceId, { type: 'geojson', data: polygon })
    }
    else {
      source.setData(polygon)
    }

    const layer: StyleLayer | undefined = map.getLayer(layerId)
    // todo, add outline and hatch
    if (layer === undefined) {
      map.addLayer({
        id: layerId,
        type:
          'fill',
        source: sourceId,
        paint: {
          'fill-color': '#000050',
          'fill-opacity': 0.5,
        },
      })
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

  return {
    mapInstance,
    mapLoaded,
    getMap,
    setMapInstance,
    onMapLoaded,
    addMarker,
    removeMarker,
    getMarker,
    setBearing,
    resetOrientation,
    invertGeometry,
    moveMarker,
    drawGamePolygon,
  }
})
