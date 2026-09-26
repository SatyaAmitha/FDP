export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type ChatResult = {
  provider: string
  model: string
  text: string
}

export type ProviderId = 'openai' | 'azure' | 'bedrock' | 'gemini' | 'vertex'

const API_BASE = import.meta.env.VITE_AI_API_BASE || ''

async function readJsonSafe(res: Response): Promise<Record<string, unknown>> {
  const raw = await res.text()
  if (!raw.trim()) {
    throw new Error(
      'AI server returned an empty response. Is ai-server running on port 8787? (cd ai-server && npm run dev)',
    )
  }
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new Error(`AI server returned invalid JSON: ${raw.slice(0, 160)}`)
  }
}

export async function chat(options: {
  messages: ChatMessage[]
  system?: string
  provider?: ProviderId | string
}): Promise<ChatResult> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: options.messages,
        system: options.system,
        provider: options.provider,
      }),
    })
  } catch {
    throw new Error(
      'Cannot reach AI server. Start it first: cd d:\\fdp\\ai-server && npm run dev',
    )
  }

  const data = await readJsonSafe(res)
  if (!res.ok) {
    throw new Error(String(data.error || `Chat request failed (${res.status})`))
  }
  return data as unknown as ChatResult
}

export async function getHealth(): Promise<{
  ok: boolean
  defaultProvider: string
  configured: Record<string, boolean>
}> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/health`)
  } catch {
    throw new Error('AI server is not running. Start ai-server (port 8787).')
  }
  if (!res.ok) throw new Error('AI server is not running. Start ai-server (port 8787).')
  return (await readJsonSafe(res)) as unknown as {
    ok: boolean
    defaultProvider: string
    configured: Record<string, boolean>
  }
}
