import type { Units } from '@turf/turf'

// type guards
interface Question {
  type: 'Radar'
  question: Radar
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
      id: questions.value.length,
    })
  }
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
  addRadar(0.2, 'kilometers', [-1.407516809729255, 50.94303107100244])

  return { questions, addRadar }
})
