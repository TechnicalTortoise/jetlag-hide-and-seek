import type { GeoJsonProperties } from 'geojson'
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
  lnglatStart: [number, number]
  lnglatEnd: [number, number]
  warmer: boolean
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

  function addThermometer(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    const t: Thermometer = {
      lnglatStart,
      lnglatEnd,
      warmer,
    }
    const q: Question = {
      type: 'Thermometer',
      id: nextQuestionId.value,
      question: t,
      polygon: undefined,
      timelineText: '',
    }
    questions.value.push(q)
    nextQuestionId.value += 1
    updateThermometer(q, lnglatStart, lnglatEnd, warmer)
    moveTimelineMarkerToEnd()
    onNewQuestionData()
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
  }

  function setThermometerPolygon(q: Question) {
    if (q.type !== 'Thermometer') {
      return
    }
    const t: Thermometer = q.question
    q.polygon = createThermometerPolygon2(t.lnglatStart, t.lnglatEnd, t.warmer)
  }

  function createThermometerPolygon2(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    const features = turf.featureCollection([turf.point(lnglatStart), turf.point(lnglatEnd)])
    const bbox = turf.bbox(features)

    const paddingKm = 10

    const kmToDegrees = (km: number) => {
      return km / 111 // lazy method for now, should be fine if not at the poles
    }

    const paddingDegrees = kmToDegrees(paddingKm)
    const bboxPolygon = turf.bboxPolygon([
      bbox[0] - paddingDegrees,
      bbox[1] - paddingDegrees,
      bbox[2] + paddingDegrees,
      bbox[3] + paddingDegrees,
    ])
    const cellSizeKm = 5.0
    const cellSizeDegrees = kmToDegrees(cellSizeKm)
    const grid = turf.pointGrid(turf.bbox(bboxPolygon), cellSizeDegrees)

    const point1Features = []
    const point2Features = []

    grid.features.forEach((gridPoint) => {
      const dist1 = turf.distance(gridPoint, lnglatStart)
      const dist2 = turf.distance(gridPoint, lnglatEnd)

      if (dist1 < dist2) {
        point1Features.push(gridPoint)
      }
      else {
        point2Features.push(gridPoint)
      }
    })
    if (warmer) {
      return turf.convex(turf.featureCollection(point2Features))
    }
    else {
      return turf.convex(turf.featureCollection(point1Features))
    }
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
      updateRadar(q1, 2, [-1.4432936229776763, 50.93119754191312], true)

      // addThermometer([-1.4183861695849982, 50.933852348338064], [-1.3992685687023434, 50.93780435744535], true)
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
