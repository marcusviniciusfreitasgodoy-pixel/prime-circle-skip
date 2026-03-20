import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { PlansLimitBanner } from '@/components/plans/PlansLimitBanner'
import { useLocation } from 'react-router-dom'

export function GlobalPlanLimitBanner() {
  const { user } = useAuth()
  const location = useLocation()
  const [demandsCount, setDemandsCount] = useState(0)
  const [userPlan, setUserPlan] = useState<string>('Free')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const fetchLimits = async () => {
      // First try to get the active plan from user_plans table
      const { data: userPlanData } = await supabase
        .from('user_plans')
        .select('*, plans(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      let currentPlan = 'Free'
      if (userPlanData && userPlanData.plans) {
        currentPlan = userPlanData.plans.name
      } else {
        // Fallback to profile plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (profile) {
          currentPlan = profile.plan || 'Free'
        }
      }

      if (isMounted) {
        setUserPlan(currentPlan)
      }

      // Count user demands from documents table
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .contains('metadata', { type: 'demanda', user_id: user.id })

      if (count !== null && isMounted) {
        setDemandsCount(count)
      }
    }

    fetchLimits()

    return () => {
      isMounted = false
    }
  }, [user, location.pathname])

  // Don't show banner on the plans page itself
  if (location.pathname === '/plans') {
    return null
  }

  const isFreePlan = userPlan.toLowerCase() === 'free'
  const hasReachedDemandLimit = isFreePlan && demandsCount >= 3

  return (
    <PlansLimitBanner
      showLimitBanner={hasReachedDemandLimit && isVisible}
      setIsBannerVisible={setIsVisible}
    />
  )
}
