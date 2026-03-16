/**
 * Mock implementation of a Transactional Email Service (like Resend API)
 */

interface EmailPayload {
  to?: string
  subject?: string
  name?: string
  candidate?: string
  code?: string
  [key: string]: any
}

export async function sendTransactionalEmail(type: string, payload: EmailPayload) {
  console.log(`[RESEND API MOCK] Triggering Email: ${type}`, payload)

  // Simulating network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 800))

  return { success: true, id: `mock_email_${Date.now()}` }
}

export function simulateInactivityReminders() {
  console.log('[CRON MOCK] Checking for 14-day inactivity...')
  console.log(
    '[CRON MOCK] Triggered Inactivity Reminders for members who have not updated needs recently.',
  )
}

export function simulateBiWeeklyReport() {
  console.log('[CRON MOCK] Generating Bi-weekly Market Report...')
  console.log('[CRON MOCK] Emails sent to all active members with latest matches and listings.')
}
