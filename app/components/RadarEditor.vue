<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'
import { getRGB } from '~/utils'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questions } = storeToRefs(gameStore)
let question: Question | undefined

const radiusKm = ref(0)
const hit = ref(false)
let lnglat: [number, number] | undefined

let questionCopy: Question | undefined

const markerId = 'NewRadarMarker'
const defaultPositionString = 'Select position on map'
const positionString = ref(defaultPositionString)
let markerExists: boolean = false // todo reset everything on open drawer

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  question = undefined
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
  gameStore.updateRadar(question, radiusKm.value, lnglat, hit.value)
  setBodyText()
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  lnglat = e.lngLat.toArray()
  gameStore.updateRadar(question, radiusKm.value, lnglat, hit.value)
  if (markerExists) {
    mapStore.removeMarker(markerId)
  }
  mapStore.addMarker(markerId, lnglat, true, onMarkerDrag, getRGB(pinColour))
  markerExists = true
  setBodyText()
}

function deleteRadar() {
  if (question !== undefined) {
    gameStore.removeQuestion(question.id)
  }
  topDrawerRef.value?.closeFn()
}

function add() {
  topDrawerRef.value?.closeFn()
}

function edit() {
  // if (lnglat === undefined) {
  //   return
  // }
  // gameStore.addRadar(radiusKm.value, 'kilometers', lnglat, hit.value, gameStore.questionBeingEdited?.id)
  topDrawerRef.value?.closeFn()
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
  question = gameStore.addRadar()
}

function onStartEditing() {
  resetFn()
  question = gameStore.getQuestionToEdit(gameStore.questionIdBeingEdited)
  if (question === undefined || question.type !== 'Radar') {
    return
  }

  const r: Radar = question.question
  lnglat = r.lnglat
  if (r.hit !== undefined) {
    hit.value = r.hit
  }
  if (r.radiusKm !== undefined) {
    radiusKm.value = r.radiusKm
  }
  if (lnglat !== undefined) {
    mapStore.addMarker(markerId, lnglat, true, onMarkerDrag)
    markerExists = true
  }
  setBodyText()
}

watch(hit, () => {
  if (question !== undefined && lnglat !== undefined) {
    gameStore.updateRadar(question, radiusKm.value, lnglat, hit.value)
  }
})
watch(radiusKm, () => {
  if (question !== undefined && lnglat !== undefined) {
    gameStore.updateRadar(question, radiusKm.value, lnglat, hit.value)
  }
})

function onCancel() {
  if (gameStore.state === State.ADDING_RADAR) {
    if (question !== undefined) {
      gameStore.removeQuestion(question.id)
    }
  }
  else if (gameStore.state === State.MODIFYING_RADAR) {
    gameStore.onNewQuestionData()
  }
  topDrawerRef.value?.closeFn()
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
    :on-cancel-fn="onCancel"
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
