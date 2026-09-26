import { useEffect, useState } from 'react'
import { getHealth, type ProviderId } from '../lib/ai'

const OPTIONS: { id: ProviderId; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'azure', label: 'Azure OpenAI' },
  { id: 'bedrock', label: 'AWS Bedrock' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'vertex', label: 'Vertex AI' },
]

interface ProviderPickerProps {
  value: ProviderId | ''
  onChange: (value: ProviderId | '') => void
}

export function ProviderPicker({ value, onChange }: ProviderPickerProps) {
  const [status, setStatus] = useState<string>('Checking AI server…')
  const [configured, setConfigured] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getHealth()
      .then((h) => {
        setConfigured(h.configured || {})
        setStatus(`AI server OK · default ${h.defaultProvider}`)
        if (!value) onChange((h.defaultProvider as ProviderId) || 'openai')
      })
      .catch(() => {
        setStatus('AI server offline — run: cd ai-server && npm run dev')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-ink/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-ink">AI provider</p>
          <p className="text-xs text-ink/55">{status}</p>
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ProviderId)}
          className="rounded-md border border-teal-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-mid"
          aria-label="Select AI provider"
        >
          {OPTIONS.map((o) => (
            <option key={o.id} value={o.id} disabled={configured[o.id] === false}>
              {o.label}
              {configured[o.id] === false ? ' (key missing)' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
