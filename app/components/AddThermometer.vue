<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { tr } from '@nuxt/ui/runtime/locale/index.js'
import { useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { addingThermometer } = storeToRefs(gameStore)
const warmer = ref(false)
const markerId0 = 'NewThermometerMarker0'
const markerId1 = 'NewThermometerMarker1'
let marker0Exists: boolean = false
let marker1Exists: boolean = false

const defaultPositionString = 'Select first position on map'
const positionString = ref(defaultPositionString)
let lnglat0: [number, number] | undefined
let lnglat1: [number, number] | undefined

const addButtonEnabled = ref(true) // todo how to set this with a computed function?

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function onDrag0() {
  lnglat0 = mapStore.getMarker(markerId0).getLngLat().toArray()
}

function onDrag1() {
  lnglat1 = mapStore.getMarker(markerId0).getLngLat().toArray()
}

function onMapClick(e: MapMouseEvent) {
  if (!addingThermometer.value) {
    return
  }
  if (!marker0Exists) {
    mapStore.addMarker(markerId0, e.lngLat.toArray(), true, onDrag0)
    lnglat0 = e.lngLat.toArray()
    marker0Exists = true
    positionString.value = 'Select second point on map'
    return
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
  }
  positionString.value = 'Drag markers if you want ig idc'
  // if both markers exist, keep replacing the last one
  mapStore.addMarker(markerId1, e.lngLat.toArray(), true, onDrag1, '#fa143e') // todo get colors from somewhere proper
  lnglat1 = e.lngLat.toArray()
  marker1Exists = true
}

function close() {
  if (marker0Exists) {
    mapStore.removeMarker(markerId0)
    marker0Exists = false
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
    marker1Exists = false
  }

  warmer.value = false
  addingThermometer.value = false
  lnglat0 = undefined
  lnglat1 = undefined
  positionString.value = defaultPositionString
}

function add() {
  console.warn(lnglat0, lnglat1)
  if (lnglat0 === undefined || lnglat1 === undefined) {
    return
  }
  gameStore.addThermometer(lnglat0, lnglat1, warmer.value)
  close()
}
</script>

<template>
  <UDrawer
    v-model:open="addingThermometer" :handle="false" :overlay="false" :modal="false" :dismissible="false"
    direction="top" :ui="{ container: 'max-w-xl mx-auto' }" title="New Thermometer"
  >
    <template #body>
      {{ positionString }}
      <br>
      <UCheckbox v-model="warmer" label="Warmer" indicator="end" class="w-min" />
    </template>

    <template #footer>
      <UButton label="Add" color="neutral" class="justify-center" :disabled="!addButtonEnabled" @click="add" />
      <UButton label="Cancel" color="neutral" variant="outline" class="justify-center" @click="close" />
    </template>
  </UDrawer>
</template>

<style></style>
