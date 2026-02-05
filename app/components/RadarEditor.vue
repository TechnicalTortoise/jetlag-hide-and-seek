<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)

const radiusKm = ref(0)
const hit = ref(false)
const markerId = 'NewRadarMarker'
const defaultPositionString = 'Select position on map'
const positionString = ref(defaultPositionString)
let markerExists: boolean = false // todo reset everything on open drawer
let lnglat: [number, number] | undefined

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  lnglat = undefined
  setBodyText()
  if (markerExists) {
    mapStore.removeMarker(markerId)
    markerExists = false
  }
  radiusKm.value = 0
  hit.value = false
}

function setBodyText() {
  if (lnglat === undefined) {
    positionString.value = defaultPositionString
    return
  }
  const precision = 5
  positionString.value = `${lnglat[1].toFixed(precision)},${lnglat[0].toFixed(precision)}`
}

function onMarkerDrag() {
  lnglat = mapStore.getMarker(markerId).getLngLat().toArray()
  setBodyText()
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  lnglat = e.lngLat.toArray()
  if (markerExists) {
    mapStore.removeMarker(markerId)
  }
  mapStore.addMarker(markerId, lnglat, true, onMarkerDrag)
  markerExists = true
  setBodyText()
}

function deleteRadar() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
    close()
  }
}

function add() {
  if (lnglat === undefined) {
    return
  }

  gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value)
  close()
}

function edit() {
  if (lnglat === undefined) {
    return
  }
  gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value, gameStore.questionBeingEdited?.id)
  close()
}

function allInfoFilled(): boolean {
  if (lnglat === undefined) {
    return false
  }
  if (radiusKm.value === 0) {
    return false
  }

  return true
}

function onStartAdding() {
  resetFn()
}

function onStartEditing() {
  const q = gameStore.questionBeingEdited
  if (q === undefined || q.type !== 'Radar') {
    return
  }
  const r: Radar = q.question
  lnglat = r.lnglat
  hit.value = r.hit
  radiusKm.value = r.radius
  setBodyText()
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Radar"
    :adding-state="State.ADDING_RADAR"
    :modifying-state="State.MODIFYING_RADAR"
    :reset-fn="resetFn"
    :body-text="positionString"
    :on-map-click-fn="onMapClick"
    :delete-fn="deleteRadar"
    :add-fn="add"
    :edit-fn="edit"
    :all-info-filled-fn="allInfoFilled"
    :on-start-adding="onStartAdding"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      Radius:
      <UInputNumber
        v-model="radiusKm"
        :format-options="{
          minimumFractionDigits: 1,
          style: 'unit',
          unit: 'kilometer',
        }"
        :step-snapping="false"
        :increment="true"
        :decrement="true"
        :min="0"
      />

      <UCheckbox
        v-model="hit"
        label="Hit"
        indicator="end"
        class="w-min"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
