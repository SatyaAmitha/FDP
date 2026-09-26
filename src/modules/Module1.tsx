import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useState } from 'react'



interface Era {

  year: string

  title: string

  detail: string

}



interface ModelCard {

  name: string

  maker: string

  strength: string

  facultyUse: string

}



const ERAS: Era[] = [

  { year: '1950s–80s', title: 'Symbolic AI', detail: 'Rules and expert systems. Knowledge encoded by hand — brittle outside narrow domains.' },

  { year: '1990s–2010s', title: 'Machine Learning', detail: 'Models learn patterns from labeled data: classification, regression, recommendation.' },

  { year: '2012+', title: 'Deep Learning', detail: 'Neural nets with many layers unlock vision, speech, and language breakthroughs.' },

  { year: '2017+', title: 'Transformers', detail: 'Attention architecture enables scalable language models and multimodal systems.' },

  { year: '2022+', title: 'Generative AI', detail: 'ChatGPT-class tools make LLMs practical for teaching, research, and productivity.' },

]



const MODELS: ModelCard[] = [

  { name: 'ChatGPT', maker: 'OpenAI', strength: 'General conversation, coding, drafting', facultyUse: 'Lesson outlines, rubrics, email drafts' },

  { name: 'Gemini', maker: 'Google', strength: 'Multimodal + Google ecosystem', facultyUse: 'Summarize Docs/Drive materials' },

  { name: 'Claude', maker: 'Anthropic', strength: 'Long context, careful writing', facultyUse: 'Paper review, policy drafting' },

  { name: 'Perplexity', maker: 'Perplexity', strength: 'Search-grounded answers with citations', facultyUse: 'Quick literature scans' },

  { name: 'Grok', maker: 'xAI', strength: 'Real-time / conversational style', facultyUse: 'Brainstorming alternate framings' },

]



const ML_POINTS = [

  'Feature engineering is often manual',

  'Works well on structured tabular data',

  'Examples: decision trees, SVM, logistic regression',

  'Needs labeled datasets for supervised tasks',

]



const DL_POINTS = [

  'Learns features automatically from raw data',

  'Excels at images, audio, and text',

  'Examples: CNNs, RNNs, Transformers',

  'Needs more compute and larger datasets',

]



