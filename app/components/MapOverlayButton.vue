<script lang="ts" setup>
const { iconName, iconAngle = 0 } = defineProps<{
  iconName: string
  iconAngle?: number
}>()
</script>

<template>
  <UButton class="text-4xl w-12 h-12 flex justify-center items-center z-100">
    <UIcon
      :name="iconName"
      class="transition-transform duration-50 w-6"
      :style="{ transform: `rotate(${iconAngle}deg)` }"
    />
  </UButton>
</template>

<style></style>
