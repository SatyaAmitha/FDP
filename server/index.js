import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer as createViteServer } from 'vite'
import { chatOpenAI, chatAzure } from './providers/openai-azure.js'
import { chatBedrock } from './providers/bedrock.js'
import { chatGemini, chatVertex } from './providers/gemini-vertex.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(root, '.env') })

const PORT = Number(process.env.PORT || process.env.AI_SERVER_PORT || 5173)
const isProd = process.env.NODE_ENV === 'production'

function resolveProvider(requested) {
  return (requested || process.env.AI_PROVIDER || 'openai').toLowerCase()
}

async function runChat({ provider, messages, system }) {
  switch (provider) {
    case 'openai':
      return chatOpenAI({ messages, system })
    case 'azure':
      return chatAzure({ messages, system })
    case 'bedrock':
      return chatBedrock({ messages, system })
    case 'gemini':
      return chatGemini({ messages, system })
    case 'vertex':
      return chatVertex({ messages, system })
    default:
      throw new Error(`Unknown AI_PROVIDER "${provider}". Use openai|azure|bedrock|gemini|vertex`)
  }
}

function mountApi(app) {
  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      defaultProvider: resolveProvider(),
      configured: {
        openai: Boolean(process.env.OPENAI_API_KEY),
        azure: Boolean(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT),
        bedrock: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY),
        vertex: Boolean(process.env.GOOGLE_CLOUD_PROJECT),
      },
    })
  })

  app.get('/providers', (_req, res) => {
    res.json({
      default: resolveProvider(),
      options: ['openai', 'azure', 'bedrock', 'gemini', 'vertex'],
    })
  })

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, system, provider: requestedProvider } = req.body || {}
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages[] is required' })
      }
      for (const m of messages) {
        if (!m?.role || typeof m.content !== 'string') {
          return res.status(400).json({ error: 'Each message needs role and content string' })
        }
      }
      const provider = resolveProvider(requestedProvider)
      const result = await runChat({
        provider,
        messages,
        system: typeof system === 'string' ? system : undefined,
      })
      res.json(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat failed'
      console.error('[chat]', message)
      res.status(500).json({ error: message })
    }
  })
}

async function start() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  mountApi(app)

  if (!isProd) {
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const dist = path.join(root, 'dist')
    app.use(express.static(dist))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'))
    })
  }

  app.listen(PORT, () => {
    console.log(`FDP GenAI Lab → http://localhost:${PORT}`)
    console.log(`UI + AI API on same server · provider: ${resolveProvider()}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
