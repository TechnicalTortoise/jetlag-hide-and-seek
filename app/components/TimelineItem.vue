<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { State, useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  text: string
  type: string
  id: number
}>()

const gameStore = useGameStore()

const iconName = computed(() => {
  if (props.type === 'Radar') {
    return 'material-symbols:radar'
  }
  else if (props.type === 'Thermometer') {
    return 'material-symbols:thermometer-outline'
  }
  return 'material-symbols:question-mark-rounded'
})

function onClick() {
  const q = gameStore.getQuestionToEdit(props.id)
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
  <div class="w-18 h-20 float-left flex items-center justify-center">
    <UButton
      class="w-16 h-16 justify-center flex-col items-center gap-0"
      :icon="iconName"
      :color="gameStore.questionIdBeingEdited === props.id ? 'secondary' : 'primary'"
      @click="onClick"
    >
      <span class="text-s">{{ props.text }}</span>
    </UButton>
  </div>
</template>

<style></style>
