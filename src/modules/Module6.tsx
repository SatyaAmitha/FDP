import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useMemo, useState } from 'react'
import { ProviderPicker } from '../components/ProviderPicker'
import { FormattedMarkdown } from '../components/FormattedMarkdown'
import { chat, type ProviderId } from '../lib/ai'



type Role = 'faculty' | 'admin' | 'student'



interface Doc {

  id: string

  title: string

  type: string

  excerpt: string

  tags: string[]

}



const DOCS: Doc[] = [

  {

    id: 'd1',

    title: 'Academic Integrity Policy 2025',

    type: 'Policy',

    excerpt: 'AI tools may assist drafting if disclosed. Fabricated citations are misconduct. Assessment-specific bans may apply.',

    tags: ['integrity', 'ai', 'assessment', 'disclosure'],

  },

  {

    id: 'd2',

    title: 'Faculty Handbook — Research Leave',

    type: 'Handbook',

    excerpt: 'Eligible faculty may apply for research leave after 3 years of continuous service. Submit form RL-02 with HOD endorsement.',

    tags: ['research', 'leave', 'faculty', 'rl-02'],

  },

  {

    id: 'd3',

    title: 'Library Access Guidelines',

    type: 'Operations',

    excerpt: 'Digital databases require institutional SSO. Alumni access is limited to on-campus terminals.',

    tags: ['library', 'sso', 'databases'],

  },

  {

    id: 'd4',

    title: 'Student Support Escalation SOP',

    type: 'SOP',

    excerpt: 'Tier-1 FAQ → Tier-2 counsellor → Tier-3 dean. Urgent welfare cases escalate within 2 hours.',

    tags: ['student', 'support', 'escalation', 'welfare'],

  },

  {

    id: 'd5',

    title: 'FDP Lab Acceptable Use',

    type: 'IT Policy',

    excerpt: 'Enterprise AI assistants must not send personal student data to public models. Prefer on-prem RAG for sensitive docs.',

    tags: ['lab', 'privacy', 'rag', 'on-prem'],

  },

  {

    id: 'd6',

    title: 'Examination Coordination Checklist',

    type: 'Admin',

    excerpt: 'Blueprints due T-21 days. Moderation T-14. Seating charts T-3. Post-exam analytics within 10 days.',

    tags: ['exam', 'admin', 'blueprint', 'moderation'],

  },

]



const ROLE_PERMS: Record<Role, string[]> = {

  faculty: ['Ask policy Q&A', 'Search research leave docs', 'Draft lecture assistants', 'View anonymized class insights'],

  admin: ['Manage knowledge base', 'Configure RBAC', 'Run workflow automation', 'View audit logs'],

  student: ['Ask student support FAQ', 'View public handbook excerpts', 'No access to faculty HR docs'],

}



const USE_CASES = [

  'Faculty knowledge assistants',

  'Research assistants',

  'Institutional document search',

  'Academic policy Q&A',

  'Student support',

  'Administrative automation',

]



const INDUSTRIES = [

  { name: 'Education', note: 'Policy Q&A, faculty copilots, secure course RAG' },

  { name: 'Healthcare', note: 'Protocol search with strict access controls' },

  { name: 'Manufacturing', note: 'SOP agents + maintenance workflows' },

  { name: 'Enterprise', note: 'Multi-LLM assistants with SSO and audit' },

]



