import { useGeolocation } from '@vueuse/core'
import { Marker } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'

export function useUserLocation() {
  const enabled = ref(false)
  const mapStore = useMapStore()

  let positionMarker: Marker | undefined
  const lnglat: Ref<[number, number]> = ref([0, 0])

  const { coords, resume, pause } = useGeolocation()

  function getLnglat() {
    return lnglat.value
  }

  function createMarker() {
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.borderRadius = '50%'
    el.style.backgroundColor = 'rgba(0, 184, 219, 0.6)'
    el.style.border = '2px solid rgba(255, 255, 255, 0.8)'
    el.style.cursor = 'pointer'

    const map = mapStore.getMap()
    if (map === undefined) {
      return
    }

    if (lnglat.value[0] === 0 && lnglat.value[1] === 0) {
      return
    }
    positionMarker = new Marker({ element: el }).setLngLat(lnglat.value).addTo(map).setDraggable(false)
  }

  watch(coords, () => {
    if (enabled.value) {
      lnglat.value = [coords.value.longitude, coords.value.latitude]
      if (positionMarker === undefined) {
        createMarker()
      }
      else {
        positionMarker.setLngLat(lnglat.value)
      }
    }
  })

  watch(enabled, () => {
    if (enabled.value) {
      if (positionMarker === undefined) {
        createMarker()
      }
      resume()
    }
    else {
      if (positionMarker !== undefined) {
        positionMarker.remove()
        positionMarker = undefined
      }
      pause()
    }
  })

  function moveMapToPosition() {
    if (lnglat.value[0] === 0 && lnglat.value[1] === 0) {
      return
    }
    mapStore.setPosition(lnglat.value)
  }

  return {
    enabled,
    getLnglat,
    moveMapToPosition,
  }
}
