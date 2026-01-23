<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <div class="w-24 h-24 bg-black float-left flex items-center justify-center">
    <UButton class="w-20 h-20 justify-center">
      {{ props.text }}
    </UButton>
  </div>
</template>

<style></style>