export default function App() {

  const [role, setRole] = useState<Role>('faculty')

  const [provider, setProvider] = useState<ProviderId | ''>('')

  const [query, setQuery] = useState('Can faculty use AI when preparing assessments?')

  const [answer, setAnswer] = useState('')

  const [selectedDoc, setSelectedDoc] = useState(DOCS[0].id)

  const [workflowStep, setWorkflowStep] = useState(0)

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState('')



  const doc = DOCS.find((d) => d.id === selectedDoc)!



  const ragHits = useMemo(() => {

    const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 3)

    return DOCS

      .map((d) => ({

        doc: d,

        score: terms.reduce(

          (acc, t) => acc + (d.excerpt.toLowerCase().includes(t) || d.tags.includes(t) || d.title.toLowerCase().includes(t) ? 1 : 0),

          0,

        ),

      }))

      .filter((x) => x.score > 0)

      .sort((a, b) => b.score - a.score)

  }, [query])



  const runRag = async () => {

    setError('')

    if (role === 'student' && /leave|hr|rl-02/i.test(query)) {

      setAnswer('Access denied for this role. Student accounts cannot query faculty HR documents.')

      return

    }



    const contextDocs = (ragHits.length ? ragHits : [{ doc: DOCS[0], score: 0 }]).slice(0, 3)

    const context = contextDocs

      .map((h) => `### ${h.doc.title}\n${h.doc.excerpt}`)

      .join('\n\n')



    setIsLoading(true)

    setAnswer('')

    try {

      const result = await chat({

        provider: provider || undefined,

        system: `You are an enterprise institutional AI assistant (AINexLayer-style). Answer ONLY using the provided institutional context. Cite document titles. If unsure, say so. Current role: ${role}.`,

        messages: [

          {

            role: 'user',

            content: `Institutional context:\n${context}\n\nQuestion: ${query}`,

          },

        ],

      })

      setAnswer(`${result.text}\n\n— ${result.provider} · ${result.model}`)

    } catch (err) {

      setError(err instanceof Error ? err.message : 'RAG request failed')

    } finally {

      setIsLoading(false)

    }

  }



  const workflow = [

    'Ingest institutional PDFs into knowledge base',

    'Chunk + embed + index for enterprise search',

    'RBAC maps roles to document collections',

    'Assistant answers with citations (RAG)',

    'Human approval for outbound student messages',

    'Audit log + evaluation dashboard',

  ]



  return (

    <>

    <ModuleHero moduleNumber={6} title="Enterprise AI with AINexLayer" tagline="From public AI tools to secure institutional assistants with RAG, agents, and RBAC." />

    <ModuleBody>

      <div className="space-y-12">

        <ProviderPicker value={provider} onChange={setProvider} />



        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

          <h2 className="font-display text-2xl text-teal-ink">Public tools → Enterprise AI</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">

            {[

              { t: 'Public ChatGPT-class tools', d: 'Fast, general, data may leave campus controls.' },

              { t: 'Enterprise platform', d: 'SSO, RBAC, private knowledge, audit, multi-LLM.' },

              { t: 'AI Lab + AINexLayer', d: 'Institution-wide secure adoption on campus infrastructure.' },

            ].map((c) => (

              <div key={c.t} className="rounded-lg bg-teal-soft/40 p-4">

                <p className="font-semibold text-teal-ink">{c.t}</p>

                <p className="mt-2 text-sm text-ink/70">{c.d}</p>

              </div>

            ))}

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Role-based access</h2>

          <div className="mt-3 flex flex-wrap gap-2">

            {(['faculty', 'admin', 'student'] as Role[]).map((r) => (

              <button

                key={r}

                type="button"

                onClick={() => setRole(r)}

                className={`rounded-md px-3 py-2 text-sm font-medium capitalize focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  role === r ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'

                }`}

                aria-pressed={role === r}

              >

                {r}

              </button>

            ))}

          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">

            {ROLE_PERMS[role].map((p) => (

              <li key={p} className="rounded-lg bg-sand/50 px-3 py-2 text-sm text-ink/80">

                {p}

              </li>

            ))}

          </ul>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Knowledge base & document intelligence</h2>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">

            <div className="space-y-2">

              {DOCS.map((d) => (

                <button

                  key={d.id}

                  type="button"

                  onClick={() => setSelectedDoc(d.id)}

                  className={`block w-full rounded-lg px-3 py-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                    selectedDoc === d.id ? 'bg-teal-ink text-white' : 'bg-white text-ink ring-1 ring-teal-ink/10'

                  }`}

                >

                  <span className="font-medium">{d.title}</span>

                  <span className={`mt-1 block text-xs ${selectedDoc === d.id ? 'text-white/70' : 'text-ink/50'}`}>{d.type}</span>

                </button>

              ))}

            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

              <p className="text-xs font-semibold uppercase tracking-wider text-teal-mid">Extracted insights</p>

              <h3 className="mt-2 text-lg font-semibold text-teal-ink">{doc.title}</h3>

              <p className="mt-3 text-sm text-ink/75">{doc.excerpt}</p>

              <p className="mt-4 text-xs text-ink/50">Tags: {doc.tags.join(', ')}</p>

            </div>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Enterprise assistant (RAG + multi-LLM)</h2>

          <label className="mt-4 block text-sm font-medium text-teal-ink" htmlFor="rag-query">

            Ask the knowledge base

          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">

            <input

              id="rag-query"

              value={query}

              onChange={(e) => setQuery(e.target.value)}

              className="flex-1 rounded-md border border-teal-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-mid"

              aria-label="Enterprise search query"

            />

            <button

              type="button"

              onClick={runRag}

              disabled={isLoading}

              className="rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid disabled:opacity-60"

            >

            {isLoading ? 'Running…' : 'Ask AI'}

            </button>

          </div>

          {ragHits.length > 0 && (

            <p className="mt-3 text-xs text-ink/55">

              Retrieved: {ragHits.map((h) => `${h.doc.title} (${h.score})`).join(' · ')}

            </p>

          )}

          {error && (

            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">

              {error}

            </p>

          )}

          {answer && (
            <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10" role="status">
              <FormattedMarkdown text={answer} />
            </div>
          )}

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Workflow automation</h2>

          <button

            type="button"

            onClick={() => setWorkflowStep((s) => (s + 1) % workflow.length)}

            className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-teal-ink/20 hover:bg-teal-soft focus:outline-none focus:ring-2 focus:ring-teal-mid"

          >

            Advance workflow step

          </button>

          <ol className="mt-4 space-y-2">

            {workflow.map((step, i) => (

              <li

                key={step}

                className={`rounded-lg px-3 py-2 text-sm ${

                  i === workflowStep ? 'bg-teal-ink text-white' : i < workflowStep ? 'bg-teal-soft/60 text-teal-ink' : 'bg-white text-ink/50 ring-1 ring-teal-ink/10'

                }`}

              >

                {i + 1}. {step}

              </li>

            ))}

          </ol>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Institutional use cases</h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {USE_CASES.map((u) => (

              <span key={u} className="rounded-full bg-sand px-3 py-1 text-sm text-teal-ink">

                {u}

              </span>

            ))}

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {INDUSTRIES.map((ind) => (

              <article key={ind.name} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-ink/10">

                <h3 className="font-semibold text-teal-ink">{ind.name}</h3>

                <p className="mt-2 text-sm text-ink/70">{ind.note}</p>

              </article>

            ))}

          </div>

        </section>



        <section className="rounded-xl bg-teal-ink px-6 py-8 text-white">

          <h2 className="font-display text-2xl">On-prem & cloud</h2>

          <p className="mt-3 max-w-3xl text-white/85">

            Deploy AINexLayer-style enterprise AI on campus AI Lab infrastructure for sensitive academic data,

            or hybrid cloud for elastic workloads — keeping SSO, RBAC, and audit intact either way.

          </p>

        </section>

      </div>

    </ModuleBody>

    </>

  )

}

