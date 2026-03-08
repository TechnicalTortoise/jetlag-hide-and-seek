<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()
const mapStore = useMapStore()

const active = computed(() => {
  return gameStore.state === State.ADDING_PINS
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  gameStore.addCustomPin(e.lngLat.toArray())
}
</script>

<template>
  <UDrawer
    :open="active"
    :handle="false"
    :overlay="false"
    :modal="false"
    :dismissible="false"
    direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }"
    title="Adding Pins"
  >
    <template #body>
      Pins can be dragged, or clicked to be deleted
    </template>
    <template #footer>
      <UButton
        label="Close"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="gameStore.state = State.MAIN"
      />
    </template>
  </UDrawer>
</template>

<style></style>
