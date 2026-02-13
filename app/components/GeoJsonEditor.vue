<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'

import { getRGB } from '~/colourUtils'

import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {

}

function onMapClick(e: MapMouseEvent) {

}

function allInfoFilled(): boolean {
  return true
}

function onStartEditing() {
  resetFn()
}

// function updateRadar() {
//   if (questionBeingEdited.value !== undefined && lnglat !== undefined) {
//     gameStore.updateRadar(questionBeingEdited.value, radiusKm.value, lnglat, hit.value)
//   }
// }

async function readDataFromFile() {
  const filePath = '/WD_DEC_2025_UK_BGC_-6364930323688940360.geojson'
  try {
    const data = await $fetch(filePath)
    if ('features' in data) {

    }

    console.warn(data)
  }
  catch (error) {
    console.error('Failed to load JSON:', error)
  }
}

async function onTestClick() {
  console.warn(await readDataFromFile())
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="GeoJSON Region"
    :adding-state="State.ADDING_GEOJSON_REGION"
    :modifying-state="State.MODIFYING_GEOJSON_REGION"
    :reset-fn="resetFn"
    :on-map-click-fn="onMapClick"
    :all-info-filled-fn="allInfoFilled"
    :create-new-question="gameStore.addRadar"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      <UButton
        label="Blub"
        @click="onTestClick"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
