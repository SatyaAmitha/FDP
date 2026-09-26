import type { ReactNode } from 'react'

interface ModuleHeroProps {
  moduleNumber: number
  title: string
  tagline: string
}

export function ModuleHero({ moduleNumber, title, tagline }: ModuleHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-teal-ink/10 bg-[linear-gradient(120deg,rgba(15,76,92,0.06),transparent_40%,rgba(232,220,196,0.35))]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm font-medium text-teal-mid">Module {moduleNumber}</p>
        <h1 className="font-display mt-1 text-3xl leading-tight text-teal-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-ink/70">{tagline}</p>
      </div>
    </section>
  )
}

export function ModuleBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</div>
}
