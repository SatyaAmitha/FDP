import { useMemo, useState } from 'react'
import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { ProviderPicker } from '../components/ProviderPicker'
import { FormattedMarkdown } from '../components/FormattedMarkdown'
import { chat, type ProviderId } from '../lib/ai'

type Role = 'owner' | 'editor' | 'viewer'

interface Doc {
  id: string
  title: string
  type: string
  excerpt: string
  tags: string[]
  library: string
}

const DOCS: Doc[] = [
  {
    id: 'd1',
    title: 'Academic Integrity Policy 2025',
    type: 'Policy',
    library: 'Documents / Policies',
    excerpt:
      'AI tools may assist drafting if disclosed. Fabricated citations are misconduct. Assessment-specific bans may apply. Faculty remain responsible for graded work.',
    tags: ['integrity', 'ai', 'assessment', 'disclosure', 'policy', 'faculty', 'exam'],
  },
  {
    id: 'd2',
    title: 'Faculty Handbook — Research Leave',
    type: 'Handbook',
    library: 'Documents / HR',
    excerpt:
      'Eligible faculty may apply for research leave after 3 years of continuous service. Submit form RL-02 with HOD endorsement. Leave is not available during active exam duty.',
    tags: ['research', 'leave', 'faculty', 'rl-02', 'handbook', 'hod'],
  },
  {
    id: 'd3',
    title: 'Library Access Guidelines',
    type: 'Operations',
    library: 'Documents / Library',
    excerpt:
      'Digital databases require institutional SSO. Alumni access is limited to on-campus terminals. Inter-library loan requests go through the librarian portal.',
    tags: ['library', 'sso', 'databases', 'alumni', 'access'],
  },
  {
    id: 'd4',
    title: 'Student Support Escalation SOP',
    type: 'SOP',
    library: 'Documents / Student Affairs',
    excerpt:
      'Tier-1 FAQ → Tier-2 counsellor → Tier-3 dean. Urgent welfare cases escalate within 2 hours. Log every case in the support desk.',
    tags: ['student', 'support', 'escalation', 'welfare', 'counsellor', 'dean'],
  },
  {
    id: 'd5',
    title: 'FDP Lab Acceptable Use',
    type: 'IT Policy',
    library: 'Documents / IT',
    excerpt:
      'Enterprise AI assistants must not send personal student data to public models. Prefer on-prem / private workspace RAG for sensitive docs. API keys stay with IT Admin.',
    tags: ['lab', 'privacy', 'rag', 'on-prem', 'ai', 'student', 'data'],
  },
  {
    id: 'd6',
    title: 'Examination Coordination Checklist',
    type: 'Admin',
    library: 'Documents / Exams',
    excerpt:
      'Blueprints due T-21 days. Moderation T-14. Seating charts T-3. Post-exam analytics within 10 days. AI may help draft blueprints only with HOD review.',
    tags: ['exam', 'admin', 'blueprint', 'moderation', 'assessment', 'seating'],
  },
]

const ROLE_PERMS: Record<Role, { label: string; perms: string[] }> = {
  owner: {
    label: 'Owner (IT / Dean office)',
    perms: [
      'Manage workspace & billing',
      'Invite members + set Team Roles',
      'Configure Models & System Instructions',
      'Create Automations & Connectors',
      'Full Documents / Library access',
    ],
  },
  editor: {
    label: 'Editor (Faculty)',
    perms: [
      'Upload & index Documents',
      'New Chat with citations (RAG)',
      'Run agents / research briefs',
      'Edit Automations (if granted)',
      'No billing / role admin',
    ],
  },
  viewer: {
    label: 'Viewer (Student / staff)',
    perms: [
      'Ask Q&A on shared Library docs',
      'Read cited answers only',
      'No upload / no Automations',
      'No HR / RL-02 leave docs',
      'Public / embed chat if enabled',
    ],
  },
}

