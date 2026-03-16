import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import useAppStore from '@/stores/main'

const COLUMNS = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

export default function MatchesListPage() {
  const { matches, needs, listings } = useAppStore()

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Pipeline de Conexões</h2>
        <p className="text-muted-foreground text-sm">
          Acompanhe o status das parcerias em andamento.
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colMatches = matches.filter((m) => m.status === col)

          return (
            <div
              key={col}
              className="flex-shrink-0 w-80 flex flex-col bg-card rounded-xl border border-border"
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-white">{col}</h3>
                <Badge variant="secondary" className="bg-secondary">
                  {colMatches.length}
                </Badge>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colMatches.map((match) => {
                  const need = needs.find((n) => n.id === match.needId)
                  const listing = listings.find((l) => l.id === match.listingId)
                  if (!need || !listing) return null

                  return (
                    <Card
                      key={match.id}
                      className="bg-secondary border-border cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-primary font-medium">Demanda</p>
                          <p className="text-sm text-white line-clamp-1">{need.title}</p>
                        </div>
                        <div className="w-full h-px bg-border" />
                        <div className="space-y-1">
                          <p className="text-xs text-primary font-medium">Imóvel</p>
                          <p className="text-sm text-white line-clamp-1">{listing.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
