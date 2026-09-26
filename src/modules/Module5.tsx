import { ModuleHero, ModuleBody } from '../components/ModuleHero'
import { useMemo, useState } from 'react'



interface Tool {

  id: string

  name: string

  category: string

  bestFor: string

  samplePrompt: string

  sampleOutput: string

  tasks: string[]

}



const TOOLS: Tool[] = [

  {

    id: 'chatgpt',

    name: 'ChatGPT',

    category: 'General LLM',

    bestFor: 'Drafting, coding help, brainstorming lesson ideas',

    samplePrompt: 'Create a 3-week module plan on operating systems for 2nd-year B.Tech.',

    sampleOutput: 'Week 1: Processes & threads… Week 2: Scheduling… Week 3: Memory & labs… (simulated outline)',

    tasks: ['lesson-plan', 'coding', 'drafting'],

  },

  {

    id: 'gemini',

    name: 'Gemini',

    category: 'Multimodal / Google',

    bestFor: 'Working with Drive docs, images, and multimodal inputs',

    samplePrompt: 'Summarize this lecture PDF and suggest 5 discussion questions.',

    sampleOutput: 'Summary themes: concurrency pitfalls… Discussion: When is spinlock preferable…',

    tasks: ['summarize', 'discussion', 'multimodal'],

  },

  {

    id: 'claude',

    name: 'Claude',

    category: 'Long-context writing',

    bestFor: 'Careful long-form editing and policy drafting',

    samplePrompt: 'Revise this department AI-use policy for clarity and fairness.',

    sampleOutput: 'Revised sections: disclosure, assessment integrity, research data…',

    tasks: ['policy', 'editing', 'research'],

  },

  {

    id: 'perplexity',

    name: 'Perplexity AI',

    category: 'Search-grounded',

    bestFor: 'Quick literature scans with cited web sources',

    samplePrompt: 'What are recent reviews on generative AI in STEM education? Cite sources.',

    sampleOutput: 'Top hits (simulated): Review A (2024)… Review B… Always verify links.',

    tasks: ['literature', 'facts'],

  },

  {

    id: 'notebooklm',

    name: 'NotebookLM',

    category: 'Source-grounded notebook',

    bestFor: 'Ask questions over your uploaded course materials',

    samplePrompt: 'From my uploaded syllabus + notes, extract assessment deadlines.',

    sampleOutput: 'Deadlines extracted from sources: Midterm W6, Project W12…',

    tasks: ['course-materials', 'summarize'],

  },

  {

    id: 'gamma',

    name: 'Gamma',

    category: 'Presentation generation',

    bestFor: 'Turning outlines into slide decks quickly',

    samplePrompt: 'Make slides: Introduction to RAG for faculty workshop (10 slides).',

    sampleOutput: 'Slide map: 1 What is RAG… 5 Demo flow… 10 Guardrails checklist…',

    tasks: ['presentation', 'workshop'],

  },

  {

    id: 'napkin',

    name: 'Napkin AI',

    category: 'Diagrams',

    bestFor: 'Turning text into conceptual diagrams',

    samplePrompt: 'Diagram the ML vs DL vs Generative AI relationship for freshers.',

    sampleOutput: 'Suggested diagram: nested circles / flowchart with definitions…',

    tasks: ['diagram', 'explain'],

  },

  {

    id: 'canva',

    name: 'Canva AI',

    category: 'Design',

    bestFor: 'Posters, certificates, social graphics for events',

    samplePrompt: 'Design a poster for FDP on Practical Generative AI (campus event).',

    sampleOutput: 'Layout: title band, date/venue, agenda strip, registration QR placeholder…',

    tasks: ['design', 'outreach'],

  },

]



const TASKS = [

  { id: 'lesson-plan', label: 'Plan a lesson / module' },

  { id: 'literature', label: 'Scan literature with citations' },

  { id: 'presentation', label: 'Build a workshop deck' },

  { id: 'diagram', label: 'Explain with a diagram' },

  { id: 'policy', label: 'Draft academic policy' },

  { id: 'course-materials', label: 'Q&A over my PDFs' },

]



