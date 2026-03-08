<script lang="ts" setup>
import type { InputMenuItem } from '@nuxt/ui'

const gameStore = useGameStore()
const isOpen = computed(() => {
  return gameStore.state === State.NEW_GAME_MENU
})

const unitOptions = ref<InputMenuItem[]>([{ label: 'Metric', id: UnitOption.metric }, {
  label: 'Imperial',
  id: UnitOption.imperial,
}])
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="New Game Options"
    :dismissible="false"
    :close="false"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="gameStore.usingLocation"
          label="Show your location"
        />
        <UFormField label="Unit preference">
          <UInputMenu
            v-model="gameStore.unitPreference"
            :items="unitOptions"
            value-key="id"
          />
        </UFormField>
        <USwitch
          v-model="gameStore.showNewGameModalAgain"
          label="Show this menu again"
        />
      </div>
    </template>

    <template #footer>
      <UButton
        label="New Game"
        class="justify-center w-full"
        @click="gameStore.state = State.MAIN"
      />
    </template>
  </UModal>
</template>

<style></style>
