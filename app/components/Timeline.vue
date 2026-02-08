<script lang="ts" setup>
import {
  useSortable,
} from '@vueuse/integrations/useSortable'
import {
  useGameStore,
} from '~/stores/GameStore'

const gameStore = useGameStore()

const el = useTemplateRef('el')
const { questions } = storeToRefs(gameStore)

useSortable(el, questions, {
  handle: '.handle',
})
</script>

<template>
  <Transition name="slide">
    <div
      v-show="gameStore.timelineShowing"
      ref="el"
      class="fixed w-screen h-20 bg-default pointer-events-auto flex flex-nowrap overflow-x-auto shrink-0 bottom-0 z-50  items-center gap-0 rounded-t-lg overflow-y-hidden"
    >
      <div
        v-for="question in questions"
        :key="question.id"
      >
        <TimelineItem
          v-if="question.id > -1"
          :id="question.id"
          :text="question.timelineText"
          :type="question.type"
        />
        <div
          v-else
          class="w-8 h-16 bg-red-400 handle rounded-md"
        />
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
