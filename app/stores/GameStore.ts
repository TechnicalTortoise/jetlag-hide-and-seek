import type { FeatureCollection, GeoJsonProperties, MultiPolygon } from 'geojson'
import * as turf from '@turf/turf'
import { useMapStore } from '~/stores/MapStore'

// type guards
export interface Question {
  type: 'Radar' | 'TimelineMarker' | 'Thermometer' | 'CustomPolygon'
  question: Radar | undefined | Thermometer
  allInfoAvailable: boolean
  timelineText: string
  id: number
  polygon: GeoJsonProperties | undefined
}

export interface Radar {
  radiusKm: number | undefined
  lnglat: [number, number] | undefined
  hit: boolean | undefined
}

export interface Thermometer {
  lnglatStart: [number, number] | undefined
  lnglatEnd: [number, number] | undefined
  warmer: boolean | undefined
}

export interface CustomPolygon {
  points: [number, number][]
  inside: boolean
}

export enum State {
  SELECTING_GAME_AREA,
  MAIN,
  MEASURING,
  ADDING_RADAR,
  MODIFYING_RADAR,
  ADDING_THERMOMENTER,
  MODIFYING_THERMOMETER,
  ADDING_CUSTOM_REGION,
  MODIFYING_CUSTOM_REGION,
  ADDING_PINS,
  NULL,
}

