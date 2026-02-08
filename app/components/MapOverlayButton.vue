<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = defineProps<{
  iconName: string
}>()
</script>

<template>
  <UButton
    class="text-4xl w-12 h-12 flex justify-center items-center z-100"
    :icon="props.iconName"
  />
</template>

<!-- icon="i-material-symbols-measuring-tape-outline" -->
<style></style>
