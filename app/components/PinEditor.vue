<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { Popup } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)
const bodyText = ref('placeholder')

interface Pin {
  lnglat: [number, number]
  color: string
  id: string
}

let pinCount: number = 0

let pins: Pin[] = []

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {

}

function setBodyText() {

}

function onMarkerDrag() {

}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }

  const id = `CustomPin${pinCount}`
  const color = '#00FF00'
  mapStore.addMarker(id, e.lngLat.toArray(), true, onMarkerDrag, color, () => {
    mapStore.removeMarker(id)
  })
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
    :adding-state="State.ADDING_PIN"
    :modifying-state="State.NULL"
    :reset-fn="resetFn"
    :body-text="bodyText"
    :on-map-click-fn="onMapClick"
    :delete-fn="() => { }"
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
