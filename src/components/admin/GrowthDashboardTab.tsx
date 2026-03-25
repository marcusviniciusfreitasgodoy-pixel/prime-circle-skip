import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import {
  TrendingUp,
  Users,
  UserCheck,
  MousePointerClick,
  Trophy,
  Send,
  Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function GrowthDashboardTab() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessingReminders, setIsProcessingReminders] = useState(false)

  const fetchMetrics = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_growth_metrics')
    if (!error && data) {
      setMetrics(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const processReminders = async () => {
    setIsProcessingReminders(true)
    try {
      const res = await supabase.functions.invoke('process-invitation-reminders')
      if (res.error) throw res.error
      toast.success(`Foram enviados lembretes para ${res.data?.processed || 0} convites pendentes.`)
    } catch (e: any) {
      toast.error('Erro ao processar lembretes: ' + e.message)
    } finally {
      setIsProcessingReminders(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const {
    total_clicks = 0,
    total_signups = 0,
    total_active = 0,
    conversion_rate = 0,
    top_referrers = [],
  } = metrics || {}

  const clickToSignupRate = total_clicks > 0 ? Math.round((total_signups / total_clicks) * 100) : 0
  const signupToActiveRate =
    total_signups > 0 ? Math.round((total_active / total_signups) * 100) : 0

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border">
        <div>
          <h3 className="text-white font-medium">Lembretes de Indicação</h3>
          <p className="text-sm text-muted-foreground">
            Dispare lembretes para corretores convidados que ainda não se cadastraram na rede.
          </p>
        </div>
        <Button
          onClick={processReminders}
          disabled={isProcessingReminders}
          className="gold-gradient text-black font-bold"
        >
          {isProcessingReminders ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Processar Lembretes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliques em Links
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{total_clicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Topo do funil</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cadastros Gerados
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{total_signups}</div>
            <p className="text-xs text-muted-foreground mt-1">Indicações diretas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Parceiros Ativos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{total_active}</div>
            <p className="text-xs text-muted-foreground mt-1">Convertidos com sucesso</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-l-4 border-l-primary/50 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-[30px]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-white">{conversion_rate}%</div>
            <p className="text-xs text-primary mt-1">Cliques → Ativos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Funil de Crescimento</CardTitle>
          <CardDescription>
            Fluxo de indicação ponta a ponta gerado por nossos embaixadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex-1 w-full bg-secondary/50 rounded-xl p-6 text-center border border-border">
              <MousePointerClick className="w-8 h-8 text-blue-500 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-black text-white">{total_clicks}</div>
              <div className="text-sm text-muted-foreground mt-1">Convites Clicados</div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-24">
              <span className="text-xs font-semibold text-muted-foreground mb-1">
                {clickToSignupRate}%
              </span>
              <div className="h-px w-full bg-border relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-muted-foreground rotate-45" />
              </div>
            </div>

            <div className="flex-1 w-full bg-secondary/50 rounded-xl p-6 text-center border border-border">
              <Users className="w-8 h-8 text-yellow-500 mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-black text-white">{total_signups}</div>
              <div className="text-sm text-muted-foreground mt-1">Novos Cadastros</div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-24">
              <span className="text-xs font-semibold text-muted-foreground mb-1">
                {signupToActiveRate}%
              </span>
              <div className="h-px w-full bg-border relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-muted-foreground rotate-45" />
              </div>
            </div>

            <div className="flex-1 w-full bg-primary/5 rounded-xl p-6 text-center border border-primary/20">
              <UserCheck className="w-8 h-8 text-primary mx-auto mb-3 opacity-80" />
              <div className="text-3xl font-black text-primary">{total_active}</div>
              <div className="text-sm text-primary/80 mt-1">Membros Ativados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Embaixadores (Ranking)
          </CardTitle>
          <CardDescription>
            Corretores que mais convertem convites em membros ativos na rede.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border">
                <TableHead className="w-[80px] text-center">Posição</TableHead>
                <TableHead>Embaixador</TableHead>
                <TableHead className="text-center">Indicações Realizadas</TableHead>
                <TableHead className="text-right">Parceiros Convertidos (Ativos)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top_referrers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma indicação registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                top_referrers.map((ref: any, index: number) => (
                  <TableRow key={ref.id} className="border-border hover:bg-secondary/20">
                    <TableCell className="text-center font-bold text-muted-foreground">
                      {index === 0
                        ? '🥇'
                        : index === 1
                          ? '🥈'
                          : index === 2
                            ? '🥉'
                            : `${index + 1}º`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ref.avatar_url} />
                          <AvatarFallback className="bg-secondary text-xs">
                            {ref.full_name?.substring(0, 2).toUpperCase() || 'US'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">
                          {ref.full_name || 'Usuário Desconhecido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {ref.signups}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20 font-bold px-3"
                      >
                        {ref.active_signups}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
