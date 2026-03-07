<script lang="ts" setup>
import type { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'

import type { MapMouseEvent } from 'maplibre-gl'
import TopDrawer from './TopDrawer.vue'

const gameStore = useGameStore()
const { questionBeingEdited, regionCollections } = storeToRefs(gameStore)

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})
const selectedRegionCollectionName = ref('')
const selectedRegionName = ref('')
const selectedRegionCollection: Ref<RegionCollection> = ref({ name: '', featureCollection: { type: 'FeatureCollection', features: [] } })

const regionNames: Ref<string[]> = computed(() => {
  if (selectedRegionCollection.value === undefined) {
    return []
  }
  return selectedRegionCollection.value.featureCollection.features.map((f) => {
    return f.properties?.name ?? ''
  })
})

const hit = ref(true)

function resetFn() {
  // selectedRegionCollectionName.value = ''
  selectedRegionName.value = ''
}

function onMapClick(e: MapMouseEvent) {

}

function allInfoFilled(): boolean {
  return true
}

function onStartEditing() {
  resetFn()
  if (questionBeingEdited.value === undefined) {
    return
  }
  if (questionBeingEdited.value.type !== 'GeoJsonRegion') {
    return
  }
  const gj: GeoJsonRegion = questionBeingEdited.value.question
  selectedRegionCollectionName.value = gj.regionCollectionName
  onSelectRegionCollection()
  selectedRegionName.value = gj.name
  hit.value = gj.hit
}

watch(hit, () => {
  updateQuestion()
})

function updateQuestion() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.updateGeoJsonRegion(questionBeingEdited.value, selectedRegionName.value, selectedRegionCollectionName.value, hit.value)
  }
}

function onSelectRegion() {
  updateQuestion()
}

function onSelectRegionCollection() {
  selectedRegionCollection.value = regionCollections.value.find((rc) => {
    return rc.name === selectedRegionCollectionName.value
  })
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Geographic Region"
    :adding-state="State.ADDING_GEOJSON_REGION"
    :modifying-state="State.MODIFYING_GEOJSON_REGION"
    :reset-fn="resetFn"
    :on-map-click-fn="onMapClick"
    :all-info-filled-fn="allInfoFilled"
    :create-new-question="gameStore.addGeoJsonRegion"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      <USelectMenu
        v-model="selectedRegionCollectionName"
        :items="regionCollections.map((rc) => rc.name)"
        class="w-full"
        placeholder="Select region collection"
        @update:model-value="onSelectRegionCollection"
      />
      <USelectMenu
        v-model="selectedRegionName"
        :items="regionNames"
        class="w-full"
        placeholder="Select region"
        @update:model-value="onSelectRegion"
      />
      <UCheckbox
        v-model="hit"
        label="Hit"
        indicator="end"
        class="w-min"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
