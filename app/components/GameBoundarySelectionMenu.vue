<script lang="ts" setup>
import type { Feature, FeatureCollection } from 'geojson'
import { useTimeout } from '@vueuse/core'

const gameStore = useGameStore()
const { searchPlaces, getPlacePolygon } = useGeoapify()

const returnedFeatures: Ref<FeatureCollection> = ref({ type: 'FeatureCollection', features: [] })
const returnedPlaceNames: Ref<string[]> = ref([])

const open = computed(() => {
  return gameStore.state === State.SETTING_GAME_BOUNDARY
})

function getPlaceId(f: Feature) {
  return f.properties.place_id
}

const searchTerm = ref('')
let previousSearchedTerm = ''
const waitingForRequest = ref(false)
let searchRunning: boolean = false
const { ready, start, stop } = useTimeout(1000, { controls: true })

function onSearch() {
  console.warn(searchTerm.value)
  if (!searchRunning) {
    apiTest()
  }
}

watch(searchTerm, () => {
  if (searchTerm.value.length < 2) {
    return
  }
  if (ready.value) {
    start()
  }
})

watch(ready, () => {
  if (searchTerm.value !== previousSearchedTerm) {
    search()
    previousSearchedTerm = searchTerm.value
  }
})

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function search() {
  searchRunning = true
  try {
    const data: FeatureCollection = await searchPlaces(searchTerm.value)
    // remove duplicates
    returnedFeatures.value.features = []
    returnedPlaceNames.value = []
    data.features.forEach((f) => {
      const currentId = getPlaceId(f)
      let alreadyAdded = false
      returnedFeatures.value.features.forEach((checkFeature) => {
        if (getPlaceId(checkFeature) === currentId) {
          alreadyAdded = true
        }
      })
      if (!alreadyAdded) {
        returnedFeatures.value.features.push(f)
        returnedPlaceNames.value.push(f.properties.formatted)
      }
    })
  }
  catch (error) {
    console.error('Search error: ', error)
  }
  searchRunning = false
}
</script>

<template>
  <UModal
    :open="open"
    :close="false"
    :overlay="false"
    :dismissible="false"
    title="Select Game Area"
  >
    <template #body>
      <UInput
        v-model="searchTerm"
        placeholder="Search for a place..."
        icon="i-lucide-search"
        class="w-full"
        :loading="waitingForRequest"
      />

      <USelectMenu
        :items="returnedPlaceNames"
        class="w-full"
        :search-input="false"
      />
    </template>

    <template #footer>
      <UButton label="Confirm" />
    </template>
  </UModal>
</template>

<style></style>
