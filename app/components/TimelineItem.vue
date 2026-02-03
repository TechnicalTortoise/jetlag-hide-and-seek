<script lang="ts" setup>
import { State, useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  text: string
  id: number
}>()

const gameStore = useGameStore()

function onClick() {
  gameStore.setQuestionToEdit(props.id)
  const q = gameStore.questionBeingEdited
  if (q === undefined) {
    return
  }
  switch (q.type) {
    case 'Radar':
    {
      gameStore.state = State.MODIFYING_RADAR
      break
    }
    case 'Thermometer':
    {
      gameStore.state = State.MODIFYING_THERMOMETER
      break
    }
  }
  // gameStore.removeQuestion(props.id)
}
</script>

<template>
  <div class="w-24 h-24 bg-black float-left flex items-center justify-center">
    <UButton class="w-20 h-20 justify-center" @click="onClick">
      {{ props.text }}
    </UButton>
  </div>
</template>

<style></style>
