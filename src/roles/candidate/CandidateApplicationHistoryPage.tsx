import { useAuth } from '../../context/useAuth'
import { MyCampaignApplicationsList } from './MyCampaignApplicationsList'

export function CandidateApplicationHistoryPage() {
  const { user } = useAuth()

  if (!user || user.role !== 'candidate') {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center text-stone-500">
        Only candidate accounts can open this page.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90 sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Candidate application history
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Full history of your campaign applications, including pending,
          approved, and rejected filings.
        </p>
      </section>
      <MyCampaignApplicationsList candidateUserId={user.id} variant="inline" />
    </div>
  )
}
