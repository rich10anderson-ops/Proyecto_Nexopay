const express = require('express')
const axios = require('axios')
const NodeCache = require('node-cache')
const cors = require('cors')
const path = require('path')

const app = express()
const cache = new NodeCache({ stdTTL: 30 }) // cache 30s by default

app.use(cors())

const COINGECKO = process.env.COINGECKO_BASE || 'https://api.coingecko.com/api/v3'

// Serve frontend static if built
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))

app.get('/api/coingecko/coins/markets', async (req, res) => {
  try{
    const key = 'markets:' + JSON.stringify(req.query)
    const cached = cache.get(key)
    if(cached){
      return res.json(cached)
    }

    const resp = await axios.get(`${COINGECKO}/coins/markets`, { params: req.query, timeout: 8000 })
    cache.set(key, resp.data)
    res.json(resp.data)
  }catch(err){
    console.error('proxy error', err.message || err)
    res.status(502).json({ error: 'Bad gateway', details: err.message })
  }
})

// Generic proxy helper
app.get('/api/coingecko/*', async (req, res) => {
  try{
    const pathTail = req.params[0]
    const key = 'g:' + pathTail + JSON.stringify(req.query)
    const cached = cache.get(key)
    if(cached) return res.json(cached)
    const url = `${COINGECKO}/${pathTail}`
    const resp = await axios.get(url, { params: req.query, timeout: 8000 })
    cache.set(key, resp.data)
    res.json(resp.data)
  }catch(err){
    console.error('proxy generic error', err.message || err)
    res.status(502).json({ error: 'Bad gateway', details: err.message })
  }
})

// Informational root route so visiting http://localhost:4000/ doesn't show a blank page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><meta charset="utf-8"><title>NEXOPAY Proxy</title></head>
      <body style="font-family:Arial,Helvetica,sans-serif;background:#071022;color:#e6f7ff;padding:24px">
        <h2>NEXOPAY Proxy Server</h2>
        <p>This server proxies CoinGecko requests to avoid CORS during development.</p>
        <ul>
          <li>Market endpoint: <a style="color:#aaf" href="/api/coingecko/coins/markets?vs_currency=usd&per_page=10&page=1">/api/coingecko/coins/markets</a></li>
        </ul>
        <p>Start the frontend dev server with <code>npm run dev</code> in the project root and open <a style="color:#aaf" href="http://localhost:5173">http://localhost:5173</a>.</p>
      </body>
    </html>
  `)
})

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log(`NEXOPAY proxy server running on http://localhost:${port}`))
