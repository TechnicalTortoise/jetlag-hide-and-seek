<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'

const opened = ref(false)
const text = ref('')
const gameStore = useGameStore()
const { copy, copied } = useClipboard()

defineExpose({
  open() {
    opened.value = true
    text.value = gameStore.exportGameToString()
  },
},
)
</script>

<template>
  <UModal
    v-model:open="opened"
    title="Export Game"
  >
    <template #body>
      <UTextarea
        v-model="text"
        class="w-full"
        :rows="10"
      >
        <template #trailing>
          <UTooltip
            text="Copy to clipboard"
            :content="{ side: 'right' }"
          >
            <UButton
              :color="copied ? 'success' : 'neutral'"
              variant="link"
              size="sm"
              :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
              aria-label="Copy to clipboard"
              @click="copy(text)"
            />
          </UTooltip>
        </template>
      </UTextarea>
    </template>
  </UModal>
</template>

<style></style>
