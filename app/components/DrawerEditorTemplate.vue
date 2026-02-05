<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)
const bodyText = ref('placeholder')

// specific stuff goes here

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {

}

function setBodyText() {

}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  console.warn(e)
}

function deleteQ() {
  // if (questionBeingEdited.value !== undefined) {
  //   gameStore.removeQuestion(questionBeingEdited.value.id)
  //   close()
  // }
}

function add() {
  close()
}

function edit() {
  close()
}

function allInfoFilled(): boolean {
  return true
}

function onStartAdding() {
  resetFn()
}

function onStartEditing() {
  setBodyText()
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Placeholder"
    :adding-state="State.ADDING_RADAR"
    :modifying-state="State.MODIFYING_RADAR"
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
      placeholder text
    </template>
  </TopDrawer>
</template>

<style></style>
