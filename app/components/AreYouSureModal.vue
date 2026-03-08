<script lang="ts" setup>
const {
  titleText = 'Are you sure?',
  bodyText = '',
  noButtonText = 'No',
  yesButtonText = 'Yes',
} = defineProps<{
  titleText?: string
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
    :title="titleText"
    :ui="{ footer: 'justify-end' }"
    :close="{ onClick: () => emit('close', false) }"
  >
    <template
      v-if="bodyText.length > 0"
      #body
    >
      {{ bodyText }}
    </template>
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
