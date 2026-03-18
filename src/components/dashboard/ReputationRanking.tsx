import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ReputationRanking() {
  const [topBrokers, setTopBrokers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, reputation_score')
        .eq('status', 'active')
        .order('reputation_score', { ascending: false })
        .limit(10)

      if (!error && data) {
        setTopBrokers(data)
      }
      setLoading(false)
    }
    fetchRanking()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500/20 drop-shadow-md" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-300 fill-gray-300/20" />
      case 2:
        return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/20" />
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center font-bold text-muted-foreground text-xs">
            {index + 1}º
          </div>
        )
    }
  }

  return (
    <Card className="bg-card border-border h-full flex flex-col shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" /> Ranking de Reputação
        </CardTitle>
        <CardDescription>Top 10 Corretores da Rede</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topBrokers.map((broker, index) => (
              <div
                key={broker.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="w-6 flex justify-center shrink-0">{getRankIcon(index)}</div>
                <Avatar className="w-10 h-10 border border-border bg-background">
                  <AvatarImage
                    src={
                      broker.avatar_url ||
                      `https://img.usecurling.com/ppl/thumbnail?seed=${broker.id}`
                    }
                  />
                  <AvatarFallback className="bg-secondary text-muted-foreground">
                    {broker.full_name?.substring(0, 2).toUpperCase() || 'CO'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {broker.full_name || 'Corretor'}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {broker.reputation_score || 0} pts
                  </p>
                </div>
              </div>
            ))}
            {topBrokers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
