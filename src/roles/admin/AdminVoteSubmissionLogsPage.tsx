import { useEffect, useMemo, useState } from 'react'
import {
  electionActivityActionLabel,
  getElectionActivityLogs,
  type ElectionActivityLogEntry,
} from '../../lib/electionActivityLog'
import { getRoleDisplayLabel } from '../../types/roles'

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

export function AdminVoteSubmissionLogsPage() {
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

  const voteRows = useMemo(
    () => rows.filter((r) => r.action === 'vote_cast'),
    [rows],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90 sm:p-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Submitted ballot logs
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Recent ballot submissions from voter accounts, visible to
          administrator-level users for audit and monitoring.
        </p>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 sm:p-6">
        {voteRows.length === 0 ? (
          <p className="text-sm text-stone-500">No submitted ballots yet.</p>
        ) : (
          <ul className="space-y-3">
            {voteRows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-stone-800">
                  {electionActivityActionLabel(row.action)} · {row.electionTitle}{' '}
                  (ID {row.electionDisplayId})
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatWhen(row.at)} · {getRoleDisplayLabel(row.actorRole)} ·{' '}
                  {row.actorEmail}
                </p>
                {row.detail ? (
                  <p className="mt-1 text-xs text-stone-600">{row.detail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
