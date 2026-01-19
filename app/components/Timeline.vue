<script lang="ts" setup>
const show = ref(false)
</script>

<template>
  <UButton class="pointer-events-auto" @click="show = !show">
    Toggle
  </UButton>

  <Transition name="slide">
    <div
      v-if="show"
      class="absolute w-screen h-32 bg-accented bottom-0 pointer-events-auto"
    >
      <TimelineItem text="R" />
    </div>
  </Transition>
</template>

<style>
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateY(100%);
  /* how to remove scroll bar which temporarily appears? */
}
</style>
