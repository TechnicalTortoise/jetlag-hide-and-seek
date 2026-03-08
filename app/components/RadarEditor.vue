<script lang="ts" setup>
import type { MapMouseEvent } from 'maplibre-gl'
import { getRGB } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'
import TopDrawer from './TopDrawer.vue'

const pinColour: [string, number] = ['tertiary', 500]

const gameStore = useGameStore()
const mapStore = useMapStore()
const { questionBeingEdited } = storeToRefs(gameStore)
const radiusUserUnits = ref(0)

const radiusKm = computed(() => {
  return distancePreferredUnitToKm(radiusUserUnits.value, gameStore.unitPreference)
})

const hit = ref(true)
let lnglat: [number, number] | undefined

const markerId = 'NewRadarMarker'
const defaultPositionString = 'Select position on map'
const positionString = ref(defaultPositionString)
let markerExists: boolean = false // todo reset everything on open drawer

const topDrawerRef = ref<InstanceType<typeof TopDrawer>>()
const active = computed(() => {
  return topDrawerRef.value?.isActive
})

function resetFn() {
  lnglat = undefined
  setBodyText()
  if (markerExists) {
    mapStore.removeMarker(markerId)
    markerExists = false
  }
  radiusUserUnits.value = 1
  hit.value = true
}

function setBodyText() {
  if (lnglat === undefined) {
    positionString.value = defaultPositionString
    return
  }
  const precision = 5
  positionString.value = `${lnglat[1].toFixed(precision)},${lnglat[0].toFixed(precision)}`
}

function onMarkerDrag() {
  if (!active.value || questionBeingEdited.value === undefined) {
    return
  }
  lnglat = mapStore.getMarker(markerId)?.getLngLat().toArray()
  if (lnglat) {
    gameStore.updateRadar(questionBeingEdited.value, radiusKm.value, lnglat, hit.value)
  }
  setBodyText()
}

function onMapClick(e: MapMouseEvent) {
  if (!active.value || questionBeingEdited.value === undefined) {
    return
  }
  lnglat = e.lngLat.toArray()
  gameStore.updateRadar(questionBeingEdited.value, radiusKm.value, lnglat, hit.value)
  if (markerExists) {
    mapStore.removeMarker(markerId)
  }
  mapStore.addMarker(markerId, lnglat, true, onMarkerDrag, getRGB(pinColour))
  markerExists = true
  setBodyText()
}

function allInfoFilled(): boolean {
  if (lnglat === undefined) {
    return false
  }
  if (radiusKm.value === 0) {
    return false
  }
  return true
}

function onStartEditing() {
  resetFn()
  const question = questionBeingEdited.value
  if (question === undefined || question.type !== 'Radar') {
    return
  }

  const r = question.question as Radar
  lnglat = r.lnglat
  if (r.hit !== undefined) {
    hit.value = r.hit
  }
  if (r.radiusKm !== undefined) {
    radiusUserUnits.value = distanceKmToPreferredUnit(r.radiusKm, gameStore.unitPreference)
  }
  if (lnglat !== undefined) {
    mapStore.addMarker(markerId, lnglat, true, onMarkerDrag)
    markerExists = true
  }
  setBodyText()
}

watch(hit, () => {
  updateRadar()
})
watch(radiusKm, () => {
  updateRadar()
})

function updateRadar() {
  if (questionBeingEdited.value !== undefined && lnglat !== undefined) {
    gameStore.updateRadar(questionBeingEdited.value, radiusKm.value, lnglat, hit.value)
  }
}
</script>

<template>
  <TopDrawer
    ref="topDrawerRef"
    name="Radar"
    :adding-state="State.ADDING_RADAR"
    :modifying-state="State.MODIFYING_RADAR"
    :reset-fn="resetFn"
    :on-map-click-fn="onMapClick"
    :all-info-filled-fn="allInfoFilled"
    :create-new-question="gameStore.addRadar"
    :on-start-editing="onStartEditing"
  >
    <template #MainContentSlot>
      <div>
        {{ positionString }}
      </div>
      <UFormField :label="`Radius (${unitToLongString(gameStore.unitPreference)})`">
        <UInputNumber
          v-model="radiusUserUnits"
          :format-options="{
            minimumFractionDigits: 1,

          }"
          :step-snapping="false"
          :increment="true"
          :decrement="true"
          :min="0"
        />
      </UFormField>
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
