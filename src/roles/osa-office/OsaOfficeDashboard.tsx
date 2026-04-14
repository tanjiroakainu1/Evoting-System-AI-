import { Link } from 'react-router-dom'
import { ElectionActivityLogPanel } from '../../components/ElectionActivityLogPanel'
import { useAuth } from '../../context/useAuth'
import { rolePath } from '../../lib/rolePaths'

const btn =
  'inline-flex rounded-xl border border-red-600 bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800'

export function OsaOfficeDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          OSA Office
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Create and manage elections for assemblies you coordinate, same
          capabilities as the admin elections console. The system log below lists
          every privileged change (admin, MIS, or OSA) with year-month-day,
          time, and email. Other role assignments stay with user management.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={rolePath('osa_office', 'elections')} className={btn}>
            Elections
          </Link>
          <Link
            to={rolePath('osa_office', 'election-results')}
            className={btn}
          >
            Election results
          </Link>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300">
        <p className="text-sm text-stone-400">
          Signed in:{' '}
          <span className="font-medium text-red-800/90">
            {user?.email ?? '—'}
          </span>
        </p>
      </div>

      <ElectionActivityLogPanel limit={30} title="System logs" />
    </div>
  )
}
