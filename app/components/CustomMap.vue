<script lang="ts" setup>
import { circle } from '@turf/turf'

import { useMapStore } from '~/stores/MapStore'

const mapComponent = useTemplateRef('map')
const mapStore = useMapStore()

watch(mapComponent, (newMapComponent) => {
  if (newMapComponent === undefined) {
    return
  }
  const mapInstance = newMapComponent?.mapInstance
  if (mapInstance === undefined) {
    return
  }
  mapStore.setMapInstance(mapInstance)
})

// function drawCircle() {
//   // const map = mapStore.getMap()
//   mapStore.drawCircle([-1.405643, 50.928988], 1.7, 'kilometers', 'heebis', 'hoobis')
// }
// defineExpose({ drawCircle })
</script>

<template>
  <Map ref="map" />
</template>

<style></style>
