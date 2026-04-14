import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { rolePath } from '../../lib/rolePaths'
import { MyCampaignApplicationsList } from './MyCampaignApplicationsList'

export function CandidateDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Candidate filing
        </h1>
        <p className="mt-2 max-w-2xl text-stone-500">
          Candidate accounts file here for a ballot line. An administrator
          approves or rejects each application before you can appear on the
          ballot; you can attach an optional campaign photo and track status
          below.
        </p>
        <Link
          to={rolePath('candidate', 'campaign', 'application')}
          className="mt-6 inline-flex rounded-xl border border-red-600 bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          Campaign application
        </Link>
      </div>

      {user ? (
        <MyCampaignApplicationsList candidateUserId={user.id} variant="panel" />
      ) : null}

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300">
        <p className="text-sm text-stone-500">
          Logged in as{' '}
          <span className="font-medium text-stone-800">{user?.fullName}</span>
        </p>
      </div>
    </div>
  )
}
