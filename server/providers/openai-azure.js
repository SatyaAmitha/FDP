import OpenAI from 'openai'

export async function chatOpenAI({ messages, system }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing in .env')

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  })

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const input = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  const res = await client.chat.completions.create({
    model,
    messages: input,
    temperature: 0.4,
  })

  return {
    provider: 'openai',
    model,
    text: res.choices[0]?.message?.content?.trim() || '',
  }
}

/**
 * Supports classic Azure OpenAI (*.openai.azure.com) and
 * Azure AI Foundry / AI Services (*.services.ai.azure.com).
 */
export async function chatAzure({ messages, system }) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '')
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'

  if (!apiKey || !endpoint || !deployment) {
    throw new Error('AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT are required')
  }

  const input = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  const isFoundry = endpoint.includes('services.ai.azure.com')

  // Foundry / AI Services: OpenAI-compatible /openai/v1
  // Classic Azure OpenAI: /openai/deployments/{name}
  const baseURL = isFoundry
    ? `${endpoint}/openai/v1`
    : `${endpoint}/openai/deployments/${deployment}`

  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultQuery: isFoundry ? undefined : { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  try {
    const res = await client.chat.completions.create({
      model: deployment,
      messages: input,
      temperature: 0.4,
      ...(isFoundry ? {} : {}),
    })

    return {
      provider: 'azure',
      model: deployment,
      text: res.choices[0]?.message?.content?.trim() || '',
    }
  } catch (err) {
    // Fallback: classic deployment path on Foundry hosts (some tenants still use it)
    if (isFoundry) {
      const fallback = new OpenAI({
        apiKey,
        baseURL: `${endpoint}/openai/deployments/${deployment}`,
        defaultQuery: { 'api-version': apiVersion },
        defaultHeaders: { 'api-key': apiKey },
      })
      try {
        const res = await fallback.chat.completions.create({
          model: deployment,
          messages: input,
          temperature: 0.4,
        })
        return {
          provider: 'azure',
          model: deployment,
          text: res.choices[0]?.message?.content?.trim() || '',
        }
      } catch {
        // surface original error
      }
    }

    const message = err instanceof Error ? err.message : 'Azure chat failed'
    throw new Error(message)
  }
}
