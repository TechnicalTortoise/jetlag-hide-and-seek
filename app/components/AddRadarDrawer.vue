<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import type { Question } from '~/stores/GameStore'
import { tr } from '@nuxt/ui/runtime/locale/index.js'
import { LngLatBounds } from 'maplibre-gl'
import { State, useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { state, questionBeingEdited } = storeToRefs(gameStore)
const radiusKm = ref(0)
const hit = ref(false)
const markerId = 'NewRadarMarker'
const defaultPositionString = 'Select position on map'
const positionString = ref(defaultPositionString)
let markerExists: boolean = false // todo reset everything on open drawer
let lnglat: [number, number] | undefined

const addButtonEnabled = ref(true) // todo how to set this with a computed function?

watch(state, () => {
  if (state.value !== State.ADDING_RADAR && state.value !== State.MODIFYING_RADAR) {
    nextTick(() => {
      reset()
    })
  }
})

watch(questionBeingEdited, () => {
  if (state.value === State.MODIFYING_RADAR) {
    const q = gameStore.questionBeingEdited
    if (q === undefined || q.type !== 'Radar') {
      return
    }
    const r: Radar = q.question
    lnglat = r.lnglat
    hit.value = r.hit
    radiusKm.value = r.radius
  }
})

const isActive = computed(() => {
  return state.value === State.ADDING_RADAR || state.value === State.MODIFYING_RADAR
})

const isModifying = computed(() => {
  return state.value === State.MODIFYING_RADAR
})

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
  if (!isActive.value) {
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

function reset() {
  lnglat = undefined
  setPositionText()
  if (markerExists) {
    mapStore.removeMarker(markerId)
    markerExists = false
  }
  radiusKm.value = 0
  hit.value = false
}

function close() {
  reset()
  state.value = State.MAIN
}

function addOrEdit() {
  if (lnglat === undefined) {
    return
  }
  if (isModifying.value) {
    gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value, gameStore.questionBeingEdited?.id)
  }
  else {
    gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value)
  }

  close()
}

function deleteRadar() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
    close()
  }
}
</script>

<template>
  <UDrawer
    :open="isActive" :handle="false" :overlay="false" :modal="false" :dismissible="false" direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }" :title="isModifying ? 'Modifying Radar' : 'Adding Radar'"
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
      <UButton
        :label="isModifying ? 'Update' : 'Add'" color="primary" class="justify-center"
        :disabled="!addButtonEnabled" @click="addOrEdit"
      />
      <UButton v-if="isModifying" label="Delete" color="error" class="justify-center" @click="deleteRadar" />
      <UButton label="Cancel" color="neutral" variant="outline" class="justify-center" @click="close" />
    </template>
  </UDrawer>
</template>

<style scoped>
:deep([data-state="open"][data-direction="top"]) {
  top: 0 !important;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>
