export function useGeoapify() {
  const config = useRuntimeConfig()
  const apiKey = config.public.geoapifyApiKey

  const searchPlaces = async (query: string) => {
    const response = await fetch(
      // todo just cities for now
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:none&limit=8&apiKey=${apiKey}`,
    )
    return await response.json()
  }

  const getPlacePolygon = async (placeId: string) => {
    const response = await fetch(
      //   `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details.polygon&apiKey=${apiKey}`,
      `https://api.geoapify.com/v1/boundaries/part-of?id=51757286e28e77f6bf59a7ec794386734940f00103f901efdcbc930000000092030b536f757468616d70746f6e&geometry=geometry_1000&apiKey=${apiKey}`,
    )
    return await response.json()
  }

  return {
    searchPlaces,
    getPlacePolygon,
  }
}
