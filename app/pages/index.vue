<script setup lang="ts">
import { Icon } from '@iconify/vue'
import CustomPolygonEditor from '~/components/CustomPolygonEditor.vue'

const map = useTemplateRef('map')
</script>

<template>
  <div class="w-screen h-screen relative overflow-hidden">
    <div class="absolute inset-0 ">
      <CustomMap ref="map" />
    </div>
    <div class="absolute inset-0 pointer-events-none z-20">
      <Timeline />
    </div>

    <div class="absolute inset-0 pointer-events-none z-20">
      <MeasurementTool />
    </div>

    <RadarEditor />
    <!-- <ThermometerEditor /> -->
    <!-- <PinEditor /> -->
    <!-- <CustomPolygonEditor /> -->

    <SideButtons />
  </div>
</template>
