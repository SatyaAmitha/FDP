import { useEffect, useState } from 'react'
import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { ProviderPicker } from '../components/ProviderPicker'
import { FormattedMarkdown, cleanAgentText } from '../components/FormattedMarkdown'
import { chat, type ProviderId } from '../lib/ai'

interface Pattern {
  id: string
  name: string
  gifLabel: string
  summary: string
  architecture: string[]
  pdfNote: string
}

interface AgentStep {
  phase: 'Thought' | 'Action' | 'Observation' | 'Reflection' | 'Answer'
  content: string
}

/** Six patterns matching the Habib Shaikh Agentic Design Patterns diagram. */
const PATTERNS: Pattern[] = [
  {
    id: 'react',
    name: 'ReAct Agent',
    gifLabel: 'REACT AGENT',
    summary: 'Reason → Act (tools) → Observe → loop until a final answer.',
    architecture: ['Query', 'Reason (LLM)', 'Tools', 'Observe', 'Output'],
    pdfNote: 'In FDP PDF as “ReAct pattern”.',
  },
  {
    id: 'mcp',
    name: 'Modern Tool Use (MCP)',
    gifLabel: 'MODERN TOOL USE',
    summary: 'Agent reaches external systems through MCP servers and APIs (search, cloud, apps).',
    architecture: ['Query', 'Agent', 'MCP servers', 'APIs / tools', 'Output'],
    pdfNote: 'In FDP PDF as “MCP” + tool/function calling.',
  },
  {
    id: 'rag',
    name: 'Agentic RAG',
    gifLabel: 'AGENTIC RAG',
    summary: 'Agent decides when to vector-search a knowledge base, then a generator answers with grounding.',
    architecture: ['Query', 'Agent + tools', 'Vector DB', 'Generator', 'Output'],
    pdfNote: 'In FDP PDF as “RAG agents”.',
  },
  {
    id: 'codeact',
    name: 'CodeAct Agent',
    gifLabel: 'CODEACT AGENT',
    summary: 'Think → execute code in an environment → observe outcome → refine until done.',
    architecture: ['User', 'Think', 'CodeAct', 'Environment', 'Observation', 'Result'],
    pdfNote: 'Not named in the FDP PDF; common industry pattern (shown in the diagram).',
  },
  {
    id: 'reflect',
    name: 'Self Reflection',
    gifLabel: 'SELF REFLECTION',
    summary: 'Draft → critique → revise until quality is good enough, then generate the final result.',
    architecture: ['Main LLM', 'First draft', 'Critique', 'Revise / Generator', 'Result'],
    pdfNote: 'In FDP PDF as “Reflection / self-correction”.',
  },
  {
    id: 'multi',
    name: 'Multi-Agent Workflow',
    gifLabel: 'MULTI-AGENT WORKFLOW',
    summary: 'Orchestrator delegates to specialist sub-agents; an aggregator LLM composes the final output.',
    architecture: ['Query', 'Supervisor agent', 'S-Agents', 'Aggregator LLM', 'Output'],
    pdfNote: 'In FDP PDF as multi-agent / supervisor-worker / orchestration.',
  },
]

const REACT_TRACE: AgentStep[] = [
  { phase: 'Thought', content: 'User asked for a lecture pack on transformers. I should gather sources then outline.' },
  { phase: 'Action', content: 'tool.search_papers("transformer attention education survey 2023")' },
  { phase: 'Observation', content: 'Found 3 candidate papers + 1 textbook chapter (simulated).' },
  { phase: 'Thought', content: 'I need a 45-minute structure with activities for undergraduates.' },
  { phase: 'Action', content: 'tool.outline_lesson(duration=45, level="UG", topic="attention")' },
  { phase: 'Observation', content: 'Outline ready: hook → intuition → demo → exercise → exit ticket.' },
  { phase: 'Reflection', content: 'Check: citations are placeholders — mark for faculty verification.' },
  { phase: 'Answer', content: 'Deliver outline + reading list + verification checklist to the instructor.' },
]

