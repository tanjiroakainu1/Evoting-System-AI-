import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { InstitutionalTopBar } from '../components/InstitutionalTopBar'
import { getDemoCredentialsForLogin } from '../lib/authStorage'
import { safePostLoginPath } from '../lib/safeRedirect'
import { resolvePostLoginRedirect } from '../lib/rolePaths'
import type { AppRole } from '../types/roles'

const demoRows = getDemoCredentialsForLogin()
const QUICK_ROLE_ORDER: AppRole[] = [
  'admin',
  'mis_office',
  'osa_office',
  'candidate',
  'voter',
]
const quickDemoRows = QUICK_ROLE_ORDER.map((role) =>
  demoRows.find((r) => r.role === role),
).filter((r): r is (typeof demoRows)[number] => Boolean(r))

const inputClass =
  'mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 shadow-inner shadow-stone-300/40 placeholder:text-stone-500 transition-colors duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const cardClass =
  'rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl shadow-stone-300/50 ring-1 ring-stone-200 backdrop-blur-sm sm:p-9'

export function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const fromQuery = safePostLoginPath(searchParams.get('redirect'))
  const fromState = safePostLoginPath(
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname,
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return (
      <Navigate
        to={resolvePostLoginRedirect(fromQuery ?? fromState, user)}
        replace
      />
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    }
  }

  function fillDemo(rowEmail: string, rowPassword: string) {
    setEmail(rowEmail)
    setPassword(rowPassword)
    setError(null)
  }

  function quickRedirectLogin(rowEmail: string, rowPassword: string) {
    try {
      setError(null)
      login(rowEmail, rowPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      <InstitutionalTopBar containerClass="max-w-lg">
        <div>
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-200/85">
            E‑Vote · ISPSC Tagudin
          </p>
          <p className="font-display text-base font-semibold text-white">
            Sign in
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Home
        </Link>
      </InstitutionalTopBar>
      <div className="pointer-events-none fixed inset-0 top-14 bg-[radial-gradient(ellipse_at_top,_rgba(185,28,28,0.08),transparent_55%)] sm:top-16" />
      <div className="relative mx-auto flex min-h-0 flex-1 max-w-lg flex-col justify-center px-3 py-8 sm:px-5 sm:py-12">
        <div className={cardClass}>
          <h1 className="font-display text-center text-2xl font-semibold tracking-tight text-red-900 sm:text-[1.75rem]">
            Sign in
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-stone-600">
            E‑Vote · Digital voting system
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <fieldset className="space-y-4 border-0 p-0">
              <legend className="sr-only">Email address and password</legend>
              <div>
                <label
                  htmlFor="login-email-address"
                  className="block text-sm font-medium text-red-800/90"
                >
                  Email address
                </label>
                <input
                  id="login-email-address"
                  name="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-red-800/90"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </fieldset>
            {error ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="font-display w-full rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-lg shadow-red-950/35 transition-all duration-200 hover:from-red-500 hover:shadow-xl hover:shadow-red-950/25 active:scale-[0.99]"
            >
              Sign in
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">
            Voter without an account?{' '}
            <Link
              to="/register"
              className="font-medium text-red-700 hover:text-red-800"
            >
              Register here
            </Link>
          </p>
          <p className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-stone-500 hover:text-red-800/90"
            >
              ← Back to home
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-xl shadow-stone-300/45 ring-1 ring-stone-200/90 backdrop-blur-sm">
          <h2 className="font-display text-sm font-semibold text-red-900">
            Demo accounts (local)
          </h2>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-red-800/80">
            Quick redirect by role
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickDemoRows.map((row) => (
              <button
                key={`quick-${row.role}`}
                type="button"
                onClick={() => quickRedirectLogin(row.email, row.password)}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50"
              >
                {row.roleLabel}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Preloaded users for each role. Click a role to fill the form—only
            visible on this sign-in page.
          </p>
          <div className="mt-4 space-y-2 sm:hidden">
            {demoRows.map((row) => (
              <button
                key={`mobile-${row.role}-${row.email}`}
                type="button"
                onClick={() => fillDemo(row.email, row.password)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-red-300 hover:bg-red-50/70"
              >
                <p className="text-sm font-semibold text-red-800">{row.roleLabel}</p>
                <p className="mt-1 font-mono text-[11px] text-stone-500">{row.email}</p>
                <p className="font-mono text-[11px] text-stone-500">{row.password}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-stone-200 shadow-inner shadow-stone-200/50 sm:block">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-white text-xs uppercase tracking-wider text-stone-500">
                  <th className="px-3 py-2 font-medium text-red-800/80">Role</th>
                  <th className="px-3 py-2 font-medium text-red-800/80">
                    Email address
                  </th>
                  <th className="px-3 py-2 font-medium text-red-800/80">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoRows.map((row) => (
                  <tr
                    key={`${row.role}-${row.email}`}
                    className="border-b border-stone-200/80 transition-colors last:border-0 hover:bg-red-50"
                  >
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => fillDemo(row.email, row.password)}
                        className="text-left font-medium text-red-700 transition-colors hover:text-red-800 hover:underline"
                      >
                        {row.roleLabel}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-stone-400">
                      {row.email}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-stone-400">
                      {row.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
