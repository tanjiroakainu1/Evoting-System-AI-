import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import {
  electionActivityActionLabel,
  getElectionActivityLogs,
  type ElectionActivityLogEntry,
} from '../../lib/electionActivityLog'
import { getEnrollmentForVoter } from '../../lib/electionsStorage'
import { rolePath } from '../../lib/rolePaths'

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function VoterBallotHistoryPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<ElectionActivityLogEntry[]>(() =>
    getElectionActivityLogs(),
  )

  useEffect(() => {
    function onLog() {
      setRows(getElectionActivityLogs())
    }
    window.addEventListener('bevms-election-activity-log', onLog)
    return () => window.removeEventListener('bevms-election-activity-log', onLog)
  }, [])

  const mine = useMemo(() => {
    if (!user || user.role !== 'voter') return []
    return rows.filter(
      (r) => r.action === 'vote_cast' && r.actorUserId === user.id,
    )
  }, [rows, user])

  const electionPinByElectionId = useMemo(() => {
    if (!user || user.role !== 'voter') return {}
    const out: Record<string, string> = {}
    for (const row of mine) {
      const enrollment = getEnrollmentForVoter(row.electionId, user.id)
      if (enrollment?.pin) out[row.electionId] = enrollment.pin
    }
    return out
  }, [mine, user])

  if (!user || user.role !== 'voter') {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center text-stone-500">
        Only voter accounts can open this page.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90 sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Submitted ballot history
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Timeline of your ballot submissions. Each entry records election,
          timestamp, and vote details captured in the system logs.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 sm:p-6">
        {mine.length === 0 ? (
          <p className="text-sm text-stone-500">
            No submitted ballot history yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {mine.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-stone-800">
                  {electionActivityActionLabel(row.action)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatWhen(row.at)} · {row.electionTitle} (ID{' '}
                  {row.electionDisplayId})
                </p>
                {electionPinByElectionId[row.electionId] ? (
                  <p className="mt-2">
                    <span className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-900">
                      Election PIN:{' '}
                      <span className="ml-1 font-mono tracking-widest">
                        {electionPinByElectionId[row.electionId]}
                      </span>
                    </span>
                  </p>
                ) : null}
                {row.detail ? (
                  <p className="mt-1 text-xs text-stone-600">{row.detail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div>
        <Link
          to={rolePath('voter', 'elections')}
          className="text-sm text-red-700 hover:text-red-800"
        >
          ← Back to elections
        </Link>
      </div>
    </div>
  )
}
