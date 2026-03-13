<script lang="ts" setup>
import {
  useSortable,
} from '@vueuse/integrations/useSortable'
import { ICONS } from '~/constants'
import {
  useGameStore,
} from '~/stores/GameStore'

const gameStore = useGameStore()

const el = useTemplateRef('el')
const { questions } = storeToRefs(gameStore)

onMounted(async () => {
  await nextTick()
  if (el.value) {
    useSortable(el.value, questions, {
      handle: '.handle',
    })
    // await nextTick()
    // gameStore.onNewQuestionData()
  }
  else {
    console.warn('Sortable is undefined')
  }
})
</script>

<template>
  <ClientOnly>
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
            class="w-6 h-16 handle flex flex-col items-center"
          >
            <div class="w-2 h-16 bg-gray-500 rounded-xs " />
          </div>
        </div>
        <div class="w-1" />
        <div class="w-18 h-16 flex flex-col align-middle justify-center">
          <NewQuestionMenu />
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}
</style>
