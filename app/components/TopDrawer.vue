<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import type { Question } from '~/stores/GameStore'
import { State, useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  name: string // eg Radar, thermoeter
  addingState: State
  modifyingState: State
  bodyText: string
  resetFn: () => (void)
  onMapClickFn: (e: MapMouseEvent) => (void)
  deleteFn: () => (void)
  addFn: () => (void)
  editFn: () => (void)
  allInfoFilledFn: () => (boolean)
  onStartAdding: () => (void)
  onStartEditing: () => (void)
}>()

const gameStore = useGameStore()
const mapStore = useMapStore()

const addButtonEnabled = ref(true) // todo how to set this with a computed function?

const { state } = storeToRefs(gameStore)

function close() {
  props.resetFn()
  state.value = State.MAIN
}

const isActive = computed(() => {
  return state.value === props.addingState || state.value === props.modifyingState
})

const isModifying = computed(() => {
  return state.value === props.modifyingState
})

defineExpose({
  isModifying,
  isActive,
})

watch(state, () => {
  if (state.value !== props.addingState && state.value !== props.modifyingState) {
    nextTick(() => {
      props.resetFn()
    })
    return
  }
  if (state.value === props.addingState) {
    props.onStartAdding()
  }
  if (state.value === props.modifyingState) {
    props.onStartEditing()
  }
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', props.onMapClickFn)
  }
})

function addOrEdit() {
  if (!props.allInfoFilledFn()) {
    return
  }
  if (isModifying.value) {
    props.editFn()
  }
  else {
    props.addFn()
  }

  close()
}

function deleteQ() {
  props.deleteFn()
  close()
}

const title = computed(() => {
  return isModifying.value ? `Modifying ${props.name}` : `Adding ${props.name}`
})
</script>

<template>
  <UDrawer
    :open="isActive"
    :handle="false"
    :overlay="false"
    :modal="false"
    :dismissible="false"
    direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }"
    :title="title"
  >
    <template #body>
      {{ props.bodyText }}
      <br>

      <slot name="MainContentSlot" />
    </template>

    <template #footer>
      <UButton
        :label="isModifying ? 'Update' : 'Add'"
        color="primary"
        class="justify-center"
        :disabled="!addButtonEnabled"
        @click="addOrEdit"
      />
      <UButton
        v-if="isModifying"
        label="Delete"
        color="error"
        class="justify-center"
        @click="deleteQ"
      />
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="close"
      />
    </template>
  </UDrawer>
</template>

<style scoped>
:deep([data-state="open"][data-direction="top"]) {
    top: 0 !important;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }

    to {
        transform: translateY(0);
    }
}
</style>
