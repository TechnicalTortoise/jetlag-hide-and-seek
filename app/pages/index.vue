<script setup lang="ts">
const map = useTemplateRef('map')
</script>

<template>
  <div class="w-screen h-screen relative overflow-hidden">
    <div class="absolute inset-0 ">
      <CustomMap ref="map" />
    </div>
    <div class="absolute pointer-events-none right-4 bottom-4 space-y-4">
      <!-- <div class="absolute w-64 right-12 top-8">
        <Calculator class="pointer-events-auto w-full h-full" />
      </div> -->
      <MapOverlayButton text="+" class="pointer-events-auto" />
      <MapOverlayButton text="📐" class="pointer-events-auto" />
    </div>

    <div class="absolute inset-0 pointer-events-none z-20">
      <Timeline />
      <!-- <UButton class="pointer-events-auto" @click="map?.drawCircle()">
        bloob
      </UButton> -->
    </div>
  </div>
</template>
