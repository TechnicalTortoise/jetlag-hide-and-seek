<script setup lang="ts">
</script>

<template>
  <div class="w-screen h-screen relative overflow-hidden">
    <div class="absolute inset-0 ">
      <CustomMap />
    </div>
    <div class="absolute inset-0 pointer-events-none z-20">
      <Timeline />
    </div>

    <div class="absolute inset-0 pointer-events-none z-20">
      <MeasurementTool />
    </div>

    <RadarEditor />
    <ThermometerEditor />
    <PinEditor />
    <CustomRegionEditor />
    <GeoJsonEditor />
    <SideButtons />
    <NewGameModal />
  </div>
</template>
