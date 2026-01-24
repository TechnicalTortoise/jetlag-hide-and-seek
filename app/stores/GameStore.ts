import type { Units } from '@turf/turf'

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

  const timelineMarkerIndex: Ref<number> = ref(0)

  questions.value.push({
    question: undefined,
    type: 'TimelineMarker',
    timelineText: '',
    id: -1,
  })

  watch(questions, (newQuestions) => {
    timelineMarkerIndex.value = newQuestions.findIndex((question) => {
      return question.type === 'TimelineMarker'
    })
    console.warn(timelineMarkerIndex.value)
  })

  addRadar(1, 'kilometers', [-1.407516809729255, 50.94303107100244])
  addRadar(2, 'kilometers', [-1.405643, 50.928988])
  addRadar(3, 'kilometers', [-1.405643, 50.928988])
  addRadar(4, 'kilometers', [-1.405643, 50.928988])
  addRadar(5, 'kilometers', [-1.405643, 50.928988])
  addRadar(6, 'kilometers', [-1.405643, 50.928988])
  addRadar(7, 'kilometers', [-1.405643, 50.928988])
  addRadar(8, 'kilometers', [-1.405643, 50.928988])
  addRadar(9, 'kilometers', [-1.405643, 50.928988])
  addRadar(10, 'kilometers', [-1.405643, 50.928988])
  addRadar(11, 'kilometers', [-1.405643, 50.928988])
  addRadar(12, 'kilometers', [-1.405643, 50.928988])
  addRadar(13, 'kilometers', [-1.405643, 50.928988])
  addRadar(14, 'kilometers', [-1.4065168097292855, 50.94303107100244])

  return { questions, addRadar, timelineMarkerIndex }
})
