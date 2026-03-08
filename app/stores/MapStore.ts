import type { MapInstance } from '@indoorequal/vue-maplibre-gl'
import type { Units } from '@turf/turf'
import type { GeoJsonProperties, Point } from 'geojson'
import type { Color, type Feature, type MapMouseEvent, MarkerOptions, Popup, Source, StyleLayer } from 'maplibre-gl'
import { Marker } from 'maplibre-gl'
import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', () => {
  const mapInstance = ref<MapInstance | undefined>(undefined)
  const mapLoaded = ref<boolean>(false)
  let markers: { id: string, marker: Marker }[] = []
  const sourceId = 'GamePolygonSource'
  const fillLayerId = 'GamePolygonLayerFill'
  const outlineLayerId = 'GamePolygonLayerOutline'
  const hatchLayerId = 'GamePolygonLayerHatch'
  const hatchImageId = 'hatch-pattern'
  const hatchStrokeWidth = 4
  const hatchColour = '#2020BF'
  const mapBearing = ref(0)

  function generateHatchSVG() {
    const w = 15
    const h = 25
    const ey = 10
    const ex = ey / h * w

    const mainLine = `<line x1="${-ex}" y1="${h + ey}" x2="${w + ex}" y2="${-ey}" stroke="${hatchColour}" stroke-width="${hatchStrokeWidth}" />`
    const extra1 = `<line x1="${ex}" y1="${-ey}" x2="${-ex}" y2="${ey}" stroke="${hatchColour}" stroke-width="${hatchStrokeWidth}" />`
    const extra2 = `<line x1="${w - ex}" y1="${h + ey}" x2="${w + ex}" y2="${h - ey}" stroke="${hatchColour}" stroke-width="${hatchStrokeWidth}" />`
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      ${mainLine}
      ${extra1}
      ${extra2}
      </svg>`
  }

  const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(generateHatchSVG())}`

  async function onMapLoaded() {
    const map = getMap()
    if (!map) {
      return
    }
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = svgDataUrl
    })
    map.addImage(hatchImageId, img)

    map.on('rotate', (_e) => {
      mapBearing.value = map.getBearing()
    })
  }

  function getMap() {
    if (mapInstance.value === undefined) {
      // return undefined
      throw new Error('map instance was undefined')
    }
    if (mapInstance.value.map === undefined) {
      return undefined
      // throw new Error('map was undefined')
    }
    return mapInstance.value.map
  }

  function setMapInstance(theMapInstance: MapInstance) {
    mapInstance.value = theMapInstance
  }
  const WORLD_BOUNDARY = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]

  function isWorldBoundaryRing(ring: number[][]): boolean {
    return (
      ring.length === 5
      && ring[0][0] === -180 && ring[0][1] === -90
      && ring[1][0] === 180 && ring[1][1] === -90
      && ring[2][0] === 180 && ring[2][1] === 90
      && ring[3][0] === -180 && ring[3][1] === 90
    )
  }

  function invertGeometry(feature: GeoJsonProperties) {
    const { type, coordinates: coords } = feature.geometry

    if (type === 'Polygon') {
      const firstRing = coords[0]

      if (isWorldBoundaryRing(firstRing) && coords.length > 1) {
        // Already inverted — return original polygon(s) as MultiPolygon if multiple holes
        const rings = coords.slice(1)
        return {
          type: 'Feature',
          geometry: rings.length === 1
            ? { type: 'Polygon', coordinates: [rings[0]] }
            : { type: 'MultiPolygon', coordinates: rings.map(r => [r]) },
        }
      }
      else {
        // Invert — wrap with world boundary, original ring becomes a hole
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [WORLD_BOUNDARY, coords[0]],
          },
        }
      }
    }

    if (type === 'MultiPolygon') {
      // Each polygon in the multi becomes a hole in the world boundary
      const firstRing = coords[0][0]

      if (isWorldBoundaryRing(firstRing)) {
        // Already inverted — reconstruct MultiPolygon from the holes
        return {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            // Each sub-array after index 0 was a hole, restore as individual polygons
            coordinates: coords.map(polygon => [polygon[1]]).filter(p => p[0]),
          },
        }
      }
      else {
        // Invert — one Polygon with world boundary + all outer rings as holes
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              WORLD_BOUNDARY,
              ...coords.map(polygon => polygon[0]), // outer ring of each polygon
            ],
          },
        }
      }
    }

    // Fallback — return as-is for unsupported geometry types
    return feature
  }
  // function invertGeometry(feature: GeoJsonProperties) {
  //   const coords = feature.geometry.coordinates

  //   // Check if already inverted (first ring is the world boundary)
  //   const firstRing = coords[0]
  //   const isWorldBoundary
  //     = firstRing.length === 5
  //       && firstRing[0][0] === -180 && firstRing[0][1] === -90
  //       && firstRing[1][0] === 180 && firstRing[1][1] === -90
  //       && firstRing[2][0] === 180 && firstRing[2][1] === 90
  //       && firstRing[3][0] === -180 && firstRing[3][1] === 90

  //   if (isWorldBoundary && coords.length > 1) {
  //     // Already inverted - extract the original polygon (second ring)
  //     return {
  //       type: 'Feature',
  //       geometry: {
  //         type: 'Polygon',
  //         coordinates: [coords[1]], // Return the hole as the main polygon
  //       },
  //     }
  //   }
  //   else {
  //     // Not inverted - wrap with world boundary
  //     return {
  //       type: 'Feature',
  //       geometry: {
  //         type: 'Polygon',
  //         coordinates: [
  //           [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
  //           coords[0],
  //         ],
  //       },
  //     }
  //   }
  // }

  function removeGamePolygon() {
    const map = getMap()
    if (!map) {
      return
    }

    const fillLayer: StyleLayer | undefined = map.getLayer(fillLayerId)
    if (fillLayer !== undefined) {
      map.removeLayer(fillLayerId)
    }
    const outlineLayer: StyleLayer | undefined = map.getLayer(outlineLayerId)
    if (outlineLayer !== undefined) {
      map.removeLayer(outlineLayerId)
    }
    const hatchLayer: StyleLayer | undefined = map.getLayer(hatchLayerId)
    if (hatchLayer !== undefined) {
      map.removeLayer(hatchLayerId)
    }
    const source: Source | undefined = map.getSource(sourceId)
    if (source !== undefined) {
      map.removeSource(sourceId)
    }
  }

  function drawGamePolygon(polygon: GeoJsonProperties | undefined) {
    if (polygon === undefined) {
      removeGamePolygon()
      return
    }
    const map = getMap()
    if (!map) {
      return
    }
    const source: Source | undefined = map.getSource(sourceId)
    if (source === undefined) {
      map.addSource(sourceId, { type: 'geojson', data: polygon })
    }
    else {
      source.setData(polygon)
    }

    const fillLayer: StyleLayer | undefined = map.getLayer(fillLayerId)
    if (fillLayer === undefined) {
      map.addLayer({
        id: fillLayerId,
        type:
          'fill',
        source: sourceId,
        paint: {
          'fill-color': '#000070',
          'fill-opacity': 0.5,
        },
      })
    }
    const outlineLayer: StyleLayer | undefined = map.getLayer(outlineLayerId)
    if (outlineLayer === undefined) {
      map.addLayer({
        id: outlineLayerId,
        type:
          'line',
        source: sourceId,
        paint: {
          'line-color': '#2020BF',
          'line-width': 2,
          'line-opacity': 1,
        },
      })
    }
    const hatchLayer: StyleLayer | undefined = map.getLayer(hatchLayerId)
    if (hatchLayer === undefined) {
      map.addLayer({
        id: hatchLayerId,
        type:
          'fill',
        source: sourceId,
        paint: {
          'fill-pattern': hatchImageId,
          'fill-opacity': 0.5,
        },
      })
    }
  }

  function addMarker(id: string, lnglat: [number, number], draggable: boolean, dragCallback: () => void | undefined = undefined, color: string = '#52c5ff', clickCallback: () => void | undefined = undefined) {
    const map = getMap()
    if (!map) {
      return
    }
    const m = new Marker({ draggable, color }).setLngLat(lnglat).addTo(map)
    if (draggable && dragCallback !== undefined) {
      m.on('drag', () => {
        dragCallback()
      })
    }

    if (clickCallback !== undefined) {
      m.getElement().addEventListener('click', (e) => {
        clickCallback()
        e.stopImmediatePropagation()
        // tood not working
      })
    }

    markers.push({ id, marker: m })
  }

  function moveMarker(id: string, lnglat: [number, number]) {
    const m = getMarker(id)
    m?.setLngLat(lnglat)
  }

  function removeMarker(id: string) {
    const idx = getMarkerIndex(id)
    if (idx !== -1) {
      markers[idx]?.marker.remove()
      markers.splice(idx, 1)
    }
  }

  function getMarker(id: string): Marker | undefined {
    return markers.find((mk) => {
      return id === mk.id
    })?.marker
  }

  function getMarkerIndex(id: string): number {
    return markers.findIndex((mk) => {
      return id === mk.id
    })
  }

  function clearMarkers() {
    markers.forEach((mk) => {
      mk.marker.remove()
    })
    markers = []
  }

  function setBearing(bearing: number) {
    const map = getMap()
    if (!map) {
      return
    }
    map.setBearing(bearing)
  }

  function resetOrientation() {
    const map = getMap()
    if (!map) {
      return
    }
    map.flyTo({
      bearing: 0,
      pitch: 0,
    })
  }

  function setPosition(lnglat: [number, number]) {
    const map = getMap()
    if (!map) {
      return
    }
    map.flyTo({
      center: lnglat,
    })
  }

  return {
    mapInstance,
    mapLoaded,
    mapBearing,
    getMap,
    setMapInstance,
    onMapLoaded,
    addMarker,
    removeMarker,
    getMarker,
    clearMarkers,
    setBearing,
    resetOrientation,
    invertGeometry,
    moveMarker,
    drawGamePolygon,
    setPosition,
  }
})
