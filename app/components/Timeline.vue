<script lang="ts" setup>
import {
  moveArrayElement,
  useSortable,
} from '@vueuse/integrations/useSortable'
import { useGameStore } from '~/stores/GameStore'

const el = useTemplateRef('el')
const show = ref(true)
const gameStore = useGameStore()
const { questions, timelineMarkerIndex } = storeToRefs(gameStore)

useSortable(el, questions, {
  handle: '.handle',
})
</script>

<template>
  <UButton class="pointer-events-auto" @click="show = !show">
    Toggle
  </UButton>

  <Transition name="slide">
    <div
      v-if="show" ref="el"
      class="absolute w-screen bg-accented bottom-0 pointer-events-auto flex flex-nowrap overflow-x-scroll shrink-0"
    >
      <div v-for="question in questions" :key="question.id">
        <TimelineItem v-if="question.id > -1" :text="question.timelineText" />
        <div v-else class="w-8 h-24 bg-red-400 handle" />
      </div>
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
