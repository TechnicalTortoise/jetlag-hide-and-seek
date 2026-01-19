<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <UButton>
    {{ props.text }}
  </UButton>
</template>

<style>

</style>
