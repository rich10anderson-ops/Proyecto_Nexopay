import axios from 'axios'

// API base selection:
// 1. If VITE_API_BASE is set (e.g., http://localhost:4000), use it.
// 2. If in dev and no VITE_API_BASE, use the Vite proxy '/coingecko' (configured in vite.config.js).
// 3. Otherwise (production), call the public CoinGecko API directly.
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/coingecko' : (import.meta.env.VITE_COINGECKO_BASE || 'https://api.coingecko.com/api/v3'))
const APP_API_BASE = import.meta.env.VITE_APP_API_BASE || 'https://nexopay-api-production.up.railway.app/api'

export async function fetchTopCurrencies(){
  try{
    const res = await axios.get(`${API_BASE}/coins/markets`,{
      params:{ vs_currency:'usd', order:'market_cap_desc', per_page:20, page:1, sparkline:false },
      timeout: 8000
    })
    return res.data || []
  }catch(e){
    console.error('fetchTopCurrencies', e?.message || e)
    return []
  }
}

export async function requestPresignedUpload(file) {
  try {
    const { data } = await axios.post('/api/get-presigned-url', {
      filename: file.name,
      filetype: file.type || 'application/octet-stream',
      filesize: file.size,
    }, {
      timeout: 10000,
    })
    return data
  } catch (error) {
    console.warn('Fallo al obtener URL firmada de S3, usando simulación local:', error?.message || error)
    return {
      isMock: true,
      uploadUrl: '',
      fileUrl: '',
      key: `local/${file.name}`,
      expiresIn: 300,
    }
  }
}

export async function uploadWithPresignedUrl(file) {
  const presigned = await requestPresignedUpload(file)

  if (presigned.isMock || !presigned.uploadUrl) {
    const fileUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    return {
      ...presigned,
      isMock: true,
      fileUrl,
      key: presigned.key || `local/${file.name}`,
    }
  }

  await axios.put(presigned.uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    timeout: 30000,
  })

  return presigned
}
