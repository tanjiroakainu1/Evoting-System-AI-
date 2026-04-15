import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { electionActivityActorFromUser } from '../../lib/electionActivityLog'
import type { ElectionActivityActorRole } from '../../lib/electionActivityLog'
import {
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../../types/election'
import { formatElectionDateTimeCell } from '../../lib/electionDisplay'
import { rolePath } from '../../lib/rolePaths'
import {
  getElectionResultsDetail,
  publishOfficialElectionResults,
} from '../../lib/electionsStorage'
import type { AppRole } from '../../types/roles'
import { getRoleDisplayLabel } from '../../types/roles'
import { ElectionResultsExportButtons } from '../../components/ElectionResultsExportButtons'

const btnPublish =
  'rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-900/50'

export function ElectionResultDetailPage(props?: {
  pathRole?: ElectionActivityActorRole
}) {
  const pathRole = props?.pathRole ?? 'admin'
  const { electionId } = useParams<{ electionId: string }>()
  const { user } = useAuth()
  const detail = electionId ? getElectionResultsDetail(electionId) : undefined
  const [publishOk, setPublishOk] = useState<string | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const actor = electionActivityActorFromUser(user)

  const resultsIndex = rolePath(pathRole as AppRole, 'election-results')

  if (!electionId || !detail) {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8">
        <p className="text-stone-400">Election not found.</p>
        <Link
          to={resultsIndex}
          className="mt-4 inline-block text-red-700 hover:text-red-800"
        >
          ← Election results
        </Link>
      </div>
    )
  }

  const { election } = detail
  const st = getElectionLifecycleStatus(election)

  function onPublishOfficial() {
    if (!electionId || !actor) return
    setPublishOk(null)
    setPublishError(null)
    try {
      publishOfficialElectionResults(electionId, actor)
      setPublishOk(
        'Official results release recorded and logged with your email. MIS and OSA dashboards show the system log with date and time.',
      )
    } catch (e) {
      setPublishError(
        e instanceof Error ? e.message : 'Could not record official release.',
      )
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <Link
          to={resultsIndex}
          className="text-sm text-red-700 hover:text-red-800"
        >
          ← All elections
        </Link>
        <p className="mt-4 text-xs uppercase tracking-wider text-stone-500">
          Election Results: {election.title}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Election Results: {election.title}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {user?.fullName ?? '—'} ·{' '}
          <span className="text-stone-400">
            {getRoleDisplayLabel(pathRole)}
          </span>{' '}
          · Election ID{' '}
          <span className="font-mono text-stone-400">{election.displayId}</span>{' '}
          ·{' '}
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
        </p>
        <p className="mt-2 text-xs text-stone-600">
          {formatElectionDateTimeCell(election.startAt)} —{' '}
          {formatElectionDateTimeCell(election.endAt)}
        </p>
        <ElectionResultsExportButtons detail={detail} className="mt-5" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-800/80">
            Total Eligible Voters
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-red-900">
            {detail.eligibleVoters}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-800/80">
            Total Votes Cast
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-red-900">
            {detail.votersParticipated}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            Voters who submitted at least one choice
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-red-800/80">
            Voter Turnout
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-red-900">
            {detail.turnoutPercent}%
          </p>
        </div>
      </div>

      {detail.positions.map((block) => (
        <section
          key={block.positionId}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90"
        >
          <h2 className="font-display text-lg font-semibold text-red-900">
            {block.positionTitle}
          </h2>
          <div className="mt-4 space-y-3 md:hidden">
            {block.rows.map((row) => (
              <article
                key={row.applicationId}
                className="rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <div className="flex items-center gap-3">
                  {row.ballotPhotoDataUrl ? (
                    <img
                      src={row.ballotPhotoDataUrl}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-red-950/50"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs text-stone-600">
                      —
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">
                      {row.candidateName}
                    </p>
                    <p className="text-xs text-stone-500">Rank #{row.rank}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-mono text-red-800/90">{row.votes} votes</span>
                  <span className="text-stone-500">{row.percentage}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500/90 transition-all"
                    style={{ width: `${Math.min(100, row.percentage)}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-stone-200 md:block">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                  <th className="px-3 py-3 font-medium text-red-800/80">Rank</th>
                  <th className="px-3 py-3 font-medium text-red-800/80">
                    Candidate
                  </th>
                  <th className="px-3 py-3 font-medium text-red-800/80">Votes</th>
                  <th className="px-3 py-3 font-medium text-red-800/80">
                    Percentage
                  </th>
                  <th className="px-3 py-3 font-medium text-red-800/80 min-w-[8rem]">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr
                    key={row.applicationId}
                    className="border-b border-stone-200/80 last:border-0"
                  >
                    <td className="px-3 py-2 font-mono text-stone-700">
                      {row.rank}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {row.ballotPhotoDataUrl ? (
                          <img
                            src={row.ballotPhotoDataUrl}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover ring-1 ring-red-950/50"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs text-stone-600">
                            —
                          </span>
                        )}
                        <span className="font-medium text-stone-800">
                          {row.candidateName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-red-800/90">
                      {row.votes}
                    </td>
                    <td className="px-3 py-2 text-stone-400">
                      {row.percentage}%
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-2 w-full min-w-[6rem] overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500/90 transition-all"
                          style={{ width: `${Math.min(100, row.percentage)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {actor ? (
        <section className="rounded-2xl border border-amber-900/35 bg-amber-50 p-6 ring-1 ring-amber-900/25">
          <h2 className="font-display text-lg font-semibold text-amber-900">
            Official results release
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Record that official results for this election have been created or
            posted. This is stored locally and appears in System logs on the MIS
            and OSA office dashboards (role, email, date, and time).
          </p>
          {publishError ? (
            <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
              {publishError}
            </p>
          ) : null}
          {publishOk ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {publishOk}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onPublishOfficial}
            className={`${btnPublish} mt-4`}
          >
            Record official results release
          </button>
        </section>
      ) : null}
    </div>
  )
}
