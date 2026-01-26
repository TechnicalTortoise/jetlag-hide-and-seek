import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
import type { LngLatLike } from 'maplibre-gl'
import { circle } from '@turf/turf'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)
  const mapLoaded = ref<boolean>(false)
  let colorIndex: number = 0

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

  function drawPolygon(poly: GeoJsonProperties, id: string) {
    const map = getMap()
    map.addSource(id, { type: 'geojson', data: poly })
    const colors = ['#00FF00', '#FF0000', '#0000FF', '#FFFF00']
    map.addLayer({
      id,
      type:
        'fill',
      source: id,
      paint: {
        'fill-color': colors[colorIndex],
        'fill-opacity': 0.2,
        // 'fill-outline-color': '#00FF00',
      },
    })
    colorIndex += 1
  }

  return { mapInstance, mapLoaded, getMap, setMapInstance, drawPolygon, invertGeometry }
})
