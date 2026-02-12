<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import type { Question } from '~/stores/GameStore'
import { State, useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  name: string // eg Radar, thermoeter
  addingState: State
  modifyingState: State
  resetFn: () => (void)
  onMapClickFn: (e: MapMouseEvent) => (void)
  allInfoFilledFn: () => (boolean)
  createNewQuestion: () => (Question)
  onStartEditing: () => (void)
}>()

const gameStore = useGameStore()
const mapStore = useMapStore()

const addButtonEnabled = ref(true) // todo how to set this with a computed function?

const { state, questionBeingEdited } = storeToRefs(gameStore)

let initialQuestionData: Question

function startAdding() {
  props.resetFn()
  const q = props.createNewQuestion()
  gameStore.setQuestionBeingEdited(q.id)
}

function closeFn() {
  props.resetFn()
  state.value = State.MAIN
  gameStore.setQuestionBeingEdited(-1)
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
  closeFn,
})

watch(state, () => {
  if (state.value !== props.addingState && state.value !== props.modifyingState) {
    nextTick(() => {
      props.resetFn()
    })
    return
  }
  if (state.value === props.addingState) {
    startAdding()
  }
  if (state.value === props.modifyingState && questionBeingEdited.value) {
    initialQuestionData = JSON.parse(JSON.stringify(questionBeingEdited.value.question))
    props.onStartEditing()
  }
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', props.onMapClickFn)
  }
})

function updateOrAdd() {
  if (!props.allInfoFilledFn()) {
    return
  }
  closeFn()
}

const title = computed(() => {
  return isModifying.value ? `Modifying ${props.name}` : `Adding ${props.name}`
})

function onCancel() {
  if (gameStore.state === props.addingState) {
    if (questionBeingEdited.value !== undefined) {
      gameStore.removeQuestion(questionBeingEdited.value.id)
    }
  }
  else if (gameStore.state === props.modifyingState) {
    // todo, make a copy of the question being edited and revert to it
    if (questionBeingEdited.value) {
      questionBeingEdited.value.question = JSON.parse(JSON.stringify(initialQuestionData))
      gameStore.updateQuestion(questionBeingEdited.value)
    }
  }
  closeFn()
}

function deleteQuestion() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
  }
  closeFn()
}
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
      <slot name="MainContentSlot" />
    </template>

    <template #footer>
      <UButton
        :label="isModifying ? 'Update' : 'Add'"
        color="primary"
        class="justify-center"
        :disabled="!addButtonEnabled"
        @click="updateOrAdd"
      />
      <UButton
        v-if="isModifying"
        label="Delete"
        color="error"
        class="justify-center"
        @click="deleteQuestion"
      />
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="onCancel"
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
