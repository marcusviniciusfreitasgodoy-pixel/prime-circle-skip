// Mock email functionality to prevent network errors and console spam
export const sendTransactionalEmail = async (type: string, payload: any) => {
  // Intentionally silent to prevent console spam
  return new Promise((resolve) => setTimeout(resolve, 500))
}

export const simulateBiWeeklyReview = () => {
  // Intentionally silent
}
