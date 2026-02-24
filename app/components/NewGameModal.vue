<script lang="ts" setup>
const gameStore = useGameStore()
const isOpen = ref(false)

defineExpose({
  open() {
    isOpen.value = true
  },
},
)
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="New Game"
  >
    <template #body>
      Are you sure you want to start a new game?
      This will delete all radars, thermometers, polygons, and pins.
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        class="justify-center w-full"
        @click="close"
      />
      <UButton
        label="New Game"
        class="justify-center w-full"
        @click="close(); gameStore.resetGame()"
      />
    </template>
  </UModal>
</template>

<style></style>
