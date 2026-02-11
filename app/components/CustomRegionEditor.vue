<script lang="ts" setup>
import type { GeoJsonProperties, Polygon } from 'geojson'
import type { MapMouseEvent } from 'maplibre-gl'
import { map } from '@indoorequal/vue-maplibre-gl'
import * as turf from '@turf/turf'
import { Marker } from 'maplibre-gl'
import { getRGB } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]
const gameStore = useGameStore()
const mapStore = useMapStore()
let question: Question | undefined

const bodyText = ref('Select points on the map to create a region')

const inside = ref(true)
let markers: string[] = []
let currentId: number = 0

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function updateQuestion() {
  if (question === undefined) {
    return
  }
  const points: [number, number][] = []
  markers.forEach((m) => {
    points.push(mapStore.getMarker(m).getLngLat().toArray())
  })
  gameStore.updateCustomRegion(question, points, inside.value)
}

function resetFn() {
  markers.forEach((m) => {
    mapStore.removeMarker(m)
  })
  markers = []
  currentId = 0
  setBodyText()
}

function setBodyText() {

}

function onMarkerDrag() {
  updateQuestion()
}

function newMarker(lnglat: [number, number]) {
  const id = `CustomRegion${currentId}`
  mapStore.addMarker(id, lnglat, true, onMarkerDrag, getRGB(pinColour), () => {
    mapStore.removeMarker(id)
    const index = markers.findIndex((m) => {
      return m === id
    })
    markers.splice(index, 1)
    updateQuestion()
  })
  markers.push(id)
  updateQuestion()
  currentId += 1
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  newMarker(e.lngLat.toArray())
  setBodyText()
}

function deleteQuestion() {
  if (question !== undefined) {
    gameStore.removeQuestion(question.id)
  }
  topDrawerRef.value?.closeFn()
}

function add() {
  topDrawerRef.value?.closeFn()
}

function edit() {
  topDrawerRef.value?.closeFn()
}

function allInfoFilled(): boolean {
  return true
}

function onStartAdding() {
  resetFn()
  question = gameStore.addCustomRegion()
}

function onStartEditing() {
  resetFn()
  console.warn('blub')
  question = gameStore.getQuestionToEdit(gameStore.questionIdBeingEdited)
  if (question === undefined || question.type !== 'CustomRegion') {
    return
  }
  if (question.question === undefined) {
    return
  }
  const cr: CustomRegion = question.question
  inside.value = cr.inside
  cr.points.forEach((p) => {
    newMarker(p)
  })
  setBodyText()
}

function onCancel() {
  // todo reuse this code
  if (gameStore.state === State.ADDING_CUSTOM_REGION) {
    if (question !== undefined) {
      gameStore.removeQuestion(question.id)
    }
  }
  else if (gameStore.state === State.MODIFYING_CUSTOM_REGION) {
    gameStore.onNewQuestionData()
  }
  topDrawerRef.value?.closeFn()
}

watch(inside, () => {
  updateQuestion()
})
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Custom Region"
    :adding-state="State.ADDING_CUSTOM_REGION"
    :modifying-state="State.MODIFYING_CUSTOM_REGION"
    :reset-fn="resetFn"
    :body-text="bodyText"
    :on-map-click-fn="onMapClick"
    :delete-fn="deleteQuestion"
    :add-fn="add"
    :edit-fn="edit"
    :all-info-filled-fn="allInfoFilled"
    :on-start-adding="onStartAdding"
    :on-start-editing="onStartEditing"
    :on-cancel-fn="onCancel"
  >
    <template #MainContentSlot>
      <UCheckbox
        v-model="inside"
        label="Inside"
        indicator="end"
        class="w-min"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
