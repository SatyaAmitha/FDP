import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useMemo, useState } from 'react'



interface Scenario {

  id: string

  title: string

  prompt: string

  isIntegrityRisk: boolean

  explanation: string

}



const HALLUCINATION = {

  claim: 'According to Sharma et al. (2019) in the Journal of Applied Pedagogy, flipped classrooms raise exam scores by 47% in Indian engineering colleges.',

  issues: [

    'Specific citation may be fabricated',

    'Precise percentage without source verification',

    'Journal name sounds plausible but must be checked',

  ],

}



const BIAS_EXAMPLES = [

  { title: 'Gendered defaults', text: '“Describe a successful engineer” → model defaults to male pronouns and Western names.' },

  { title: 'Language prestige', text: '“Improve this student writing” → over-corrects Indian English idioms as “errors”.' },

  { title: 'Ability assumptions', text: 'Career advice prompts steer differently by implied caste/region stereotypes.' },

]



const AUTH_CHECKLIST = [

  'I verified citations in a real database (Google Scholar / library)',

  'I rewrote key paragraphs in my own voice',

  'I added local examples from my course / campus',

  'I disclosed AI assistance where policy requires',

  'Numbers, dates, and legal claims were fact-checked',

]



const SCENARIOS: Scenario[] = [

  {

    id: 's1',

    title: 'Student submits AI essay',

    prompt: 'A student pastes a ChatGPT essay with fake references as their term paper.',

    isIntegrityRisk: true,

    explanation: 'Submitting AI text as original work without disclosure violates academic integrity.',

  },

  {

    id: 's2',

    title: 'Faculty drafts rubric',

    prompt: 'A teacher uses AI to draft a rubric, then edits criteria to match learning outcomes.',

    isIntegrityRisk: false,

    explanation: 'AI as a drafting assistant with human ownership is typically acceptable under transparent policies.',

  },

  {

    id: 's3',

    title: 'Fabricated literature review',

    prompt: 'A scholar includes AI-invented papers because they “looked real”.',

    isIntegrityRisk: true,

    explanation: 'Fabricated citations are research misconduct regardless of intent.',

  },

  {

    id: 's4',

    title: 'Brainstorm exam ideas',

    prompt: 'Instructor brainstorms question ideas with AI, then writes final items independently.',

    isIntegrityRisk: false,

    explanation: 'Ideation support with human authorship of assessed materials is generally fine.',

  },

]



export default function App() {

  const [checked, setChecked] = useState<boolean[]>(() => AUTH_CHECKLIST.map(() => false))

  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)

  const [verdict, setVerdict] = useState<'risk' | 'ok' | null>(null)

  const [feedback, setFeedback] = useState('')



  const score = useMemo(() => checked.filter(Boolean).length, [checked])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!



  const handleVerdict = (choice: 'risk' | 'ok') => {

    setVerdict(choice)

    const correct =

      (choice === 'risk' && scenario.isIntegrityRisk) || (choice === 'ok' && !scenario.isIntegrityRisk)

    setFeedback(correct ? `Correct. ${scenario.explanation}` : `Not quite. ${scenario.explanation}`)

  }



  const toggleCheck = (index: number) => {

    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)))

  }



  return (

    <>

    <ModuleHero moduleNumber={3} title="Responsible AI & AI Limitations" tagline="Practice spotting hallucinations, bias, and integrity risks in academic AI use." />

    <ModuleBody>

      <div className="space-y-12">

        <section>

          <h2 className="font-display text-2xl text-teal-ink">AI hallucinations</h2>

          <p className="mt-2 text-ink/70">Models can invent confident-sounding facts and citations.</p>

          <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

            <p className="text-sm font-semibold uppercase tracking-wide text-teal-mid">Suspicious claim</p>

            <blockquote className="mt-3 border-l-4 border-sand-deep pl-4 text-ink/80">{HALLUCINATION.claim}</blockquote>

            <ul className="mt-4 space-y-2 text-sm text-ink/75">

              {HALLUCINATION.issues.map((issue) => (

                <li key={issue} className="flex gap-2">

                  <span className="text-teal-mid">!</span>

                  <span>{issue}</span>

                </li>

              ))}

            </ul>

            <p className="mt-4 rounded-lg bg-teal-soft/50 px-3 py-2 text-sm text-teal-ink">

              Verification step: search the author + year + journal. If nothing matches, treat as hallucination.

            </p>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Bias in AI</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            {BIAS_EXAMPLES.map((b) => (

              <article key={b.title} className="rounded-xl bg-sand/50 p-4 ring-1 ring-teal-ink/10">

                <h3 className="font-semibold text-teal-ink">{b.title}</h3>

                <p className="mt-2 text-sm text-ink/75">{b.text}</p>

              </article>

            ))}

          </div>

          <p className="mt-4 text-sm text-ink/65">

            Reflection: Which bias might appear in your subject area? How would you prompt to counter it?

          </p>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Making AI output authentic</h2>

          <p className="mt-2 text-ink/70">Score your process before submitting AI-assisted work.</p>

          <ul className="mt-4 space-y-2">

            {AUTH_CHECKLIST.map((item, i) => (

              <li key={item}>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-teal-ink/10">

                  <input

                    type="checkbox"

                    checked={checked[i]}

                    onChange={() => toggleCheck(i)}

                    className="mt-1"

                    aria-label={item}

                  />

                  <span className="text-sm text-ink/80">{item}</span>

                </label>

              </li>

            ))}

          </ul>

          <p className="mt-4 text-sm font-medium text-teal-ink">

            Authenticity score: {score}/{AUTH_CHECKLIST.length}{' '}

            {score === AUTH_CHECKLIST.length

              ? '— strong process'

              : score >= 3

                ? '— improve remaining checks'

                : '— high risk of shallow or unverified output'}

          </p>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Academic integrity scenarios</h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {SCENARIOS.map((s) => (

              <button

                key={s.id}

                type="button"

                onClick={() => {

                  setScenarioId(s.id)

                  setVerdict(null)

                  setFeedback('')

                }}

                className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  scenarioId === s.id ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'

                }`}

                aria-pressed={scenarioId === s.id}

              >

                {s.title}

              </button>

            ))}

          </div>

          <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

            <p className="text-ink/80">{scenario.prompt}</p>

            <div className="mt-4 flex flex-wrap gap-3">

              <button

                type="button"

                onClick={() => handleVerdict('risk')}

                className="rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid"

              >

                Integrity risk

              </button>

              <button

                type="button"

                onClick={() => handleVerdict('ok')}

                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-teal-ink ring-1 ring-teal-ink/20 hover:bg-teal-soft focus:outline-none focus:ring-2 focus:ring-teal-mid"

              >

                Generally acceptable

              </button>

            </div>

            {verdict && (

              <p className="mt-4 rounded-lg bg-teal-soft/50 px-3 py-2 text-sm text-teal-ink" role="status">

                {feedback}

              </p>

            )}

          </div>

        </section>



        <section className="rounded-xl bg-teal-ink px-6 py-8 text-white">

          <h2 className="font-display text-2xl">Ethical AI usage</h2>

          <p className="mt-3 max-w-3xl text-white/85">

            Use AI to accelerate drafts and exploration — never to invent evidence. Disclose assistance when required,

            verify facts, and keep human judgment responsible for grades, research claims, and student feedback.

          </p>

        </section>

      </div>

    </ModuleBody>

    </>

  )

}

