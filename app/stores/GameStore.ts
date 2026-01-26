import type { Units } from '@turf/turf'
import type { GeoJsonProperties } from 'geojson'
import { timeline } from '#build/ui'
import { id, tr } from '@nuxt/ui/runtime/locale/index.js'
import { circle, difference, featureCollection, intersect, union } from '@turf/turf'
import { useMapStore } from '~/stores/MapStore'

// type guards
export interface Question {
  type: 'Radar' | 'TimelineMarker'
  question: Radar | undefined
  timelineText: string
  id: number
  mapLayerId: string
  fullPolygon: GeoJsonProperties | undefined
  exclusivePolygon: GeoJsonProperties | undefined
}

interface Radar {
  radius: number
  units: Units
  lnglat: [number, number]
  hit: boolean

}

export const useGameStore = defineStore('game', () => {
  const questions: Ref<Question[]> = ref([])
  const mapStore = useMapStore()
  const { mapInstance, mapLoaded } = storeToRefs(mapStore)

  function addRadar(radius: number, units: Units, lnglat: [number, number], hit: boolean) {
    const radar: Radar = { radius, units, lnglat, hit }
    // radar.radius = radius
    // radar.units = units
    // radar.lnglat = lnglat

    const c: GeoJsonProperties = circle(lnglat, radius, { steps: 64, units })
    // const entirePolygon: GeoJsonProperties = hit ? mapStore.invertGeometry(c) : c
    const entirePolygon: GeoJsonProperties = c

    // const inverted = invertGeometry(c)
    const id = questions.value.length - 1
    const name = `${radius.toString() + units.toString()} Radar (${id.toString()})`

    questions.value.push({
      question: radar,
      type: 'Radar',
      timelineText: `${radius.toString()} ${units}`,
      id,
      mapLayerId: name,
      fullPolygon: entirePolygon,
      exclusivePolygon: undefined,
    })
  }

  const gameArea = {
    center: [-1.407516809729255, 50.94303107100244] as [number, number],
    radiusKm: 7.0,
  }

  const timelineMarkerIndex: Ref<number> = ref(0)

  questions.value.push({
    question: undefined,
    type: 'TimelineMarker',
    timelineText: '',
    id: -1,
    mapLayerId: '',
    fullPolygon: undefined,
    exclusivePolygon: undefined,
  })

  const drawGameArea = () => {
    const fullWorld: GeoJsonProperties = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          // Outer ring - covers the world
          [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ],
        ],
      },
    }
    let currentRemainingArea: GeoJsonProperties = fullWorld
    questions.value.forEach((q: Question) => {
      if (q.type === 'Radar') {
        const r = q.question
        if (r !== undefined) {
          // const name = `${r.radius.toString() + r.units.toString()} Radar (${q.id.toString()})`
          // mapStore.drawCircle(r.lnglat, r.radius, r.units, name, name, r.hit)
          if (q.fullPolygon !== undefined) {
            if (r.hit) {
              q.exclusivePolygon = difference(featureCollection([currentRemainingArea, q.fullPolygon]))
            }
            else {
              q.exclusivePolygon = difference(featureCollection([currentRemainingArea, mapStore.invertGeometry(q.fullPolygon)]))
            }
            currentRemainingArea = difference(featureCollection([currentRemainingArea, q.exclusivePolygon]))

            mapStore.drawPolygon(q.exclusivePolygon, q.mapLayerId)
          }
        }
      }
    })
  }

  watch(mapLoaded, () => {
    console.warn('map loaded watcher says ', mapLoaded.value)
    if (mapLoaded.value) {
      drawGameArea()
    }
  })

  watch(mapInstance, () => {
    console.warn('Map instance watcher running')
    if (mapInstance.value === undefined) {
      console.warn('Map instance undefined')
    }
    // drawGameArea()
  })

  watch(questions, (newQuestions) => {
    timelineMarkerIndex.value = newQuestions.findIndex((question) => {
      return question.type === 'TimelineMarker'
    })
  })

  addRadar(gameArea.radiusKm, 'kilometers', gameArea.center, true)

  addRadar(6, 'kilometers', [-1.4432936229776763, 50.93119754191312], false)

  addRadar(1, 'kilometers', [-1.3583492927662713, 50.94474366229376], true)

  // addRadar(2, 'kilometers', [-1.405643, 50.928988])
  // addRadar(3, 'kilometers', [-1.405643, 50.928988])
  // addRadar(4, 'kilometers', [-1.405643, 50.928988])
  // addRadar(5, 'kilometers', [-1.405643, 50.928988])
  // addRadar(6, 'kilometers', [-1.405643, 50.928988])
  // addRadar(7, 'kilometers', [-1.405643, 50.928988])
  // addRadar(8, 'kilometers', [-1.405643, 50.928988])
  // addRadar(9, 'kilometers', [-1.405643, 50.928988])
  // addRadar(10, 'kilometers', [-1.405643, 50.928988])
  // addRadar(11, 'kilometers', [-1.405643, 50.928988])
  // addRadar(12, 'kilometers', [-1.405643, 50.928988])
  // addRadar(13, 'kilometers', [-1.405643, 50.928988])
  // addRadar(14, 'kilometers', [-1.4065168097292855, 50.94303107100244])

  // todo move timeline marker to the end

  return { questions, addRadar, timelineMarkerIndex, gameArea }
})
