import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
import { useAuth } from '../context/useAuth'
import { roleBasePath } from '../lib/rolePaths'
import type { AppRole } from '../types/roles'
import { getRoleDisplayLabel } from '../types/roles'
import { FloatingAIAssistant } from './FloatingAIAssistant'

const headerBarClass =
  'border-b border-red-700/30 bg-gradient-to-r from-[#7a2a3a] via-[#662332] to-[#7a2a3a] pt-[max(2px,env(safe-area-inset-top))] text-white shadow-sm shadow-red-900/15'

const asideShellClass =
  'flex min-h-0 shrink-0 flex-col overflow-hidden border-red-800/35 bg-gradient-to-b from-[#5b1f2c] via-[#4b1823] to-[#3f141e]'

function sidebarNavClass({ isActive }: { isActive: boolean }) {
  return [
    'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-red-800/65 text-red-50 ring-1 ring-red-600/45 shadow-md shadow-red-900/15'
      : 'text-stone-300 hover:bg-red-800/40 hover:text-red-50',
  ].join(' ')
}

function NavItem({
  to,
  end,
  onNavigate,
  children,
}: {
  to: string
  end?: boolean
  onNavigate?: () => void
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={sidebarNavClass}
      onClick={() => onNavigate?.()}
    >
      {children}
    </NavLink>
  )
}

function SidebarLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 px-3 font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-300/55 first:mt-0">
      {children}
    </p>
  )
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const base = user ? roleBasePath(user.role as AppRole) : '/'
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileNavTopPx, setMobileNavTopPx] = useState(0)
  const mobileNavId = useId()
  const headerRef = useRef<HTMLElement>(null)

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  const updateMobileNavTop = useCallback(() => {
    const el = headerRef.current
    if (!el) return
    setMobileNavTopPx(el.getBoundingClientRect().bottom)
  }, [])

  useLayoutEffect(() => {
    if (!mobileNavOpen) return
    updateMobileNavTop()
    window.addEventListener('resize', updateMobileNavTop)
    window.addEventListener('scroll', updateMobileNavTop, true)
    return () => {
      window.removeEventListener('resize', updateMobileNavTop)
      window.removeEventListener('scroll', updateMobileNavTop, true)
    }
  }, [mobileNavOpen, updateMobileNavTop])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    mq.addEventListener('change', onChange)
    onChange()
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const renderSidebarInner = (onNavigate?: () => void) => (
    <>
      <div className="shrink-0 border-b border-red-950/35 px-4 py-5">
        <Link
          to={base}
          onClick={onNavigate}
          className="group block transition-opacity hover:opacity-95"
        >
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-200/75">
            E‑Vote · ISPSC Tagudin
          </p>
          <p className="font-display mt-1 text-lg font-semibold tracking-tight text-white group-hover:text-red-50">
            Management console
          </p>
        </Link>
      </div>

      {user ? (
        <nav className="sidebar-nav-scroll flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-y-contain p-3">
          <SidebarLabel>Main</SidebarLabel>
          <NavItem to={base} end onNavigate={onNavigate}>
            Dashboard
          </NavItem>
          <NavItem to={`${base}/profile`} onNavigate={onNavigate}>
            Profile
          </NavItem>

          {user.role === 'admin' ? (
            <>
              <SidebarLabel>Accounts</SidebarLabel>
              <NavItem to={`${base}/users`} onNavigate={onNavigate}>
                Administrators
              </NavItem>
              <NavItem to={`${base}/voters`} onNavigate={onNavigate}>
                Voters
              </NavItem>
              <NavItem to={`${base}/candidates`} onNavigate={onNavigate}>
                Candidates
              </NavItem>
              <NavItem to={`${base}/mis-office`} onNavigate={onNavigate}>
                MIS Office
              </NavItem>
              <NavItem to={`${base}/osa-office`} onNavigate={onNavigate}>
                OSA Office
              </NavItem>
              <SidebarLabel>Elections</SidebarLabel>
              <NavItem to={`${base}/positions`} onNavigate={onNavigate}>
                Positions
              </NavItem>
              <NavItem to={`${base}/elections`} onNavigate={onNavigate}>
                Elections
              </NavItem>
              <NavItem to={`${base}/election-results`} onNavigate={onNavigate}>
                Election results
              </NavItem>
              <NavItem
                to={`${base}/campaign-applications`}
                onNavigate={onNavigate}
              >
                Campaign applications
              </NavItem>
              <NavItem to={`${base}/vote-logs`} onNavigate={onNavigate}>
                Submitted ballot logs
              </NavItem>
            </>
          ) : null}

          {user.role === 'candidate' ? (
            <>
              <SidebarLabel>Campaign</SidebarLabel>
              <NavItem
                to={`${base}/campaign/application`}
                onNavigate={onNavigate}
              >
                Campaign application
              </NavItem>
              <NavItem to={`${base}/campaign/history`} onNavigate={onNavigate}>
                Application history
              </NavItem>
            </>
          ) : null}

          {user.role === 'voter' ? (
            <>
              <SidebarLabel>Elections</SidebarLabel>
              <NavItem to={`${base}/elections`} onNavigate={onNavigate}>
                Elections
              </NavItem>
              <NavItem to={`${base}/ballot-history`} onNavigate={onNavigate}>
                Ballot history
              </NavItem>
            </>
          ) : null}

          {user.role === 'mis_office' || user.role === 'osa_office' ? (
            <>
              <SidebarLabel>Elections</SidebarLabel>
              <NavItem to={`${base}/elections`} onNavigate={onNavigate}>
                Elections
              </NavItem>
              <NavItem
                to={`${base}/election-results`}
                onNavigate={onNavigate}
              >
                Election results
              </NavItem>
            </>
          ) : null}
        </nav>
      ) : null}

      {user ? (
        <div className="shrink-0 border-t border-red-950/35 p-4">
          <div className="rounded-xl border border-red-800/35 bg-black/35 px-3 py-2.5 text-xs shadow-inner shadow-black/25">
            <p className="text-stone-500">Signed in</p>
            <p className="mt-0.5 font-medium text-stone-100">{user.fullName}</p>
            <p className="mt-1.5 inline-flex rounded-md border border-red-700/40 bg-red-950/50 px-2 py-0.5 font-display text-[0.65rem] font-medium text-red-100">
              {getRoleDisplayLabel(user.role)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              flushSync(() => {
                logout()
              })
              navigate('/login', { replace: true })
            }}
            className="font-display mt-3 w-full rounded-xl border border-red-700/45 bg-red-950/45 py-2.5 text-sm font-medium text-red-50 transition-colors hover:border-red-600/50 hover:bg-red-900/55 active:bg-red-900/65"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </>
  )

  return (
    <div className="min-h-svh overflow-x-clip bg-stone-100 text-stone-900">
      <div className="flex min-h-svh flex-col lg:flex-row">
        <aside
          className={`${asideShellClass} hidden w-64 border-r lg:sticky lg:top-0 lg:flex lg:h-svh lg:max-h-svh`}
        >
          {renderSidebarInner()}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <header
            ref={headerRef}
            className={`${headerBarClass} sticky top-0 shrink-0`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-white/25 bg-white/10 p-2 text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 lg:hidden"
                  aria-expanded={mobileNavOpen}
                  aria-controls={mobileNavId}
                  onClick={() => setMobileNavOpen((o) => !o)}
                >
                  <span className="sr-only">
                    {mobileNavOpen ? 'Close menu' : 'Open menu'}
                  </span>
                  <HamburgerIcon className="block" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-red-200/85 sm:text-[0.65rem] sm:tracking-[0.2em]">
                    E‑Vote · ISPSC Tagudin
                  </p>
                  <p className="font-display mt-0.5 text-pretty text-[0.95rem] font-semibold leading-snug tracking-tight text-white sm:text-lg">
                    Management console
                  </p>
                </div>
              </div>
              {user ? (
                <div className="min-w-0 max-w-[min(100%,14rem)] text-right text-xs sm:block sm:max-w-[20rem] sm:text-sm">
                  <p className="truncate font-medium text-red-50">{user.fullName}</p>
                  <p className="mt-0.5 truncate text-[0.65rem] text-red-200/85 sm:text-xs">
                    {getRoleDisplayLabel(user.role)} · {user.email}
                  </p>
                </div>
              ) : null}
            </div>
          </header>
          <main className="flex-1 bg-stone-50/80 px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              className="fixed right-0 z-[45] bg-black/50 backdrop-blur-[2px] lg:hidden"
              style={{
                top: mobileNavTopPx,
                left: 0,
                bottom: 0,
              }}
              aria-label="Close navigation menu"
              onClick={closeMobileNav}
            />
            <aside
              id={mobileNavId}
              className={`${asideShellClass} fixed bottom-0 left-0 z-[50] flex w-[min(20rem,88vw)] border-r shadow-2xl shadow-black/40 lg:hidden`}
              style={{ top: mobileNavTopPx } satisfies CSSProperties}
            >
              {renderSidebarInner(closeMobileNav)}
            </aside>
          </>
        ) : null}
      </div>
      <FloatingAIAssistant developerName="Raminder Jangao" />
    </div>
  )
}
