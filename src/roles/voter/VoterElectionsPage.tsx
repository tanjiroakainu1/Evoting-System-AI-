import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { formatElectionPeriod } from '../../lib/electionDisplay'
import {
  getApprovedApplicationsForBallot,
  getElectionById,
  getElections,
  getEnrollmentForVoter,
} from '../../lib/electionsStorage'
import {
  electionStatusLabel,
  getElectionLifecycleStatus,
  type ElectionRecord,
} from '../../types/election'

type ElectionBallotSummary = {
  election: ElectionRecord
  approvedCandidates: number
  approvedPositions: number
}

function summarizeApprovedBallot(election: ElectionRecord): ElectionBallotSummary {
  let approvedCandidates = 0
  let approvedPositions = 0
  for (const positionId of election.positionIds) {
    const rows = getApprovedApplicationsForBallot(election.id, positionId)
    approvedCandidates += rows.length
    if (rows.length > 0) approvedPositions += 1
  }
  return { election, approvedCandidates, approvedPositions }
}

export function VoterElectionsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<ElectionBallotSummary[]>([])

  useEffect(() => {
    function sync() {
      if (!user || user.role !== 'voter') {
        setRows([])
        return
      }
      const eligible = getElections()
        .filter((e) => getEnrollmentForVoter(e.id, user.id))
        .map((e) => {
          const latest = getElectionById(e.id) ?? e
          return summarizeApprovedBallot(latest)
        })
      setRows(eligible)
    }
    sync()
    window.addEventListener('bevms-elections', sync)
    return () => window.removeEventListener('bevms-elections', sync)
  }, [user])

  if (!user || user.role !== 'voter') return null

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-wider text-stone-500">Voter ballot</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Elections available to vote
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          These elections are created by Admin, MIS Office, or OSA Office. Open
          each election to choose from approved candidates per office and submit
          your ballot.
        </p>
      </div>

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">
            No enrolled elections yet. Contact administrators if you should be
            included in an election voter list.
          </p>
        </section>
      ) : (
        <div className="space-y-3">
          {rows.map(({ election, approvedCandidates, approvedPositions }) => {
            const status = getElectionLifecycleStatus(election)
            return (
              <article
                key={election.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-semibold text-red-900">
                      {election.title}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {election.organizationType || 'General election'}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {formatElectionPeriod(election.startAt, election.endAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      status === 'active'
                        ? 'bg-red-50 text-red-800'
                        : status === 'scheduled'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {electionStatusLabel(status)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-stone-600 sm:grid-cols-2">
                  <p>
                    Approved candidates: <strong>{approvedCandidates}</strong>
                  </p>
                  <p>
                    Offices with choices: <strong>{approvedPositions}</strong> /{' '}
                    {election.positionIds.length}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/voter/vote/${election.id}`}
                    className="font-display inline-flex items-center justify-center rounded-xl border border-red-600 bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    Open ballot
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
