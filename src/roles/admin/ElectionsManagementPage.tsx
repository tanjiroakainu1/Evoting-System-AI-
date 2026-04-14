import QRCode from 'react-qr-code'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import {
  type ElectionRecord,
  electionStatusLabel,
  getElectionLifecycleStatus,
} from '../../types/election'
import { ELECTION_ORGANIZATION_OPTIONS } from '../../lib/electionConstants'
import {
  formatElectionDateTimeCell,
  formatElectionPeriod,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '../../lib/electionDisplay'
import { electionActivityActorFromUser } from '../../lib/electionActivityLog'
import type { ElectionActivityActorRole } from '../../lib/electionActivityLog'
import {
  createElection,
  deleteElection,
  getElectionById,
  getElections,
  getEnrollmentsForElection,
  getPositions,
  getVotingUrlForElection,
  markElectionManuallyCompleted,
  updateElection,
} from '../../lib/electionsStorage'

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 shadow-inner shadow-stone-300/40 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const btn =
  'rounded-lg border border-red-800/50 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-900/50'

const btnPrimary =
  'rounded-lg border border-red-600 bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800'

const btnDanger =
  'rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200'

const btnComplete =
  'rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200'

function printPinsSheet(election: ElectionRecord) {
  const rows = getEnrollmentsForElection(election.id)
  const w = window.open('', '_blank')
  if (!w) return
  const body = rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.voterName)}</td><td>${escapeHtml(r.voterEmail)}</td><td>${escapeHtml(r.pin)}</td></tr>`,
    )
    .join('')
  w.document.open()
  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>PINs — ${escapeHtml(election.title)}</title><style>body{font-family:sans-serif;padding:24px;color:#111}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}.election-pin{font-family:monospace;font-size:1.1rem;font-weight:600}</style></head><body><h1>${escapeHtml(election.title)}</h1><p>Election ID: ${election.displayId}</p><p>Election PIN (system): <span class="election-pin">${escapeHtml(election.electionPin)}</span> — one per election; voter rows below use individual PINs.</p><table><thead><tr><th>Name</th><th>Email</th><th>Voter PIN (6 digits)</th></tr></thead><tbody>${body}</tbody></table></body></html>`,
  )
  w.document.close()
  w.focus()
  w.print()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function ElectionsManagementPage(props?: {
  pathRole?: ElectionActivityActorRole
}) {
  const pathRole = props?.pathRole ?? 'admin'
  const { user } = useAuth()
  const [elections, setElections] = useState(getElections)
  const [positions, setPositions] = useState(getPositions)
  const [pinsElectionId, setPinsElectionId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [organizationType, setOrganizationType] = useState('')
  const [votingVenue, setVotingVenue] = useState('')
  const [policies, setPolicies] = useState('')
  const now = new Date()
  const [startLocal, setStartLocal] = useState(() =>
    toDatetimeLocalValue(new Date(now.getTime() + 60 * 60 * 1000)),
  )
  const [endLocal, setEndLocal] = useState(() =>
    toDatetimeLocalValue(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
  )
  const [selectedPositionIds, setSelectedPositionIds] = useState<Set<string>>(
    () => new Set(),
  )

  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [detailId, setDetailId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editOrg, setEditOrg] = useState('')
  const [editVenue, setEditVenue] = useState('')
  const [editPolicies, setEditPolicies] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editPositions, setEditPositions] = useState<Set<string>>(new Set())
  const [detailError, setDetailError] = useState<string | null>(null)

  function refresh() {
    const el = getElections()
    setElections(el)
    setPositions(getPositions())
    setPinsElectionId((prev) => {
      if (prev && el.some((e) => e.id === prev)) return prev
      return el[0]?.id ?? null
    })
  }

  useEffect(() => {
    function onEvt() {
      refresh()
    }
    onEvt()
    window.addEventListener('bevms-elections', onEvt)
    return () => window.removeEventListener('bevms-elections', onEvt)
  }, [])

  const detailElection = detailId ? getElectionById(detailId) : undefined
  const pinsRows = pinsElectionId
    ? getEnrollmentsForElection(pinsElectionId)
    : []
  const pinsElection = pinsElectionId
    ? getElectionById(pinsElectionId)
    : undefined

  function toggleCreatePosition(id: string) {
    setSelectedPositionIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleEditPosition(id: string) {
    setEditPositions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setFormError(null)
    setFormSuccess(null)
    try {
      const ids = [...selectedPositionIds]
      const election = createElection({
        title,
        description,
        organizationType,
        votingVenue,
        policies,
        startAt: fromDatetimeLocalValue(startLocal),
        endAt: fromDatetimeLocalValue(endLocal),
        positionIds: ids,
        createdByUserId: user.id,
        createdByName: user.fullName,
        activityActor: electionActivityActorFromUser(user),
      })
      setFormSuccess(
        `Election created. Election PIN (system): ${election.electionPin}. Approved voters enrolled with voter PINs in election_voters.`,
      )
      setTitle('')
      setDescription('')
      setOrganizationType('')
      setVotingVenue('')
      setPolicies('')
      setSelectedPositionIds(new Set())
      setPinsElectionId(election.id)
      refresh()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not create election.',
      )
    }
  }

  function openDetail(id: string) {
    setDetailId(id)
    setEditMode(false)
    setDetailError(null)
    const e = getElectionById(id)
    if (e) {
      setEditTitle(e.title)
      setEditDescription(e.description)
      setEditOrg(e.organizationType)
      setEditVenue(e.votingVenue)
      setEditPolicies(typeof e.policies === 'string' ? e.policies : '')
      setEditStart(toDatetimeLocalValue(new Date(e.startAt)))
      setEditEnd(toDatetimeLocalValue(new Date(e.endAt)))
      setEditPositions(new Set(e.positionIds))
    }
  }

  function saveDetailEdit() {
    if (!detailElection) return
    if (getElectionLifecycleStatus(detailElection) === 'completed') {
      setDetailError('Completed elections cannot be edited.')
      return
    }
    setDetailError(null)
    try {
      const ids = [...editPositions]
      if (ids.length === 0) throw new Error('Select at least one position.')
      updateElection(
        detailElection.id,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          organizationType: editOrg.trim(),
          votingVenue: editVenue.trim(),
          policies: editPolicies.trim(),
          startAt: fromDatetimeLocalValue(editStart),
          endAt: fromDatetimeLocalValue(editEnd),
          positionIds: ids,
        },
        electionActivityActorFromUser(user),
      )
      setEditMode(false)
      refresh()
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : 'Could not save election.',
      )
    }
  }

  function onDeleteElection(id: string, label: string) {
    if (
      !window.confirm(
        `Delete election “${label}” and all voter PIN enrollments for it?`,
      )
    ) {
      return
    }
    try {
      deleteElection(id, electionActivityActorFromUser(user))
      if (detailId === id) {
        setDetailId(null)
        setEditMode(false)
      }
      if (pinsElectionId === id) setPinsElectionId(null)
      refresh()
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Could not delete election.',
      )
    }
  }

  function onMarkCompleteBackup(id: string, label: string) {
    const actor = electionActivityActorFromUser(user)
    if (!actor) {
      window.alert(
        'Only administrator, MIS Office, or OSA Office accounts can mark an election complete.',
      )
      return
    }
    if (
      !window.confirm(
        `Mark “${label}” as completed now (backup close)? Voting and new campaign filings stop; scheduled end date is unchanged. This is recorded in System logs.`,
      )
    ) {
      return
    }
    try {
      markElectionManuallyCompleted(id, actor)
      refresh()
      if (detailId === id) openDetail(id)
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Could not close election.',
      )
    }
  }

  const detailStatus = detailElection
    ? getElectionLifecycleStatus(detailElection)
    : null
  const detailCanEdit = detailStatus !== 'completed'

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          Elections management system
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">
          {pathRole === 'admin' ? (
            <>
              Review all elections in the table below, create new contests, then
              manage voter PINs and print sheets. Positions come from{' '}
              <span className="text-stone-400">Positions</span> in the sidebar.
              Each election gets a unique 6-digit election PIN; each enrolled
              voter gets a separate voter PIN.
            </>
          ) : (
            <>
              Create and manage elections using the shared position catalog
              (maintained by an administrator). Each election gets a unique
              6-digit election PIN; each enrolled voter gets a separate voter
              PIN. Create, edit, and delete actions are recorded in the shared
              system log (MIS/OSA dashboards) with your office email, date, and
              time.
            </>
          )}
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Elections list
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          One row per election. Use{' '}
          <span className="text-stone-400">Complete (backup)</span> to close an
          election immediately (recorded in System logs). Use{' '}
          <span className="text-stone-400">View details</span> for full info, QR
          code, and edits (when not completed).
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full min-w-[72rem] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[4.5rem]" />
              <col />
              <col className="w-[7rem]" />
              <col className="w-[11rem]" />
              <col className="w-[10.5rem]" />
              <col className="w-[10.5rem]" />
              <col className="w-[6.5rem]" />
              <col className="w-[13rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <th className="px-3 py-3 font-medium text-red-800/80">ID</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Title</th>
                <th className="px-3 py-3 font-medium text-red-800/80 text-center">
                  Election PIN
                </th>
                <th className="px-3 py-3 font-medium text-red-800/80">
                  Organization
                </th>
                <th className="px-3 py-3 font-medium text-red-800/80">
                  Start date
                </th>
                <th className="px-3 py-3 font-medium text-red-800/80">
                  End date
                </th>
                <th className="px-3 py-3 font-medium text-red-800/80">Status</th>
                <th className="px-3 py-3 font-medium text-red-800/80 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {elections.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-8 text-center text-sm text-stone-500"
                  >
                    No elections yet. Use{' '}
                    <span className="text-stone-400">Create new election</span>{' '}
                    below.
                  </td>
                </tr>
              ) : (
                elections.map((el) => {
                  const st = getElectionLifecycleStatus(el)
                  return (
                    <tr
                      key={el.id}
                      className="border-b border-stone-200/80 align-middle last:border-0 hover:bg-stone-50/80"
                    >
                      <td className="px-3 py-2.5 font-mono text-sm tabular-nums text-stone-400">
                        {el.displayId}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-stone-800">
                        <span className="line-clamp-2" title={el.title}>
                          {el.title}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-sm tabular-nums tracking-wide text-red-800/90">
                        {el.electionPin}
                      </td>
                      <td className="px-3 py-2.5 text-stone-400">
                        <span className="line-clamp-2" title={el.organizationType}>
                          {el.organizationType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-stone-400">
                        {formatElectionDateTimeCell(el.startAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-stone-400">
                        {formatElectionDateTimeCell(el.endAt)}
                      </td>
                      <td className="px-3 py-2.5">
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
                          {el.manualCompletedAt ? (
                            <span
                              className="ml-1 text-[0.65rem] font-normal normal-case text-stone-600"
                              title="Closed early via backup"
                            >
                              backup
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {st !== 'completed' ? (
                            <button
                              type="button"
                              onClick={() =>
                                onMarkCompleteBackup(el.id, el.title)
                              }
                              className={btnComplete}
                            >
                              Complete (backup)
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openDetail(el.id)}
                            className={btnPrimary}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteElection(el.id, el.title)}
                            className={btnDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Create new election
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Required fields are marked with *. After you save, the new row
          appears in <span className="text-stone-400">Elections list</span> with
          a new ID and election PIN.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          <strong className="text-stone-400">Voters:</strong> All approved voters
          are automatically enrolled when you create an election. Set the voting
          window (start/end) so the Vote Now button is enabled during that
          period. After the end time passes, the election is closed
          automatically.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          A unique 6-digit election PIN is assigned to the election itself. Voter
          PINs are also auto-generated (6 digits) per enrolled voter. Both show
          in <span className="text-stone-400">Enrolled voters & PINs</span>{' '}
          (below) and on <span className="text-stone-400">Print PINs</span>.
        </p>

        <form onSubmit={onCreate} className="mt-8 max-w-3xl space-y-5">
          <div>
            <label
              htmlFor="el-title"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Election title *
            </label>
            <input
              id="el-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label
              htmlFor="el-desc"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Description
            </label>
            <textarea
              id="el-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="el-org"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Organization / type *
            </label>
            <select
              id="el-org"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              required
              className={`${fieldClass} cursor-pointer py-2.5`}
            >
              <option value="">— Select —</option>
              {ELECTION_ORGANIZATION_OPTIONS.filter(Boolean).map((o) => (
                <option key={o} value={o} className="bg-white">
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="el-venue"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Voting venue / limited area
            </label>
            <input
              id="el-venue"
              value={votingVenue}
              onChange={(e) => setVotingVenue(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Campus A, Room 101"
            />
          </div>
          <div>
            <label
              htmlFor="el-policies"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Voting policies & procedures
            </label>
            <textarea
              id="el-policies"
              value={policies}
              onChange={(e) => setPolicies(e.target.value)}
              rows={4}
              placeholder="Rules and procedures voters must agree to before voting."
              className={fieldClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="el-start"
                className="text-xs font-medium uppercase tracking-wide text-red-800/85"
              >
                Start date & time *
              </label>
              <input
                id="el-start"
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="el-end"
                className="text-xs font-medium uppercase tracking-wide text-red-800/85"
              >
                End date & time *
              </label>
              <input
                id="el-end"
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
              Positions * (from positions management)
            </p>
            <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-3">
              {positions.length === 0 ? (
                <p className="text-sm text-stone-500">No positions defined.</p>
              ) : (
                positions.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPositionIds.has(p.id)}
                      onChange={() => toggleCreatePosition(p.id)}
                      className="rounded border-red-800 bg-white text-red-600 focus:ring-red-500/40"
                    />
                    {p.title}
                  </label>
                ))
              )}
            </div>
          </div>

          {formError ? (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
              {formError}
            </p>
          ) : null}
          {formSuccess ? (
            <p className="rounded-lg border border-red-800/40 bg-red-50 px-3 py-2 text-sm text-red-900">
              {formSuccess}
            </p>
          ) : null}

          <button
            type="submit"
            className="font-display rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 px-8 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-red-950/35 hover:from-red-500"
          >
            Save election
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl ring-1 ring-stone-200/90">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Enrolled voters & PINs
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Voter PINs are auto-generated (6 digits) per voter in{' '}
          <span className="font-mono text-stone-400">election_voters.pin</span>{' '}
          when an election is saved. The election’s own{' '}
          <span className="font-mono text-stone-400">electionPin</span> (6
          digits) is system-wide for that contest. Use the list below to print
          sheets for distribution.
        </p>
        <div className="mt-4 max-w-md">
          <label
            htmlFor="pins-election-pick"
            className="text-xs font-medium uppercase tracking-wide text-red-800/85"
          >
            Election
          </label>
          <select
            id="pins-election-pick"
            value={pinsElectionId ?? ''}
            onChange={(e) =>
              setPinsElectionId(e.target.value || null)
            }
            className={`${fieldClass} cursor-pointer py-2.5`}
          >
            {elections.length === 0 ? (
              <option value="">No elections yet</option>
            ) : null}
            {elections.map((el) => (
              <option key={el.id} value={el.id} className="bg-white">
                {el.title} (ID {el.displayId})
              </option>
            ))}
          </select>
        </div>
        {pinsElection ? (
          <div className="mt-4 rounded-xl border border-red-800/40 bg-white px-4 py-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
              Election PIN (system)
            </p>
            <p className="mt-1 font-mono text-lg tracking-wider text-red-900">
              {pinsElection.electionPin}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Distinct from each voter’s PIN in the table below.
            </p>
          </div>
        ) : null}
        {pinsElection && pinsRows.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[28%]" />
                  <col className="w-[44%]" />
                  <col className="w-[7rem]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                    <th className="px-3 py-3 font-medium text-red-800/80">
                      Voter name
                    </th>
                    <th className="px-3 py-3 font-medium text-red-800/80">
                      Email
                    </th>
                    <th className="px-3 py-3 text-center font-medium text-red-800/80">
                      Voter PIN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pinsRows.map((r) => (
                    <tr
                      key={`${r.electionId}-${r.userId}`}
                      className="border-b border-stone-200/80 align-middle last:border-0 hover:bg-stone-50/80"
                    >
                      <td className="px-3 py-2.5 text-stone-800">{r.voterName}</td>
                      <td className="break-all px-3 py-2.5 text-stone-400">
                        {r.voterEmail}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-sm tabular-nums tracking-wide text-red-800/90">
                        {r.pin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => pinsElection && printPinsSheet(pinsElection)}
              className={`${btnPrimary} mt-4`}
            >
              Print PINs
            </button>
          </>
        ) : (
          <p className="mt-4 text-sm text-stone-600">
            {pinsElection
              ? 'No approved voters to enroll yet — add or approve voters first.'
              : 'Create an election to generate PIN rows.'}
          </p>
        )}
      </section>

      {detailElection ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-300 bg-stone-50 p-6 shadow-2xl sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  Election details
                </p>
                <h2 className="font-display text-xl font-semibold text-red-900">
                  {editMode ? 'Edit election' : detailElection.title}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {detailElection.createdByName} · Administrator · ID{' '}
                  {detailElection.displayId}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!editMode && detailCanEdit ? (
                  <button
                    type="button"
                    onClick={() =>
                      onMarkCompleteBackup(detailElection.id, detailElection.title)
                    }
                    className={btnComplete}
                  >
                    Complete (backup)
                  </button>
                ) : null}
                {!editMode && detailCanEdit ? (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className={btnPrimary}
                  >
                    Edit
                  </button>
                ) : null}
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={saveDetailEdit}
                      className={btnPrimary}
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        openDetail(detailElection.id)
                      }}
                      className={btn}
                    >
                      Cancel edit
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setDetailId(null)
                    setEditMode(false)
                  }}
                  className={btn}
                >
                  Close
                </button>
              </div>
            </div>

            {detailError ? (
              <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                {detailError}
              </p>
            ) : null}

            {!editMode ? (
              <div className="mt-6 space-y-3 text-sm">
                <h3 className="font-display border-b border-stone-200 pb-2 text-sm font-semibold text-red-900">
                  Election information
                </h3>
                <DetailRow label="Title" value={detailElection.title} />
                <DetailRow
                  label="Election PIN (system)"
                  value={detailElection.electionPin}
                  valueClassName="font-mono tracking-wider text-red-800/95"
                />
                <DetailRow
                  label="Organization / type"
                  value={detailElection.organizationType}
                />
                <DetailRow
                  label="Description"
                  value={detailElection.description || '—'}
                />
                <DetailRow
                  label="Voting period (time limit)"
                  value={formatElectionPeriod(
                    detailElection.startAt,
                    detailElection.endAt,
                  )}
                />
                <DetailRow
                  label="Voting venue / area"
                  value={detailElection.votingVenue || '—'}
                />
                <DetailRow
                  label="Policies & procedures"
                  value={
                    (detailElection.policies ?? '').trim()
                      ? 'Set (voters must accept before voting)'
                      : 'Not set'
                  }
                />
                <DetailRow
                  label="Positions"
                  value={(detailElection.positionTitles ?? []).join(', ')}
                />
                <DetailRow
                  label="Status"
                  value={
                    electionStatusLabel(
                      getElectionLifecycleStatus(detailElection),
                    ) +
                    (detailElection.manualCompletedAt
                      ? ' — backup close'
                      : '')
                  }
                />
                {detailElection.manualCompletedAt ? (
                  <DetailRow
                    label="Backup closed at"
                    value={formatElectionDateTimeCell(
                      detailElection.manualCompletedAt,
                    )}
                  />
                ) : null}
                <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
                  <h3 className="font-display text-sm font-semibold text-red-900">
                    Voting link & QR code
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Share this link so voters can log in and vote.
                  </p>
                  <p className="mt-3 break-all font-mono text-xs text-red-800/90">
                    {getVotingUrlForElection(detailElection.id)}
                  </p>
                  <div className="mt-4 inline-block rounded-xl bg-white p-3 shadow-lg">
                    <QRCode
                      value={getVotingUrlForElection(detailElection.id)}
                      size={180}
                      style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      viewBox="0 0 256 256"
                    />
                  </div>
                  <p className="mt-2 text-xs text-stone-600">
                    Scan with a phone camera to open the sign-in URL (demo).
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Title *
                  </label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Organization / type *
                  </label>
                  <select
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                    className={`${fieldClass} cursor-pointer py-2.5`}
                  >
                    {ELECTION_ORGANIZATION_OPTIONS.filter(Boolean).map((o) => (
                      <option key={o} value={o} className="bg-white">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Voting venue / area
                  </label>
                  <input
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Policies & procedures
                  </label>
                  <textarea
                    value={editPolicies}
                    onChange={(e) => setEditPolicies(e.target.value)}
                    rows={3}
                    className={fieldClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                      Start *
                    </label>
                    <input
                      type="datetime-local"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                      End *
                    </label>
                    <input
                      type="datetime-local"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                    Positions *
                  </p>
                  <div className="mt-2 flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-stone-200 bg-white p-3">
                    {positions.map((p) => (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-stone-700"
                      >
                        <input
                          type="checkbox"
                          checked={editPositions.has(p.id)}
                          onChange={() => toggleEditPosition(p.id)}
                          className="rounded border-red-800 bg-white text-red-600 focus:ring-red-500/40"
                        />
                        {p.title}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-stone-200 py-2 sm:flex-row sm:justify-between">
      <span className="text-stone-500">{label}:</span>
      <span
        className={`max-w-xl text-right text-stone-800 ${valueClassName ?? ''}`}
      >
        {value}
      </span>
    </div>
  )
}
