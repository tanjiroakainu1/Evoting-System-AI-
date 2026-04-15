import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { formatElectionPeriod } from '../../lib/electionDisplay'
import {
  getElections,
  getEnrollmentForVoter,
} from '../../lib/electionsStorage'
import {
  type ElectionRecord,
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../../types/election'

const stat =
  'rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-md shadow-stone-200/50 transition-all duration-200 hover:border-red-300 hover:shadow-lg'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-stone-200 py-3 last:border-0 sm:flex-row sm:justify-between">
      <dt className="text-xs font-medium uppercase tracking-wide text-red-700/80">
        {label}
      </dt>
      <dd className="text-sm text-stone-800">{value || '—'}</dd>
    </div>
  )
}

export function VoterDashboard() {
  const { user } = useAuth()
  const [elections, setElections] = useState<ElectionRecord[]>(getElections)

  useEffect(() => {
    function sync() {
      setElections(getElections())
    }
    sync()
    window.addEventListener('bevms-elections', sync)
    return () => window.removeEventListener('bevms-elections', sync)
  }, [])

  if (!user) return null

  const enrolledActive = elections.filter((e) => {
    if (getElectionLifecycleStatus(e) !== 'active') return false
    return getEnrollmentForVoter(e.id, user.id) !== undefined
  })

  const enrolledUpcoming = elections.filter((e) => {
    if (getElectionLifecycleStatus(e) !== 'scheduled') return false
    return getEnrollmentForVoter(e.id, user.id) !== undefined
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500">
              Ballot access
            </p>
            <p className="text-sm text-stone-600">
              View all elections you are enrolled in and open each ballot.
            </p>
          </div>
          <Link
            to="/voter/elections"
            className="font-display inline-flex items-center rounded-lg border border-red-600 bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Open elections
          </Link>
          <Link
            to="/voter/ballot-history"
            className="font-display inline-flex items-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-red-300 hover:text-red-800"
          >
            Ballot history
          </Link>
        </div>
      </section>

      {enrolledActive.length > 0 ? (
        <section className="rounded-2xl border border-red-500/35 bg-gradient-to-br from-red-950/40 to-stone-50 p-6 shadow-lg ring-1 ring-red-800/30">
          <h2 className="font-display text-lg font-semibold text-red-900">
            You can vote now
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            These elections are open. Use your election PIN if prompted.
          </p>
          <ul className="mt-4 space-y-3">
            {enrolledActive.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-300 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-900">{e.title}</p>
                  <p className="text-xs text-stone-500">
                    {e.organizationType} ·{' '}
                    {formatElectionPeriod(e.startAt, e.endAt)}
                  </p>
                </div>
                <Link
                  to={`/voter/vote/${e.id}`}
                  className="font-display inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 px-6 py-3 text-center text-sm font-semibold tracking-wide text-white shadow-lg shadow-red-950/35 transition-all hover:from-red-500 active:scale-[0.99]"
                >
                  Vote now
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {enrolledUpcoming.length > 0 ? (
        <section className="rounded-2xl border border-amber-900/35 bg-amber-50 p-6 ring-1 ring-amber-900/25">
          <h2 className="font-display text-lg font-semibold text-amber-900">
            Upcoming elections
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-500">
            {enrolledUpcoming.map((e) => (
              <li key={e.id}>
                <span className="text-stone-700">{e.title}</span> ·{' '}
                {electionStatusLabel(getElectionLifecycleStatus(e))} ·{' '}
                {formatElectionPeriod(e.startAt, e.endAt)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="rounded-2xl border border-stone-200 bg-white border border-stone-200 shadow-sm p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200 backdrop-blur-sm sm:flex sm:items-start sm:gap-8 sm:p-7">
        {user.profilePhotoDataUrl ? (
          <img
            src={user.profilePhotoDataUrl}
            alt=""
            className="mx-auto h-28 w-28 shrink-0 rounded-2xl border border-stone-200 object-cover sm:mx-0"
          />
        ) : null}
        <div className="mt-4 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
            Voter portal
          </h1>
          <p className="mt-1 text-lg text-stone-700">{user.fullName}</p>
          <p className="mt-2 text-sm text-stone-500">
            {user.accountType ?? 'Voter'} · {user.email}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-500">
            View your registration details and cast your ballot when the
            election window opens.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <dl className={stat}>
          <h2 className="font-display mb-3 text-sm font-semibold tracking-wide text-red-900">
            Personal
          </h2>
          <Row label="Gender" value={user.gender ?? ''} />
          <Row label="Birthday" value={user.birthday ?? ''} />
          <Row label="Citizenship" value={user.citizenship ?? ''} />
          <Row label="Civil status" value={user.civilStatus ?? ''} />
          <Row label="Contact" value={user.contactNumber ?? ''} />
          <Row
            label="Address"
            value={
              [user.barangay, user.townCity, user.province, user.zipCode]
                .filter(Boolean)
                .join(', ') || ''
            }
          />
        </dl>
        <dl className={stat}>
          <h2 className="font-display mb-3 text-sm font-semibold tracking-wide text-red-900">
            Educational
          </h2>
          <Row label="Campus" value={user.campus ?? ''} />
          <Row label="ID number" value={user.idNumber ?? ''} />
          <Row label="Department" value={user.department ?? ''} />
          <Row label="Course" value={user.course ?? ''} />
          <Row label="Year" value={user.year ?? ''} />
          <Row label="Academic year" value={user.academicYear ?? ''} />
          <Row label="Semester" value={user.semester ?? ''} />
          <Row label="Student status" value={user.studentStatus ?? ''} />
        </dl>
      </div>
    </div>
  )
}
