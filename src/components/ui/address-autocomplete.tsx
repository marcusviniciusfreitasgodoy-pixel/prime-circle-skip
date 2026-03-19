import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { useGoogleMapsScript } from '@/hooks/use-google-maps'
import { extractAddressComponents } from '@/lib/address-utils'
import { MapPin, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    google: any
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onSelect: (details: { street: string; neighborhood: string; city: string; state: string }) => void
  placeholder?: string
  required?: boolean
  name?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  required,
  name,
}: AddressAutocompleteProps) {
  const isLoaded = useGoogleMapsScript()
  const [open, setOpen] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const mapDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoaded && !autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
    }
    if (isLoaded && !placesService.current && mapDiv.current && window.google) {
      placesService.current = new window.google.maps.places.PlacesService(mapDiv.current)
    }
  }, [isLoaded])

  useEffect(() => {
    if (!value || value.length < 3 || !autocompleteService.current) {
      setPredictions([])
      return
    }

    autocompleteService.current.getPlacePredictions(
      { input: value, componentRestrictions: { country: 'br' } },
      (results: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results)
          setOpen(true)
        } else {
          setPredictions([])
        }
      },
    )
  }, [value])

  const handleSelect = (placeId: string, description: string) => {
    onChange(description)
    setOpen(false)

    if (placesService.current) {
      placesService.current.getDetails(
        { placeId, fields: ['address_components', 'formatted_address', 'name'] },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const details = extractAddressComponents(place)
            onSelect({
              street: details.street,
              neighborhood: details.neighborhood,
              city: details.city,
              state: details.state,
            })
          }
        },
      )
    }
  }

  return (
    <div className="relative">
      <div ref={mapDiv} className="hidden" />
      <Popover open={open && predictions.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              name={name}
              required={required}
              placeholder={placeholder || 'Comece a digitar o endereço...'}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-9"
              autoComplete="off"
            />
            {!isLoaded && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {predictions.map((p) => (
                  <CommandItem
                    key={p.place_id}
                    value={p.description}
                    onSelect={() => handleSelect(p.place_id, p.description)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{p.description}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
