<script lang="ts" setup>
import { ICONS } from '~/constants'

const gameStore = useGameStore()
const mapStore = useMapStore()

const { state } = storeToRefs(gameStore)
const { mapBearing } = storeToRefs(mapStore)
const userLocation = gameStore.userLocation

function toggleMeasuring() {
  if (state.value === State.MEASURING) {
    state.value = State.MAIN
  }
  else {
    state.value = State.MEASURING
  }
}

function toggleTimeline() {
  gameStore.timelineShowing = !gameStore.timelineShowing
}

function onClickCompass() {
  const map = mapStore.getMap()
  if (!map)
    return
  if (map.getBearing() === 0) {
    userLocation.moveMapToPosition()
  }
  else {
    mapStore.resetOrientation()
  }
}
</script>

<template>
  <div>
    <div
      class="fixed pointer-events-none right-4 bottom-4 space-y-4 transition-all duration-300 ease-in-out"
      :style="{
        transform: gameStore.timelineShowing ? 'translateY(-80px)' : 'translateY(0)',
      }"
    >
      <MapOverlayButton
        icon-name="material-symbols:expand-circle-up-outline-rounded"
        :icon-angle="-mapBearing"
        class="pointer-events-auto"
        :ui="{}"
        @click="onClickCompass"
      />

      <NewQuestionMenu>
        <MapOverlayButton
          :icon-name="ICONS.newQuestion"
          class="pointer-events-auto"
        />
      </NewQuestionMenu>
      <MapOverlayButton
        icon-name="material-symbols:measuring-tape-outline"
        class="pointer-events-auto"
        @click="
          toggleMeasuring()
        "
      />

      <OptionsMenu />

      <MapOverlayButton
        icon-name="material-symbols:view-timeline-outline-rounded"
        class="pointer-events-auto"
        @click="toggleTimeline()"
      />
    </div>
  </div>
</template>

<style></style>
