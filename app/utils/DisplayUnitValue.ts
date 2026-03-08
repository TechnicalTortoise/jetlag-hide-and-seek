const kmToMiles = 0.621371
const milesToFeet = 5280.0

export function distanceKmToPreferredFormatted(distanceKm: number, unit: UnitOption): string {
  if (unit === UnitOption.metric) {
    if (distanceKm < 1) {
      return `${(distanceKm * 1000).toFixed(0)}m`
    }
    return `${distanceKm.toFixed(3)}km`
  }

  const distanceMiles = kmToMiles * distanceKm
  return `${distanceMiles.toFixed(3)}mi`
  // if (distanceMiles > 1) {
  //     return `${distanceMiles.toFixed(3)}mi`
  // }
  // const distanceFeet = milesToFeet * distanceMiles
  // return `${distanceFeet.toFixed(0)}ft`
}

export function areaKm2ToPrefferedFormatted(areaKm2: number, unit: UnitOption): string {
  if (unit === UnitOption.metric) {
    if (areaKm2 < 1e-3) {
      // <1000m^2
      return `${(areaKm2 * 1e-6).toFixed(0)}m²`
    }
    return `${areaKm2.toFixed(3)}km²`
  }

  // 0.386102
  const areaMi2 = (kmToMiles * kmToMiles) * areaKm2
  return `${areaMi2.toFixed(3)}mi²`

  //   const oneThousandSquareFtInMi2 = 1000 / (milesToFeet * milesToFeet)
  //   if (areaMi2 < oneThousandSquareFtInMi2) {
  //     const areaFt2 = areaMi2 / (milesToFeet * milesToFeet)
  //     return `${(areaFt2).toFixed(0)}ft²`
  //   }
}

export function unitToLongString(unit: UnitOption): string {
  if (unit === UnitOption.metric) {
    return 'km'
  }
  return 'miles'
}

export function distanceKmToPreferredUnit(distanceKm: number, unit: UnitOption): number {
  if (unit === UnitOption.metric) {
    return distanceKm
  }
  return kmToMiles * distanceKm
}

export function distancePreferredUnitToKm(distancePreferredUnit: number, unit: UnitOption): number {
  if (unit === UnitOption.metric) {
    return distancePreferredUnit
  }
  return distancePreferredUnit / kmToMiles
}