const PRODUCT_FEATURES = [
  { id: 'assistant', title: 'Enterprise AI Assistant', ainl: 'Multi-agent chat with citations', screen: 'New Chat / Chats' },
  { id: 'docintel', title: 'Document Intelligence', ainl: 'Parse → chunk → embed → summarize', screen: 'Documents / Library' },
  { id: 'multillm', title: 'Multi-LLM Support', ainl: 'Azure, OpenAI, Claude, Bedrock, Vertex, Ollama…', screen: 'Workspace Settings → Models' },
  { id: 'search', title: 'Enterprise Search', ainl: 'Hybrid semantic + keyword retrieval', screen: 'Chat over Library' },
  { id: 'kb', title: 'Knowledge Base', ainl: 'Workspace Library + Drive / OneDrive sync', screen: 'Documents' },
  { id: 'rag', title: 'RAG', ainl: 'Grounded answers with sources from indexed docs', screen: 'New Chat + citations' },
  { id: 'agents', title: 'AI Agents', ainl: 'Agents with KB, MCP, and connector tools', screen: 'Chat agents · Playground' },
  { id: 'workflow', title: 'Workflow Automation', ainl: 'Scheduled / event runs → Slack, Notion, Jira', screen: 'Automations' },
  { id: 'rbac', title: 'Role-Based Access Control', ainl: 'Owner / Editor / Viewer (+ custom roles)', screen: 'Team · Team Roles' },
  { id: 'deploy', title: 'On-Premise & Cloud', ainl: 'SaaS cloud or Docker self-host for campus', screen: 'Cloud or Docker Compose' },
]

const USE_CASES = [
  { title: 'Faculty knowledge assistants', how: 'Upload syllabi & notes → New Chat with System Instructions' },
  { title: 'Research assistants', how: 'Chat agent + Connectors (Search, YouTube, web crawl) → cited briefs' },
  { title: 'Institutional document search', how: 'Index handbook/policies in Documents → ask in chat' },
  { title: 'Academic policy Q&A', how: 'Policy PDFs in Library → RAG answers with citations' },
  { title: 'Student support', how: 'Viewer workspace or Embed public chat for FAQ' },
  { title: 'Administrative automation', how: 'Automations: weekly digests, Slack alerts, exam reminders' },
]

const INDUSTRIES = [
  { name: 'Education', note: 'Faculty copilots, policy RAG, student FAQ' },
  { name: 'Healthcare', note: 'Protocol search with strict Viewer access' },
  { name: 'Manufacturing', note: 'SOP agents + maintenance Automations' },
  { name: 'Enterprise', note: 'Multi-LLM workspaces, Team RBAC, audit' },
]

const SAMPLE_QUESTIONS = [
  'Can faculty use AI when preparing assessments?',
  'What is form RL-02 for research leave?',
  'Do digital library databases need SSO?',
  'How fast must urgent student welfare cases escalate?',
  'Can we send student data to public AI models?',
  'When are exam blueprints due?',
]

const WORKFLOW = [
  'Create Education workspace in AINexLayer',
  'Upload institutional PDFs to Documents (Library)',
  'Index → embeddings (Document Intelligence)',
  'Connect Models (Azure / OpenAI / Claude…)',
  'Set Team Roles: Owner / Editor / Viewer',
  'New Chat → RAG answers with citations',
  'Optional: Automations for admin digests',
  'Deploy on campus AI Lab (Docker) or cloud',
]

function scoreDoc(doc: Doc, terms: string[]): number {
  const hay = `${doc.title} ${doc.excerpt} ${doc.tags.join(' ')} ${doc.type}`.toLowerCase()
  return terms.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0)
}

