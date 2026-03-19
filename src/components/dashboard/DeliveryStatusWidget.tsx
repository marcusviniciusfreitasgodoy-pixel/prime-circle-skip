import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Send, CheckCircle2, XCircle } from 'lucide-react'

export function DeliveryStatusWidget() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ success: 0, failed: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      setLoading(true)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('notification_logs')
        .select('status')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (!error && data) {
        const success = data.filter((d) => d.status === 'success').length
        const failed = data.filter((d) => d.status === 'failed').length
        setStats({ success, failed, total: data.length })
      }
      setLoading(false)
    }

    fetchStats()
  }, [user])

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" /> Status de Entrega
        </CardTitle>
        <CardDescription>Taxa de sucesso das notificações (30 dias)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-8 bg-muted rounded w-full mt-4"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white">{successRate}%</div>
              <div className="text-sm text-muted-foreground mb-1">Taxa de Sucesso</div>
            </div>

            <Progress
              value={successRate}
              className="h-2 bg-secondary"
              indicatorClassName="bg-primary"
            />

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Sucesso
                </span>
                <span className="text-lg font-semibold text-white">{stats.success}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <XCircle className="w-3 h-3 text-red-500" /> Falhas
                </span>
                <span className="text-lg font-semibold text-white">{stats.failed}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
