<script lang="ts" setup>
import { useGameStore } from '~/stores/GameStore'

const props = defineProps<{
  text: string
  id: number
}>()

const gameStore = useGameStore()

function onClick() {
  console.warn('looking for id ', props.id)

  gameStore.removeQuestion(props.id)
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
