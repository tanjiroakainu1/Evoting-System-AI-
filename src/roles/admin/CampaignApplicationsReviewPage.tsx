import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import type { CampaignApplicationRecord } from '../../types/election'
import { getAllUsers } from '../../lib/authStorage'
import {
  approveCampaignApplication,
  getElectionById,
  getPositions,
  listPendingCampaignApplications,
  rejectCampaignApplication,
} from '../../lib/electionsStorage'

const btnOk =
  'rounded-lg border border-emerald-800/50 bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-900/50'
const btnDanger =
  'rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200'

export function CampaignApplicationsReviewPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<CampaignApplicationRecord[]>(
    listPendingCampaignApplications,
  )
  const [error, setError] = useState<string | null>(null)

  function refresh() {
    setRows(listPendingCampaignApplications())
  }

  useEffect(() => {
    function onEvt() {
      refresh()
    }
    onEvt()
    window.addEventListener('bevms-elections', onEvt)
    return () => window.removeEventListener('bevms-elections', onEvt)
  }, [])

  const positions = getPositions()
  const positionTitle = (id: string) =>
    positions.find((p) => p.id === id)?.title ?? id

  function nameFor(userId: string) {
    return getAllUsers().find((u) => u.id === userId)?.fullName ?? userId
  }

  function onApprove(id: string) {
    if (!user) return
    setError(null)
    try {
      approveCampaignApplication(id, {
        userId: user.id,
        fullName: user.fullName,
      })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not approve.')
    }
  }

  function onReject(id: string) {
    if (!user) return
    setError(null)
    try {
      rejectCampaignApplication(id, {
        userId: user.id,
        fullName: user.fullName,
      })
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reject.')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center text-stone-400">
        Only administrators can review campaign applications.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Campaign applications
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          Only <strong className="font-medium text-stone-400">candidate</strong>{' '}
          accounts can file these applications. Approve to place them on the
          ballot, or reject to decline the filing.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
          No pending applications.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((a) => {
            const el = getElectionById(a.electionId)
            return (
              <li
                key={a.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-lg ring-1 ring-stone-200/90"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-red-900">
                      {nameFor(a.candidateUserId)}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Election:{' '}
                      <span className="text-stone-700">
                        {el?.title ?? a.electionId}
                      </span>
                    </p>
                    <p className="text-sm text-stone-500">
                      Position:{' '}
                      <span className="text-stone-700">
                        {positionTitle(a.positionId)}
                      </span>
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-stone-400">
                      {a.platform}
                    </p>
                  </div>
                  {a.ballotPhotoDataUrl ? (
                    <img
                      src={a.ballotPhotoDataUrl}
                      alt="Campaign"
                      className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-red-950/50"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={btnOk}
                    onClick={() => onApprove(a.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className={btnDanger}
                    onClick={() => onReject(a.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
