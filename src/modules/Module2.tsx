import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useMemo, useState } from 'react'
import { ProviderPicker } from '../components/ProviderPicker'
import { FormattedMarkdown } from '../components/FormattedMarkdown'
import { chat, type ProviderId } from '../lib/ai'



type LabKey = 'lesson' | 'question' | 'assignment' | 'research' | 'coding' | 'report'



interface Lab {

  key: LabKey

  label: string

  role: string

  task: string

  format: string

  constraints: string

  weak: string

  strongHint: string

}



const LABS: Lab[] = [

  {

    key: 'lesson',

    label: 'Lesson Planning',

    role: 'You are an experienced university lecturer in Computer Science.',

    task: 'Design a 60-minute undergraduate lecture on sorting algorithms.',

    format: 'Return: learning outcomes, agenda with timings, activities, exit ticket.',

    constraints: 'Assume 40 students, mixed prior knowledge, no paid tools required.',

    weak: 'Make a lesson on sorting.',

    strongHint: 'Role + task + format + constraints + audience',

  },

  {

    key: 'question',

    label: 'Question Paper',

    role: 'You are a course instructor setting a fair mid-term exam.',

    task: 'Generate a question paper on Database Management Systems.',

    format: 'Sections: MCQ (5), short answer (3), long answer (2). Include marks and a brief key.',

    constraints: 'Bloom mix: remember/understand/apply/analyze. Total 50 marks. 90 minutes.',

    weak: 'Give me DBMS questions.',

    strongHint: 'Blueprint marks, Bloom levels, duration',

  },

  {

    key: 'assignment',

    label: 'Assignments',

    role: 'You are a faculty mentor designing authentic assessment.',

    task: 'Create a take-home assignment on climate data visualization.',

    format: 'Include brief, deliverables, rubric (criteria × levels), plagiarism note.',

    constraints: 'Undergraduate, 1 week, individual work, open datasets only.',

    weak: 'Create an assignment about climate.',

    strongHint: 'Rubric + constraints + authenticity',

  },

  {

    key: 'research',

    label: 'Research',

    role: 'You are a research methods coach for PhD scholars.',

    task: 'Help refine a research question on generative AI in higher education.',

    format: 'Output: refined RQ, hypotheses, methods sketch, risks, reading list (5).',

    constraints: 'Focus on empirical classroom studies; flag unverifiable claims.',

    weak: 'Help with my AI education research.',

    strongHint: 'Scope + method + verification',

  },

  {

    key: 'coding',

    label: 'Coding',

    role: 'You are a senior Python educator.',

    task: 'Write a starter notebook structure for teaching pandas filtering.',

    format: 'Markdown sections + 3 progressive exercises + sample solution outline.',

    constraints: 'Python 3.11, pandas only, beginner-friendly comments.',

    weak: 'Teach pandas with code.',

    strongHint: 'Stack + pedagogy progression',

  },

  {

    key: 'report',

    label: 'Report Writing',

    role: 'You are an academic writing coach.',

    task: 'Outline a department FDP impact report.',

    format: 'Executive summary bullets, sections, metrics table template, appendix list.',

    constraints: 'Max 8 pages equivalent; evidence-based; avoid marketing tone.',

    weak: 'Write an FDP report.',

    strongHint: 'Audience + evidence + structure',

  },

]



const TECHNIQUES = [

  { id: 'zero', name: 'Zero-shot', desc: 'Ask directly with no examples.' },

  { id: 'one', name: 'One-shot', desc: 'Provide one worked example.' },

  { id: 'few', name: 'Few-shot', desc: 'Provide 2–5 examples of the desired pattern.' },

  { id: 'cot', name: 'Chain of Thought', desc: 'Ask the model to reason step by step.' },

  { id: 'role', name: 'Role prompting', desc: 'Assign expertise and audience.' },

  { id: 'chain', name: 'Prompt chaining', desc: 'Break work into sequential prompts.' },

]



