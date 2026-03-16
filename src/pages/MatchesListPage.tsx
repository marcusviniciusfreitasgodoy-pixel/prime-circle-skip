import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import useAppStore from '@/stores/main'

const COLUMNS = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

export default function MatchesListPage() {
  const { matches, needs, listings, updateMatchStatus } = useAppStore()
  const navigate = useNavigate()

  const handleAdvance = (matchId: string, currentStatus: string) => {
    const currentIndex = COLUMNS.indexOf(currentStatus as any)
    if (currentStatus === 'Proposta') {
      navigate(`/matches/${matchId}/close`)
    } else if (currentIndex < COLUMNS.length - 1) {
      updateMatchStatus(matchId, COLUMNS[currentIndex + 1])
    }
  }

  const handleRegress = (matchId: string, currentStatus: string) => {
    const currentIndex = COLUMNS.indexOf(currentStatus as any)
    if (currentIndex > 0) {
      updateMatchStatus(matchId, COLUMNS[currentIndex - 1])
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Pipeline de Conexões</h2>
        <p className="text-muted-foreground text-sm">
          Acompanhe e movimente o status das parcerias em andamento.
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colMatches = matches.filter((m) => m.status === col)

          return (
            <div
              key={col}
              className={`flex-shrink-0 w-80 flex flex-col bg-card rounded-xl border ${col === 'Fechado' ? 'border-primary/50' : 'border-border'}`}
            >
              <div className="p-4 border-b border-border flex justify-between items-center bg-black/20 rounded-t-xl">
                <h3
                  className={`font-semibold ${col === 'Fechado' ? 'text-primary' : 'text-white'}`}
                >
                  {col}
                </h3>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground">
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
                      className="bg-secondary border-border hover:border-primary/50 transition-colors"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs text-primary font-medium">Demanda</p>
                          <p className="text-sm text-white line-clamp-1">{need.title}</p>
                        </div>
                        <div className="w-full h-px bg-border" />
                        <div className="space-y-1">
                          <p className="text-xs text-primary font-medium">Imóvel</p>
                          <p className="text-sm text-white line-clamp-1">{listing.title}</p>
                        </div>
                        {col === 'Fechado' && match.finalValue && (
                          <div className="pt-2">
                            <Badge className="w-full justify-center bg-primary/20 text-primary hover:bg-primary/30">
                              VGV: R$ {match.finalValue}
                            </Badge>
                          </div>
                        )}
                        {col !== 'Fechado' && (
                          <div className="flex justify-between items-center pt-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 border-border bg-background hover:bg-muted text-muted-foreground"
                              onClick={() => handleRegress(match.id, match.status)}
                              disabled={col === 'Novo'}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 h-8 bg-primary/20 text-primary hover:bg-primary/30"
                              onClick={() => handleAdvance(match.id, match.status)}
                            >
                              {col === 'Proposta' ? 'Fechar' : <ChevronRight className="w-4 h-4" />}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {colMatches.length === 0 && (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4 text-center border-2 border-dashed border-border rounded-lg">
                    Nenhum negócio nesta etapa
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
