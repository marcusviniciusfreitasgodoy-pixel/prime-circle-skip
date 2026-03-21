import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export function GlobalPlanLimitBanner() {
  const { user } = useAuth()
  const location = useLocation()
  const [demandCount, setDemandCount] = useState(0)
  const [plan, setPlan] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchUserPlan = async () => {
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (data) setPlan(data.plan)
    }

    const checkLimits = async () => {
      try {
        // Use GET with limit(1) instead of HEAD to avoid JSON.parse error in preview environments
        // The interceptor fails on empty bodies from HEAD requests, so this safely fetches the count.
        const { count, error } = await supabase
          .from('documents')
          .select('id', { count: 'exact' })
          .contains('metadata', { type: 'demanda', user_id: user.id })
          .limit(1)

        if (!error && count !== null) {
          setDemandCount(count)
        }
      } catch (err) {
        console.error('Error fetching demand count', err)
      }
    }

    fetchUserPlan()
    checkLimits()
  }, [user])

  if (plan !== 'Free' || demandCount < 3 || isDismissed) return null

  if (location.pathname === '/plans') return null

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 p-3 sticky top-0 z-50 backdrop-blur-md">
      <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-destructive">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Limite do Plano Free Atingido</h4>
            <p className="text-xs opacity-90">
              Você atingiu o limite de 3 demandas. Faça o upgrade para continuar publicando.
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setIsDismissed(true)}
          >
            Agora não
          </Button>
          <Button
            asChild
            size="sm"
            variant="destructive"
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            <Link to="/plans">Ver Planos</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
