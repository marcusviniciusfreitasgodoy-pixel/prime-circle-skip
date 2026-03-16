import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search } from 'lucide-react'
import { ListingCard } from '@/components/ListingCard'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'

export default function ListingsListPage() {
  const { listings, addListing } = useAppStore()
  const [bairro, setBairro] = useState('all')
  const [tipo, setTipo] = useState('all')

  const filteredListings = listings.filter((l) => {
    if (bairro !== 'all' && l.neighborhood !== bairro) return false
    if (tipo !== 'all' && l.type !== tipo) return false
    return true
  })

  const handleAddMockListing = () => {
    const success = addListing({
      title: 'Casa Mansão Nova',
      type: 'Casa',
      price: 'R$ 10.000.000',
      priceValue: 10000000,
      area: '800m²',
      beds: 5,
      neighborhood: 'Jardim Oceânico',
      image: 'https://img.usecurling.com/p/600/400?q=luxury%20mansion',
    })
    if (success) {
      toast.success('Imóvel adicionado com sucesso!')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catálogo de Imóveis</h2>
          <p className="text-muted-foreground text-sm">
            Explore o inventário exclusivo do círculo.
          </p>
        </div>
        <Button
          className="gold-gradient text-black w-full sm:w-auto"
          onClick={handleAddMockListing}
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="font-medium">Novo Imóvel</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar palavra-chave..."
            className="pl-9 bg-background border-border text-white h-10"
          />
        </div>
        <Select value={bairro} onValueChange={setBairro}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
            <SelectValue placeholder="Bairro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Bairros</SelectItem>
            <SelectItem value="Barra da Tijuca">Barra da Tijuca</SelectItem>
            <SelectItem value="Jardim Oceânico">Jardim Oceânico</SelectItem>
            <SelectItem value="Santa Mônica">Santa Mônica</SelectItem>
            <SelectItem value="Lúcio Costa">Lúcio Costa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="Casa">Casa</SelectItem>
            <SelectItem value="Apartamento">Apartamento</SelectItem>
            <SelectItem value="Cobertura">Cobertura</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredListings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          Nenhum imóvel encontrado com estes filtros.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing, i) => (
            <div
              key={listing.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
