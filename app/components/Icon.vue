<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'

defineProps<{
  icon: string
}>()
</script>

<template>
  <IconifyIcon
    :icon="icon"
    v-bind="$attrs"
  />
</template>
