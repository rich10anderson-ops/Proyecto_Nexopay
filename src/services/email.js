import axios from 'axios'

const APP_API_BASE = import.meta.env.VITE_APP_API_BASE || ''

export async function sendEmail(to, subject, body) {
  try {
    const { data } = await axios.post('/api/send-email', {
      to,
      subject,
      body,
    }, {
      timeout: 10000,
    })
    return data
  } catch (error) {
    console.warn('Fallo al enviar correo vía API, usando simulación local:', error?.message || error)
    return {
      isMock: true,
      messageId: `mock-${Date.now()}`,
    }
  }
}
