import axios from 'axios'

const APP_API_BASE = import.meta.env.VITE_APP_API_BASE || ''

export async function sendEmail(to, subject, body) {
  if (import.meta.env.DEV && !APP_API_BASE) {
    return {
      isMock: true,
      messageId: `local-${Date.now()}`,
    }
  }

  const { data } = await axios.post(`${APP_API_BASE}/api/send-email`, {
    to,
    subject,
    body,
  }, {
    timeout: 10000,
  })

  return data
}
