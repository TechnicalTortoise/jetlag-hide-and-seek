<script lang="ts" setup>
import {
  MglMap,
  MglNavigationControl,
  useMap,
} from '@indoorequal/vue-maplibre-gl'
import { Marker } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'

const mapStore = useMapStore()
const { mapLoaded } = storeToRefs(mapStore)

const style = 'https://tiles.openfreemap.org/styles/liberty'
// const center = [-1.405643, 50.928988] as [number, number] // southampton
const center = [4.357612894542058, 50.84054783554592] as [number, number] // brussels
const zoom = 12
const mapInstance = useMap()
defineExpose({ mapInstance })

function onMapLoaded() {
  mapStore.onMapLoaded()
  mapLoaded.value = true
  // mapInstance.map?.setProjection({ type: 'globe' })
}
</script>

<template>
  <MglMap
    :map-style="style"
    :center="center"
    :zoom="zoom"
    :attribution-control="false"
    class="w-full h-full"
    @map:load="onMapLoaded"
  >
    <MglNavigationControl
      :show-compass="false"
      :show-zoom="false"
    />
  </MglMap>
</template>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
