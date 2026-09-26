import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useEffect, useState } from 'react'

import { ProviderPicker } from '../components/ProviderPicker'

import { FormattedMarkdown, cleanAgentText } from '../components/FormattedMarkdown'

import { chat, type ProviderId } from '../lib/ai'



interface Pattern {

  id: string

  name: string

  summary: string

  architecture: string[]

}



interface AgentStep {

  phase: 'Thought' | 'Action' | 'Observation' | 'Reflection' | 'Answer'

  content: string

}



const PATTERNS: Pattern[] = [

  {

    id: 'react',

    name: 'ReAct',

    summary: 'Interleave reasoning with tool actions and observations.',

    architecture: ['LLM reasoner', 'Tool router', 'Observation memory', 'Final answer'],

  },

  {

    id: 'rag',

    name: 'RAG agent',

    summary: 'Retrieve institutional docs, then generate grounded answers.',

    architecture: ['Query rewrite', 'Retriever', 'Reranker', 'Grounded generator'],

  },

  {

    id: 'supervisor',

    name: 'Supervisor / worker',

    summary: 'A supervisor plans; specialist workers execute subtasks.',

    architecture: ['Supervisor', 'Research worker', 'Writing worker', 'Aggregator'],

  },

  {

    id: 'hitl',

    name: 'Human-in-the-loop',

    summary: 'Pause for faculty approval before irreversible actions.',

    architecture: ['Agent draft', 'Approval gate', 'Execute / revise', 'Audit log'],

  },

  {

    id: 'mcp',

    name: 'MCP tools',

    summary: 'Model Context Protocol exposes tools/resources to agents safely.',

    architecture: ['Host app', 'MCP server', 'Tools / resources', 'Agent client'],

  },

  {

    id: 'guard',

    name: 'Guardrails',

    summary: 'Policy filters on inputs/outputs before students see results.',

    architecture: ['Input filter', 'Agent', 'Output validator', 'Fallback response'],

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



export default function App() {

  const [patternId, setPatternId] = useState('react')

  const [step, setStep] = useState(0)

  const [running, setRunning] = useState(false)

  const [provider, setProvider] = useState<ProviderId | ''>('')

  const [liveAnswer, setLiveAnswer] = useState('')

  const [liveMeta, setLiveMeta] = useState('')

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

    setLiveAnswer('')

    setLiveMeta('')

    setError('')

  }



  const handleLiveAgent = async () => {

    setIsLoading(true)

    setError('')

    setLiveAnswer('')

    setLiveMeta('')

    try {

      const result = await chat({

        provider: provider || undefined,

        system: [

          'You are a faculty teaching assistant.',

          'Return ONLY the final lecture pack for undergraduates.',

          'Do NOT include Thought, Action, Observation, Reflection, or any agent monologue.',

          'Do NOT use markdown pipe tables (|). Use numbered lists for timings instead.',

          'Structure with clear headings:',

          '1) Title',

          '2) Timed outline (numbered list with minutes)',

          '3) One classroom activity',

          '4) Citation / verification checklist',

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

      setLiveAnswer(cleanAgentText(result.text))

      setLiveMeta(`${result.provider} · ${result.model}`)

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Agent request failed')

    } finally {

      setIsLoading(false)

    }

  }



  return (

    <>

    <ModuleHero moduleNumber={4} title="Agentic AI + Design Patterns" tagline="See how agents plan, call tools, reflect, and collaborate — with academic examples." />

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

            <h3 className="text-xl font-semibold text-teal-ink">{pattern.name}</h3>

            <p className="mt-2 text-ink/75">{pattern.summary}</p>

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

            aria-label="Run simulated ReAct agent"

          >

            {running ? 'Running pattern…' : 'Replay ReAct pattern'}

          </button>

          <button

            type="button"

            onClick={handleLiveAgent}

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

          {liveAnswer && (

            <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10" role="status">

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-teal-ink/10 pb-3">

                <h3 className="font-semibold text-teal-ink">Agent result</h3>

                {liveMeta && <span className="text-xs text-ink/50">{liveMeta}</span>}

              </div>

              <FormattedMarkdown text={liveAnswer} />

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

