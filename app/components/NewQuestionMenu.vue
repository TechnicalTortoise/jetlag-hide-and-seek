<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { ICONS } from '~/constants'
import { State, useGameStore } from '~/stores/GameStore'

const gameStore = useGameStore()
const { state } = storeToRefs(gameStore)

const items = ref<DropdownMenuItem[][]>([[
  {
    label: 'Radar',
    type: 'link',
    icon: ICONS.radar,
    onSelect: () => { state.value = State.ADDING_RADAR },
  },
  {
    label: 'Thermometer',
    type: 'link',
    icon: ICONS.thermometer,
    onSelect: () => { state.value = State.ADDING_THERMOMENTER },
  },
  {
    label: 'Custom Region',
    type: 'link',
    icon: ICONS.customRegion,
    onSelect: () => { state.value = State.ADDING_CUSTOM_REGION },
  },
  {
    label: 'Geographic Region',
    type: 'link',
    icon: ICONS.geoJsonRegion,
    onSelect: () => { state.value = State.ADDING_GEOJSON_REGION },
  },
  {
    label: 'Pin',
    type: 'link',
    icon: ICONS.pin,
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
      :icon-name="ICONS.newQuestion"
      class="pointer-events-auto"
    />
  </UDropdownMenu>
</template>

<style></style>
