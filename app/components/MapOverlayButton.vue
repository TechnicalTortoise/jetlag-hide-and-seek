<script lang="ts" setup>
const props = defineProps<{
  text: string
}>()

function onButtonPress() {
  console.warn('awoo')
}
</script>

<template>
  <UButton class="text-4xl flex justify-center items-center bg-accented" @click="onButtonPress()">
    {{ props.text }}
  </UButton>
</template>

<style>

</style>
