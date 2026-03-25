import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Activity, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QualityPerformanceTab({ profiles }: { profiles: any[] }) {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      const { data } = await supabase.from('documents').select('metadata')
      if (data) {
        const ofertas = data.filter((d) => d.metadata?.type === 'oferta')
        setDocs(ofertas)
      }
      setLoading(false)
    }
    fetchDocs()
  }, [])

  const performanceData = useMemo(() => {
    if (!profiles || !docs) return []

    const userStats: Record<string, any> = {}

    profiles.forEach((p) => {
      userStats[p.id] = {
        id: p.id,
        name: p.full_name || 'Corretor',
        avatar: p.avatar_url,
        total: 0,
        pending: 0,
        duplicates: 0,
        score: 100,
      }
    })

    docs.forEach((d) => {
      const md = d.metadata
      const uid = md.user_id
      if (uid && userStats[uid]) {
        userStats[uid].total += 1
        if (md.has_duplicate_history) {
          if (md.resolution === 'pending') {
            userStats[uid].pending += 1
          }
          if (md.resolution === 'duplicate') {
            userStats[uid].duplicates += 1
          }
        }
      }
    })

    const result = Object.values(userStats)
      .map((stat) => {
        if (stat.total > 0) {
          stat.score = Math.max(0, Math.round(100 - (stat.duplicates / stat.total) * 100))
        } else {
          stat.score = '-' // No docs
        }
        return stat
      })
      .filter((s) => s.total > 0)

    return result.sort((a, b) => {
      if (a.score === '-' && b.score === '-') return 0
      if (a.score === '-') return 1
      if (b.score === '-') return -1
      if (b.score !== a.score) return b.score - a.score
      return b.total - a.total
    })
  }, [profiles, docs])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Relatório de Qualidade de Cadastro
          </CardTitle>
          <CardDescription>
            Ranking de corretores baseado na organização e limpeza de seus portfólios.
            <br />O Score penaliza contas que cadastram duplicidades confirmadas na base.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground py-3">Posição</TableHead>
                <TableHead className="text-muted-foreground py-3">Corretor</TableHead>
                <TableHead className="text-center text-muted-foreground py-3">Imóveis</TableHead>
                <TableHead className="text-center text-muted-foreground py-3">Em Análise</TableHead>
                <TableHead className="text-center text-muted-foreground py-3">Duplicados</TableHead>
                <TableHead className="text-right text-muted-foreground py-3">
                  Score de Qualidade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((stat, i) => (
                <TableRow
                  key={stat.id}
                  className="border-border hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-medium text-white">
                    <span
                      className={cn(
                        'w-6 inline-block font-bold',
                        i === 0
                          ? 'text-yellow-400'
                          : i === 1
                            ? 'text-gray-300'
                            : i === 2
                              ? 'text-amber-600'
                              : 'text-muted-foreground',
                      )}
                    >
                      {i + 1}º
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-1 ring-border">
                        <AvatarImage src={stat.avatar} />
                        <AvatarFallback className="bg-secondary text-xs">
                          {stat.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white">{stat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-white">{stat.total}</TableCell>
                  <TableCell className="text-center">
                    {stat.pending > 0 ? (
                      <span className="text-yellow-500 font-medium">{stat.pending}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {stat.duplicates > 0 ? (
                      <span className="text-red-400 font-medium">{stat.duplicates}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {stat.score === '-' ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-none font-bold text-sm h-7 px-3',
                          stat.score >= 90
                            ? 'bg-green-500/10 text-green-500'
                            : stat.score >= 70
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500',
                        )}
                      >
                        {stat.score}%
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {performanceData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum imóvel cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
