import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { rolePath } from '../../lib/rolePaths'

const panel =
  'rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300 hover:shadow-lg'

export function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Administrator workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Election system log (date, time, email) is shown on the MIS Office and
          OSA Office dashboards; actions you take here are recorded there too.
          Configure elections and open the right console:{' '}
          <Link
            to={rolePath('admin', 'users')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Admins
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'voters')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Voters
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'candidates')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Candidates
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'mis-office')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            MIS Office
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'osa-office')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            OSA Office
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'positions')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Positions
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'election-results')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Election results
          </Link>
          ,{' '}
          <Link
            to={rolePath('admin', 'campaign-applications')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Campaign applications
          </Link>
          , and{' '}
          <Link
            to={rolePath('admin', 'elections')}
            className="font-medium text-red-700 underline decoration-red-600/50 underline-offset-2 hover:text-red-800"
          >
            Elections
          </Link>
          .
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to={rolePath('admin', 'elections')}
          className={`${panel} block text-left no-underline`}
        >
          <h2 className="font-medium text-red-900">Elections management</h2>
          <p className="mt-1 text-sm text-stone-500">
            Create elections, voting windows, PIN enrollment, and voter links.
          </p>
        </Link>
        <Link
          to={rolePath('admin', 'positions')}
          className={`${panel} block text-left no-underline`}
        >
          <h2 className="font-medium text-red-900">Positions management</h2>
          <p className="mt-1 text-sm text-stone-500">
            Maintain ballot offices (President, Secretary, etc.).
          </p>
        </Link>
        <Link
          to={rolePath('admin', 'election-results')}
          className={`${panel} block text-left no-underline`}
        >
          <h2 className="font-medium text-red-900">Election results</h2>
          <p className="mt-1 text-sm text-stone-500">
            Turnout, ranked tallies, and percentage bars per office.
          </p>
        </Link>
        <div className={panel}>
          <h2 className="font-medium text-red-900">Your profile</h2>
          <p className="mt-1 text-sm text-stone-500">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}
