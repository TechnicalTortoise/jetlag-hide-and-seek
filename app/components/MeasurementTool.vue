<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { distance } from '@turf/turf'
import { State, useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'
import MapOverlayButton from './MapOverlayButton.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()

const { state } = storeToRefs(gameStore)

let marker0Exists: boolean = false
let marker1Exists: boolean = false
const markerId0: string = 'measurement0'
const markerId1: string = 'measurement1'
const mapLayerSourceID: string = 'measurementTool'

const text = ref('')

const isActive = computed(() => {
  return state.value === State.MEASURING
})

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
  if (!isActive.value) {
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
  const marker0 = mapStore.getMarker(markerId0)
  const marker1 = mapStore.getMarker(markerId1)
  if (!marker0 || !marker1) {
    return
  }
  const lnglat0: [number, number] = marker0.getLngLat().toArray()
  const lnglat1: [number, number] = marker1.getLngLat().toArray()
  const d: number = distance(lnglat0, lnglat1, { units: 'kilometers' })
  text.value = distanceKmToPreferredFormatted(d, gameStore.unitPreference)
  if (geojson.features[0]) {
    geojson.features[0].geometry.coordinates[0] = lnglat0
    geojson.features[0].geometry.coordinates[1] = lnglat1
  }
  const map = mapStore.getMap()
  if (map) {
    map.getSource(mapLayerSourceID).setData(geojson)
  }
}

watch(state, () => {
  const map = mapStore.getMap()
  if (!map) {
    return
  }

  if (!isActive.value) {
    if (marker0Exists) {
      mapStore.removeMarker(markerId0)
    }
    if (marker1Exists) {
      mapStore.removeMarker(markerId1)
    }
    marker0Exists = false
    marker1Exists = false
    if (map.getLayer(mapLayerSourceID)) {
      map.removeLayer(mapLayerSourceID)
    }
    if (map.getSource(mapLayerSourceID)) {
      map.removeSource(mapLayerSourceID)
    }
  }
  else {
    // just enabled
    text.value = 'Select first point'
    if (!geojson.features[0]) {
      return
    }
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
        'line-color': '#52c5ff',
        'line-width': 8,
        'line-dasharray': [1, 2],
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

function close() {
  state.value = State.MAIN
}
</script>

<template>
  <UDrawer
    :open="isActive"
    :handle="false"
    :overlay="false"
    :modal="false"
    :dismissible="false"
    direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }"
    title="Measurement Tool"
  >
    <template #body>
      {{ text }}
    </template>

    <template #footer>
      <UButton
        label="Close"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="close"
      />
    </template>
  </UDrawer>
</template>

<style></style>
