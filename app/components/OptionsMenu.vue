<script lang="ts" setup>
import ExportDataForm from './ExportDataForm.vue'
import ImportDataForm from './ImportDataForm.vue'

const gameStore = useGameStore()

const dataInputForm = useTemplateRef('dataInputForm')
const dataExportForm = useTemplateRef('dataExportForm')
const newGameModal = useTemplateRef('newGameModal')

const items = computed(() => [
  {
    label: 'Show location',
    icon: 'i-material-symbols:location-searching-rounded',
    type: 'checkbox' as const,
    checked: gameStore.userLocation.enabled,
    color: 'secondary',
    onUpdateChecked(checked: boolean) {
      gameStore.userLocation.enabled = checked
    },
  },
  {
    label: 'New game',
    type: 'link',
    icon: 'material-symbols:delete-outline-rounded',
    onSelect: () => { newGameModal.value?.open() },
  },
  {
    label: 'Export Data',
    icon: 'i-material-symbols:file-export-outline-rounded',
    onSelect: () => {
      if (dataExportForm.value) {
        dataExportForm.value.open()
      }
    },
  },
  {
    label: 'Import Data',
    icon: 'i-material-symbols:file-open-outline',
    onSelect: () => {
      if (dataInputForm.value) {
        dataInputForm.value.open()
      }
    },
  },
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ side: 'left' }"
  >
    <MapOverlayButton
      icon-name="material-symbols:settings-outline-rounded"
      class="pointer-events-auto"
    />
  </UDropdownMenu>

  <ImportDataForm ref="dataInputForm" />
  <ExportDataForm ref="dataExportForm" />
  <NewGameModal ref="newGameModal" />
</template>

<style></style>
