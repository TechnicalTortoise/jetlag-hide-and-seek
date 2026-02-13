<script lang="ts" setup>
const opened = ref(false)
const inputValue = ref('')
const gameStore = useGameStore()
const invalid = ref(false)
const errorMessage = ref('')

watch(inputValue, () => {
  invalid.value = false
  errorMessage.value = ''
})

defineExpose({
  open() {
    inputValue.value = ''
    invalid.value = false
    errorMessage.value = ''
    opened.value = true
  },
},
)

function onClickAccept() {
  if (gameStore.setQuestionsFromString(inputValue.value)) {
    opened.value = false
  }
  else {
    invalid.value = true
    errorMessage.value = 'Failed to parse input'
  }
}
</script>

<template>
  <UModal
    v-model:open="opened"
    title="Import Data"
  >
    <template #body>
      <UTextarea
        v-model="inputValue"
        class="w-full"
        :rows="10"
        :ui="invalid ? {
          base: 'ring-1 ring-error-500 dark:ring-error-400',
        } : {}"
      />
    </template>
    <template #footer>
      <UButton
        label="Accept"
        @click="onClickAccept"
      />
      {{ errorMessage }}
    </template>
  </UModal>
</template>

<style></style>
