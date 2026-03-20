import { supabase } from '@/lib/supabase/client'

export interface PlanPriceCalculation {
  plan_id: string
  price_base: number
  discount_percentage: number
  final_price: number
  matches_this_month: number
}

export const calculatePlanPrice = async (
  userId: string,
  planId: string,
): Promise<PlanPriceCalculation | null> => {
  const { data, error } = await supabase.functions.invoke('calculate-plan-price', {
    body: { user_id: userId, plan_id: planId },
  })

  if (error) {
    console.error('Error calculating plan price via edge function:', error)
    return null
  }

  return data as PlanPriceCalculation
}
