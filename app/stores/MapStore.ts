import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
// import { map } from '@indoorequal/vue-maplibre-gl'
import { circle, difference, featureCollection, intersect, union } from '@turf/turf'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)
  const mapLoaded = ref<boolean>(false)
  let colorIndex: number = 0

  function getMap() {
    if (mapInstance.value === undefined) {
      throw new Error('map instance was undefined')
    }
    if (mapInstance.value.map === undefined) {
      throw new Error('map was undefined')
    }
    return mapInstance.value?.map
  }

  function setMapInstance(theMapInstance: MapInstance) {
    mapInstance.value = theMapInstance
  }

  function invertGeometry(feature: GeoJsonProperties) {
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          feature.geometry.coordinates[0],
        ],
      },
    }
  }

  function drawQuestion(q: Question) {
    const map = getMap()
    if (map.getLayer(q.mapLayerId) === undefined) {
      addQuestionLayer(q)
    }
  }

  function hideQuestion(q: Question) {
    const map = getMap()
    if (map.getLayer(q.mapLayerId) !== undefined) {
      removeQuestionLayer(q)
    }
  }

  function addQuestionSource(q: Question) {
    const map = getMap()
    map.addSource(q.mapLayerId, { type: 'geojson', data: q.exclusivePolygon })
  }

  function removeQuestionSource(q: Question) {
    const map = getMap()
    map.removeSource(q.mapLayerId)
  }

  function addQuestionLayer(q: Question) {
    const map = getMap()
    const colors = ['#00FF00', '#FF0000', '#0000FF', '#FFFF00']
    colorIndex = (q.id) % colors.length
    map.addLayer({
      id: q.mapLayerId,
      type:
        'fill',
      source: q.mapLayerId,
      paint: {
        'fill-color': colors[colorIndex],
        'fill-opacity': 0.2,
      },
    })
  }

  function removeQuestionLayer(q: Question) {
    const map = getMap()
    map.removeLayer(q.mapLayerId)
  }

  function calculatePolygons(questions: Question[]) {
    console.warn('questions length = ', questions.length)
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
    for (let i = 0; i < questions.length; i += 1) {
      const q: Question | undefined = questions[i]
      if (q === undefined) {
        continue
      }

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
              q.exclusivePolygon = difference(featureCollection([currentRemainingArea, invertGeometry(q.fullPolygon)]))
            }
            addQuestionSource(q)

            currentRemainingArea = difference(featureCollection([currentRemainingArea, q.exclusivePolygon]))

            // mapStore.drawPolygon(q.exclusivePolygon, q.mapLayerId)
          }
        }
      }
      // else if (q.type === 'TimelineMarker') {
      //   break
      // }
    }
  }

  return { mapInstance, mapLoaded, getMap, setMapInstance, calculatePolygons, drawQuestion, hideQuestion }
})
