<script lang="ts" setup>
import type { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson'
import type TopDrawer from './TopDrawer.vue'
import { useTimeout } from '@vueuse/core'

const gameStore = useGameStore()
let question: Question | undefined

const { searchPlaces, getPlacePolygon } = useGeoapify()
const returnedFeatures: Ref<FeatureCollection> = ref({ type: 'FeatureCollection', features: [] })
const returnedPlaceNames: Ref<string[]> = ref([])

const searchTerm = ref('')
const selectedPlaceName = ref('')
let selectedPolygon: GeoJsonProperties
let previousSearchedTerm = ''
const { ready, start } = useTimeout(1000, { controls: true })
const searchRunning = ref(false)

const selectMenuOpen = ref(false)
const selectedPlaceIndex = ref(-1)

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  searchTerm.value = ''
  previousSearchedTerm = ''
  selectedPlaceIndex.value = -1
  returnedPlaceNames.value = []
  returnedFeatures.value.features = []
}

function updateQuestion() {
  if (question === undefined || selectedPolygon === undefined) {
    return
  }
  gameStore.updateGameBoundary(question, selectedPlaceName.value, selectedPolygon)
}

function deleteQ() {
  if (question !== undefined) {
    gameStore.removeQuestion(question.id)
  }
  topDrawerRef.value?.closeFn()
}

function add() {
  topDrawerRef.value?.closeFn()
}

function edit() {
  topDrawerRef.value?.closeFn()
}

function onStartAdding() {
  resetFn()
  question = gameStore.addGameBoundary()
}

function onStartEditing() {
  resetFn()
  question = gameStore.getQuestionToEdit(gameStore.questionIdBeingEdited)
}

function onCancel() {
  if (gameStore.state === State.ADDING_GAME_BOUNDARY) {
    if (question !== undefined) {
      gameStore.removeQuestion(question.id)
    }
  }
  else if (gameStore.state === State.MODIFYING_GAME_BOUNDARY) {
    gameStore.onNewQuestionData()
  }
  topDrawerRef.value?.closeFn()
}

function getPlaceId(f: Feature) {
  return f.properties.place_id
}

async function selectPlace() {
  if (selectedPlaceIndex.value === -1) {
    return
  }

  const id = getPlaceId(returnedFeatures.value.features[selectedPlaceIndex.value])

  const data: FeatureCollection = await getPlacePolygon(id)
  if (data.features.length > 0) {
    const f = data.features.at(0)
    if (f?.geometry.type === 'Polygon') {
      selectedPolygon = f.geometry
      updateQuestion()
    }
  }
}

watch(searchTerm, () => {
  if (searchTerm.value.length < 2) {
    return
  }
  // if searchTerm is something in the list of results then we've selected it
  selectedPlaceIndex.value = returnedPlaceNames.value.findIndex((p) => {
    return p === searchTerm.value
  })

  if (selectedPlaceIndex.value === -1) {
    start()
    return
  }
  if (ready.value) {
    selectPlace()
  }
})

watch(ready, () => {
  if (searchTerm.value !== previousSearchedTerm) {
    search()
    previousSearchedTerm = searchTerm.value
  }
})

async function search() {
  searchRunning.value = true
  try {
    const data: FeatureCollection = await searchPlaces(searchTerm.value)
    // remove duplicates
    returnedFeatures.value.features = []
    returnedPlaceNames.value = []
    if (data.features) {
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

    selectMenuOpen.value = (returnedPlaceNames.value.length > 0)
  }
  catch (error) {
    console.error('Search error: ', error)
  }
  searchRunning.value = false
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Game Boundary"
    :adding-state="State.ADDING_GAME_BOUNDARY"
    :modifying-state="State.MODIFYING_GAME_BOUNDARY"
    :reset-fn="resetFn"
    body-text=""
    :on-map-click-fn="() => { }"
    :delete-fn="deleteQ"
    :add-fn="add"
    :edit-fn="edit"
    :all-info-filled-fn="() => { return true }"
    :on-start-adding="onStartAdding"
    :on-start-editing="onStartEditing"
    :on-cancel-fn="onCancel"
  >
    <template #MainContentSlot>
      <UInputMenu
        v-model:search-term="searchTerm"
        v-model="selectedPlaceName"
        :items="returnedPlaceNames"
        :loading="searchRunning"
        placeholder="Search for a place..."
        class="w-full"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
