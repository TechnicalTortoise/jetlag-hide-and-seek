<script lang="ts" setup>
import {
  MglMap,
  MglNavigationControl,
  useMap,
} from '@indoorequal/vue-maplibre-gl'

const style = 'https://tiles.openfreemap.org/styles/liberty'
const center = [-1.405643, 50.928988] as [number, number]
const zoom = 12

const mapInstance = useMap()
defineExpose({ mapInstance })
</script>

<template>
  <MglMap :map-style="style" :center="center" :zoom="zoom" class="w-full h-full">
    <MglNavigationControl />
  </MglMap>
</template>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
