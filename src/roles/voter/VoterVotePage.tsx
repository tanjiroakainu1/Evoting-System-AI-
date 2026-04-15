import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import type { ElectionRecord, ElectionVoterEnrollment } from '../../types/election'
import {
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../../types/election'
import { formatElectionPeriod } from '../../lib/electionDisplay'
import { getAllUsers } from '../../lib/authStorage'
import {
  castBallotVotes,
  getApprovedApplicationsForBallot,
  getElectionById,
  getEnrollmentForVoter,
  getVoterBallotSelections,
  hasVoterSubmittedBallot,
} from '../../lib/electionsStorage'
import { roleBasePath } from '../../lib/rolePaths'

type ActiveBallotProps = {
  election: ElectionRecord
  electionId: string
  userId: string
  enrollment: ElectionVoterEnrollment
  statusLabel: string
}

function VoterActiveBallotForm({
  election,
  electionId,
  userId,
  enrollment,
  statusLabel,
}: ActiveBallotProps) {
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    getVoterBallotSelections(electionId, userId),
  )
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    function syncFromStorage() {
      setChoices(getVoterBallotSelections(electionId, userId))
    }
    window.addEventListener('bevms-elections', syncFromStorage)
    return () => window.removeEventListener('bevms-elections', syncFromStorage)
  }, [electionId, userId])

  const users = getAllUsers()
  const allComplete = election.positionIds.every((pid) => choices[pid])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setSavedMsg(null)
    try {
      castBallotVotes({
        electionId: election.id,
        voterUserId: userId,
        choices,
      })
      setSavedMsg('Ballot saved. Thank you for voting.')
    } catch (errSubmit) {
      setErr(
        errSubmit instanceof Error
          ? errSubmit.message
          : 'Could not save ballot.',
      )
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90 sm:p-8">
        <p className="text-xs uppercase tracking-wider text-stone-500">
          {statusLabel}
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-red-900">
          {election.title}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{election.organizationType}</p>
        <p className="mt-2 text-sm text-stone-500">
          Voting window:{' '}
          {formatElectionPeriod(election.startAt, election.endAt)}
        </p>
        {election.votingVenue ? (
          <p className="mt-1 text-sm text-stone-500">Venue: {election.votingVenue}</p>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
      >
        <h2 className="font-display text-lg font-semibold text-red-900">
          Ballot
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Select one candidate per office. Ballot submission is allowed once per
          election.
        </p>
        <ul className="mt-4 space-y-6">
          {election.positionIds.map((positionId, idx) => {
            const title = election.positionTitles[idx] ?? positionId
            const apps = getApprovedApplicationsForBallot(election.id, positionId)
            return (
              <li
                key={positionId}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <p className="text-sm font-medium text-red-800/90">{title}</p>
                {apps.length === 0 ? (
                  <p className="mt-2 text-xs text-stone-600">
                    No approved candidates yet for this office.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {apps.map((a) => {
                      const uid = a.candidateUserId
                      const name =
                        users.find((x) => x.id === uid)?.fullName ?? 'Candidate'
                      const img =
                        a.ballotPhotoDataUrl ||
                        users.find((x) => x.id === uid)?.profilePhotoDataUrl
                      const sel = choices[positionId] === a.id
                      return (
                        <li key={a.id}>
                          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-red-950/50 hover:bg-stone-50/80">
                            <input
                              type="radio"
                              name={`pos-${positionId}`}
                              checked={sel}
                              onChange={() =>
                                setChoices((c) => ({
                                  ...c,
                                  [positionId]: a.id,
                                }))
                              }
                              className="border-red-800 bg-white text-red-600 focus:ring-red-500/40"
                            />
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="h-11 w-11 rounded-lg object-cover ring-1 ring-red-950/40"
                              />
                            ) : (
                              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-50 text-xs text-stone-600">
                                —
                              </span>
                            )}
                            <span className="text-sm text-stone-800">{name}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
        {err ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}
        {savedMsg ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {savedMsg}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!allComplete}
          className="font-display mt-8 w-full max-w-md rounded-xl border border-red-600 bg-red-700 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/20 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Submit ballot
        </button>
      </form>

      <p className="text-center text-xs text-stone-600">
        Your election PIN ends in ···{enrollment.pin.slice(-2)} (use the full
        6-digit PIN issued by the administrator).
      </p>

      <div className="text-center">
        <Link
          to={roleBasePath('voter')}
          className="text-sm text-red-700 hover:text-red-800"
        >
          ← Back to voter dashboard
        </Link>
      </div>
    </div>
  )
}

export function VoterVotePage() {
  const { electionId } = useParams<{ electionId: string }>()
  const { user } = useAuth()

  if (!user || user.role !== 'voter') {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center">
        <p className="text-stone-400">Only voter accounts can open this page.</p>
        <Link to={roleBasePath('voter')} className="mt-4 inline-block text-red-700 hover:text-red-800">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!electionId) {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center text-stone-400">
        Missing election.
      </div>
    )
  }

  const election = getElectionById(electionId)
  const enrollment = getEnrollmentForVoter(electionId, user.id)
  const status = election ? getElectionLifecycleStatus(election) : null
  const alreadySubmitted = election
    ? hasVoterSubmittedBallot(election.id, user.id)
    : false

  if (!election) {
    return (
      <div className="rounded-2xl border border-stone-300 bg-white p-8">
        <p className="text-stone-400">This election was not found.</p>
        <Link to={roleBasePath('voter')} className="mt-4 inline-block text-red-700 hover:text-red-800">
          ← Voter dashboard
        </Link>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="rounded-2xl border border-amber-900/40 bg-amber-50 p-8">
        <h1 className="font-display text-xl font-semibold text-amber-900">
          Not enrolled
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          You are not on the voter list for “{election.title}”. Contact the
          administrator if this is a mistake.
        </p>
        <Link to={roleBasePath('voter')} className="mt-6 inline-block text-red-700 hover:text-red-800">
          ← Voter dashboard
        </Link>
      </div>
    )
  }

  if (alreadySubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-8">
        <h1 className="font-display text-xl font-semibold text-emerald-900">
          Ballot already submitted
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Your vote for “{election.title}” is already recorded. Voting again is
          restricted for this election.
        </p>
        <Link
          to={roleBasePath('voter')}
          className="mt-6 inline-block text-red-700 hover:text-red-800"
        >
          ← Voter dashboard
        </Link>
      </div>
    )
  }

  if (status === 'scheduled') {
    return (
      <div className="rounded-2xl border border-amber-900/40 bg-amber-50 p-8">
        <h1 className="font-display text-xl font-semibold text-amber-900">
          Voting not open yet
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          {election.title} · Opens {formatElectionPeriod(election.startAt, election.endAt)}
        </p>
        <Link to={roleBasePath('voter')} className="mt-6 inline-block text-red-700 hover:text-red-800">
          ← Voter dashboard
        </Link>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
        <h1 className="font-display text-xl font-semibold text-stone-700">
          Election closed
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          “{election.title}” has ended. Voting is no longer available.
        </p>
        <Link to={roleBasePath('voter')} className="mt-6 inline-block text-red-700 hover:text-red-800">
          ← Voter dashboard
        </Link>
      </div>
    )
  }

  return (
    <VoterActiveBallotForm
      key={`${electionId}-${user.id}`}
      election={election}
      electionId={electionId}
      userId={user.id}
      enrollment={enrollment}
      statusLabel={electionStatusLabel(status!)}
    />
  )
}
