import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import type { CampaignApplicationRecord } from '../../types/election'
import { rolePath } from '../../lib/rolePaths'
import {
  getElections,
  getMyCampaignApplications,
  getPositions,
} from '../../lib/electionsStorage'

const statusLabel: Record<CampaignApplicationRecord['status'], string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
}

function statusBadgeClass(s: CampaignApplicationRecord['status']): string {
  if (s === 'approved') {
    return 'border-emerald-800/45 bg-emerald-950/40 text-emerald-900'
  }
  if (s === 'rejected') {
    return 'border-red-300 bg-red-50 text-red-800'
  }
  return 'border-amber-200 bg-amber-50 text-amber-900'
}

type Props = {
  candidateUserId: string
  /** Larger panel with title — used on dashboard and application page */
  variant?: 'panel' | 'inline'
}

export function MyCampaignApplicationsList({
  candidateUserId,
  variant = 'panel',
}: Props) {
  const [elections, setElections] = useState(getElections)
  const [mine, setMine] = useState<CampaignApplicationRecord[]>(() =>
    getMyCampaignApplications(candidateUserId),
  )

  const positions = getPositions()

  const refresh = useCallback(() => {
    setElections(getElections())
    setMine(getMyCampaignApplications(candidateUserId))
  }, [candidateUserId])

  useEffect(() => {
    window.addEventListener('bevms-elections', refresh)
    return () => window.removeEventListener('bevms-elections', refresh)
  }, [refresh])

  const sorted = [...mine].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const wrapClass =
    variant === 'panel'
      ? 'rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300 sm:p-6'
      : 'max-w-2xl'

  return (
    <section className={wrapClass}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-red-900">
          My campaign
        </h2>
        <Link
          to={rolePath('candidate', 'campaign', 'application')}
          className="text-xs font-medium text-red-700/95 underline decoration-red-700/40 underline-offset-2 hover:text-red-800"
        >
          New application
        </Link>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Your filings and whether an administrator has approved or rejected each
        one.
      </p>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          No applications yet.{' '}
          <Link
            to={rolePath('candidate', 'campaign', 'application')}
            className="font-medium text-red-700 hover:text-red-800"
          >
            Apply for an election office
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((a) => {
            const el = elections.find((e) => e.id === a.electionId)
            const posTitle =
              positions.find((p) => p.id === a.positionId)?.title ??
              a.positionId
            const submitted = new Date(a.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
            return (
              <li
                key={a.id}
                className="flex flex-wrap gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
              >
                {a.ballotPhotoDataUrl ? (
                  <img
                    src={a.ballotPhotoDataUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-red-950/50"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-stone-50 text-xs text-stone-600">
                    No photo
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800">
                    {el?.title ?? 'Election'}{' '}
                    {el ? (
                      <span className="font-normal text-stone-500">
                        (ID {el.displayId})
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-stone-400">
                    Office:{' '}
                    <span className="text-stone-700">{posTitle}</span>
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    Submitted {submitted}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(a.status)}`}
                  >
                    {statusLabel[a.status]}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
