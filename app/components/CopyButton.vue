<script lang="ts" setup>
import { useTimeout } from '@vueuse/core'

const props = defineProps<{
  textToCopy: string
}>()
const { ready: timeoutReady, start: timeoutStart } = useTimeout(2500, {
  controls: true,
  immediate: false,
})

function onClick() {
  navigator.clipboard.writeText(props.textToCopy)
  timeoutStart()
}

const icon = computed(() => {
  return timeoutReady.value ? 'lucide:clipboard' : 'lucide:clipboard-check'
})

const colour = computed(() => {
  return timeoutReady.value ? 'neutral' : 'success'
})
</script>

<template>
  <UButton
    :icon="icon"
    :color="colour"
    variant="ghost"
    @click="onClick"
  />
</template>

<style></style>
