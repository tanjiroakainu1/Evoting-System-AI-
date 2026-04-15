import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import type { ElectionActivityActorRole } from '../../lib/electionActivityLog'
import {
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../../types/election'
import { formatElectionDateTimeCell } from '../../lib/electionDisplay'
import { rolePath } from '../../lib/rolePaths'
import { ElectionResultsExportButtons } from '../../components/ElectionResultsExportButtons'
import { getElectionResultsDetail, getElections } from '../../lib/electionsStorage'
import type { AppRole } from '../../types/roles'
import { getRoleDisplayLabel } from '../../types/roles'

const btnPrimary =
  'inline-flex rounded-lg border border-red-600 bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800'

export function ElectionResultsPage(props?: {
  pathRole?: ElectionActivityActorRole
}) {
  const pathRole = props?.pathRole ?? 'admin'
  const { user } = useAuth()
  const [elections, setElections] = useState(getElections)

  useEffect(() => {
    function onEvt() {
      setElections(getElections())
    }
    onEvt()
    window.addEventListener('bevms-elections', onEvt)
    return () => window.removeEventListener('bevms-elections', onEvt)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider text-stone-500">
          Election Results
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Election Results
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {user?.fullName ?? '—'} ·{' '}
          <span className="text-stone-400">
            {getRoleDisplayLabel(pathRole)}
          </span>
        </p>
        <p className="mt-3 max-w-2xl text-sm text-stone-500">
          View turnout and ranked results per office. Use{' '}
          <span className="text-stone-400">Export PDF</span> or{' '}
          <span className="text-stone-400">Export Excel</span> from the list or
          the detail page (Excel downloads as UTF-8 CSV).
        </p>
      </div>

      <div className="space-y-3 md:hidden">
        {elections.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white px-4 py-6 text-center text-sm text-stone-500">
            No elections available.
          </p>
        ) : null}
        {elections.map((el) => {
          const st = getElectionLifecycleStatus(el)
          const detail = getElectionResultsDetail(el.id)
          return (
            <article
              key={el.id}
              className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <h3 className="font-medium text-stone-800">{el.title}</h3>
              <p className="mt-2 text-xs text-stone-500">
                Start: {formatElectionDateTimeCell(el.startAt)}
              </p>
              <p className="text-xs text-stone-500">
                End: {formatElectionDateTimeCell(el.endAt)}
              </p>
              <p
                className={`mt-2 text-sm ${
                  st === 'active'
                    ? 'text-red-800'
                    : st === 'completed'
                      ? 'text-stone-500'
                      : 'text-amber-800'
                }`}
              >
                {electionStatusLabel(st)}
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  to={rolePath(pathRole as AppRole, 'election-results', el.id)}
                  className={`${btnPrimary} justify-center text-center`}
                >
                  View results
                </Link>
                {detail ? (
                  <ElectionResultsExportButtons detail={detail} />
                ) : (
                  <p className="text-xs text-stone-600">No results data</p>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-stone-200 md:block">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
              <th className="px-3 py-3 font-medium text-red-800/80">
                Election Title
              </th>
              <th className="px-3 py-3 font-medium text-red-800/80">
                Start Date
              </th>
              <th className="px-3 py-3 font-medium text-red-800/80">End Date</th>
              <th className="px-3 py-3 font-medium text-red-800/80">Status</th>
              <th className="px-3 py-3 font-medium text-red-800/80">Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map((el) => {
              const st = getElectionLifecycleStatus(el)
              const detail = getElectionResultsDetail(el.id)
              return (
                <tr
                  key={el.id}
                  className="border-b border-stone-200/80 last:border-0 hover:bg-stone-50/80"
                >
                  <td className="px-3 py-2 font-medium text-stone-800">
                    {el.title}
                  </td>
                  <td className="px-3 py-2 text-stone-400">
                    {formatElectionDateTimeCell(el.startAt)}
                  </td>
                  <td className="px-3 py-2 text-stone-400">
                    {formatElectionDateTimeCell(el.endAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        st === 'active'
                          ? 'text-red-800'
                          : st === 'completed'
                            ? 'text-stone-500'
                            : 'text-amber-800'
                      }
                    >
                      {electionStatusLabel(st)}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex min-w-[12rem] flex-col gap-2">
                      <Link
                        to={rolePath(
                          pathRole as AppRole,
                          'election-results',
                          el.id,
                        )}
                        className={`${btnPrimary} justify-center`}
                      >
                        View results
                      </Link>
                      {detail ? (
                        <ElectionResultsExportButtons detail={detail} />
                      ) : (
                        <p className="text-xs text-stone-600">No results data</p>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
