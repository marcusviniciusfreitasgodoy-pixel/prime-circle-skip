/**
 * Mock implementation of a Transactional Email Service (like Resend API)
 * Triggers specified in Acceptance Criteria:
 * 1. member_approved
 * 2. new_need
 * 3. new_listing
 * 4. match_created
 * 5. status_advanced
 * 6. pending_confirmation
 * 7. closing_confirmed
 * 8. closing_disputed
 * 9. split_reminder
 * 10. new_suggestion
 * 11. suggestion_status_changed
 * 12. waitlist_invite
 */

type EmailTriggerType =
  | 'member_approved'
  | 'new_need'
  | 'new_listing'
  | 'match_created'
  | 'status_advanced'
  | 'pending_confirmation'
  | 'closing_confirmed'
  | 'closing_disputed'
  | 'split_reminder'
  | 'new_suggestion'
  | 'suggestion_status_changed'
  | 'waitlist_invite'
  | 'magic_link_otp'

interface EmailPayload {
  to?: string
  subject?: string
  name?: string
  candidate?: string
  code?: string
  [key: string]: any
}

export async function sendTransactionalEmail(type: EmailTriggerType, payload: EmailPayload) {
  console.log(`[RESEND API MOCK] Triggering Email: ${type}`, payload)

  // Simulating network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 800))

  return { success: true, id: `mock_email_${Date.now()}` }
}

export function simulateInactivityReminders() {
  console.log('[CRON MOCK] Checking for 30, 60, 90-day inactivity for Ambassador Tier...')
  console.log('[CRON MOCK] Triggered Inactivity warnings and tier suspension where applicable.')
}

export function simulateBiWeeklyReview() {
  console.log('[CRON MOCK] Auto-validating members pending review > 20 days...')
}
