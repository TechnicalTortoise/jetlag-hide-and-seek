import type { Units } from '@turf/turf'

// type guards
interface Question {
  type: 'Radar'
  question: Radar
  timelineText: string
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
    })
  }
  addRadar(2, 'kilometers', [-1.405643, 50.928988])
  addRadar(1, 'kilometers', [-1.4065168097292855, 50.94303107100244])

  return { questions, addRadar }
})
