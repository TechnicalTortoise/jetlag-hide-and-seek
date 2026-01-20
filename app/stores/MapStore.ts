import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { Point } from 'geojson'
import type { LngLatLike } from 'maplibre-gl'
import { circle } from '@turf/turf'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)

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

  function drawCircle(center: [number, number], radius: number, units: Units, sourceId: string, layerId: string) {
    const map = getMap()
    const c = circle(center, radius, { steps: 64, units })
    map.addSource(sourceId, { type: 'geojson', data: c })
    map.addLayer({
      id: layerId,
      type:
        'fill',
      source: sourceId,
      paint: {
        'fill-color': '#8CCFFF',
        'fill-opacity': 0.5,
        'fill-outline-color': '#0094ff',
      },

    })

    // map.addLayer({
    //   id: 'heebus-radius-outline',
    //   type: 'line',
    //   source: 'heebus-radius',
    //   paint: {
    //     'line-color': '#0094ff',
    //     'line-width': 3,
    //   },
    // })
  }

  return { map: mapInstance, getMap, setMapInstance, drawCircle }
})
