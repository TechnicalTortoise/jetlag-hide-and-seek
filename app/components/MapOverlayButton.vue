<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()

function onButtonPress() {
  console.warn('awoo')
}
</script>

<template>
  <UButton class="text-4xl w-12 h-12 flex justify-center items-center z-100" @click="onButtonPress()">
    {{ props.text }}
  </UButton>
</template>

<style></style>
