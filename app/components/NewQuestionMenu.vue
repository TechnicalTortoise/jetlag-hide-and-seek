<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { State, useGameStore } from '~/stores/GameStore'

const gameStore = useGameStore()
const { state } = storeToRefs(gameStore)

const items = ref<DropdownMenuItem[][]>([[
  {
    label: 'Radar',
    type: 'link',
    icon: 'i-material-symbols:radar',
    onSelect: () => { state.value = State.ADDING_RADAR },
  },
  {
    label: 'Thermometer',
    type: 'link',
    icon: 'i-material-symbols:thermometer-outline',
    onSelect: () => { state.value = State.ADDING_THERMOMENTER },
  },
  {
    label: 'Custom Region',
    type: 'link',
    icon: 'i-material-symbols:polyline-outline-rounded',
    onSelect: () => { },
  },
  {
    label: 'Pin',
    type: 'link',
    icon: 'i-material-symbols:location-on-outline-rounded',
    onSelect: () => { state.value = State.ADDING_PINS },
  },
]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ side: 'left' }"
  >
    <MapOverlayButton
      icon-name="material-symbols:add-circle-outline-rounded"
      class="pointer-events-auto"
    />
  </UDropdownMenu>
</template>

<style></style>
