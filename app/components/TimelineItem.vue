<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <UButton class="w-24">
    {{ props.text }}
  </UButton>
</template>

<style></style>
