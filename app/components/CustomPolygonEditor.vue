<script lang="ts" setup>
import type { GeoJsonProperties, Polygon } from 'geojson'
import type { MapMouseEvent } from 'maplibre-gl'
import { map } from '@indoorequal/vue-maplibre-gl'
import * as turf from '@turf/turf'
import { Marker } from 'maplibre-gl'
import { useMapStore } from '~/stores/MapStore'
import { getRGB } from '~/utils'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]
const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)
const bodyText = ref('Select points on the map to create a region')

const inside = ref(true)
let markers: string[] = []
let currentId: number = 0
const mapSourceLayerId = 'CustomRegionID'
let polygon: Polygon

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  markers.forEach((m) => {
    mapStore.removeMarker(m)
  })
  markers = []
  currentId = 0

  setBodyText()
}

function setBodyText() {

}

function drawPolygon() {
  const map = mapStore.getMap()
  const source = map.getSource(mapSourceLayerId)
  if (source === undefined) {
    map.addSource(mapSourceLayerId, { type: 'geojson', data: polygon })
  }
  else {
    source.setData(polygon)
  }
  if (map.getLayer(mapSourceLayerId) === undefined) {
    map.addLayer({
      id: mapSourceLayerId,
      type:
        'fill',
      source: mapSourceLayerId,
      paint: {
        'fill-color': '#006400',
        'fill-opacity': 0.5,
      },
    })
  }
}

function computeGeoJson() {
  if (markers.length < 3) {
    return
  }
  const points: [number, number][] = []
  markers.forEach((m) => {
    points.push(mapStore.getMarker(m).getLngLat().toArray())
  })
  points.push(mapStore.getMarker(markers[0]).getLngLat().toArray())
  polygon = turf.polygon([points])
  drawPolygon()
}

function onMarkerDrag() {
  computeGeoJson()
}

function newMarker(lnglat: [number, number]) {
  const id = `CustomRegion${currentId}`
  mapStore.addMarker(id, lnglat, true, onMarkerDrag, getRGB(pinColour), () => {
    mapStore.removeMarker(id)
    const index = markers.findIndex((m) => {
      return m === id
    })
    markers.splice(index, 1)
    computeGeoJson()
  })
  markers.push(id)
  computeGeoJson()
  currentId += 1
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  newMarker(e.lngLat.toArray())

  setBodyText()
}

function deleteRegion() {
  if (questionBeingEdited.value !== undefined) {
    gameStore.removeQuestion(questionBeingEdited.value.id)
    close()
  }
}

function add() {
  close()
}

function edit() {
  close()
}

function allInfoFilled(): boolean {
  return true
}

function onStartAdding() {
  resetFn()
}

function onStartEditing() {
  // const q = gameStore.questionBeingEdited
  // if (q === undefined || q.type !== 'Radar') {
  //   return
  // }
  // const r: Radar = q.question
  // lnglat = r.lnglat
  // hit.value = r.hit
  // radiusKm.value = r.radius
  // mapStore.addMarker(markerId, lnglat, true, onMarkerDrag)
  // markerExists = true
  setBodyText()
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Custom Region"
    :adding-state="State.ADDING_CUSTOM_REGION"
    :modifying-state="State.MODIFYING_CUSTOM_REGION"
    :reset-fn="resetFn"
    :body-text="bodyText"
    :on-map-click-fn="onMapClick"
    :delete-fn="deleteRegion"
    :add-fn="add"
    :edit-fn="edit"
    :all-info-filled-fn="allInfoFilled"
    :on-start-adding="onStartAdding"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
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
