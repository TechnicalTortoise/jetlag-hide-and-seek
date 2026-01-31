<script setup lang="ts">
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

    <AddRadarDrawer />
  </div>
</template>
