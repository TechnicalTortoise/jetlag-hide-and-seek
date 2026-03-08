<script lang="ts" setup>
const {
  bodyText = 'Are you sure?',
  noButtonText = 'No',
  yesButtonText = 'Yes',
} = defineProps<{
  bodyText?: string
  noButtonText?: string
  yesButtonText?: string
}>()

const emit = defineEmits<{
  close: [boolean]
}>()
</script>

<template>
  <UModal
    :title="bodyText"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: () => emit('close', false) }"
  >
    <template #footer>
      <UButton
        :label="noButtonText"
        color="neutral"
        variant="outline"
        @click="emit('close', false)"
      />
      <UButton
        :label="yesButtonText"
        color="neutral"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>

<style></style>
