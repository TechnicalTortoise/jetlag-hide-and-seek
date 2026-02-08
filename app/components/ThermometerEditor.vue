<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { distance } from '@turf/turf'
import { useMapStore } from '~/stores/MapStore'
import { getRGB } from '~/utils'
import TopDrawer from './TopDrawer.vue'

const pinColour0: [string, number] = ['secondary', 500]
const pinColour1: [string, number] = ['tertiary', 500]

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)
const bodyText = ref('placeholder')

const warmer = ref(false)
const markerId0 = 'NewThermometerMarker0'
const markerId1 = 'NewThermometerMarker1'
let marker0Exists: boolean = false
let marker1Exists: boolean = false
let lnglat0: [number, number] | undefined
let lnglat1: [number, number] | undefined

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  if (marker0Exists) {
    mapStore.removeMarker(markerId0)
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
  }
  marker0Exists = false
  marker1Exists = false

  warmer.value = false
  lnglat0 = undefined
  lnglat1 = undefined
  setBodyText()
}

function setBodyText() {
  if (!marker0Exists) {
    bodyText.value = 'Select first point on map'
  }
  else if (!marker1Exists) {
    bodyText.value = 'Select second point on map'
  }
  else {
    if (lnglat0 === undefined || lnglat1 === undefined) {
      bodyText.value = 'Somethings gone wrong!'
      return
    }
    const d: number = distance(lnglat0, lnglat1, { units: 'kilometers' })
    bodyText.value = `Distance between markers: ${d.toFixed(2)} km`
  }
}

function onDrag0() {
  lnglat0 = mapStore.getMarker(markerId0).getLngLat().toArray()
  setBodyText()
}

function onDrag1() {
  lnglat1 = mapStore.getMarker(markerId1).getLngLat().toArray()
  setBodyText()
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  if (!marker0Exists) {
    mapStore.addMarker(markerId0, e.lngLat.toArray(), true, onDrag0, getRGB(pinColour0))
    lnglat0 = e.lngLat.toArray()
    marker0Exists = true
    setBodyText()
    return
  }
  if (marker1Exists) {
    mapStore.removeMarker(markerId1)
  }
  mapStore.addMarker(markerId1, e.lngLat.toArray(), true, onDrag1, getRGB(pinColour1))
  lnglat1 = e.lngLat.toArray()
  marker1Exists = true
  setBodyText()
}

function deleteQ() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
    close()
  }
}

function add() {
  if (lnglat0 !== undefined && lnglat1 !== undefined) {
    gameStore.addThermometer(lnglat0, lnglat1, warmer.value)
  }
  close()
}

function edit() {
  if (lnglat0 !== undefined && lnglat1 !== undefined) {
    gameStore.addThermometer(lnglat0, lnglat1, warmer.value, gameStore.questionBeingEdited?.id)
  }
  close()
}

function allInfoFilled(): boolean {
  return lnglat0 !== undefined && lnglat1 !== undefined
}

function onStartAdding() {
  resetFn()
}

function onStartEditing() {
  const q = questionBeingEdited.value
  if (q === undefined) {
    return
  }
  if (q.type === undefined || q.type !== 'Thermometer' || q.question === undefined) {
    return
  }
  const t: Thermometer = q.question
  lnglat0 = t.lnglatStart
  lnglat1 = t.lnglatEnd
  warmer.value = t.warmer
  mapStore.addMarker(markerId0, lnglat0, true, onDrag0, getRGB(pinColour0))
  mapStore.addMarker(markerId1, lnglat1, true, onDrag1, getRGB(pinColour1))
  marker0Exists = true
  marker1Exists = true

  setBodyText()
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Thermometer"
    :adding-state="State.ADDING_THERMOMENTER"
    :modifying-state="State.MODIFYING_THERMOMETER"
    :reset-fn="resetFn"
    :body-text="bodyText"
    :on-map-click-fn="onMapClick"
    :delete-fn="deleteQ"
    :add-fn="add"
    :edit-fn="edit"
    :all-info-filled-fn="allInfoFilled"
    :on-start-adding="onStartAdding"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      <UCheckbox
        v-model="warmer"
        label="Warmer"
        indicator="end"
        class="w-min"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
