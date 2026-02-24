<script lang="ts" setup>
import {
  useGeolocation,
} from '@vueuse/core'
import { Marker } from 'maplibre-gl'
import { getRGB, hexToRGBA } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'
import ExportDataForm from './ExportDataForm.vue'
import ImportDataForm from './ImportDataForm.vue'

const mapStore = useMapStore()

const { coords, locatedAt, error, resume, pause } = useGeolocation()

const enableLocation = ref(false)
let positionMarker: Marker | undefined

const dataInputForm = useTemplateRef('dataInputForm')
const dataExportForm = useTemplateRef('dataExportForm')
const newGameModal = useTemplateRef('newGameModal')

function createMarker() {
  const el = document.createElement('div')
  el.className = 'custom-marker'
  el.style.width = '20px'
  el.style.height = '20px'
  el.style.borderRadius = '50%'
  const backgroundColor: [string, number] = ['secondary', 500]
  el.style.backgroundColor = hexToRGBA(getRGB(backgroundColor), 0.5)
  console.warn(el.style.backgroundColor)

  // el.style.backgroundColor = 'rgba(239, 66, 245, 0.6)'
  el.style.border = '2px solid rgba(164, 47, 168, 0.6)'
  el.style.cursor = 'pointer'

  const map = mapStore.getMap()
  if (map === undefined) {
    return
  }
  const lnglat: [number, number] = [coords.value.longitude, coords.value.latitude]
  positionMarker = new Marker({ element: el }).setLngLat(lnglat).addTo(map)
}

watch(coords, () => {
  if (enableLocation.value) {
    if (positionMarker === undefined) {
      createMarker()
    }
    else {
      const lnglat: [number, number] = [coords.value.longitude, coords.value.latitude]
      positionMarker.setLngLat(lnglat)
    }
  }
})

watch(enableLocation, () => {
  if (enableLocation.value) {
    if (positionMarker === undefined) {
      createMarker()
    }
  }
  else {
    if (positionMarker !== undefined) {
      positionMarker.remove()
      positionMarker = undefined
    }
  }
})

const items = computed(() => [
  {
    label: 'Show location',
    icon: 'i-material-symbols:location-searching-rounded',
    type: 'checkbox' as const,
    checked: enableLocation.value,
    color: 'secondary',
    onUpdateChecked(checked: boolean) {
      enableLocation.value = checked
      if (checked) {
        resume()
      }
      else {
        pause()
      }
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
