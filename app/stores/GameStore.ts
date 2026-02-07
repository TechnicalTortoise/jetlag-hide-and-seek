import type { Units } from '@turf/turf'
import type { FeatureCollection, GeoJsonProperties } from 'geojson'
import { buffer, centroid, circle, difference, distance, featureCollection, flatten, lineString } from '@turf/turf'
import * as turf from '@turf/turf'
import { isQuestionOrPlusOrMinusToken } from 'typescript'
import { useMapStore } from '~/stores/MapStore'

// type guards
export interface Question {
  type: 'Radar' | 'TimelineMarker' | 'Thermometer'
  question: Radar | undefined | Thermometer
  timelineText: string
  id: number
  mapLayerId: string
  fullPolygon: GeoJsonProperties | undefined
  exclusivePolygon: GeoJsonProperties | undefined
  cumulativePolygon: GeoJsonProperties | undefined
}

export interface Radar {
  radius: number
  units: Units
  lnglat: [number, number]
  hit: boolean
}

export interface Thermometer {
  lnglatStart: [number, number]
  lnglatEnd: [number, number]
  warmer: boolean
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
  ADDING_PIN,
  MODIFYING_PIN,
  NULL,
}

export const useGameStore = defineStore('game', () => {
  const questions: Ref<Question[]> = ref([])
  const mapStore = useMapStore()
  const { mapInstance, mapLoaded } = storeToRefs(mapStore)
  const state = ref(State.MAIN)
  const nextQuestionId = ref(0)
  const questionBeingEdited: Ref<Question | undefined> = ref(undefined)

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
    cumulativePolygon: undefined,
  })

  const drawGameArea = () => {
    mapStore.calculatePolygons(questions.value)
    getTimelineMarkerIndex()
    if (!mapStore.mapLoaded) {
      return
    }
    for (let i = 0; i < questions.value.length; i += 1) {
      const q: Question | undefined = questions.value[i]
      if (q === undefined) {
        console.warn('Question undefined')
        continue
      }
      if (i !== timelineMarkerIndex.value - 1) {
        mapStore.hideQuestion(q)
      }
      else {
        mapStore.drawQuestion(q)
      }
    }
  }

  function removeQuestion(id: number) {
    const index = questions.value.findIndex((q) => {
      return id === q.id
    })
    if (index === -1) {
      return
    }
    mapStore.removeQuestionLayer(questions.value[index])
    // mapStore.removeQuestionSource(questions.value[index])
    questions.value.splice(index, 1)
    drawGameArea()
  }

  function setQuestionToEdit(id: number) {
    const index = questions.value.findIndex((q) => {
      return id === q.id
    })
    if (index === -1) {
      questionBeingEdited.value = undefined
    }
    else {
      questionBeingEdited.value = questions.value[index]
    }
  }

  function addRadar(radius: number, units: Units, lnglat: [number, number], hit: boolean, id: number = -1) {
    // if radar already exists, then just modify
    const radar: Radar = { radius, units, lnglat, hit }
    const c: GeoJsonProperties = circle(lnglat, radius, { steps: 64, units })
    const entirePolygon: GeoJsonProperties = hit ? c : mapStore.invertGeometry(c)
    const newRadar = id === -1
    if (newRadar) {
      id = nextQuestionId.value
      nextQuestionId.value += 1
    }

    const name = `${radius.toString() + units.toString()} Radar (${id.toString()})`

    const q: Question = {
      question: radar,
      type: 'Radar',
      timelineText: `${radius.toString()}km`,
      id,
      mapLayerId: name,
      fullPolygon: entirePolygon,
      exclusivePolygon: undefined,
      cumulativePolygon: undefined,
    }

    if (newRadar) {
      questions.value.push(q)
      moveTimelineMarkerToEnd()
    }
    else {
      const qIndex = questions.value.findIndex((que) => {
        return que.id === id
      })
      removeQuestion(id)
      questions.value.splice(qIndex, 0, q)
    }

    drawGameArea()
  }

  function createThermometerPolygon(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    // x is longitude
    // y is latitude

    const theta: number = Math.atan2(lnglatEnd[1] - lnglatStart[1], lnglatEnd[0] - lnglatStart[0]) + (Math.PI / 2)
    const midPoint: [number, number] = [(lnglatEnd[0] + lnglatStart[0]) / 2, (lnglatEnd[1] + lnglatStart[1]) / 2]
    const d: number = (midPoint[1] * Math.cos(theta)) - (midPoint[0] * Math.sin(theta))
    // line in form xSin(theta) - ycos(theta) + d = 0
    // need to find the points where this intersects the world polygon and find the correct side based on warmer value

    // todo this doesn't work when playing at extremes
    const maxLat: number = 89
    const maxLng: number = 179

    const yFromX = (x: number) => {
      return ((x * Math.sin(theta)) + d) / Math.cos(theta) // could be infity!
    }
    const xFromY = (y: number) => {
      return ((y * Math.cos(theta)) - d) / Math.sin(theta) // could be infity!
    }
    const xInBounds = (x: number) => {
      return (x > -maxLng && x < maxLng)
    }
    const yInBounds = (y: number) => {
      return (y > -maxLat && y < maxLat)
    }
    // test each extreme
    const xTop = xFromY(maxLat)
    const xBottom = xFromY(-maxLat)
    const yLeft = yFromX(-maxLng)
    const yRight = yFromX(maxLng)

    let intersectPoints = []
    if (xInBounds(xTop)) {
      intersectPoints.push([xTop, maxLat])
    }
    if (xInBounds(xBottom)) {
      intersectPoints.push([xBottom, -maxLat])
    }
    if (yInBounds(yLeft)) {
      intersectPoints.push([-maxLng, yLeft])
    }
    if (yInBounds(yRight)) {
      intersectPoints.push([maxLng, yRight])
    }

    if (intersectPoints.length !== 2) {
      return undefined
    }

    // intersectPoints = [[-1.402679279203333, 50.795232238349364], [-1.4222032731419236, 51.112627915289245]]

    const l = lineString(intersectPoints)
    const bufferedLine = buffer(l, 1, { units: 'meters' })
    // const worldPolygon
    //   = {
    //     type: 'Feature',
    //     geometry: {
    //       type: 'Polygon',
    //       coordinates: [
    //         [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
    //       ],
    //     },
    //   }
    // todo, can get the play area polygon
    const worldPolygon: GeoJsonProperties = circle(lnglatStart, 10, { steps: 256, units: 'kilometers' })

    const splittedPolygon = difference(featureCollection([worldPolygon, bufferedLine]))
    const flattenedPolygons: FeatureCollection = flatten(splittedPolygon)

    // one of the polygones will be in the direction between start and end, one not
    for (let i = 0; i < flattenedPolygons.features.length; i += 1) {
      const p = flattenedPolygons.features[i]
      const center = centroid(p)
      // console.warn(center)
      const toMidPoint = [midPoint[0] - center.geometry.coordinates[0], midPoint[1] - center.geometry.coordinates[1]]
      const direction: [number, number] = [(lnglatEnd[0] - lnglatStart[0]), (lnglatEnd[1] - lnglatStart[1])]
      const dotProduct: number = (toMidPoint[0] * direction[0]) + (toMidPoint[1] * direction[1])
      if ((warmer && dotProduct < 0) || (!warmer && dotProduct > 0)) {
        return p
      }
    }

    // console.warn(flattenedPolygons)
    // const map = mapStore.getMap()
    // map
    console.warn('somethings gone wrong!')
    return undefined
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

  function addThermometer(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean, id: number = -1) {
    const thermometer: Thermometer = { lnglatStart, lnglatEnd, warmer }
    // const entirePolygon: GeoJsonProperties = c

    const poly = createThermometerPolygon2(lnglatStart, lnglatEnd, warmer)
    const d: number = distance(lnglatStart, lnglatEnd, 'kilometers')
    const newThermometer = id === -1
    if (newThermometer) {
      id = nextQuestionId.value
      nextQuestionId.value += 1
    }
    const name = `${d.toFixed(2)}Km thermometer${id.toString()}`
    const timelineText = `${d.toFixed(2)}Km`
    const q: Question = {
      question: thermometer,
      type: 'Thermometer',
      timelineText,
      id,
      mapLayerId: name,
      fullPolygon: poly,
      exclusivePolygon: undefined,
      cumulativePolygon: undefined,
    }

    if (newThermometer) {
      questions.value.push(q)
      moveTimelineMarkerToEnd()
    }
    else {
      const qIndex = questions.value.findIndex((que) => {
        return que.id === id
      })
      removeQuestion(id)
      questions.value.splice(qIndex, 0, q)
    }

    drawGameArea()
  }

  function moveTimelineMarkerToEnd() {
    getTimelineMarkerIndex()
    const marker: Question | undefined = questions.value[timelineMarkerIndex.value]
    questions.value.splice(timelineMarkerIndex.value, 1)
    questions.value.push(marker)
    getTimelineMarkerIndex()
  }

  watch(mapLoaded, () => {
    if (mapLoaded.value) {
      // addRadar(gameArea.radiusKm, 'kilometers', gameArea.center, true)
      // addRadar(6, 'kilometers', [-1.4432936229776763, 50.93119754191312], false)
      // addRadar(2, 'kilometers', [-1.4432936229776763, 50.93119754191312], true)
      addThermometer([-1.4183861695849982, 50.933852348338064], [-1.3992685687023434, 50.93780435744535], true)

      // addRadar(2, 'kilometers', [-1.3583492927662713, 50.94474366229376], true)

      // addRadar(2, 'kilometers', [-1.3583492927662713, 50.94474366229376], false)
      // addRadar(2, 'kilometers', [-1.3889024760083344, 50.932672579033], true)

      moveTimelineMarkerToEnd()
      drawGameArea()
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
    getTimelineMarkerIndex()
    drawGameArea()
  })

  return {
    questions,
    addRadar,
    addThermometer,
    timelineMarkerIndex,
    gameArea,
    state,
    removeQuestion,
    setQuestionToEdit,
    questionBeingEdited,
  }
})