export default function App() {

  const [labKey, setLabKey] = useState<LabKey>('lesson')

  const [technique, setTechnique] = useState('role')

  const [provider, setProvider] = useState<ProviderId | ''>('')

  const [output, setOutput] = useState('')

  const [meta, setMeta] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState('')



  const lab = useMemo(() => LABS.find((l) => l.key === labKey)!, [labKey])



  const composed = useMemo(() => {

    const techLine =

      technique === 'cot'

        ? 'Think step by step before answering.'

        : technique === 'few'

          ? 'Here are two short examples of good structure (imitate the pattern, not the content).'

          : technique === 'one'

            ? 'Use this single example as a style guide.'

            : technique === 'chain'

              ? 'This is step 1 of a chain; wait for confirmation before step 2.'

              : 'Respond as the assigned role.'



    return [

      `ROLE\n${lab.role}`,

      `TASK\n${lab.task}`,

      `FORMAT\n${lab.format}`,

      `CONSTRAINTS\n${lab.constraints}`,

      `TECHNIQUE\n${techLine}`,

    ].join('\n\n')

  }, [lab, technique])



  const handleRunLive = async () => {

    setIsLoading(true)

    setError('')

    setOutput('')

    setMeta('')

    try {

      const result = await chat({

        provider: provider || undefined,

        system: 'You are helping faculty in an FDP workshop. Be practical, structured, and concise.',

        messages: [{ role: 'user', content: composed }],

      })

      setOutput(result.text)

      setMeta(`${result.provider} · ${result.model}`)

    } catch (err) {

      setError(err instanceof Error ? err.message : 'Request failed')

    } finally {

      setIsLoading(false)

    }

  }



  return (

    <>

    <ModuleHero moduleNumber={2} title="Mastering Prompt Engineering" tagline="Build strong academic prompts with frameworks, constraints, and shot techniques." />

    <ModuleBody>

      <div className="space-y-10">

        <ProviderPicker value={provider} onChange={setProvider} />



        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

          <h2 className="font-display text-2xl text-teal-ink">What makes a good prompt?</h2>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {['Clear role', 'Specific task', 'Desired format', 'Hard constraints'].map((item) => (

              <li key={item} className="rounded-lg bg-teal-soft/60 px-3 py-3 text-sm font-medium text-teal-ink">

                {item}

              </li>

            ))}

          </ul>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Prompt techniques</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {TECHNIQUES.map((t) => (

              <button

                key={t.id}

                type="button"

                onClick={() => setTechnique(t.id)}

                className={`rounded-xl p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  technique === t.id

                    ? 'bg-teal-ink text-white'

                    : 'bg-white text-ink ring-1 ring-teal-ink/10 hover:bg-teal-soft/40'

                }`}

                aria-pressed={technique === t.id}

              >

                <p className="font-semibold">{t.name}</p>

                <p className={`mt-1 text-sm ${technique === t.id ? 'text-white/80' : 'text-ink/65'}`}>{t.desc}</p>

              </button>

            ))}

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Academic prompt lab</h2>

          <p className="mt-2 text-ink/70">Hands-on scenarios from the FDP: lesson planning through report writing.</p>

          <div className="mt-4 flex flex-wrap gap-2">

            {LABS.map((l) => (

              <button

                key={l.key}

                type="button"

                onClick={() => {

                  setLabKey(l.key)

                  setOutput('')

                  setError('')

                  setMeta('')

                }}

                className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  labKey === l.key ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'

                }`}

                aria-pressed={labKey === l.key}

              >

                {l.label}

              </button>

            ))}

          </div>



          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="rounded-xl bg-sand/50 p-5 ring-1 ring-teal-ink/10">

              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-mid">Weak prompt</h3>

              <p className="mt-3 font-mono text-sm text-ink/80">{lab.weak}</p>

              <p className="mt-4 text-sm text-ink/60">Missing: {lab.strongHint}</p>

            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

              <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-mid">Strong composed prompt</h3>

              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink/80">{composed}</pre>

              <button

                type="button"

                onClick={handleRunLive}

                disabled={isLoading}

                className="mt-4 rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid disabled:opacity-60"

              >

                {isLoading ? 'Calling AI…' : 'Run with AI'}

              </button>

            </div>

          </div>



          {error && (

            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">

              {error}

            </p>

          )}



          {output && (
            <div className="mt-4 rounded-xl border border-teal-mid/30 bg-white p-5 shadow-sm" role="status">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-teal-ink/10 pb-3">
                <h3 className="font-semibold text-teal-ink">AI response</h3>
                {meta && <span className="text-xs text-ink/55">{meta}</span>}
              </div>
              <FormattedMarkdown text={output} />
            </div>
          )}

        </section>



        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

          <h2 className="font-display text-xl text-teal-ink">Prompt library starter</h2>

          <p className="mt-2 text-sm text-ink/70">

            Save winning prompts by category (assessment, research, admin). Version them, note model used, and add a verification checklist.

          </p>

        </section>

      </div>

    </ModuleBody>

    </>

  )

}

