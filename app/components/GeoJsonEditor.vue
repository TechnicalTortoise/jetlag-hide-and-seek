<script lang="ts" setup>
import type { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'

import type { MapMouseEvent } from 'maplibre-gl'
import * as turf from '@turf/turf'

import { GeoJSONFeature } from 'maplibre-gl'
import { getRGB } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

const regionNames: Ref<[string]> = ref([' '])
const selectedRegionName = ref('')
let polygons: { [name: string]: GeoJsonProperties }
let selectedPolygon: GeoJsonProperties
const hit = ref(true)

function resetFn() {

}

function onMapClick(e: MapMouseEvent) {

}

function allInfoFilled(): boolean {
  return true
}

function onStartEditing() {
  resetFn()
}

function onSelectRegionName() {
  const p = polygons[selectedRegionName.value]
  if (p !== undefined) {
    selectedPolygon = p

    if (questionBeingEdited.value === undefined) {
      console.warn('Undefined question')
    }
    else {
      updateQuestion()
    }
  }
}

function unwrapMultiPolygon(feature: Feature<MultiPolygon>): Feature<Polygon> {
  return {
    ...feature,
    geometry: {
      type: 'Polygon',
      coordinates: feature.geometry.coordinates[0],
    },
  }
}

async function readDataFromFile() {
  const filePath = '/limites-administratives-des-communes-en-region-de-bruxelles-capitale.geojson'
  try {
    const data: FeatureCollection = await $fetch(filePath)
    // console.warn()
    const nameField = 'name_fr'
    // const props = data.features[0].properties
    // for (const key in props) {
    //   if (/(name|nm)/i.test(key)) {
    //     nameFields.push(key)
    //   }
    // }
    // console.warn('Found possible name fields: ', nameFields)

    // data.features.array.forEach((feature) => {

    //   // const nameField = 'name_fr'
    // })

    // console.warn(data)

    // temp: combine all regions into one to save out
    // const newFeatures: FeatureCollection = new turf.featureCollection([])
    // data.features.forEach((feature) => {
    //   newFeatures.features.push(turf.buffer(feature, 5, { units: 'meters' }))
    // })
    // const combined = turf.union(newFeatures)
    // console.warn(combined)

    regionNames.value = []
    polygons = {}
    data.features.forEach((feature) => {
      if ('properties' in feature) {
        if (nameField in feature.properties) {
          const name = feature.properties[nameField]
          regionNames.value.push(name)
          polygons[name] = feature
        }
      }
    })
    regionNames.value.sort()
    console.warn(polygons)
    // console.warn(regionNames.value)
  }
  catch (error) {
    console.error('Failed to load JSON:', error)
  }
}

async function onTestClick() {
  await readDataFromFile()
}

watch(hit, () => {
  updateQuestion()
})

function updateQuestion() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.updateGeoJsonRegion(questionBeingEdited.value, selectedRegionName.value, hit.value, selectedPolygon)
  }
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="GeoJSON Region"
    :adding-state="State.ADDING_GEOJSON_REGION"
    :modifying-state="State.MODIFYING_GEOJSON_REGION"
    :reset-fn="resetFn"
    :on-map-click-fn="onMapClick"
    :all-info-filled-fn="allInfoFilled"
    :create-new-question="gameStore.addGeoJsonRegion"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      <UButton
        label="Blub"
        @click="onTestClick"
      />
      <USelectMenu
        v-model="selectedRegionName"
        :items="regionNames"
        class="w-full"
        @update:model-value="onSelectRegionName"
      />
      <UCheckbox
        v-model="hit"
        label="Hit"
        indicator="end"
        class="w-min"
      />
      <!-- <UFileUpload label="Upload GeoJSON file containing region polygon(s)" /> -->
    </template>
  </TopDrawer>
</template>

<style></style>
