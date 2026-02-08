<script setup lang="ts">
import { Icon } from '@iconify/vue'

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
    <ThermometerEditor />
    <PinEditor />

    <SideButtons />
    <div class="z-20 absolute inset-0 pointer-events-auto">
      <UButton icon="i-lucide-user" />
      <UButton
        icon="i-lucide-user"
        label="Home"
      />
      <UButton
        icon="i-lucide-user"
        label="Home"
      />
    </div>
  </div>
</template>