export const useGameStore = defineStore('game', () => {
  const questions: Ref<Question[]> = ref([])
  const mapStore = useMapStore()
  const { mapInstance, mapLoaded } = storeToRefs(mapStore)
  const state = ref(State.MAIN)
  const nextQuestionId = ref(0)
  const timelineShowing = ref(true)
  const questionIdBeingEdited = ref(-1)

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
    polygon: undefined,
    allInfoAvailable: true,
  })

  function calculateTotalPolygon(): GeoJsonProperties | undefined {
    const fullWorld: GeoJsonProperties = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
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
    let polygon: GeoJsonProperties | undefined
    for (let i = 0; i < questions.value.length; i += 1) {
      const q = questions.value[i]
      // console.warn('Applying polygon for question ', q.type, q.id)
      if (q === undefined) {
        continue
      }

      if (q.type === 'TimelineMarker') {
        break
      }
      if (q.polygon === undefined) {
        continue
      }
      if (polygon === undefined) {
        polygon = mapStore.invertGeometry(q.polygon)
      }
      else {
        polygon = turf.union(turf.featureCollection([polygon, mapStore.invertGeometry(q.polygon)]))
      }
    }
    return polygon
  }

  function drawGameArea() {
    const p = calculateTotalPolygon()
    mapStore.drawGamePolygon(p)
  }

  function removeQuestion(id: number) {
    const index = questions.value.findIndex((q) => {
      return id === q.id
    })
    if (index === -1) {
      return
    }
    questions.value.splice(index, 1)
    onNewQuestionData()
  }

  function onNewQuestionData() {
    drawGameArea()
  }

  function addRadar(): Question {
    const r: Radar = {
      hit: undefined,
      lnglat: undefined,
      radiusKm: undefined,
    }
    const q: Question = {
      type: 'Radar',
      id: nextQuestionId.value,
      question: r,
      polygon: undefined,
      timelineText: '',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    nextQuestionId.value += 1
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    return q
  }

  function updateRadar(q: Question, radiusKm: number, lnglat: [number, number], hit: boolean) {
    if (q.type !== 'Radar') {
      return
    }
    q.timelineText = `${radiusKm.toFixed(2)}km`
    console.warn(questions.value[questions.value.length - 2]?.timelineText)
    const r: Radar = {
      hit,
      lnglat,
      radiusKm,
    }
    q.allInfoAvailable = true
    q.question = r
    setRadarPolygon(q)
    onNewQuestionData()
  }

  function setRadarPolygon(q: Question) {
    if (q.type !== 'Radar') {
      return
    }
    const r: Radar = q.question
    const p: GeoJsonProperties = turf.circle(r.lnglat, r.radiusKm, { steps: 64, units: 'kilometers' })
    q.polygon = r.hit ? p : mapStore.invertGeometry(p)
  }

  function addThermometer(): Question {
    const t: Thermometer = {
      lnglatStart: undefined,
      lnglatEnd: undefined,
      warmer: undefined,
    }
    const q: Question = {
      type: 'Thermometer',
      id: nextQuestionId.value,
      question: t,
      polygon: undefined,
      timelineText: '',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    nextQuestionId.value += 1
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    return q
  }

  function updateThermometer(q: Question, lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    if (q.type !== 'Thermometer') {
      return
    }
    const d: number = turf.distance(lnglatStart, lnglatEnd, 'kilometers')
    q.timelineText = `${d.toFixed(2)}km`
    const t: Thermometer = {
      lnglatStart,
      lnglatEnd,
      warmer,
    }
    q.question = t
    setThermometerPolygon(q)
    onNewQuestionData()
  }

  function setThermometerPolygon(q: Question) {
    if (q.type !== 'Thermometer') {
      return
    }
    const t: Thermometer = q.question
    if (t === undefined || t.lnglatStart === undefined || t.lnglatEnd === undefined || t.warmer === undefined) {
      return
    }
    q.polygon = createThermometerPolygon(t.lnglatStart, t.lnglatEnd, t.warmer)
  }

  function createThermometerPolygon(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    const bearing = turf.bearing(lnglatStart, lnglatEnd)
    const perpBearing = (bearing + 90) % 360
    const midPoint = turf.midpoint(lnglatStart, lnglatEnd)
    const dist = 10
    const p0 = turf.destination(midPoint, dist, perpBearing, { units: 'kilometers' }).geometry.coordinates
    const p1 = turf.destination(midPoint, -dist, perpBearing, { units: 'kilometers' }).geometry.coordinates
    const line = turf.lineString([p0, p1])
    const cutter = turf.buffer(line, 0.1, { units: 'meters' })
    const circleToSplit = turf.circle(midPoint, dist / 2, { units: 'kilometers', steps: 64 })
    const polygons: MultiPolygon = turf.difference(turf.featureCollection([circleToSplit, cutter]))
    const geometry = polygons.geometry.coordinates
    if (geometry.length !== 2) {
      console.warn('Expect 2 polygons!')
      return undefined
    }

    const polygon0 = turf.polygon(geometry[0])
    const polygon1 = turf.polygon(geometry[1])
    const centroid0 = turf.centroid(polygon0)
    const centroid1 = turf.centroid(polygon1)
    const d0 = turf.distance(centroid0, lnglatStart)
    const d1 = turf.distance(centroid1, lnglatStart)
    if (warmer) {
      return d0 > d1 ? polygon0 : polygon1
    }
    else {
      return d0 < d1 ? polygon0 : polygon1
    }
    return undefined
  }

  function moveTimelineMarkerToEnd() {
    getTimelineMarkerIndex()
    const marker: Question | undefined = questions.value[timelineMarkerIndex.value]
    questions.value.splice(timelineMarkerIndex.value, 1)
    questions.value.push(marker)
    getTimelineMarkerIndex()
  }

  function getQuestionToEdit(id: number): Question | undefined {
    questionIdBeingEdited.value = id
    return questions.value.find((q) => {
      return id === q.id
    })
  }

  watch(mapLoaded, () => {
    if (mapLoaded.value) {
      const q0 = addRadar()
      updateRadar(q0, gameArea.radiusKm, gameArea.center, true)
      const q1 = addRadar()
      updateRadar(q1, 4, [-1.4432936229776763, 50.93119754191312], true)

      const q2 = addThermometer()
      updateThermometer(q2, [-1.4183861695849982, 50.933852348338064], [-1.3992685687023434, 50.93780435744535], true)

      // addRadar(2, [-1.3583492927662713, 50.94474366229376], true)

      // addRadar(2, 'kilometers', [-1.3583492927662713, 50.94474366229376], false)
      // addRadar(2, 'kilometers', [-1.3889024760083344, 50.932672579033], true)
    }
  })

  watch(mapInstance, () => {
    if (mapInstance.value === undefined) {
      console.warn('Map instance undefined')
    }
  })

  function getTimelineMarkerIndex() {
    timelineMarkerIndex.value = questions.value.findIndex((question) => {
      return question.type === 'TimelineMarker'
    })
  }

  watch(questions, () => {
    // need this to watch when timeline marker is moved
    if (mapStore.mapLoaded) {
      onNewQuestionData()
    }
  })

  return {
    questions,
    onNewQuestionData,
    addRadar,
    addThermometer,
    updateRadar,
    updateThermometer,
    timelineMarkerIndex,
    gameArea,
    state,
    removeQuestion,
    getQuestionToEdit,
    questionIdBeingEdited,
    timelineShowing,
  }
})
