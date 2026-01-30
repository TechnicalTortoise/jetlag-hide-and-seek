<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { distance } from '@turf/turf'
import { useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'
import MapOverlayButton from './MapOverlayButton.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()

const { measurementToolActive } = storeToRefs(gameStore)

let marker0Exists: boolean = false
let marker1Exists: boolean = false
const markerId0: string = 'measurement0'
const markerId1: string = 'measurement1'
const mapLayerSourceID: string = 'measurementTool'

const text = ref('')

const el = useTemplateRef('el')

const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [0, 0]],
      },
    },
  ],
}

function onMapClick(e: MapMouseEvent) {
  if (!measurementToolActive.value) {
    return
  }
  if (!marker0Exists) {
    mapStore.addMarker(markerId0, e.lngLat.toArray(), true, onDrag)
    marker0Exists = true
    text.value = 'Select second point'
    return
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
  }
  // if both markers exist, keep replacing the last one
  mapStore.addMarker(markerId1, e.lngLat.toArray(), true, onDrag)
  marker1Exists = true
  setDistanceText()
}

function onDrag() {
  setDistanceText()
}

function setDistanceText() {
  if (!marker0Exists || !marker1Exists) {
    return
  }
  const lnglat0: [number, number] = mapStore.getMarker(markerId0).getLngLat().toArray()
  const lnglat1: [number, number] = mapStore.getMarker(markerId1).getLngLat().toArray()
  const d: number = distance(lnglat0, lnglat1, { units: 'kilometers' })
  if (d < 1) {
    text.value = `${(d * 1000).toFixed(0)} m`
  }
  else {
    text.value = `${d.toFixed(3)} km`
  }

  geojson.features[0].geometry.coordinates[0] = lnglat0
  geojson.features[0].geometry.coordinates[1] = lnglat1
  const map = mapStore.getMap()
  map.getSource(mapLayerSourceID).setData(geojson)
}

watch(measurementToolActive, () => {
  const map = mapStore.getMap()

  if (!measurementToolActive.value) {
    if (marker0Exists) {
      mapStore.removeMarker(markerId0)
    }
    if (marker1Exists) {
      mapStore.removeMarker(markerId1)
    }
    marker0Exists = false
    marker1Exists = false
    map.removeLayer(mapLayerSourceID)
    map.removeSource(mapLayerSourceID)
  }
  else {
    // just enabled
    text.value = 'Select first point'
    geojson.features[0].geometry.coordinates[0] = [0, 0]
    geojson.features[0].geometry.coordinates[1] = [0, 0]
    map.addSource(mapLayerSourceID, {
      type: 'geojson',
      data: geojson,
    })

    map.addLayer({
      id: mapLayerSourceID,
      type: 'line',
      source: mapLayerSourceID,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#888',
        'line-width': 8,
      },
    })
  }
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})
</script>

<template>
  <Transition name="slideTopBar">
    <div
      v-show="measurementToolActive" ref="el"
      class="fixed w-screen bg-accented pointer-events-auto flex flex-nowrap overflow-x-scroll shrink-0 top-0 justify-center py-4"
    >
      {{ text }}
    </div>
  </Transition>
</template>

<style>
.slideTopBar-enter-active,
.slideTopBar-leave-active {
  transition: transform 0.3s ease;
}

.slideTopBar-enter-from,
.slideTopBar-leave-to {
  transform: translateY(-100%);
}
</style>
