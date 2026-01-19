<script lang="ts" setup>
import { circle } from '@turf/turf'

// import { useMap } from 'vue-maplibre-gl'

// const map = useMap()
const mapRef = useTemplateRef('map')

function drawCircle() {
  const map = mapRef.value?.map
  if (map === undefined) {
    return
  }
  const c = circle([-1.405643, 50.928988], 1, { steps: 64, units: 'kilometers' })
  map.addSource('heebus-radius', { type: 'geojson', data: c })
  map.addLayer({ id: 'heebus-radius', type:
  'fill', source: 'heebus-radius', paint: {
    'fill-color': '#8CCFFF',
    'fill-opacity': 0.5,
  } })

  map.addLayer({
    id: 'heebus-radius-outline',
    type: 'line',
    source: 'heebus-radius',
    paint: {
      'line-color': '#0094ff',
      'line-width': 3,
    },
  })
}
defineExpose({ drawCircle })
</script>

<template>
  <Map ref="map" />
</template>

<style>

</style>
