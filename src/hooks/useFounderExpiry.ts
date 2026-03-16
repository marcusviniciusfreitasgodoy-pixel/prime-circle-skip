import useAppStore from '@/stores/main'

export function useFounderExpiry() {
  const { user, getExpirationInfo } = useAppStore()

  const isFounderUser = user?.plan === 'Founder' || user?.wasFounder

  if (!user || !isFounderUser) {
    return {
      isFounder: false,
      daysRemaining: 0,
      isExpiring: false,
      isExpired: false,
      expiryDate: null,
    }
  }

  const info = getExpirationInfo()
  if (!info) {
    return {
      isFounder: true,
      daysRemaining: 0,
      isExpiring: false,
      isExpired: false,
      expiryDate: null,
    }
  }

  return {
    isFounder: true,
    daysRemaining: info.daysLeft,
    isExpiring: info.daysLeft <= 30 && info.daysLeft > 0,
    isExpired: info.isExpired,
    expiryDate: info.expirationDate,
  }
}
