<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <UButton class="text-4xl flex justify-center items-center">
    {{ props.text }}
  </UButton>
</template>
