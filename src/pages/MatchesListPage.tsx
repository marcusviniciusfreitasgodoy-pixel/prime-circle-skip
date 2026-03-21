import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GitMerge, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '@/stores/main'
import { toast } from 'sonner'

export default function MatchesListPage() {
  const { matches, needs, listings, updateMatchStatus } = useAppStore()
  const navigate = useNavigate()

  const MATCH_STAGES = ['Novo', 'Contato', 'Visita', 'Proposta', 'Fechado'] as const

  const advanceMatch = (id: string, currentStatus: string) => {
    const idx = MATCH_STAGES.indexOf(currentStatus as any)
    if (idx < MATCH_STAGES.length - 2) {
      updateMatchStatus(id, MATCH_STAGES[idx + 1])
      toast.success(`Conexão avançou para ${MATCH_STAGES[idx + 1]}`)
    } else if (idx === MATCH_STAGES.length - 2) {
      navigate(`/matches/${id}/close`)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Minhas Conexões</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe o andamento das suas parcerias e matches.
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Funil de Negócios de Conexões</CardTitle>
          <CardDescription>Fluxo de validação obrigatório até o fechamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {matches.map((match) => {
              const need = needs.find((n) => n.id === match.needId)
              const listing = listings.find((l) => l.id === match.listingId)
              const currentIdx = MATCH_STAGES.indexOf(match.status as any)

              return (
                <div key={match.id} className="p-4 bg-background rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-medium">
                        {need?.title || 'Demanda'}{' '}
                        <span className="text-muted-foreground mx-2">↔</span>{' '}
                        {listing?.title || 'Imóvel'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Conexão ID: {match.id}</p>
                    </div>
                    {match.status !== 'Fechado' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/50 text-primary hover:bg-primary/10"
                        onClick={() => advanceMatch(match.id, match.status)}
                      >
                        {match.status === 'Proposta' ? 'Registrar Fechamento' : 'Avançar Status'}{' '}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-500 border-none hover:bg-green-500/30">
                        Fechamento Validado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center w-full justify-between mt-6 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${(currentIdx / (MATCH_STAGES.length - 1)) * 100}%` }}
                    />

                    {MATCH_STAGES.map((stage, i) => (
                      <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-colors ${i <= currentIdx ? 'bg-primary border-primary' : 'bg-background border-border'} ${i === currentIdx ? 'shadow-[0_0_10px_rgba(201,168,76,0.5)] scale-125' : ''}`}
                        />
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider absolute top-6 whitespace-nowrap ${i <= currentIdx ? 'text-white' : 'text-muted-foreground'}`}
                        >
                          {stage}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-4" />
                </div>
              )
            })}
            {matches.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-card/50 rounded-xl border border-dashed border-border text-center mt-4">
                <GitMerge className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-white mb-2">Nenhuma conexão ativa</p>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Você ainda não possui matches em andamento. Continue publicando demandas e imóveis
                  para gerar parcerias.
                </p>
                <Button
                  variant="outline"
                  className="border-border hover:bg-secondary text-muted-foreground"
                  onClick={() => navigate('/dashboard')}
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
