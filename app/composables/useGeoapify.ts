export function useGeoapify() {
  const config = useRuntimeConfig()
  const apiKey = config.public.geoapifyApiKey

  const searchPlaces = async (query: string) => {
    const response = await fetch(
      // todo just cities for now
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:none&limit=10&apiKey=${apiKey}`,
    )
    return await response.json()
  }

  const getPlacePolygon = async (placeId: string) => {
    const response = await fetch(
      `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details.polygon&apiKey=${apiKey}`,
    )
    return await response.json()
  }

  return {
    searchPlaces,
    getPlacePolygon,
  }
}
