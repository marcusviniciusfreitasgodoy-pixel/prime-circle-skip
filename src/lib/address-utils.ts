export function capitalizeWords(str: string) {
  if (!str) return ''
  const lowers = ['da', 'de', 'do', 'das', 'dos', 'e', 'na', 'no', 'nas', 'nos']
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (lowers.includes(word) && index !== 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function normalizeStreetName(street: string) {
  if (!street) return ''
  let normalized = street
  normalized = normalized.replace(/^Av\.\s*/i, 'Avenida ')
  normalized = normalized.replace(/^Av\s+/i, 'Avenida ')
  normalized = normalized.replace(/^R\.\s*/i, 'Rua ')
  normalized = normalized.replace(/^R\s+/i, 'Rua ')
  normalized = normalized.replace(/^Pça\.\s*/i, 'Praça ')
  normalized = normalized.replace(/^Pca\s+/i, 'Praça ')
  normalized = normalized.replace(/^Al\.\s*/i, 'Alameda ')
  normalized = normalized.replace(/^Al\s+/i, 'Alameda ')

  normalized = normalized.replace(/\s+/g, ' ').trim()
  return capitalizeWords(normalized)
}

export function extractAddressComponents(place: any) {
  let street = ''
  let route = ''
  let street_number = ''
  let neighborhood = ''
  let city = ''
  let state = ''

  if (place.address_components) {
    place.address_components.forEach((component: any) => {
      const types = component.types
      if (types.includes('route')) {
        route = normalizeStreetName(component.long_name)
      }
      if (types.includes('street_number')) {
        street_number = component.long_name
      }
      if (
        types.includes('sublocality_level_1') ||
        types.includes('sublocality') ||
        types.includes('neighborhood')
      ) {
        neighborhood = capitalizeWords(component.long_name)
      }
      if (types.includes('administrative_area_level_2') || types.includes('locality')) {
        city = capitalizeWords(component.long_name)
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      }
    })
  }

  street = route + (street_number ? `, ${street_number}` : '')

  return {
    street: street || normalizeStreetName(place.name || ''),
    neighborhood,
    city,
    state,
    formattedAddress: place.formatted_address,
  }
}
