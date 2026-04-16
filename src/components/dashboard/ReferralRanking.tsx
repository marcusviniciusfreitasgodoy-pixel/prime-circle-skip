import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ReferralRanking() {
  const [topReferrers, setTopReferrers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      // Fetch all active profiles that have a referred_by_id
      const { data: referrals, error: refError } = await supabase
        .from('profiles')
        .select('referred_by_id')
        .eq('status', 'active')
        .not('referred_by_id', 'is', null)

      if (refError || !referrals) {
        setLoading(false)
        return
      }

      // Count occurrences
      const counts: Record<string, number> = {}
      referrals.forEach((r) => {
        const refId = r.referred_by_id
        if (refId) {
          counts[refId] = (counts[refId] || 0) + 1
        }
      })

      // Sort and get top 5
      const topIds = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0])

      if (topIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch profile details for top referrers
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', topIds)

      if (!profError && profiles) {
        // Map and sort by count
        const result = profiles
          .map((p) => ({
            ...p,
            count: counts[p.id],
          }))
          .sort((a, b) => b.count - a.count)

        setTopReferrers(result)
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
      <CardHeader className="pb-3 border-b border-border/50 p-4 sm:p-6">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Ranking de Indicações
        </CardTitle>
        <CardDescription>Top 5 Embaixadores da Rede</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 p-3 sm:p-6 flex-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-1">
                <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {topReferrers.map((referrer, index) => (
              <div
                key={referrer.id}
                className="flex items-center gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="w-6 flex justify-center shrink-0">{getRankIcon(index)}</div>
                <Avatar className="w-10 h-10 border border-border bg-background shrink-0">
                  <AvatarImage src={referrer.avatar_url} />
                  <AvatarFallback className="bg-secondary text-muted-foreground">
                    {referrer.full_name?.substring(0, 2).toUpperCase() || 'CO'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {referrer.full_name || 'Corretor'}
                  </p>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {referrer.count} indicações ativas
                  </p>
                </div>
              </div>
            ))}
            {topReferrers.length === 0 && (
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
