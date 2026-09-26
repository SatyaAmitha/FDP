import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'

export async function chatBedrock({ messages, system }) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const modelId = process.env.BEDROCK_MODEL_ID

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required for Bedrock')
  }
  if (!modelId) throw new Error('BEDROCK_MODEL_ID is missing in .env')

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })

  const converseMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: [{ text: m.content }],
  }))

  const command = new ConverseCommand({
    modelId,
    messages: converseMessages,
    system: system ? [{ text: system }] : undefined,
    inferenceConfig: { temperature: 0.4, maxTokens: 2048 },
  })

  const res = await client.send(command)
  const text =
    res.output?.message?.content?.map((c) => c.text || '').join('').trim() || ''

  return {
    provider: 'bedrock',
    model: modelId,
    text,
  }
}
