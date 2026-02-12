import type { Feature, GeoJsonProperties } from 'geojson'
import * as turf from '@turf/turf'

export function useGeoapify() {
  const config = useRuntimeConfig()
  const apiKey = config.public.geoapifyApiKey

  const searchPlaces = async (query: string) => {
    const response = await fetch(
      // todo just cities for now, should combobox to select different types
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:none&limit=8&apiKey=${apiKey}`,
    )
    return await response.json()
  }

  function doesPlaceMatch(feature, placeName: string) {
    if (!('properties' in feature)) {
      console.warn('feature has no properties! ', feature)
      return false
    }
    // todo, lower case this
    if (feature.properties.name === placeName || feature.properties.city === placeName) {
      return true
    }
    return false
  }

  async function getPolygonFromCall(apiCall: string, placeName: string): Promise<GeoJsonProperties | undefined> {
    const response = await fetch(apiCall)
    const data = await response.json()

    if (!('features' in data)) {
      return undefined
    }
    const regionBoundary = data.features.find((f) => {
      return doesPlaceMatch(f, placeName)
    })

    if (!regionBoundary) {
      return undefined
    }

    if (regionBoundary.geometry.type === 'Polygon') {
      return turf.polygon(regionBoundary.geometry.coordinates)
    }
    if (regionBoundary.geometry.type === 'MultiPolygon') {
      return turf.multiPolygon(regionBoundary.geometry.coordinates)
    }

    return undefined
  }

  const getPlacePolygon = async (placeName: string, placeId: string) => {
    console.warn('Getting polygon of place Id=', placeId, ', name=', placeName)
    const v1Result = await getPolygonFromCall(`https://api.geoapify.com/v1/boundaries/part-of?id=${placeId}&geometry=geometry_1000&apiKey=${apiKey}`, placeName)
    if (v1Result) {
      console.warn('Retrieved polygon using v1 api')
      return v1Result
    }
    const v2Result = await getPolygonFromCall(`https://api.geoapify.com/v2/place-details?id=${placeId}&apiKey=${apiKey}`, placeName)
    if (v2Result) {
      console.warn('Retrieved polygon using v2 api')
      return v2Result
    }
    console.warn('Failed to get polygon')
    return undefined
  }

  return {
    searchPlaces,
    getPlacePolygon,
  }
}
