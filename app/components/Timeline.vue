<script lang="ts" setup>
import { useGameStore } from '~/stores/GameStore'

const show = ref(false)
const gameStore = useGameStore()
const { questions } = storeToRefs(gameStore)
</script>

<template>
  <UButton class="pointer-events-auto" @click="show = !show">
    Toggle
  </UButton>

  <Transition name="slide">
    <div v-if="show" class="absolute w-screen h-32 bg-accented bottom-0 pointer-events-auto">
      <!-- <div class="grid grid-cols-6 grid-rows-1 gap-4"> -->
      <TimelineItem v-for="(question, index) in questions" :key="index" :text="question.timelineText" />
      <!-- </div> -->
    </div>
  </Transition>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
  /* how to remove scroll bar which temporarily appears? */
}
</style>
