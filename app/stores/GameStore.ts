import type { FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson'
import type { ShallowRef } from 'vue'
import * as turf from '@turf/turf'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { getRGB } from '~/colourUtils'
import { useMapStore } from '~/stores/MapStore'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// type guards
export interface Question {
  type: 'Radar' | 'TimelineMarker' | 'Thermometer' | 'CustomRegion' | 'GameBoundary' | 'GeoJsonRegion'
  question: Radar | undefined | Thermometer | CustomRegion | GameBoundary | GeoJsonRegion
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

export interface CustomRegion {
  points: [number, number][]
  inside: boolean
}

export interface GameBoundary {
  name: string
}

export interface GeoJsonRegion {
  name: string
  regionCollectionName: string // todo make sure to load this in the editor when opening editor
  hit: boolean
}

export enum State {
  MAIN,
  MEASURING,
  ADDING_RADAR,
  MODIFYING_RADAR,
  ADDING_THERMOMENTER,
  MODIFYING_THERMOMETER,
  ADDING_CUSTOM_REGION,
  MODIFYING_CUSTOM_REGION,
  ADDING_GEOJSON_REGION,
  MODIFYING_GEOJSON_REGION,
  ADDING_PINS,
  NULL,
}

export interface RegionCollection {
  name: string
  featureCollection: FeatureCollection
}

export interface CustomPin {
  id: string
  displayNumber: number
  lnglat: [number, number]
  colour: string
}

export enum UnitOption {
  metric,
  imperial,
}

export const useGameStore = defineStore('game', () => {
  const questions: Ref<Question[]> = ref([])
  const mapStore = useMapStore()
  const { mapLoaded } = storeToRefs(mapStore)
  const state = ref(State.MAIN)
  const timelineShowing = ref(true)
  const questionIdBeingEdited = ref(-1)
  const questionBeingEdited: Ref<Question | undefined> = ref(undefined)
  const regionCollections: Ref<RegionCollection[]> = ref([])
  const customPins: Ref<CustomPin[]> = ref([])
  const nextCustomPinNumber = ref(1)
  const unitPreference: Ref<UnitOption> = ref(UnitOption.metric)
  const showNewGameModalAgain = ref(true)

  const userLocation = useUserLocation()
  const usingLocation = userLocation.enabled

  function generateQuestionId(): number {
    return Date.now()
  }

  const timelineMarkerIndex: Ref<number> = ref(0)

  function addTimelineMarker() {
    questions.value.push({
      question: undefined,
      type: 'TimelineMarker',
      timelineText: '',
      id: -1,
      polygon: undefined,
      allInfoAvailable: true,
    })
  }

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
      id: generateQuestionId(),
      question: r,
      polygon: undefined,
      timelineText: 'New Radar',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    // returning q does not work properly, but this does
    return questions.value.at(-2)
  }

  function updateRadar(q: Question, radiusKm: number, lnglat: [number, number], hit: boolean) {
    if (q.type !== 'Radar') {
      return
    }
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
    q.timelineText = `${r.radiusKm.toFixed(2)}km`
  }

  function addThermometer(): Question {
    const t: Thermometer = {
      lnglatStart: undefined,
      lnglatEnd: undefined,
      warmer: undefined,
    }
    const q: Question = {
      type: 'Thermometer',
      id: generateQuestionId(),
      question: t,
      polygon: undefined,
      timelineText: 'New Thermo.',
      allInfoAvailable: false,
    }
    questions.value.push(q)

    moveTimelineMarkerToEnd()
    onNewQuestionData()
    return questions.value.at(-2)
  }

  function updateThermometer(q: Question, lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    if (q.type !== 'Thermometer') {
      return
    }

    const t: Thermometer = {
      lnglatStart,
      lnglatEnd,
      warmer,
    }
    q.allInfoAvailable = true
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
    const d: number = turf.distance(t.lnglatStart, t.lnglatEnd, 'kilometers')
    q.timelineText = `${d.toFixed(2)}km`
    q.polygon = createThermometerPolygon(t.lnglatStart, t.lnglatEnd, t.warmer)
  }

  function createThermometerPolygon(lnglatStart: [number, number], lnglatEnd: [number, number], warmer: boolean) {
    const bearing = turf.bearing(lnglatStart, lnglatEnd)
    const perpBearing = (bearing + 90) % 360
    const midPoint = turf.midpoint(lnglatStart, lnglatEnd)

    const minimumSampleDistanceKm = 20
    const maximumSampleDistanceKm = 1000 // getting too big causes errors
    const maxDist = Math.min(Math.max(turf.distance(lnglatStart, lnglatEnd, { units: 'kilometers' }) * 10, minimumSampleDistanceKm), maximumSampleDistanceKm)
    const divs = 32
    const step = maxDist / divs
    const samplePoints = []
    for (let d = -maxDist; d < maxDist + divs; d += step) {
      const p = turf.destination(midPoint, d, perpBearing, { units: 'kilometers' }).geometry.coordinates
      samplePoints.push(p)
    }
    const line = turf.lineString(samplePoints)
    const cutter = turf.buffer(line, 0.1, { units: 'meters' })
    const circleToSplit = turf.circle(midPoint, maxDist / 2.2, { units: 'kilometers', steps: 640 })
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

  function addCustomRegion(): Question {
    const cr: CustomRegion = {
      points: [],
      inside: true,
    }
    const q: Question = {
      type: 'CustomRegion',
      id: generateQuestionId(),
      question: cr,
      polygon: undefined,
      timelineText: 'New Region',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    // returning q does not work properly, but this does
    return questions.value.at(-2)
  }

  function updateCustomRegion(q: Question, points: [number, number][], inside: boolean) {
    if (q.type !== 'CustomRegion') {
      return
    }
    const cr: CustomRegion = {
      points,
      inside,
    }
    q.allInfoAvailable = true
    q.question = cr
    setCustomRegionPolygon(q)

    onNewQuestionData()
  }

  function setCustomRegionPolygon(q: Question) {
    if (q.type !== 'CustomRegion') {
      return
    }
    const cr: CustomRegion = q.question
    if (cr.points.length < 3) {
      q.polygon = undefined
      return
    }
    const points: [number, number][] = []
    cr.points.forEach((p) => {
      points.push(p)
    })
    points.push(cr.points[0])
    const p: GeoJsonProperties = turf.polygon([points])
    q.polygon = cr.inside ? p : mapStore.invertGeometry(p)

    let areaKm2 = 0
    if (q.polygon) {
      const p = cr.inside ? q.polygon : mapStore.invertGeometry(q.polygon)
      areaKm2 = turf.area(p) * 1e-6
    }

    q.timelineText = `${areaKm2.toFixed(2)}km²`
  }

  function addGameBoundary(): Question {
    const gb: GameBoundary = {
      name: '',
    }
    const q: Question = {
      type: 'GameBoundary',
      id: generateQuestionId(),
      question: gb,
      polygon: undefined,
      timelineText: 'Game Boundary',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    // returning q does not work properly, but this does
    return questions.value.at(-2)
  }

  function updateGameBoundary(q: Question, name: string, poly: GeoJsonProperties) {
    if (q.type !== 'GameBoundary') {
      return
    }
    const gb: GameBoundary = {
      name,
    }

    q.polygon = poly
    q.allInfoAvailable = true
    q.question = gb
    if (poly.geometry.type === 'Polygon') {
      q.polygon = poly
    }
    else if (poly.geometry.type === 'MultiPolygon') {
      let biggestPolygon: GeoJsonProperties | undefined
      let biggestArea: number = 0
      for (let i = 0; i < poly.geometry.coordinates.length; i += 1) {
        const subP = turf.polygon(poly.geometry.coordinates[i])
        const area = turf.area(subP)
        if (area > biggestArea) {
          biggestArea = area
          biggestPolygon = subP
        }
      }
      q.polygon = biggestPolygon
    }
    q.timelineText = `${gb.name}`

    if (q.polygon) {
      const centre = turf.center(q.polygon).geometry.coordinates
      if (centre) {
        const map = mapStore.getMap()
        map.setCenter(centre)
      }
    }

    onNewQuestionData()
  }

  function addGeoJsonRegion(): Question {
    const gj: GeoJsonRegion = {
      name: '',
      hit: true,
      regionCollectionName: '',
    }
    const q: Question = {
      type: 'GeoJsonRegion',
      id: generateQuestionId(),
      question: gj,
      polygon: undefined,
      timelineText: 'New Geographic Region',
      allInfoAvailable: false,
    }
    questions.value.push(q)
    moveTimelineMarkerToEnd()
    onNewQuestionData()
    // returning q does not work properly, but this does
    return questions.value.at(-2)
  }

  function updateGeoJsonRegion(q: Question, name: string, regionCollectionName: string, hit: boolean) {
    if (q.type !== 'GeoJsonRegion') {
      return
    }
    const gj: GeoJsonRegion = {
      name,
      regionCollectionName,
      hit,
    }
    q.allInfoAvailable = true
    q.question = gj
    setGeoJsonRegionPolygon(q)
    onNewQuestionData()
  }

  function setGeoJsonRegionPolygon(q: Question) {
    if (q.type !== 'GeoJsonRegion') {
      return
    }
    const gj = q.question as GeoJsonRegion
    // find region collection
    const regionCollection: RegionCollection | undefined = regionCollections.value.find((rc) => {
      return rc.name === gj.regionCollectionName
    })
    if (!regionCollection) {
      return
    }
    // find region

    const poly = regionCollection.featureCollection.features.find((f) => {
      if (!f.properties) {
        return false
      }
      if (!f.properties.name) {
        return false
      }
      return f.properties.name === gj.name
    })
    if (!poly) {
      return
    }

    q.polygon = gj.hit ? poly : mapStore.invertGeometry(poly)

    q.timelineText = gj.name
  }

  function setQuestionPolygon(q: Question) {
    if (q.type === 'Radar') {
      setRadarPolygon(q)
    }
    else if (q.type === 'Thermometer') {
      setThermometerPolygon(q)
    }
    else if (q.type === 'CustomRegion') {
      setCustomRegionPolygon(q)
    }
    else if (q.type === 'GeoJsonRegion') {
      setGeoJsonRegionPolygon(q)
    }
    else {
      console.warn('Trying to set question polygon for unhandled type ', q.type)
    }
    onNewQuestionData()
  }

  function moveTimelineMarkerToEnd() {
    getTimelineMarkerIndex()
    const marker: Question | undefined = questions.value[timelineMarkerIndex.value]
    questions.value.splice(timelineMarkerIndex.value, 1)
    if (marker) {
      questions.value.push(marker)
    }
    getTimelineMarkerIndex()
  }

  function setQuestionBeingEdited(id: number) {
    questionIdBeingEdited.value = id
    if (id === -1) {
      questionBeingEdited.value = undefined
    }
    else {
      questionBeingEdited.value = questions.value.find((q) => {
        return id === q.id
      })
    }
  }

  watch(mapLoaded, () => {
    if (mapLoaded.value) {
      // const q0 = addRadar()
      // updateRadar(q0, gameArea.radiusKm, gameArea.center, true)
      // const q1 = addRadar()
      // updateRadar(q1, 4, [-1.4432936229776763, 50.93119754191312], true)
      // const q2 = addThermometer()
      // updateThermometer(q2, [-1.4183861695849982, 50.933852348338064], [-1.3992685687023434, 50.93780435744535], true)

      // when the map loads (will always be slower than loading local questions storage)
      // try and get the timeline marker index. If there isn't one (first time being run so questions is empty), then add one
      // questions.value = []
      getTimelineMarkerIndex()
      // marker only
      if (questions.value.length === 1) {
        onNewGame()
      }
      onNewQuestionData()

      customPins.value.forEach((p) => {
        addCustomPinToMap(p)
      })
    }
  })

  function getTimelineMarkerIndex() {
    timelineMarkerIndex.value = questions.value.findIndex((question) => {
      return question.type === 'TimelineMarker'
    })
    if (timelineMarkerIndex.value === -1) {
      console.warn('Adding timeline marker')
      addTimelineMarker()
    }
  }

  watch(questions, () => {
    // need this to watch when timeline marker is moved
    if (mapStore.mapLoaded) {
      onNewQuestionData()
    }
  })

  function resetGame() {
    mapStore.clearMarkers()
    customPins.value = []
    nextCustomPinNumber.value = 1
    questions.value.splice(0, questions.value.length)
    addTimelineMarker()
    onNewQuestionData()
  }

  async function onNewGame() {

  }

  function exportGameToString() {
    const questionsCopy = JSON.parse(JSON.stringify(questions.value))
    questionsCopy.splice(questionsCopy.length - 1, 1)
    questionsCopy.forEach((q: Question) => {
      q.polygon = undefined
    })

    const gameObject = {
      questions: questionsCopy,
      regionCollections: regionCollections.value,
    }
    const json = JSON.stringify(gameObject)
    return json
  }

  function importGameFromString(str: string): boolean {
    try {
      const gameObject: { questions: Question[], regionCollections: RegionCollection[] } = JSON.parse(str)
      regionCollections.value = gameObject.regionCollections
      questions.value = gameObject.questions
      questions.value.forEach((q) => {
        setQuestionPolygon(q)
      })
      addTimelineMarker()
      onNewQuestionData()
      return true
    }
    catch (err) {
      console.error('Failed to load questions from clipboard, ', str, ', err=', err)
      return false
    }
  }

  function addCustomPinToMap(pin: CustomPin) {
    mapStore.addMarker(pin.id, pin.lnglat, true, () => {
      const mk = mapStore.getMarker(pin.id)
      if (mk) {
        pin.lnglat = mk.getLngLat().toArray()
      }
    }, pin.colour, () => {

    })
  }

  function addCustomPin(lnglat: [number, number]) {
    const id: string = `CustomPin${Date.now()}`
    // const pinColour: [string, number] = ['accent', 500]
    const possibleColours = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#000075', '#808080', '#000000']
    const colourIndex = (nextCustomPinNumber.value - 1) % possibleColours.length
    let pinColour = possibleColours[colourIndex]
    if (!pinColour) {
      pinColour = '#FFFFFF'
    }
    customPins.value.push({ id, lnglat, displayNumber: nextCustomPinNumber.value, colour: pinColour })
    const pin = customPins.value.at(-1)
    if (pin) {
      addCustomPinToMap(pin)
    }
    nextCustomPinNumber.value += 1
  }

  function removeCustomPin(id: string) {
    mapStore.removeMarker(id)
    const idx = customPins.value.findIndex((p) => {
      return p.id === id
    })
    if (idx !== -1) {
      customPins.value.splice(idx, 1)
    }
  }

  return {
    questions,
    resetGame,
    onNewQuestionData,
    addRadar,
    addThermometer,
    updateRadar,
    updateThermometer,
    addCustomRegion,
    updateCustomRegion,
    addGameBoundary,
    updateGameBoundary,
    addGeoJsonRegion,
    updateGeoJsonRegion,
    updateQuestion: setQuestionPolygon,
    timelineMarkerIndex,
    state,
    removeQuestion,
    setQuestionBeingEdited,
    questionBeingEdited,
    questionIdBeingEdited,
    timelineShowing,
    exportGameToString,
    importGameFromString,
    userLocation,
    regionCollections,
    customPins,
    addCustomPin,
    removeCustomPin,
    nextCustomPinNumber,
    unitPreference,
    showNewGameModalAgain,
    usingLocation,
  }
}, {
  persist: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
})
