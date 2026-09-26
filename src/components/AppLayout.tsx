import { NavLink, Outlet } from 'react-router-dom'
import { MODULES } from '../modules/nav'
import { useState } from 'react'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleToggleCollapse = () => {
    setCollapsed((c) => !c)
  }

  return (
    <div className="flex min-h-screen">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-teal-ink/10 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[4.5rem]' : 'w-72'}`}
      >
        <div className={`border-b border-teal-ink/10 ${collapsed ? 'px-2 py-4' : 'px-5 py-5'}`}>
          <div className={`flex items-start ${collapsed ? 'justify-center' : 'justify-between gap-2'}`}>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-mid">FDP GenAI Lab</p>
                <p className="mt-1 font-display text-2xl text-teal-ink">Modules</p>
                <p className="mt-1 text-xs text-ink/55">Powered by Akshara · Azure AI</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden shrink-0 rounded-md bg-teal-soft px-2.5 py-2 text-sm font-semibold text-teal-ink hover:bg-teal-soft/80 focus:outline-none focus:ring-2 focus:ring-teal-mid lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>
          {collapsed && (
            <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-teal-mid">FDP</p>
          )}
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-3'}`} aria-label="Module navigation">
          {MODULES.map((m) => (
            <NavLink
              key={m.id}
              to={m.path}
              onClick={() => setMobileOpen(false)}
              title={m.title}
              className={({ isActive }) =>
                `block rounded-lg transition focus:outline-none focus:ring-2 focus:ring-teal-mid ${
                  collapsed ? 'px-2 py-3 text-center' : 'px-3 py-3'
                } ${isActive ? 'bg-teal-ink text-white' : 'text-teal-ink hover:bg-teal-soft/60'}`
              }
            >
              {({ isActive }) =>
                collapsed ? (
                  <span className="text-sm font-bold">{m.id}</span>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${isActive ? 'text-sand' : 'text-teal-mid'}`}>
                        Module {m.id}
                      </span>
                      {m.liveAi && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            isActive ? 'bg-white/15 text-white' : 'bg-teal-soft text-teal-ink'
                          }`}
                        >
                          AI
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium leading-snug">{m.short}</p>
                  </>
                )
              }
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t border-teal-ink/10 px-4 py-3 text-xs text-ink/50">
            One project · UI + AI API on same server
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-teal-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            type="button"
            className="rounded-md bg-teal-soft px-3 py-2 text-sm font-semibold text-teal-ink lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open modules sidebar"
          >
            Modules
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-teal-ink">
              Practical Generative AI for Teaching, Research &amp; Productivity
            </p>
            <p className="text-xs text-ink/55">Faculty Development Programme</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
