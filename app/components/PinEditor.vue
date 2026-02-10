<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import appConfig from '~/app.config'
import { useMapStore } from '~/stores/MapStore'

import { getRGB } from '~/colourUtils'

const gameStore = useGameStore()
const mapStore = useMapStore()

let pinCount: number = 0
const pinColour: [string, number] = ['accent', 500]

const active = computed(() => {
  return gameStore.state === State.ADDING_PINS
})

function onMarkerDrag() {

}

watch(mapStore, () => {
  console.warn(getRGB(pinColour))
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }

  const id = `CustomPin${pinCount}`

  mapStore.addMarker(id, e.lngLat.toArray(), true, onMarkerDrag, getRGB(pinColour), () => {
    mapStore.removeMarker(id)
  })
  pinCount += 1
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
