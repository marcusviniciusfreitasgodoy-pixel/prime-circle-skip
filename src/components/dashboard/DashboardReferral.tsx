import { useEffect, useState } from 'react'
import { Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export function DashboardReferral() {
  const [totalMembers, setTotalMembers] = useState(0)
  const goal = 500

  useEffect(() => {
    const fetchTotal = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'pending_validation'])
      if (count !== null) {
        setTotalMembers(count)
      }
    }
    fetchTotal()
  }, [])

  const progress = Math.min(100, (totalMembers / goal) * 100)

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            <Trophy className="text-primary w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Programa Embaixador</CardTitle>
          <CardDescription className="text-base max-w-2xl mx-auto">
            Ajude a construir o círculo e elimine seus custos operacionais. Indicações aprovadas
            destravam níveis e benefícios exclusivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-secondary/50 p-6 rounded-xl border border-border text-center">
              <Badge
                variant="outline"
                className="mb-4 text-blue-400 border-blue-400/30 bg-blue-400/10"
              >
                Embaixador
              </Badge>
              <h3 className="text-lg font-bold text-white mb-2">1-4 Indicações</h3>
              <p className="text-sm text-muted-foreground">
                Status base, acesso ao mural de demandas públicas.
              </p>
            </div>
            <div className="bg-secondary/50 p-6 rounded-xl border border-border text-center">
              <Badge
                variant="outline"
                className="mb-4 text-gray-300 border-gray-300/30 bg-gray-300/10"
              >
                Silver
              </Badge>
              <h3 className="text-lg font-bold text-white mb-2">5-6 Indicações</h3>
              <p className="text-sm text-muted-foreground">
                1 Mês de acesso gratuito ao plano Standard.
              </p>
            </div>
            <div className="bg-secondary/50 p-6 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(201,168,76,0.1)] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-[20px]" />
              <Badge
                variant="outline"
                className="mb-4 text-primary border-primary/30 bg-primary/10"
              >
                Gold
              </Badge>
              <h3 className="text-lg font-bold text-white mb-2">7-9 Indicações</h3>
              <p className="text-sm text-muted-foreground">
                2 Meses gratuitos + Destaque na plataforma.
              </p>
            </div>
            <div className="bg-secondary/50 p-6 rounded-xl border border-border text-center">
              <Badge
                variant="outline"
                className="mb-4 text-purple-400 border-purple-400/30 bg-purple-400/10"
              >
                Elite
              </Badge>
              <h3 className="text-lg font-bold text-white mb-2">10+ Indicações</h3>
              <p className="text-sm text-muted-foreground">
                Até 4 Meses gratuitos e 30% de desconto vitalício.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-dashed border-border overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
        <CardHeader className="pb-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Construção Coletiva</CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Mais parceiros significam mais imóveis e demandas compatíveis para você. Ajude-nos a
                bater a meta da rede.
              </CardDescription>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <span className="text-2xl font-black text-white">{totalMembers}</span>
            <span className="text-sm text-muted-foreground ml-1">/ {goal} membros</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-full bg-background rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
            <span>Rede Exclusiva Barra & Recreio</span>
            <span>Faltam {Math.max(0, goal - totalMembers)} parceiros de alto padrão</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