export default function Module6() {
  const [role, setRole] = useState<Role>('editor')
  const [provider, setProvider] = useState<ProviderId | ''>('')
  const [query, setQuery] = useState(SAMPLE_QUESTIONS[0])
  const [answer, setAnswer] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(DOCS[0].id)
  const [featureId, setFeatureId] = useState(PRODUCT_FEATURES[0].id)
  const [workflowStep, setWorkflowStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const doc = DOCS.find((d) => d.id === selectedDoc)!
  const feature = PRODUCT_FEATURES.find((f) => f.id === featureId)!

  const ragHits = useMemo(() => {
    const terms = query.toLowerCase().split(/\W+/).filter((t) => t.length > 3)
    return DOCS.map((d) => ({ doc: d, score: scoreDoc(d, terms) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [query])

  const handleAsk = async () => {
    setError('')
    if (role === 'viewer' && /leave|hr|rl-02/i.test(query)) {
      setAnswer('Access denied for Viewer role. Research leave / HR documents are Editor+ only (AINexLayer Team Roles).')
      return
    }

    const contextDocs = (ragHits.length ? ragHits : [{ doc: DOCS[0], score: 0 }]).slice(0, 3)
    const context = contextDocs.map((h) => `### ${h.doc.title}\nLibrary: ${h.doc.library}\n${h.doc.excerpt}`).join('\n\n')

    setIsLoading(true)
    setAnswer('')
    try {
      const result = await chat({
        provider: provider || undefined,
        system: [
          'You are the AINexLayer Enterprise AI Assistant for an education workspace.',
          'Answer ONLY from the institutional Documents / Library context.',
          'Cite document titles like AINexLayer chat citations.',
          'If unsure, say the Library does not contain enough evidence.',
          `Active Team Role: ${ROLE_PERMS[role].label}.`,
        ].join(' '),
        messages: [{ role: 'user', content: `Library context:\n${context}\n\nQuestion: ${query}` }],
      })
      setAnswer(`${result.text}\n\n— AINexLayer demo · ${result.provider} · ${result.model}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ask failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ModuleHero
        moduleNumber={6}
        title="Enterprise AI with AINexLayer"
        tagline="From public AI tools to a secure institutional workspace — Documents, RAG chat, Models, Automations, and Team Roles."
      />
      <ModuleBody>
        <div className="space-y-12">
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">
            <h2 className="font-display text-2xl text-teal-ink">From public AI tools → AINexLayer</h2>
            <p className="mt-2 text-sm text-ink/70">
              Public tools are fast but data can leave campus. AINexLayer keeps work in a private workspace: documents,
              cited chat, multi-LLM models, agents, and roles — in the cloud or self-hosted.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { t: 'Public tools', d: 'ChatGPT / Gemini / Claude — general use; data may leave campus.' },
                { t: 'AINexLayer workspace', d: 'Documents · New Chat · Models · Automations · Team Roles.' },
                { t: 'Cloud or self-host', d: 'SaaS for speed, or Docker on campus for sensitive academic data.' },
              ].map((c) => (
                <div key={c.t} className="rounded-lg bg-teal-soft/40 p-4">
                  <p className="font-semibold text-teal-ink">{c.t}</p>
                  <p className="mt-2 text-sm text-ink/70">{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Feature map</h2>
            <p className="mt-2 text-ink/70">Each capability maps to an AINexLayer screen you can show live.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRODUCT_FEATURES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFeatureId(f.id)}
                  className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${
                    featureId === f.id ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'
                  }`}
                  aria-pressed={featureId === f.id}
                >
                  {f.title}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-sand/50 p-5 ring-1 ring-teal-ink/10">
              <h3 className="text-lg font-semibold text-teal-ink">{feature.title}</h3>
              <p className="mt-2 text-sm text-ink/80"><span className="font-medium">What it does:</span> {feature.ainl}</p>
              <p className="mt-2 text-sm text-ink/80"><span className="font-medium">Where in AINexLayer:</span> {feature.screen}</p>
            </div>
          </section>

          <ProviderPicker value={provider} onChange={setProvider} />

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Team Roles (RBAC)</h2>
            <p className="mt-2 text-sm text-ink/70">AINexLayer roles: Owner · Editor · Viewer (matches product RBAC).</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(ROLE_PERMS) as Role[]).map((r) => (
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
            <p className="mt-3 text-sm font-medium text-teal-ink">{ROLE_PERMS[role].label}</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {ROLE_PERMS[role].perms.map((p) => (
                <li key={p} className="rounded-lg bg-sand/50 px-3 py-2 text-sm text-ink/80">
                  {p}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">Documents / Library (Knowledge Base)</h2>
            <p className="mt-2 text-ink/70">Sample institutional Library — click a doc for Document Intelligence excerpt.</p>
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
                    <span className={`mt-1 block text-xs ${selectedDoc === d.id ? 'text-white/70' : 'text-ink/50'}`}>
                      {d.library} · {d.type}
                    </span>
                  </button>
                ))}
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-mid">Document intelligence</p>
                <h3 className="mt-2 text-lg font-semibold text-teal-ink">{doc.title}</h3>
                <p className="mt-1 text-xs text-ink/50">{doc.library}</p>
                <p className="mt-3 text-sm text-ink/75">{doc.excerpt}</p>
                <p className="mt-4 text-xs text-ink/50">Indexed tags: {doc.tags.join(', ')}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">New Chat — RAG demo</h2>
            <p className="mt-2 text-sm text-ink/70">
              Ask about the library docs above. This lab retrieves matching excerpts, then answers with your selected model.
              AINexLayer itself uses full semantic RAG with citations.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="rounded-full bg-teal-soft/70 px-3 py-1 text-xs font-medium text-teal-ink hover:bg-teal-soft"
                >
                  {q.length > 42 ? `${q.slice(0, 42)}…` : q}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-teal-ink" htmlFor="rag-query">
              Ask the knowledge base
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="rag-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 rounded-md border border-teal-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-mid"
                aria-label="Institutional knowledge question"
              />
              <button
                type="button"
                onClick={handleAsk}
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
            <h2 className="font-display text-2xl text-teal-ink">Workflow automation (AINexLayer Automations)</h2>
            <button
              type="button"
              onClick={() => setWorkflowStep((s) => (s + 1) % WORKFLOW.length)}
              className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-teal-ink/20 hover:bg-teal-soft focus:outline-none focus:ring-2 focus:ring-teal-mid"
            >
              Advance workflow step
            </button>
            <ol className="mt-4 space-y-2">
              {WORKFLOW.map((step, i) => (
                <li
                  key={step}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    i === workflowStep
                      ? 'bg-teal-ink text-white'
                      : i < workflowStep
                        ? 'bg-teal-soft/60 text-teal-ink'
                        : 'bg-white text-ink/50 ring-1 ring-teal-ink/10'
                  }`}
                >
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl text-teal-ink">How AINexLayer supports academia</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {USE_CASES.map((u) => (
                <article key={u.title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-teal-ink/10">
                  <h3 className="font-semibold text-teal-ink">{u.title}</h3>
                  <p className="mt-2 text-sm text-ink/70">{u.how}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {INDUSTRIES.map((ind) => (
                <article key={ind.name} className="rounded-xl bg-sand/50 p-4 ring-1 ring-teal-ink/10">
                  <h3 className="font-semibold text-teal-ink">{ind.name}</h3>
                  <p className="mt-2 text-sm text-ink/70">{ind.note}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-teal-ink px-6 py-8 text-white">
            <h2 className="font-display text-2xl">Wrap-up</h2>
            <p className="mt-3 max-w-3xl text-white/85">
              AINexLayer (cloud or self-hosted) supports secure campus adoption: private library, cited RAG chat,
              multi-LLM models, automations, and team roles — beyond public consumer AI tools.
            </p>
          </section>
        </div>
      </ModuleBody>
    </>
  )
}
