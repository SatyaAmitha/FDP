import { useEffect, useState } from 'react'
import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { ProviderPicker } from '../components/ProviderPicker'
import { FormattedMarkdown, cleanAgentText } from '../components/FormattedMarkdown'
import { chat, type ProviderId } from '../lib/ai'

interface AgentStep {
  phase: 'Thought' | 'Action' | 'Observation' | 'Reflection' | 'Answer'
  content: string
}

interface SyllabusTopic {
  title: string
  detail: string
}

/** Extra Module 4 concepts beyond the six diagram panels. */
const SYLLABUS_EXTRAS: SyllabusTopic[] = [
  {
    title: 'Planning & reasoning',
    detail:
      'Before acting, the agent breaks a faculty goal into steps (e.g. research → outline → activity → checklist) and revises the plan when tool results change.',
  },
  {
    title: 'Memory',
    detail:
      'Short-term scratchpad (current turn), long-term store (course policies, past lecture packs), and retrieval so the agent does not re-ask what it already knows.',
  },
  {
    title: 'Tool / function calling',
    detail:
      'The model emits structured calls (search, calendar, LMS, code runner). Tools return observations; the model continues. MCP is one modern way to expose those tools.',
  },
  {
    title: 'Supervisor / worker & orchestration',
    detail:
      'A supervisor agent routes work to specialist workers (writer, critic, researcher), waits for results, and merges them — the multi-agent panel on the diagram.',
  },
  {
    title: 'Human-in-the-loop',
    detail:
      'Pause for faculty approval before high-risk actions: publishing grades, emailing students, or citing unverified sources. Agents propose; humans decide.',
  },
  {
    title: 'Guardrails',
    detail:
      'Policy filters, PII redaction, citation checks, rate limits, and allowed-tool lists so campus agents stay safe and compliant.',
  },
  {
    title: 'State management',
    detail: 'Track goals, scratchpad, tool results, and conversation turns so long tasks can resume or roll back.',
  },
  {
    title: 'Agent evaluation',
    detail: 'Score faithfulness, tool success rate, latency, and faculty satisfaction — not only “did it answer?”',
  },
  {
    title: 'Production deployment',
    detail: 'Logging, secrets, on-prem vs cloud, rollback, and monitoring for institutional agent apps.',
  },
]

const ARCHITECTURE = [
  { title: 'Goal / planner', detail: 'Planning and reasoning before action.' },
  { title: 'Memory', detail: 'Short-term and long-term context.' },
  { title: 'Tools / MCP', detail: 'Function calling and external systems.' },
  { title: 'Evaluator + guardrails', detail: 'Quality checks and safety rails.' },
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
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [provider, setProvider] = useState<ProviderId | ''>('')
  const [agentAnswer, setAgentAnswer] = useState('')
  const [agentMeta, setAgentMeta] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
        tagline="Agent fundamentals, design patterns, and a live ReAct teaching demo."
      />
      <ModuleBody>
        <div className="space-y-12">
          <ProviderPicker value={provider} onChange={setProvider} />

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">
            <h2 className="font-display text-2xl text-teal-ink">Agent architecture</h2>
            <p className="mt-2 text-sm text-ink/70">
              An agent does more than answer — it plans, uses tools, keeps memory, and can ask for human approval.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ARCHITECTURE.map((item) => (
                <div key={item.title} className="rounded-lg bg-teal-soft/50 px-3 py-4 text-center">
                  <p className="text-sm font-medium text-teal-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-ink/60">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Design patterns</h2>
            <p className="mt-2 text-sm text-ink/70">
              Six common agentic design patterns used in modern AI systems.
            </p>

            <figure className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-teal-ink/10">
              <img
                src="/agentic-design-patterns.gif"
                alt="Agentic Design Patterns diagram: ReAct, Modern Tool Use (MCP), Agentic RAG, CodeAct, Self Reflection, Multi-Agent Workflow"
                className="h-auto w-full object-contain"
              />
              <figcaption className="border-t border-teal-ink/10 px-4 py-3 text-xs text-ink/55">
                Agentic design patterns overview
              </figcaption>
            </figure>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Key concepts</h2>
            <p className="mt-2 text-sm text-ink/70">
              Building blocks that make agents reliable in real teaching and research workflows.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SYLLABUS_EXTRAS.map((topic) => (
                <article key={topic.title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-ink/10">
                  <h3 className="font-semibold text-teal-ink">{topic.title}</h3>
                  <p className="mt-2 text-sm text-ink/70">{topic.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">ReAct demo</h2>
            <p className="mt-2 text-ink/70">
              Watch Thought → Action → Observation, then run a live agent for a lecture-pack task.
            </p>
            <button
              type="button"
              onClick={startRun}
              className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-teal-ink/20 hover:bg-teal-soft focus:outline-none focus:ring-2 focus:ring-teal-mid"
              aria-label="Replay walkthrough"
            >
              {running ? 'Running…' : 'Replay walkthrough'}
            </button>
            <button
              type="button"
              onClick={handleRunAgent}
              disabled={isLoading}
              className="ml-3 mt-4 rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid disabled:opacity-60"
              aria-label="Run agent"
            >
              {isLoading ? 'Running…' : 'Run agent'}
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
        </div>
      </ModuleBody>
    </>
  )
}
