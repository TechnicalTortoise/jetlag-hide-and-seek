<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import type { Thermometer } from '~/stores/GameStore'
import { distance } from '@turf/turf'
import { State, useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { state, questionBeingEdited } = storeToRefs(gameStore)
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

const isActive = computed(() => {
  return state.value === State.ADDING_THERMOMENTER || state.value === State.MODIFYING_THERMOMETER
})

const isModifying = computed(() => {
  return state.value === State.MODIFYING_THERMOMETER
})

watch(state, () => {
  if (state.value !== State.ADDING_THERMOMENTER && state.value !== State.MODIFYING_THERMOMETER) {
    nextTick(() => {
      reset()
    })
  }
})

watch(questionBeingEdited, () => {
  if (state.value === State.MODIFYING_THERMOMETER) {
    const q = gameStore.questionBeingEdited
    if (q === undefined) {
      return
    }
    if (q.type === undefined || q.type !== 'Thermometer') {
      return
    }
    const t: Thermometer = q.question
    lnglat0 = t.lnglatStart
    lnglat1 = t.lnglatEnd
    warmer.value = t.warmer
    mapStore.addMarker(markerId0, lnglat0, true, onDrag0)
    mapStore.addMarker(markerId1, lnglat1, true, onDrag1, '#fa143e') // todo get colors from somewhere proper
    marker0Exists = true
    marker1Exists = true
    setPositionStringToDistance()
  }
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function setPositionStringToDistance() {
  if (!marker0Exists || !marker1Exists) {
    return
  }
  if (lnglat0 === undefined || lnglat1 === undefined) {
    return
  }
  const d: number = distance(lnglat0, lnglat1, { units: 'kilometers' })
  positionString.value = `Distance between markers: ${d.toFixed(2)} km`
}

function onDrag0() {
  lnglat0 = mapStore.getMarker(markerId0).getLngLat().toArray()
  setPositionStringToDistance()
}

function onDrag1() {
  lnglat1 = mapStore.getMarker(markerId1).getLngLat().toArray()
  setPositionStringToDistance()
}

function onMapClick(e: MapMouseEvent) {
  if (!isActive.value) {
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
  mapStore.addMarker(markerId1, e.lngLat.toArray(), true, onDrag1, '#fa143e') // todo get colors from somewhere proper
  lnglat1 = e.lngLat.toArray()
  marker1Exists = true
  setPositionStringToDistance()
}

function close() {
  reset()
  state.value = State.MAIN
}

function reset() {
  if (marker0Exists) {
    mapStore.removeMarker(markerId0)
    marker0Exists = false
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
    marker1Exists = false
  }

  warmer.value = false
  lnglat0 = undefined
  lnglat1 = undefined
  positionString.value = defaultPositionString
}

function addOrEdit() {
  if (lnglat0 === undefined || lnglat1 === undefined) {
    return
  }
  if (isModifying.value) {
    gameStore.addThermometer(lnglat0, lnglat1, warmer.value, gameStore.questionBeingEdited?.id)
  }
  else {
    gameStore.addThermometer(lnglat0, lnglat1, warmer.value)
  }

  close()
}

function deleteThermometer() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
    close()
  }
}
</script>

<template>
  <UDrawer
    :open="isActive" :handle="false" :overlay="false" :modal="false" :dismissible="false" direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }" :title="isModifying ? 'Modifying Thermometer' : 'Adding Thermometer'"
  >
    <template #body>
      {{ positionString }}
      <br>
      <UCheckbox v-model="warmer" label="Warmer" indicator="end" class="w-min" />
    </template>

    <template #footer>
      <UButton
        :label="isModifying ? 'Update' : 'Add'" color="primary" class="justify-center"
        :disabled="!addButtonEnabled" @click="addOrEdit"
      />
      <UButton v-if="isModifying" label="Delete" color="error" class="justify-center" @click="deleteThermometer" />

      <UButton label="Cancel" color="neutral" variant="outline" class="justify-center" @click="close" />
    </template>
  </UDrawer>
</template>

<style></style>
