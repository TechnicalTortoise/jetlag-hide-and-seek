<script lang="ts" setup>
import type { GeoJsonProperties, Polygon } from 'geojson'
import type { MapMouseEvent } from 'maplibre-gl'
import { map } from '@indoorequal/vue-maplibre-gl'
import * as turf from '@turf/turf'
import { Marker } from 'maplibre-gl'
import { getRGB } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]
const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)

const bodyText = ref('Select points on the map to create a region')

const inside = ref(true)
let markers: string[] = []
let currentId: number = 0

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function updateQuestion() {
  if (questionBeingEdited.value === undefined) {
    return
  }
  const points: [number, number][] = []
  markers.forEach((m) => {
    points.push(mapStore.getMarker(m).getLngLat().toArray())
  })

  gameStore.updateCustomRegion(questionBeingEdited.value, points, inside.value)
}

function resetFn() {
  markers.forEach((m) => {
    mapStore.removeMarker(m)
  })
  markers = []
  currentId = 0
}

function onMarkerDrag() {
  updateQuestion()
}

function newMarker(lnglat: [number, number]) {
  const id = `CustomRegion${currentId}`
  mapStore.addMarker(id, lnglat, true, onMarkerDrag, getRGB(pinColour), () => {
    mapStore.removeMarker(id)
    const index = markers.findIndex((m) => {
      return m === id
    })
    markers.splice(index, 1)
    updateQuestion()
  })
  markers.push(id)
  updateQuestion()
  currentId += 1
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  newMarker(e.lngLat.toArray())
}

function allInfoFilled(): boolean {
  return true
}

function onStartEditing() {
  resetFn()
  const question = questionBeingEdited.value
  if (question === undefined || question.type !== 'CustomRegion') {
    return
  }
  if (question.question === undefined) {
    return
  }
  const cr: CustomRegion = question.question
  inside.value = cr.inside
  cr.points.forEach((p) => {
    newMarker(p)
  })
}

watch(inside, () => {
  updateQuestion()
})
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Custom Region"
    :adding-state="State.ADDING_CUSTOM_REGION"
    :modifying-state="State.MODIFYING_CUSTOM_REGION"
    :reset-fn="resetFn"
    :on-map-click-fn="onMapClick"
    :all-info-filled-fn="allInfoFilled"
    :create-new-question="gameStore.addCustomRegion"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      {{ bodyText }}
      <UCheckbox
        v-model="inside"
        label="Inside"
        indicator="end"
        class="w-min"
      />
    </template>
  </TopDrawer>
</template>

<style></style>
