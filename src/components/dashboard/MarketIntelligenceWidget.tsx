import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { BarChart3, AlertCircle, Building2, TrendingUp, Search, Target } from 'lucide-react'
import { AddPropertyDialog } from './AddPropertyDialog'

const mockData = [
  {
    id: '1',
    name: 'Solar das Acácias',
    neighborhood: 'Barra da Tijuca',
    totalOffers: 0,
    totalDemands: 5,
    averageTicket: 2500000,
    demandScore: 0.95,
  },
  {
    id: '2',
    name: 'Mundo Novo',
    neighborhood: 'Barra da Tijuca',
    totalOffers: 2,
    totalDemands: 12,
    averageTicket: 1800000,
    demandScore: 0.85,
  },
  {
    id: '3',
    name: 'Península',
    neighborhood: 'Barra da Tijuca',
    totalOffers: 15,
    totalDemands: 8,
    averageTicket: 3200000,
    demandScore: 0.6,
  },
  {
    id: '4',
    name: 'Riserva Uno',
    neighborhood: 'Barra da Tijuca',
    totalOffers: 5,
    totalDemands: 3,
    averageTicket: 8500000,
    demandScore: 0.4,
  },
  {
    id: '5',
    name: 'Golden Green',
    neighborhood: 'Barra da Tijuca',
    totalOffers: 1,
    totalDemands: 6,
    averageTicket: 5000000,
    demandScore: 0.75,
  },
]

export function MarketIntelligenceWidget() {
  const [selectedCondo, setSelectedCondo] = useState<any>(null)

  return (
    <div className="space-y-6 mt-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-primary w-6 h-6" />
            Inteligência de Mercado
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Visão consolidada de Oferta vs. Demanda por Condomínio.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockData.map((condo) => {
          const isHighDemand =
            condo.totalDemands > condo.totalOffers * 1.5 ||
            (condo.totalDemands > 0 && condo.totalOffers === 0)
          const total = condo.totalOffers + condo.totalDemands
          const demandPercent = total > 0 ? (condo.totalDemands / total) * 100 : 0
          const offerPercent = total > 0 ? (condo.totalOffers / total) * 100 : 0

          return (
            <Card
              key={condo.id}
              className={`bg-card/80 border-border relative overflow-hidden transition-all group flex flex-col h-full hover:border-primary/50 ${isHighDemand && condo.totalOffers === 0 ? 'ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
            >
              {isHighDemand && (
                <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 border-b border-l border-red-500/30 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Alta Demanda
                </div>
              )}

              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-base sm:text-lg text-white font-semibold line-clamp-1 pr-24 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />{' '}
                  <span className="truncate">{condo.name}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
                  {condo.neighborhood}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-blue-400 flex items-center gap-1">
                        <Search className="w-3 h-3" /> Demandas ({condo.totalDemands})
                      </span>
                      <span className="text-primary flex items-center gap-1">
                        <Target className="w-3 h-3" /> Ofertas ({condo.totalOffers})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${demandPercent}%` }}
                        className="h-full bg-blue-500"
                      ></div>
                      <div
                        style={{ width: `${offerPercent}%` }}
                        className="h-full bg-primary"
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm bg-secondary/30 p-2 sm:p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Ticket Médio
                      </p>
                      <p className="font-semibold text-white text-xs sm:text-sm">
                        R$ {(condo.averageTicket / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Hot Score
                      </p>
                      <p className="font-semibold text-primary flex items-center gap-1 text-xs sm:text-sm">
                        <TrendingUp className="w-3 h-3" /> {(condo.demandScore * 100).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full border-border hover:bg-secondary text-white transition-colors"
                    onClick={() => setSelectedCondo(condo)}
                  >
                    Analisar Oportunidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!selectedCondo} onOpenChange={(open) => !open && setSelectedCondo(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          {selectedCondo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2 text-white">
                  <Building2 className="w-5 h-5 text-primary" /> {selectedCondo.name}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedCondo.neighborhood}
                </DialogDescription>
              </DialogHeader>

              <div className="py-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center flex flex-col justify-center">
                    <p className="text-2xl font-bold text-white">{selectedCondo.totalOffers}</p>
                    <p className="text-xs text-muted-foreground mt-1">Imóveis Ativos</p>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center flex flex-col justify-center">
                    <p className="text-2xl font-bold text-white">{selectedCondo.totalDemands}</p>
                    <p className="text-xs text-muted-foreground mt-1">Clientes Buscando</p>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg border border-border text-center flex flex-col justify-center">
                    <p className="text-lg font-bold text-white flex items-center justify-center">
                      R$ {(selectedCondo.averageTicket / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Ticket Médio</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/30 text-center flex flex-col justify-center">
                    <p className="text-2xl font-bold text-primary">
                      {(selectedCondo.demandScore * 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-primary/80 mt-1 uppercase tracking-wider font-semibold">
                      Hot Score
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-border/50 pb-2">
                    Diagnóstico de Captação
                  </h4>

                  {selectedCondo.totalDemands > selectedCondo.totalOffers && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-400 uppercase tracking-wide">
                          Forte Escassez de Oferta
                        </p>
                        <p className="text-sm text-red-400/80 mt-1 leading-relaxed">
                          Existem{' '}
                          <strong>
                            {selectedCondo.totalDemands - selectedCondo.totalOffers} demandas a mais
                          </strong>{' '}
                          do que imóveis disponíveis. Excelente oportunidade para priorizar
                          prospecção ativa neste condomínio. Qualquer imóvel captado aqui tem alta
                          chance de match imediato.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCondo.totalOffers >= selectedCondo.totalDemands &&
                    selectedCondo.totalDemands > 0 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                        <Search className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-green-400 uppercase tracking-wide">
                            Mercado Equilibrado
                          </p>
                          <p className="text-sm text-green-400/80 mt-1 leading-relaxed">
                            Existe demanda ativa compatível com a oferta. Conecte as pontas
                            verificando os imóveis disponíveis.
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="p-6 sm:p-8 text-center bg-background/80 border border-dashed border-border rounded-lg mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      A listagem detalhada de unidades e demandas será ativada na Fase 2 da
                      Inteligência de Mercado.
                    </p>

                    <div className="flex justify-center">
                      <AddPropertyDialog
                        onSuccess={() => {}}
                        trigger={
                          <Button className="gold-gradient text-black font-bold shadow-[0_0_15px_rgba(201,168,76,0.2)] w-full sm:w-auto">
                            <Target className="w-4 h-4 mr-2" />
                            Prospectar & Divulgar Imóvel
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
