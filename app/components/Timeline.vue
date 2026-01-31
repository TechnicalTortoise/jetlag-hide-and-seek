<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import {
  moveArrayElement,
  useSortable,
} from '@vueuse/integrations/useSortable'
import { useGameStore } from '~/stores/GameStore'
import { useMapStore } from '~/stores/MapStore'

const gameStore = useGameStore()

const items = ref<DropdownMenuItem[][]>([[
  { label: 'Radar', type: 'link', onSelect: () => { gameStore.addingRadar = !gameStore.addingRadar } },
  { label: 'Thermometer', type: 'link', onSelect: () => { gameStore.addingThermometer = !gameStore.addingThermometer } },
  { label: 'Region', type: 'link', onSelect: bleebus },
]])

function bleebus() {
  gameStore.addingRadar = !gameStore.addingRadar
}

const mapStore = useMapStore()

const el = useTemplateRef('el')
const show = ref(false)
const slideHeight = ref(0)
const { questions } = storeToRefs(gameStore)

useSortable(el, questions, {
  handle: '.handle',
})

function toggleShow() {
  show.value = !show.value
}

function measureHeight() {
  slideHeight.value = el.value?.offsetHeight || 0
}
</script>

<template>
  <div>
    <div
      class="fixed pointer-events-none right-4 bottom-4 space-y-4 transition-all duration-300"
      :style="{ bottom: show ? `${slideHeight + 16}px` : '16px' }"
    >
      <MapOverlayButton text="🧭" class="pointer-events-auto" @click="mapStore.resetOrientation()" />
      <UDropdownMenu :items="items" :content="{ side: 'left' }">
        <MapOverlayButton text="+" class="pointer-events-auto" />
      </UDropdownMenu>
      <MapOverlayButton
        text="📐" class="pointer-events-auto"
        @click="gameStore.measurementToolActive = !gameStore.measurementToolActive"
      />
      <MapOverlayButton text="🦉" class="pointer-events-auto" @click="toggleShow()" />
    </div>
    <Transition name="slide" @enter="measureHeight">
      <div
        v-show="show" ref="el"
        class="fixed w-screen bg-accented pointer-events-auto flex flex-nowrap overflow-x-scroll shrink-0 bottom-0"
      >
        <div v-for="question in questions" :key="question.id">
          <TimelineItem v-if="question.id > -1" :id="question.id" :text="question.timelineText" />
          <div v-else class="w-8 h-24 bg-red-400 handle" />
        </div>
      </div>
    </Transition>
  </div>
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
