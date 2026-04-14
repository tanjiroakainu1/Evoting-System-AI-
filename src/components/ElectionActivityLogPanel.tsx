import { useEffect, useState } from 'react'
import {
  electionActivityActionLabel,
  getElectionActivityLogs,
  type ElectionActivityLogEntry,
} from '../lib/electionActivityLog'
import { getRoleDisplayLabel } from '../types/roles'

const panelClass =
  'rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 sm:p-6'

type Props = {
  /** Max rows to show (newest first). */
  limit?: number
  title?: string
}

type WhenParts = { datePart: string; timePart: string; longDate: string }

/** Local calendar date + time for audit (year, month, day explicit). */
function parseWhen(iso: string): WhenParts | null {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const datePart = `${y}-${mo}-${day}`
    const timePart = d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })
    const longDate = d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return { datePart, timePart, longDate }
  } catch {
    return null
  }
}

function LogWhenPrefix({ iso }: { iso: string }) {
  const fmt = parseWhen(iso)
  if (!fmt) {
    return (
      <>
        <span className="font-mono text-stone-400">{iso}</span>
        <span className="text-stone-600"> · </span>
      </>
    )
  }
  return (
    <>
      <span className="font-mono tabular-nums text-stone-400">
        {fmt.datePart}
      </span>
      <span className="text-stone-600"> · </span>
      <span className="tabular-nums text-stone-400">{fmt.timePart}</span>
      <span className="text-stone-600"> · </span>
      <span className="text-stone-500">{fmt.longDate}</span>
      <span className="text-stone-600"> · </span>
    </>
  )
}

export function ElectionActivityLogPanel({ limit = 25, title }: Props) {
  const [rows, setRows] = useState<ElectionActivityLogEntry[]>(() =>
    getElectionActivityLogs().slice(0, limit),
  )

  useEffect(() => {
    function onLog() {
      setRows(getElectionActivityLogs().slice(0, limit))
    }
    window.addEventListener('bevms-election-activity-log', onLog)
    return () =>
      window.removeEventListener('bevms-election-activity-log', onLog)
  }, [limit])

  return (
    <section className={panelClass}>
      <h2 className="font-display text-lg font-semibold text-red-900">
        {title ?? 'System logs'}
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Shared audit trail: election create, update, delete, backup manual
        completion, and official results releases from the administrator, MIS
        Office, or OSA Office consoles. Each row shows calendar date
        (year-month-day), time, and the account email.
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">No activity yet.</p>
      ) : (
        <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1 text-sm">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2.5"
            >
              <p className="font-medium text-stone-800">
                {electionActivityActionLabel(r.action)}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                <LogWhenPrefix iso={r.at} />
                <span className="text-stone-400">{r.electionTitle}</span> (ID{' '}
                <span className="font-mono tabular-nums text-stone-400">
                  {r.electionDisplayId}
                </span>
                )
              </p>
              <p className="mt-1 text-xs text-stone-600">
                <span className="text-stone-500">
                  {getRoleDisplayLabel(r.actorRole)}
                </span>
                {' · '}
                <span className="font-mono text-stone-400">{r.actorEmail}</span>
              </p>
              {r.detail ? (
                <p className="mt-1 text-xs text-stone-600">{r.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
