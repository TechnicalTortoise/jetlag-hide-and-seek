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
  else {
    return 'material-symbols:thermometer-outline'
  }
})

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
  <div class="w-18 h-18 float-left flex items-center justify-center">
    <UButton
      class="w-16 h-16 justify-center flex-col items-center gap-0"
      @click="onClick"
    >
      <Icon
        :icon="iconName"
        class="w-8 h-8"
      />
      <br>

      <span class="text-s">{{ props.text }}</span>
    </UButton>
  </div>
</template>

<style></style>
