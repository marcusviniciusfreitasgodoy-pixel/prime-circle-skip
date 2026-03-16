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
import { Plus, Search, Link as LinkIcon } from 'lucide-react'
import { NeedCard } from '@/components/NeedCard'
import { MatchModal } from '@/components/MatchModal'
import useAppStore, { Need } from '@/stores/main'

export default function NeedsListPage() {
  const { needs, user } = useAppStore()
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null)
  const [bairro, setBairro] = useState('all')

  const filteredNeeds = needs.filter((n) => {
    if (bairro !== 'all' && !n.neighborhood.includes(bairro)) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Demandas Ativas</h2>
          <p className="text-muted-foreground text-sm">
            Descubra o que os clientes dos parceiros estão buscando.
          </p>
        </div>
        <Button className="gold-gradient w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2 text-black" />
          <span className="text-black font-medium">Nova Demanda</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar demandas..."
            className="pl-9 bg-background border-border text-white h-10"
          />
        </div>
        <Select value={bairro} onValueChange={setBairro}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background border-border">
            <SelectValue placeholder="Bairro / Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Regiões</SelectItem>
            <SelectItem value="Barra da Tijuca">Barra da Tijuca</SelectItem>
            <SelectItem value="Jardim Oceânico">Jardim Oceânico</SelectItem>
            <SelectItem value="Santa Mônica">Santa Mônica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredNeeds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
          Nenhuma demanda encontrada.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNeeds.map((need, i) => (
            <div
              key={need.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <NeedCard
                need={need}
                action={
                  need.ownerId !== user?.id ? (
                    <Button
                      className="w-full bg-background hover:bg-primary hover:text-black text-white border border-primary/50 transition-colors mt-4"
                      onClick={() => setSelectedNeed(need)}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Vincular Imóvel
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full mt-4" disabled>
                      Sua Demanda
                    </Button>
                  )
                }
              />
            </div>
          ))}
        </div>
      )}

      <MatchModal
        need={selectedNeed}
        isOpen={!!selectedNeed}
        onClose={() => setSelectedNeed(null)}
      />
    </div>
  )
}