export default function Module4() {
  const [patternId, setPatternId] = useState('react')
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [provider, setProvider] = useState<ProviderId | ''>('')
  const [agentAnswer, setAgentAnswer] = useState('')
  const [agentMeta, setAgentMeta] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const pattern = PATTERNS.find((p) => p.id === patternId)!

  useEffect(() => {
    if (!running) return
    if (step >= REACT_TRACE.length - 1) {
      setRunning(false)
      return
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 900)
    return () => window.clearTimeout(t)
  }, [running, step])

  const startRun = () => {
    setStep(0)
    setRunning(true)
    setAgentAnswer('')
    setAgentMeta('')
    setError('')
  }

  const handleRunAgent = async () => {
    setIsLoading(true)
    setError('')
    setAgentAnswer('')
    setAgentMeta('')
    try {
      const result = await chat({
        provider: provider || undefined,
        system: [
          'You are a faculty teaching assistant.',
          'Return ONLY the final lecture pack for undergraduates.',
          'Do NOT include Thought, Action, Observation, Reflection, or any agent monologue.',
          'Do NOT use markdown pipe tables (|). Use numbered lists for timings instead.',
          'Structure with clear headings: Title, Timed outline, One classroom activity, Citation checklist.',
          'Keep it concise and classroom-ready.',
        ].join(' '),
        messages: [
          {
            role: 'user',
            content:
              'Create a 45-minute undergraduate lecture pack on transformers and attention. Faculty-facing only — no ReAct scratchpad.',
          },
        ],
      })
      setAgentAnswer(cleanAgentText(result.text))
      setAgentMeta(`${result.provider} · ${result.model}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent request failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ModuleHero
        moduleNumber={4}
        title="Agentic AI + Design Patterns"
        tagline="Explore industry agent patterns with a clear diagram, then try ReAct and a live teaching agent."
      />
      <ModuleBody>
        <div className="space-y-12">
          <ProviderPicker value={provider} onChange={setProvider} />

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">
            <h2 className="font-display text-2xl text-teal-ink">Agent architecture (fundamentals)</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['Goal / planner', 'Memory', 'Tool / function calling', 'Evaluator + guardrails'].map((item) => (
                <div key={item} className="rounded-lg bg-teal-soft/50 px-3 py-4 text-center text-sm font-medium text-teal-ink">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/70">
              Agentic AI does not only answer — it decides next steps, uses tools, manages state, and can request human approval.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Design patterns gallery</h2>
            <p className="mt-2 text-sm text-ink/70">
              Visual overview of six agentic design patterns. Click a pattern below the image for a short FDP-aligned explanation.
            </p>

            <figure className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-teal-ink/10">
              <img
                src="/agentic-design-patterns.gif"
                alt="Agentic Design Patterns diagram: ReAct, Modern Tool Use (MCP), Agentic RAG, CodeAct, Self Reflection, Multi-Agent Workflow"
                className="h-auto w-full object-contain"
              />
              <figcaption className="border-t border-teal-ink/10 px-4 py-3 text-xs text-ink/55">
                Diagram credit: Habib Shaikh / AIKaDoctor — Agentic Design Patterns (for FDP teaching use with attribution).
              </figcaption>
            </figure>

            <div className="mt-4 flex flex-wrap gap-2">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPatternId(p.id)}
                  className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${
                    patternId === p.id ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'
                  }`}
                  aria-pressed={patternId === p.id}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-sand/50 p-5 ring-1 ring-teal-ink/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-mid">On the diagram: {pattern.gifLabel}</p>
              <h3 className="mt-1 text-xl font-semibold text-teal-ink">{pattern.name}</h3>
              <p className="mt-2 text-ink/75">{pattern.summary}</p>
              <p className="mt-2 text-sm text-ink/60">{pattern.pdfNote}</p>
              <ol className="mt-4 flex flex-wrap gap-2">
                {pattern.architecture.map((node, i) => (
                  <li key={node} className="flex items-center gap-2 text-sm">
                    <span className="rounded-md bg-white px-3 py-2 font-medium text-teal-ink ring-1 ring-teal-ink/10">
                      {node}
                    </span>
                    {i < pattern.architecture.length - 1 && <span className="text-ink/40">→</span>}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Simulated ReAct agent</h2>
            <p className="mt-2 text-ink/70">
              Task: “Build a lecture pack on transformers for undergraduates.” Watch Thought → Action → Observation.
            </p>
            <button
              type="button"
              onClick={startRun}
              className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-teal-ink/20 hover:bg-teal-soft focus:outline-none focus:ring-2 focus:ring-teal-mid"
              aria-label="Replay ReAct pattern"
            >
              {running ? 'Running pattern…' : 'Replay ReAct pattern'}
            </button>
            <button
              type="button"
              onClick={handleRunAgent}
              disabled={isLoading}
              className="ml-3 mt-4 rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid disabled:opacity-60"
              aria-label="Run agent"
            >
              {isLoading ? 'Running agent…' : 'Run agent'}
            </button>
            <ol className="mt-6 space-y-3">
              {REACT_TRACE.slice(0, step + 1).map((s, i) => (
                <li
                  key={`${s.phase}-${i}`}
                  className={`rounded-xl p-4 ring-1 ring-teal-ink/10 ${
                    i === step ? 'bg-teal-ink text-white' : 'bg-white text-ink'
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider ${i === step ? 'text-sand' : 'text-teal-mid'}`}>
                    {s.phase}
                  </p>
                  <p className={`mt-1 text-sm ${i === step ? 'text-white/90' : 'text-ink/75'}`}>{s.content}</p>
                </li>
              ))}
            </ol>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            )}
            {agentAnswer && (
              <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10" role="status">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-teal-ink/10 pb-3">
                  <h3 className="font-semibold text-teal-ink">Agent result</h3>
                  {agentMeta && <span className="text-xs text-ink/50">{agentMeta}</span>}
                </div>
                <FormattedMarkdown text={agentAnswer} />
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { t: 'State management', d: 'Track goals, scratchpad, tool results, and conversation turns.' },
              { t: 'Evaluation', d: 'Score faithfulness, tool success rate, and faculty satisfaction.' },
              { t: 'Production', d: 'Logging, rate limits, secrets, on-prem options, and rollback plans.' },
            ].map((c) => (
              <article key={c.t} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-ink/10">
                <h3 className="font-semibold text-teal-ink">{c.t}</h3>
                <p className="mt-2 text-sm text-ink/70">{c.d}</p>
              </article>
            ))}
          </section>
        </div>
      </ModuleBody>
    </>
  )
}
