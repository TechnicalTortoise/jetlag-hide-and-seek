<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { tr } from '@nuxt/ui/runtime/locale/index.js'
import { useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { addingRadar } = storeToRefs(gameStore)
const radiusKm = ref(0)
const hit = ref(false)
const markerId = 'NewRadarMarker'
const defaultPositionString = 'Select position on map'
const positionString = ref(defaultPositionString)
let markerExists: boolean = false // todo reset everything on open drawer
let lnglat: [number, number] | undefined

const addButtonEnabled = ref(true) // todo how to set this with a computed function?

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function onMarkerDrag() {
  lnglat = mapStore.getMarker(markerId).getLngLat().toArray()
  setPositionText()
}

function onMapClick(e: MapMouseEvent) {
  if (!addingRadar.value) {
    return
  }
  lnglat = e.lngLat.toArray()
  if (markerExists) {
    mapStore.removeMarker(markerId)
  }
  mapStore.addMarker(markerId, lnglat, true, onMarkerDrag)
  markerExists = true
  setPositionText()
}

function setPositionText() {
  if (lnglat === undefined) {
    positionString.value = defaultPositionString
    return
  }
  const precision = 5
  positionString.value = `${lnglat[1].toFixed(precision)},${lnglat[0].toFixed(precision)}`
}

function close() {
  lnglat = undefined
  setPositionText()
  if (markerExists) {
    mapStore.removeMarker(markerId)
    markerExists = false
  }
  radiusKm.value = 0
  hit.value = false
  addingRadar.value = false
}

function add() {
  if (lnglat === undefined) {
    return
  }
  gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value)
  close()
}
</script>

<template>
  <UDrawer
    v-model:open="addingRadar" :handle="false" :overlay="false" :modal="false" :dismissible="false"
    direction="top" :ui="{ container: 'max-w-xl mx-auto' }" title="New Radar"
  >
    <template #body>
      {{ positionString }}
      <br>
      Radius:
      <UInputNumber
        v-model="radiusKm" :format-options="{
          minimumFractionDigits: 1,
          style: 'unit',
          unit: 'kilometer',
        }" :step-snapping="false" :increment="true" :decrement="true" :min="0"
      />

      <UCheckbox v-model="hit" label="Hit" indicator="end" class="w-min" />
    </template>

    <template #footer>
      <UButton label="Add" color="neutral" class="justify-center" :disabled="!addButtonEnabled" @click="add" />
      <UButton label="Cancel" color="neutral" variant="outline" class="justify-center" @click="close" />
    </template>
  </UDrawer>
</template>

<style></style>
