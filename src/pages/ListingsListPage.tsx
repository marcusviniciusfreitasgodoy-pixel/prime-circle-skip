import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter } from 'lucide-react'
import { ListingCard } from '@/components/ListingCard'
import useAppStore from '@/stores/main'

export default function ListingsListPage() {
  const { listings } = useAppStore()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Catálogo de Imóveis</h2>
          <p className="text-muted-foreground text-sm">
            Explore o inventário exclusivo do círculo.
          </p>
        </div>
        <Button className="gold-gradient w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2 text-black" />
          <span className="text-black font-medium">Novo Imóvel</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por bairro, condomínio ou tipo..."
            className="pl-9 bg-card border-border text-white h-10"
          />
        </div>
        <Button variant="outline" size="icon" className="border-border bg-card hover:bg-secondary">
          <Filter className="w-4 h-4 text-white" />
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing, i) => (
          <div
            key={listing.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  )
}
