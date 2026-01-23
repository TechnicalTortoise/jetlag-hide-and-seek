<script lang="ts" setup>
import type { ComponentInstance, ComponentPublicInstance } from 'vue'
import { useDraggable } from '@vueuse/core'
import { onMounted, ref, useTemplateRef } from 'vue'
import { useGameStore } from '~/stores/GameStore'

const show = ref(true)
const gameStore = useGameStore()
const { questions } = storeToRefs(gameStore)
const draggable = useTemplateRef('draggable')
const container = ref(null)
const itemRefs = ref<ComponentPublicInstance[]>([])
const snapPoints = ref<number[]>([])

function setItemRef(comp: ComponentPublicInstance | null | Element) {
  if (comp && !itemRefs.value.includes(comp as ComponentPublicInstance)) {
    itemRefs.value.push(comp as ComponentPublicInstance)
  }
}

function calculateSnapPoints() {
  snapPoints.value = itemRefs.value
    .map((component) => {
      // Get the root DOM element from the component
      const el = component?.$el
      if (!el)
        return null

      const rect = el.getBoundingClientRect()
      return rect.left + rect.width / 2
    })
    .filter(x => x !== null)
  console.warn(snapPoints)
}
onMounted(() => {
  itemRefs.value = []
  setTimeout(() => {
    calculateSnapPoints()
    console.warn(snapPoints.value)
  }, 0)
})

const { x, y, style } = useDraggable(draggable, {
  axis: 'x',
  initialValue: {
    x: 0,
    y: 0,
  },
  containerElement: container,
  onMove: (position) => {
    let bestX: number = 0
    let bestDistance: number = Infinity
    snapPoints.value.forEach((snapX) => {
      const d: number = Math.abs(position.x - snapX)
      if (d < bestDistance) {
        bestDistance = d
        bestX = snapX
      }
      // todo can break early
    })
    position.x = bestX
  },
})
</script>

<template>
  <UButton class="pointer-events-auto" @click="show = !show">
    Toggle
  </UButton>

  <Transition name="slide">
    <div v-if="show" class="absolute w-screen h-32 bg-accented bottom-0 pointer-events-auto">
      <TimelineItem v-for="question in questions" :key="question.id" :ref="setItemRef" :text="question.timelineText" />
      <div ref="draggable" class="w-1 h-24 bg-red-400 float-left" :style="style" style="position:absolute" />
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
