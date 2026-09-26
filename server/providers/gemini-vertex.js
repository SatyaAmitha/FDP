import { GoogleGenerativeAI } from '@google/generative-ai'
import { VertexAI } from '@google-cloud/vertexai'

export async function chatGemini({ messages, system }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in .env')

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: system || undefined,
  })

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const last = messages[messages.length - 1]
  if (!last) throw new Error('At least one user message is required')

  const chat = model.startChat({ history })
  const result = await chat.sendMessage(last.content)
  const text = result.response.text().trim()

  return {
    provider: 'gemini',
    model: modelName,
    text,
  }
}

export async function chatVertex({ messages, system }) {
  const project = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.VERTEX_LOCATION || 'us-central1'
  const modelName = process.env.VERTEX_MODEL || 'gemini-2.0-flash-001'

  if (!project) throw new Error('GOOGLE_CLOUD_PROJECT is required for Vertex AI')

  if (process.env.VERTEX_CREDENTIALS_JSON) {
    const creds = JSON.parse(process.env.VERTEX_CREDENTIALS_JSON)
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = process.env.VERTEX_CREDENTIALS_JSON
    // @google-cloud libs also accept GOOGLE_APPLICATION_CREDENTIALS file path
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const { writeFileSync, mkdtempSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const { join } = await import('node:path')
      const dir = mkdtempSync(join(tmpdir(), 'vertex-'))
      const path = join(dir, 'sa.json')
      writeFileSync(path, JSON.stringify(creds))
      process.env.GOOGLE_APPLICATION_CREDENTIALS = path
    }
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.VERTEX_CREDENTIALS_JSON) {
    throw new Error(
      'Set GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON) or VERTEX_CREDENTIALS_JSON',
    )
  }

  const vertex = new VertexAI({ project, location })
  const model = vertex.getGenerativeModel({
    model: modelName,
    systemInstruction: system || undefined,
  })

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const result = await model.generateContent({ contents })
  const text =
    result.response?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() ||
    ''

  return {
    provider: 'vertex',
    model: modelName,
    text,
  }
}