export default function App() {

  const [eraIndex, setEraIndex] = useState(4)

  const [modelIndex, setModelIndex] = useState(0)

  const [tokenStep, setTokenStep] = useState(0)



  const tokens = ['Faculty', 'use', 'AI', 'to', 'design', 'better', 'assessments']

  const era = ERAS[eraIndex]

  const model = MODELS[modelIndex]



  return (

    <>

    <ModuleHero moduleNumber={1} title="Introduction to Generative AI" tagline="Understand how modern AI works and where it is being applied in academia." />

    <ModuleBody>

      <div className="space-y-12">

        <section>

          <h2 className="font-display text-2xl text-teal-ink">Evolution of AI</h2>

          <p className="mt-2 text-ink/70">Click an era to see what changed for researchers and teachers.</p>

          <div className="mt-6 flex flex-wrap gap-2">

            {ERAS.map((item, i) => (

              <button

                key={item.year}

                type="button"

                onClick={() => setEraIndex(i)}

                className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  i === eraIndex ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15 hover:bg-teal-soft'

                }`}

                aria-pressed={i === eraIndex}

              >

                {item.year}

              </button>

            ))}

          </div>

          <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

            <h3 className="text-lg font-semibold text-teal-ink">{era.title}</h3>

            <p className="mt-2 text-ink/75">{era.detail}</p>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Machine Learning vs Deep Learning</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

              <h3 className="font-semibold text-teal-ink">Machine Learning</h3>

              <ul className="mt-3 space-y-2 text-sm text-ink/75">

                {ML_POINTS.map((p) => (

                  <li key={p} className="flex gap-2">

                    <span className="text-teal-mid">•</span>

                    <span>{p}</span>

                  </li>

                ))}

              </ul>

            </div>

            <div className="rounded-xl bg-sand/60 p-5 shadow-sm ring-1 ring-teal-ink/10">

              <h3 className="font-semibold text-teal-ink">Deep Learning</h3>

              <ul className="mt-3 space-y-2 text-sm text-ink/75">

                {DL_POINTS.map((p) => (

                  <li key={p} className="flex gap-2">

                    <span className="text-teal-mid">•</span>

                    <span>{p}</span>

                  </li>

                ))}

              </ul>

            </div>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">What is Generative AI?</h2>

          <p className="mt-3 max-w-3xl text-ink/75">

            Generative AI creates new content — text, images, code, audio — by learning statistical patterns from large datasets.

            Unlike a search engine that retrieves pages, it <em>predicts</em> the next useful token given your prompt and context.

          </p>

          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

            <h3 className="font-semibold text-teal-ink">LLM token prediction (simplified)</h3>

            <p className="mt-2 text-sm text-ink/65">Watch how a language model builds a sentence one token at a time.</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">

              {tokens.slice(0, tokenStep + 1).map((t) => (

                <span key={t} className="rounded-md bg-teal-soft px-2.5 py-1 text-sm font-medium text-teal-ink">

                  {t}

                </span>

              ))}

              {tokenStep < tokens.length - 1 && (

                <span className="animate-pulse text-sm text-ink/40"> predicting…</span>

              )}

            </div>

            <button

              type="button"

              className="mt-4 rounded-md bg-teal-ink px-4 py-2 text-sm font-semibold text-white hover:bg-teal-mid focus:outline-none focus:ring-2 focus:ring-teal-mid"

              onClick={() => setTokenStep((s) => (s + 1) % tokens.length)}

              aria-label="Predict next token"

            >

              {tokenStep < tokens.length - 1 ? 'Predict next token' : 'Replay'}

            </button>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Transformers (simplified)</h2>

          <p className="mt-3 max-w-3xl text-ink/75">

            Transformers use <strong>attention</strong>: each word looks at other words to decide what matters.

            In “The student submitted <em>her</em> thesis”, attention links “her” to “student”.

          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            {['Encode context', 'Attend to relevant tokens', 'Decode / generate output'].map((step, i) => (

              <div key={step} className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-teal-ink/10">

                <p className="text-xs font-semibold uppercase tracking-wider text-teal-mid">Step {i + 1}</p>

                <p className="mt-2 font-medium text-teal-ink">{step}</p>

              </div>

            ))}

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">AI Landscape</h2>

          <p className="mt-2 text-ink/70">Explore leading tools faculty commonly encounter.</p>

          <div className="mt-4 flex flex-wrap gap-2">

            {MODELS.map((m, i) => (

              <button

                key={m.name}

                type="button"

                onClick={() => setModelIndex(i)}

                className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  i === modelIndex ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15 hover:bg-teal-soft'

                }`}

                aria-pressed={i === modelIndex}

              >

                {m.name}

              </button>

            ))}

          </div>

          <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

            <p className="text-sm text-ink/55">{model.maker}</p>

            <h3 className="text-xl font-semibold text-teal-ink">{model.name}</h3>

            <p className="mt-3 text-ink/75"><span className="font-medium text-teal-ink">Strength:</span> {model.strength}</p>

            <p className="mt-2 text-ink/75"><span className="font-medium text-teal-ink">Faculty use:</span> {model.facultyUse}</p>

          </div>

        </section>



        <section className="rounded-xl bg-teal-ink px-6 py-8 text-white">

          <h2 className="font-display text-2xl">Learning outcome</h2>

          <p className="mt-3 max-w-2xl text-white/85">

            Participants understand how modern AI works — from classical ML to LLMs and transformers —

            and can place tools like ChatGPT, Gemini, and Claude in the academic landscape.

          </p>

        </section>

      </div>

    </ModuleBody>

    </>

  )

}