export default function App() {

  const [toolId, setToolId] = useState('chatgpt')

  const [taskId, setTaskId] = useState('lesson-plan')



  const tool = TOOLS.find((t) => t.id === toolId)!

  const recommended = useMemo(

    () => TOOLS.filter((t) => t.tasks.includes(taskId)),

    [taskId],

  )



  return (

    <>

    <ModuleHero moduleNumber={5} title="AI Tools Demonstration" tagline="Compare popular AI tools with real academic examples for teaching and research." />

    <ModuleBody>

      <div className="space-y-12">

        <section>

          <h2 className="font-display text-2xl text-teal-ink">Pick a teaching task</h2>

          <p className="mt-2 text-ink/70">We recommend tools that fit the job — not every tool for every task.</p>

          <div className="mt-4 flex flex-wrap gap-2">

            {TASKS.map((task) => (

              <button

                key={task.id}

                type="button"

                onClick={() => setTaskId(task.id)}

                className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  taskId === task.id ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'

                }`}

                aria-pressed={taskId === task.id}

              >

                {task.label}

              </button>

            ))}

          </div>

          <div className="mt-4 rounded-xl bg-sand/50 p-4 ring-1 ring-teal-ink/10">

            <p className="text-sm font-semibold text-teal-ink">Recommended</p>

            <p className="mt-2 text-ink/80">

              {recommended.length ? recommended.map((t) => t.name).join(' · ') : 'Explore the gallery below'}

            </p>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Tools gallery</h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {TOOLS.map((t) => (

              <button

                key={t.id}

                type="button"

                onClick={() => setToolId(t.id)}

                className={`rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-mid ${

                  toolId === t.id ? 'bg-teal-ink text-white' : 'bg-white text-teal-ink ring-1 ring-teal-ink/15'

                }`}

                aria-pressed={toolId === t.id}

              >

                {t.name}

              </button>

            ))}

          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">

            <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-ink/10">

              <p className="text-xs font-semibold uppercase tracking-wider text-teal-mid">{tool.category}</p>

              <h3 className="mt-1 text-2xl font-semibold text-teal-ink">{tool.name}</h3>

              <p className="mt-3 text-ink/75"><span className="font-medium">Best for:</span> {tool.bestFor}</p>

              <p className="mt-4 text-sm font-semibold text-teal-ink">Sample academic prompt</p>

              <p className="mt-1 rounded-lg bg-teal-soft/40 px-3 py-2 text-sm text-ink/80">{tool.samplePrompt}</p>

            </article>

            <article className="rounded-xl bg-teal-ink p-5 text-white">

              <p className="text-xs font-semibold uppercase tracking-wider text-sand">Simulated demo output</p>

              <p className="mt-3 text-white/90">{tool.sampleOutput}</p>

              <p className="mt-6 text-sm text-white/70">

                Open the real tool and run this prompt — compare quality, citations, and speed.

              </p>

            </article>

          </div>

        </section>



        <section>

          <h2 className="font-display text-2xl text-teal-ink">Comparison matrix</h2>

          <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-teal-ink/10">

            <table className="min-w-full text-left text-sm">

              <thead className="bg-teal-soft/60 text-teal-ink">

                <tr>

                  <th className="px-4 py-3 font-semibold">Tool</th>

                  <th className="px-4 py-3 font-semibold">Category</th>

                  <th className="px-4 py-3 font-semibold">Faculty strength</th>

                </tr>

              </thead>

              <tbody>

                {TOOLS.map((t) => (

                  <tr key={t.id} className="border-t border-teal-ink/10">

                    <td className="px-4 py-3 font-medium text-teal-ink">{t.name}</td>

                    <td className="px-4 py-3 text-ink/70">{t.category}</td>

                    <td className="px-4 py-3 text-ink/70">{t.bestFor}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </ModuleBody>

    </>

  )

}

