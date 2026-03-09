<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { AreYouSureModal, RegionCollectionManagerModal, UploadGeoJsonModal } from '#components'
import { ICONS } from '~/constants'

const gameStore = useGameStore()

const overlay = useOverlay()
const regionCollectionsModal = overlay.create(RegionCollectionManagerModal)
const areYouSureModal = overlay.create(AreYouSureModal)

const gameFileInput = ref(null)
const gameFileCurrentlyUploading = ref(false)

async function onGameFileUpload(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }
  try {
    gameFileCurrentlyUploading.value = true
    const text = await file.text()
    gameStore.importGameFromString(text)
  }
  catch {
    console.error('Failed to parse file')
    // todo show an error
  }
  gameFileCurrentlyUploading.value = false
}

const items = ref<DropdownMenuItem[][]>([
  {
    label: 'Show location',
    icon: 'i-material-symbols:location-searching-rounded',
    type: 'checkbox' as const,
    checked: computed(() => {
      return gameStore.userLocation.enabled
    }),
    color: 'secondary',
    onSelect: (e: Event) => {
      e.preventDefault()
      gameStore.userLocation.enabled = !gameStore.userLocation.enabled
    },

  },
  {
    label: 'New game',
    type: 'link',
    icon: 'material-symbols:delete-outline-rounded',
    onSelect: async () => {
      const instance = areYouSureModal.open({
        titleText: 'Are you sure you want to start a new game?',
        bodyText: 'This will delete all radars, thermometers, polygons, and pins.',
      })
      const yes = await instance.result
      if (yes) {
        gameStore.resetGame()
        if (gameStore.showNewGameModalAgain) {
          gameStore.state = State.NEW_GAME_MENU
        }
      }
    },
  },
  {
    label: 'Export Game',
    icon: 'i-material-symbols:file-export-outline-rounded',
    onSelect: () => {
      downloadFile(gameStore.exportGameToString())
    },
  },
  {
    label: 'Import Game',
    icon: 'i-material-symbols:file-open-outline',
    onSelect: () => {
      gameFileInput.value.click()
    },
  },
  {
    label: 'Manage Region Collections',
    icon: ICONS.geoJsonRegion,
    onSelect: () => {
      regionCollectionsModal.open()
    },
  },
  {
    icon: 'material-symbols:measuring-tape-outline-rounded',
    label: 'Unit Preference',

    children:
      [
        {
          type: 'checkbox',
          label: 'Metric',
          checked: computed(() => { return gameStore.unitPreference === UnitOption.metric }),
          onSelect(e: Event) {
            e.preventDefault()
            gameStore.unitPreference = UnitOption.metric
          },
        },
        {
          label: 'Imperial',
          type: 'checkbox',
          checked: computed(() => { return gameStore.unitPreference === UnitOption.imperial }),
          onSelect(e: Event) {
            e.preventDefault()
            gameStore.unitPreference = UnitOption.imperial
          },
        },
      ],

    onSelect: () => {

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
  <input
    ref="gameFileInput"
    type="file"
    accept=".json"
    hidden="true"
    @change="onGameFileUpload"
  >
</template>

<style></style>
