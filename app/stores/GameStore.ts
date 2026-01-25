import type { Units } from '@turf/turf'
import { useMapStore } from '~/stores/MapStore'

// type guards
export interface Question {
  type: 'Radar' | 'TimelineMarker'
  question: Radar | undefined
  timelineText: string
  id: number
}

interface Radar {
  radius: number
  units: Units
  lnglat: [number, number]

}

export const useGameStore = defineStore('game', () => {
  const questions: Ref<Question[]> = ref([])
  const mapStore = useMapStore()
  const { mapInstance, mapLoaded } = storeToRefs(mapStore)

  function addRadar(radius: number, units: Units, lnglat: [number, number]) {
    const radar: Radar = { radius, units, lnglat }
    radar.radius = radius
    radar.units = units
    radar.lnglat = lnglat
    questions.value.push({
      question: radar,
      type: 'Radar',
      timelineText: `${radius.toString()} ${units}`,
      id: questions.value.length - 1,
    })
  }

  const gameArea = {
    center: [-1.407516809729255, 50.94303107100244] as [number, number],
    radiusKm: 5.0,
  }

  const timelineMarkerIndex: Ref<number> = ref(0)

  questions.value.push({
    question: undefined,
    type: 'TimelineMarker',
    timelineText: '',
    id: -1,
  })

  const drawGameArea = () => {
    mapStore.drawCircle(gameArea.center, gameArea.radiusKm, 'kilometers', 'gameArea', 'gameArea')
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

  addRadar(1, 'kilometers', [-1.407516809729255, 50.94303107100244])
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
