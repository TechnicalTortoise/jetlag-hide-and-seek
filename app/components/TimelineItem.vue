<script lang="ts" setup>
import { ICONS } from '~/constants'
import { State, useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  text: string
  type: string
  id: number
}>()

const gameStore = useGameStore()

const iconName = computed(() => {
  if (props.type === 'Radar') {
    return ICONS.radar
  }
  else if (props.type === 'Thermometer') {
    return ICONS.thermometer
  }
  else if (props.type === 'CustomRegion') {
    return ICONS.customRegion
  }
  else if (props.type === 'GameBoundary') {
    return ICONS.world
  }
  return ICONS.undefined
})

function onClick() {
  gameStore.setQuestionBeingEdited(props.id)
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
    case 'CustomRegion':
      {
        gameStore.state = State.MODIFYING_CUSTOM_REGION
        break
      }
    case 'GameBoundary':
      {
        gameStore.state = State.MODIFYING_GAME_BOUNDARY
        break
      }
    default:
      {
        console.warn(`Trying to modify question type ${q.type}, not yet handled`)
      }
  }
  // gameStore.removeQuestion(props.id)
}
</script>

<template>
  <div class="w-18 h-20 float-left flex items-center justify-center">
    <UButton class="w-16 h-16 justify-center flex-col items-center gap-0" :icon="iconName"
      :color="gameStore.questionIdBeingEdited === props.id ? 'secondary' : 'primary'" @click="onClick">
      <span class="text-s">{{ props.text }}</span>
    </UButton>
  </div>
</template>

<style></style>
