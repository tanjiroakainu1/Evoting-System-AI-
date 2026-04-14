import type {
  BallotPosition,
  BallotVoteRecord,
  CampaignApplicationRecord,
  ElectionRecord,
  ElectionResultsDetail,
  ElectionVoterEnrollment,
} from '../types/election'
import { getElectionLifecycleStatus } from '../types/election'
import { findUserById, getAllUsers } from './authStorage'
import {
  appendElectionActivityLog,
  type ElectionActivityActor,
  type ElectionActivityActorRole,
} from './electionActivityLog'

const POSITIONS_KEY = 'bevms_ballot_positions'
const ELECTIONS_KEY = 'bevms_elections'
const ENROLLMENTS_KEY = 'bevms_election_voters'
const APPLICATIONS_KEY = 'bevms_campaign_applications'
const VOTES_KEY = 'bevms_ballot_votes'
const OFFICIAL_RESULTS_KEY = 'bevms_official_results_releases'

/** Administrative “official results” sign-off rows (local demo). */
export type OfficialResultsRelease = {
  id: string
  electionId: string
  createdAt: string
  createdByUserId: string
  createdByEmail: string
  createdByRole: ElectionActivityActorRole
}

function emitElectionsChanged() {
  window.dispatchEvent(new Event('bevms-elections'))
}

/** Default positions available when targeting offices in an election. */
export const defaultPositionSeeds: BallotPosition[] = [
  { id: 'seed-pos-president', title: 'President' },
  { id: 'seed-pos-vice-president', title: 'Vice President' },
  { id: 'seed-pos-secretary', title: 'Secretary' },
  { id: 'seed-pos-treasurer', title: 'Treasurer' },
  { id: 'seed-pos-auditor', title: 'Auditor' },
  { id: 'seed-pos-raminder', title: 'Raminder' },
]

const demoElection: ElectionRecord = {
  id: 'seed-demo-election-student-council',
  displayId: 1842,
  electionPin: '739105',
  title: 'Demo: Student Council Election',
  description:
    'Annual election for the Supreme Student Council representatives (demo record).',
  organizationType: 'Supreme Student Council',
  votingVenue: 'Tagudin Campus — Student Affairs Hall',
  policies:
    'One vote per position. Voters must verify identity with their election PIN. Ballots are confidential.',
  startAt: new Date('2025-01-15T08:00:00').toISOString(),
  endAt: new Date('2025-01-20T18:00:00').toISOString(),
  positionIds: [
    defaultPositionSeeds[0]!.id,
    defaultPositionSeeds[1]!.id,
  ],
  positionTitles: [
    defaultPositionSeeds[0]!.title,
    defaultPositionSeeds[1]!.title,
  ],
  createdAt: new Date('2025-01-10T10:00:00').toISOString(),
  createdByUserId: 'seed-admin',
  createdByName: 'System Administrator',
}

/** Second seed election — active window for demos (matches sample “inserted” data). */
const sampleActiveElection: ElectionRecord = {
  id: 'seed-sample-active-election',
  displayId: 1843,
  electionPin: '628401',
  title: 'sadasdasd',
  description: 'Sample active election window (demo seed).',
  organizationType: 'General Assembly',
  votingVenue: 'Tagudin Campus',
  policies: 'One vote per office. Demo record.',
  startAt: new Date('2026-04-15T03:24:00').toISOString(),
  endAt: new Date('2026-05-14T03:24:00').toISOString(),
  positionIds: [
    defaultPositionSeeds[0]!.id,
    defaultPositionSeeds[1]!.id,
  ],
  positionTitles: [
    defaultPositionSeeds[0]!.title,
    defaultPositionSeeds[1]!.title,
  ],
  createdAt: new Date('2026-04-01T12:00:00').toISOString(),
  createdByUserId: 'seed-admin',
  createdByName: 'System Administrator',
}

const SEED_ELECTIONS: ElectionRecord[] = [demoElection, sampleActiveElection]

const DEMO_SEED_APP = {
  presTest: 'seed-app-demo-president-test',
  presAlpha: 'seed-app-demo-president-alpha',
  presBeta: 'seed-app-demo-president-beta',
  vpGamma: 'seed-app-demo-vp-gamma',
  vpDelta: 'seed-app-demo-vp-delta',
} as const

const DEMO_VOTE_VOTER_ORDER = [
  'seed-voter',
  'seed-voter-two',
  'seed-voter-three',
  'seed-voter-four',
] as const

const SEED_PLATFORM =
  'Official campaign platform for the student council election (demo seed record).'

function readPositions(): BallotPosition[] {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY)
    if (!raw) {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(defaultPositionSeeds))
      return [...defaultPositionSeeds]
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(defaultPositionSeeds))
      return [...defaultPositionSeeds]
    }
    return parsed as BallotPosition[]
  } catch {
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(defaultPositionSeeds))
    return [...defaultPositionSeeds]
  }
}

function writePositions(positions: BallotPosition[]) {
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
}

function mergeMissingSeedElections(list: ElectionRecord[]): ElectionRecord[] {
  let next = [...list]
  let changed = false
  for (const seed of SEED_ELECTIONS) {
    if (!next.some((e) => e.id === seed.id)) {
      next = [{ ...seed }, ...next]
      changed = true
    }
  }
  if (changed) writeElections(next)
  return next
}

function syncVoterEnrollmentsForElection(electionId: string): void {
  const voters = getAllUsers().filter(
    (u) =>
      u.role === 'voter' &&
      (u.registrationStatus === 'approved' ||
        u.registrationStatus === undefined),
  )
  let all = readEnrollments()
  let changed = false
  for (const v of voters) {
    if (all.some((r) => r.electionId === electionId && r.userId === v.id)) {
      continue
    }
    const pin = allocatePin(electionId, all)
    all = [
      ...all,
      {
        electionId,
        userId: v.id,
        voterEmail: v.email,
        voterName: v.fullName,
        pin,
      },
    ]
    changed = true
  }
  if (changed) writeEnrollments(all)
}

function readElections(): ElectionRecord[] {
  try {
    let list: ElectionRecord[]
    const raw = localStorage.getItem(ELECTIONS_KEY)
    if (!raw) {
      list = SEED_ELECTIONS.map((e) => ({ ...e }))
      writeElections(list)
    } else {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        list = SEED_ELECTIONS.map((e) => ({ ...e }))
        writeElections(list)
      } else {
        list = mergeMissingSeedElections(parsed as ElectionRecord[])
      }
    }
    list = migrateElectionPins(list)
    for (const seed of SEED_ELECTIONS) {
      syncVoterEnrollmentsForElection(seed.id)
    }
    ensureDemoBallotSeed(list)
    return list
  } catch {
    const list = SEED_ELECTIONS.map((e) => ({ ...e }))
    writeElections(list)
    for (const seed of SEED_ELECTIONS) {
      syncVoterEnrollmentsForElection(seed.id)
    }
    ensureDemoBallotSeed(list)
    return migrateElectionPins(list)
  }
}

function writeElections(elections: ElectionRecord[]) {
  localStorage.setItem(ELECTIONS_KEY, JSON.stringify(elections))
}

/** Assign a 6-digit election PIN to any row missing a valid one (localStorage migration). */
function migrateElectionPins(list: ElectionRecord[]): ElectionRecord[] {
  const used = new Set(
    list
      .map((e) => e.electionPin)
      .filter(
        (p): p is string =>
          typeof p === 'string' && p.length === 6 && /^\d{6}$/.test(p),
      ),
  )
  let changed = false
  const next = list.map((e) => {
    if (
      typeof e.electionPin === 'string' &&
      e.electionPin.length === 6 &&
      /^\d{6}$/.test(e.electionPin)
    ) {
      return e
    }
    changed = true
    let pin = randomPin6()
    let guard = 0
    while (used.has(pin) && guard < 120) {
      pin = randomPin6()
      guard += 1
    }
    used.add(pin)
    return { ...e, electionPin: pin }
  })
  if (changed) {
    writeElections(next)
    emitElectionsChanged()
  }
  return next
}

function allocateUniqueElectionPin(elections: ElectionRecord[]): string {
  const used = new Set(
    elections
      .map((e) => e.electionPin)
      .filter(
        (p): p is string =>
          typeof p === 'string' && p.length === 6 && /^\d{6}$/.test(p),
      ),
  )
  let pin = randomPin6()
  let guard = 0
  while (used.has(pin) && guard < 120) {
    pin = randomPin6()
    guard += 1
  }
  return pin
}

function readEnrollments(): ElectionVoterEnrollment[] {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ElectionVoterEnrollment[]
  } catch {
    return []
  }
}

function writeEnrollments(rows: ElectionVoterEnrollment[]) {
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(rows))
}

function readApplications(): CampaignApplicationRecord[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as CampaignApplicationRecord[]
  } catch {
    return []
  }
}

function writeApplications(rows: CampaignApplicationRecord[]) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(rows))
}

function readVotes(): BallotVoteRecord[] {
  try {
    const raw = localStorage.getItem(VOTES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as BallotVoteRecord[]
  } catch {
    return []
  }
}

function writeVotes(rows: BallotVoteRecord[]) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(rows))
}

function readOfficialResultsReleases(): OfficialResultsRelease[] {
  try {
    const raw = localStorage.getItem(OFFICIAL_RESULTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as OfficialResultsRelease[]
  } catch {
    return []
  }
}

function writeOfficialResultsReleases(rows: OfficialResultsRelease[]) {
  localStorage.setItem(OFFICIAL_RESULTS_KEY, JSON.stringify(rows))
}

function purgeBallotDataForElection(electionId: string): void {
  const apps = readApplications()
  const nextApps = apps.filter((a) => a.electionId !== electionId)
  if (nextApps.length !== apps.length) writeApplications(nextApps)
  const votes = readVotes()
  const nextVotes = votes.filter((v) => v.electionId !== electionId)
  if (nextVotes.length !== votes.length) writeVotes(nextVotes)
}

function buildApprovedSeedApplications(
  demoRow: ElectionRecord,
  presId: string,
  vpId: string,
): CampaignApplicationRecord[] {
  const reviewedAt = new Date('2025-01-19T12:00:00').toISOString()
  const createdAt = new Date('2025-01-08T10:00:00').toISOString()
  return [
    {
      id: DEMO_SEED_APP.presTest,
      electionId: demoRow.id,
      candidateUserId: 'seed-cand-test',
      positionId: presId,
      platform: SEED_PLATFORM,
      ballotPhotoDataUrl: null,
      status: 'approved',
      createdAt,
      reviewedAt,
      reviewedByUserId: 'seed-admin',
      reviewedByName: 'System Administrator',
    },
    {
      id: DEMO_SEED_APP.presAlpha,
      electionId: demoRow.id,
      candidateUserId: 'seed-cand-alpha',
      positionId: presId,
      platform: SEED_PLATFORM,
      ballotPhotoDataUrl: null,
      status: 'approved',
      createdAt,
      reviewedAt,
      reviewedByUserId: 'seed-admin',
      reviewedByName: 'System Administrator',
    },
    {
      id: DEMO_SEED_APP.presBeta,
      electionId: demoRow.id,
      candidateUserId: 'seed-cand-beta',
      positionId: presId,
      platform: SEED_PLATFORM,
      ballotPhotoDataUrl: null,
      status: 'approved',
      createdAt,
      reviewedAt,
      reviewedByUserId: 'seed-admin',
      reviewedByName: 'System Administrator',
    },
    {
      id: DEMO_SEED_APP.vpGamma,
      electionId: demoRow.id,
      candidateUserId: 'seed-cand-gamma',
      positionId: vpId,
      platform: SEED_PLATFORM,
      ballotPhotoDataUrl: null,
      status: 'approved',
      createdAt,
      reviewedAt,
      reviewedByUserId: 'seed-admin',
      reviewedByName: 'System Administrator',
    },
    {
      id: DEMO_SEED_APP.vpDelta,
      electionId: demoRow.id,
      candidateUserId: 'seed-cand-delta',
      positionId: vpId,
      platform: SEED_PLATFORM,
      ballotPhotoDataUrl: null,
      status: 'approved',
      createdAt,
      reviewedAt,
      reviewedByUserId: 'seed-admin',
      reviewedByName: 'System Administrator',
    },
  ]
}

function buildSeedVotes(
  electionId: string,
  presId: string,
  vpId: string,
): BallotVoteRecord[] {
  const castAt = new Date('2025-01-18T14:00:00').toISOString()
  const presPicks = [
    DEMO_SEED_APP.presTest,
    DEMO_SEED_APP.presTest,
    DEMO_SEED_APP.presTest,
    DEMO_SEED_APP.presAlpha,
  ] as const
  const vpPicks = [
    DEMO_SEED_APP.vpGamma,
    DEMO_SEED_APP.vpGamma,
    DEMO_SEED_APP.vpGamma,
    DEMO_SEED_APP.vpDelta,
  ] as const
  const out: BallotVoteRecord[] = []
  for (let i = 0; i < DEMO_VOTE_VOTER_ORDER.length; i++) {
    out.push({
      electionId,
      voterUserId: DEMO_VOTE_VOTER_ORDER[i]!,
      positionId: presId,
      applicationId: presPicks[i]!,
      castAt,
    })
    out.push({
      electionId,
      voterUserId: DEMO_VOTE_VOTER_ORDER[i]!,
      positionId: vpId,
      applicationId: vpPicks[i]!,
      castAt,
    })
  }
  return out
}

function ensureDemoBallotSeed(elections: ElectionRecord[]): void {
  const demo = elections.find((e) => e.id === demoElection.id)
  if (!demo || demo.positionIds.length < 2) return
  const presId = demo.positionIds[0]!
  const vpId = demo.positionIds[1]!

  let apps = readApplications()
  if (!apps.some((a) => a.id === DEMO_SEED_APP.presTest)) {
    apps = [...apps, ...buildApprovedSeedApplications(demo, presId, vpId)]
    writeApplications(apps)
    emitElectionsChanged()
  }

  let votes = readVotes()
  if (!votes.some((v) => v.electionId === demo.id)) {
    votes = [...votes, ...buildSeedVotes(demo.id, presId, vpId)]
    writeVotes(votes)
    emitElectionsChanged()
  }
}

function nextDisplayId(elections: ElectionRecord[]): number {
  return elections.reduce((m, e) => Math.max(m, e.displayId), 0) + 1
}

function randomPin6(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function pinUniqueForElection(
  electionId: string,
  pin: string,
  enrollments: ElectionVoterEnrollment[],
): boolean {
  return !enrollments.some((r) => r.electionId === electionId && r.pin === pin)
}

function allocatePin(
  electionId: string,
  enrollments: ElectionVoterEnrollment[],
): string {
  let pin = randomPin6()
  let guard = 0
  while (!pinUniqueForElection(electionId, pin, enrollments) && guard < 50) {
    pin = randomPin6()
    guard += 1
  }
  return pin
}

export function getPositions(): BallotPosition[] {
  return readPositions()
}

export function addPosition(title: string): BallotPosition {
  const positions = readPositions()
  const t = title.trim()
  if (!t) throw new Error('Position title is required.')
  if (positions.some((p) => p.title.toLowerCase() === t.toLowerCase())) {
    throw new Error('A position with this title already exists.')
  }
  const p: BallotPosition = { id: crypto.randomUUID(), title: t }
  positions.push(p)
  writePositions(positions)
  emitElectionsChanged()
  return p
}

export function updatePosition(id: string, title: string): void {
  const positions = readPositions()
  const idx = positions.findIndex((p) => p.id === id)
  if (idx < 0) throw new Error('Position not found.')
  const t = title.trim()
  if (!t) throw new Error('Position title is required.')
  positions[idx] = { ...positions[idx], title: t }
  writePositions(positions)
  emitElectionsChanged()
}

export function deletePosition(id: string): void {
  const positions = readPositions()
  const next = positions.filter((p) => p.id !== id)
  if (next.length === positions.length) {
    throw new Error('Position not found.')
  }
  writePositions(next)
  emitElectionsChanged()
}

export function getElections(): ElectionRecord[] {
  return readElections()
}

export function getElectionById(id: string): ElectionRecord | undefined {
  return readElections().find((e) => e.id === id)
}

export function getEnrollmentsForElection(
  electionId: string,
): ElectionVoterEnrollment[] {
  return readEnrollments().filter((r) => r.electionId === electionId)
}

export function getEnrollmentForVoter(
  electionId: string,
  userId: string,
): ElectionVoterEnrollment | undefined {
  return readEnrollments().find(
    (r) => r.electionId === electionId && r.userId === userId,
  )
}

export function getVotingUrlForElection(electionId: string): string {
  const path = `/login?redirect=${encodeURIComponent(`/voter/vote/${electionId}`)}`
  return `${window.location.origin}${path}`
}

function enrollApprovedVotersForElection(
  election: ElectionRecord,
): ElectionVoterEnrollment[] {
  const voters = getAllUsers().filter(
    (u) =>
      u.role === 'voter' &&
      (u.registrationStatus === 'approved' || u.registrationStatus === undefined),
  )
  const all = readEnrollments()
  const next: ElectionVoterEnrollment[] = []
  for (const v of voters) {
    const pin = allocatePin(election.id, [...all, ...next])
    next.push({
      electionId: election.id,
      userId: v.id,
      voterEmail: v.email,
      voterName: v.fullName,
      pin,
    })
  }
  writeEnrollments([...all, ...next])
  return next
}

export type CreateElectionInput = {
  title: string
  description: string
  organizationType: string
  votingVenue: string
  policies: string
  startAt: string
  endAt: string
  positionIds: string[]
  createdByUserId: string
  createdByName: string
  /** When set (admin / MIS / OSA), an audit row is stored. */
  activityActor?: ElectionActivityActor
}

export function createElection(input: CreateElectionInput): ElectionRecord {
  const title = input.title.trim()
  if (!title) throw new Error('Election title is required.')
  if (!input.organizationType.trim()) {
    throw new Error('Organization / type is required.')
  }
  if (!input.startAt || !input.endAt) {
    throw new Error('Start and end date/time are required.')
  }
  const start = new Date(input.startAt).getTime()
  const end = new Date(input.endAt).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('End must be after start.')
  }
  if (input.positionIds.length === 0) {
    throw new Error('Select at least one position.')
  }

  const positions = readPositions()
  const titles: string[] = []
  for (const pid of input.positionIds) {
    const p = positions.find((x) => x.id === pid)
    if (p) titles.push(p.title)
  }
  if (titles.length !== input.positionIds.length) {
    throw new Error('One or more positions are no longer available.')
  }

  const elections = readElections()
  const electionPin = allocateUniqueElectionPin(elections)
  const election: ElectionRecord = {
    id: crypto.randomUUID(),
    displayId: nextDisplayId(elections),
    electionPin,
    title,
    description: input.description.trim(),
    organizationType: input.organizationType.trim(),
    votingVenue: input.votingVenue.trim(),
    policies: input.policies.trim(),
    startAt: new Date(input.startAt).toISOString(),
    endAt: new Date(input.endAt).toISOString(),
    positionIds: [...input.positionIds],
    positionTitles: titles,
    createdAt: new Date().toISOString(),
    createdByUserId: input.createdByUserId,
    createdByName: input.createdByName,
  }

  elections.push(election)
  writeElections(elections)
  enrollApprovedVotersForElection(election)
  emitElectionsChanged()
  const actor = input.activityActor
  if (actor) {
    appendElectionActivityLog({
      action: 'election_create',
      electionId: election.id,
      electionDisplayId: election.displayId,
      electionTitle: election.title,
      actorUserId: actor.userId,
      actorEmail: actor.email,
      actorRole: actor.role,
    })
  }
  return election
}

export type UpdateElectionInput = Partial<
  Pick<
    ElectionRecord,
    | 'title'
    | 'description'
    | 'organizationType'
    | 'votingVenue'
    | 'policies'
    | 'startAt'
    | 'endAt'
    | 'positionIds'
    | 'positionTitles'
  >
>

export function updateElection(
  id: string,
  patch: UpdateElectionInput,
  activityActor?: ElectionActivityActor,
): ElectionRecord {
  const elections = readElections()
  const idx = elections.findIndex((e) => e.id === id)
  if (idx < 0) throw new Error('Election not found.')
  const prev = elections[idx]
  const next: ElectionRecord = {
    ...prev,
    ...patch,
    id: prev.id,
    displayId: prev.displayId,
    electionPin: prev.electionPin,
    createdAt: prev.createdAt,
    createdByUserId: prev.createdByUserId,
    createdByName: prev.createdByName,
  }
  if (patch.startAt) next.startAt = new Date(patch.startAt).toISOString()
  if (patch.endAt) next.endAt = new Date(patch.endAt).toISOString()
  if (patch.positionIds && patch.positionIds.length > 0) {
    const positions = readPositions()
    next.positionIds = [...patch.positionIds]
    const titles = patch.positionIds.map((pid) => {
      const p = positions.find((x) => x.id === pid)
      return p?.title
    })
    if (titles.some((t) => !t)) {
      throw new Error('One or more positions are no longer available.')
    }
    next.positionTitles = titles as string[]
  }
  const start = new Date(next.startAt).getTime()
  const end = new Date(next.endAt).getTime()
  if (end <= start) throw new Error('End must be after start.')
  elections[idx] = next
  writeElections(elections)
  emitElectionsChanged()
  if (activityActor) {
    appendElectionActivityLog({
      action: 'election_update',
      electionId: next.id,
      electionDisplayId: next.displayId,
      electionTitle: next.title,
      actorUserId: activityActor.userId,
      actorEmail: activityActor.email,
      actorRole: activityActor.role,
    })
  }
  return next
}

/** Close an election immediately for backup / operational use; logged. */
export function markElectionManuallyCompleted(
  id: string,
  actor: ElectionActivityActor,
): ElectionRecord {
  const elections = readElections()
  const idx = elections.findIndex((e) => e.id === id)
  if (idx < 0) throw new Error('Election not found.')
  const prev = elections[idx]!
  if (getElectionLifecycleStatus(prev) === 'completed') {
    throw new Error('This election is already completed.')
  }
  const next: ElectionRecord = {
    ...prev,
    manualCompletedAt: new Date().toISOString(),
  }
  elections[idx] = next
  writeElections(elections)
  emitElectionsChanged()
  appendElectionActivityLog({
    action: 'election_manual_complete',
    electionId: next.id,
    electionDisplayId: next.displayId,
    electionTitle: next.title,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.role,
    detail: 'Election closed early (manual / backup)',
  })
  return next
}

export function deleteElection(
  id: string,
  activityActor?: ElectionActivityActor,
): void {
  const elections = readElections()
  const victim = elections.find((e) => e.id === id)
  const next = elections.filter((e) => e.id !== id)
  if (next.length === elections.length) {
    throw new Error('Election not found.')
  }
  writeElections(next)
  const enrollments = readEnrollments().filter((r) => r.electionId !== id)
  writeEnrollments(enrollments)
  purgeBallotDataForElection(id)
  const rel = readOfficialResultsReleases().filter((r) => r.electionId !== id)
  writeOfficialResultsReleases(rel)
  emitElectionsChanged()
  if (activityActor && victim) {
    appendElectionActivityLog({
      action: 'election_delete',
      electionId: victim.id,
      electionDisplayId: victim.displayId,
      electionTitle: victim.title,
      actorUserId: activityActor.userId,
      actorEmail: activityActor.email,
      actorRole: activityActor.role,
    })
  }
}

export function listOfficialResultsReleases(): OfficialResultsRelease[] {
  return readOfficialResultsReleases()
}

/** Records an official results release and appends the election activity log. */
export function publishOfficialElectionResults(
  electionId: string,
  actor: ElectionActivityActor,
): OfficialResultsRelease {
  const election = readElections().find((e) => e.id === electionId)
  if (!election) throw new Error('Election not found.')
  const row: OfficialResultsRelease = {
    id: crypto.randomUUID(),
    electionId,
    createdAt: new Date().toISOString(),
    createdByUserId: actor.userId,
    createdByEmail: actor.email,
    createdByRole: actor.role,
  }
  writeOfficialResultsReleases([row, ...readOfficialResultsReleases()])
  appendElectionActivityLog({
    action: 'results_publish',
    electionId: election.id,
    electionDisplayId: election.displayId,
    electionTitle: election.title,
    actorUserId: actor.userId,
    actorEmail: actor.email,
    actorRole: actor.role,
    detail: 'Official results release created',
  })
  emitElectionsChanged()
  return row
}

/** @deprecated Use automatic sync via readElections — kept for external callers. */
export function ensureDemoElectionEnrollments(): void {
  syncVoterEnrollmentsForElection(demoElection.id)
}

export function getCampaignApplicationsForElection(
  electionId: string,
): CampaignApplicationRecord[] {
  return readApplications().filter((a) => a.electionId === electionId)
}

export function getMyCampaignApplications(
  candidateUserId: string,
): CampaignApplicationRecord[] {
  return readApplications().filter((a) => a.candidateUserId === candidateUserId)
}

export function listPendingCampaignApplications(): CampaignApplicationRecord[] {
  return readApplications().filter((a) => a.status === 'pending')
}

export function getApprovedApplicationsForBallot(
  electionId: string,
  positionId: string,
): CampaignApplicationRecord[] {
  return readApplications().filter(
    (a) =>
      a.electionId === electionId &&
      a.positionId === positionId &&
      a.status === 'approved',
  )
}

export function submitCampaignApplication(input: {
  electionId: string
  candidateUserId: string
  positionId: string
  platform: string
  ballotPhotoDataUrl: string | null
}): CampaignApplicationRecord {
  const election = readElections().find((e) => e.id === input.electionId)
  if (!election) throw new Error('Election not found.')
  const candidateUser = findUserById(input.candidateUserId)
  if (!candidateUser || candidateUser.role !== 'candidate') {
    throw new Error('Only candidate accounts can submit a campaign application.')
  }
  if (getElectionLifecycleStatus(election) === 'completed') {
    throw new Error('This election has ended.')
  }
  if (!election.positionIds.includes(input.positionId)) {
    throw new Error('That position is not part of this election.')
  }
  const platform = input.platform.trim()
  if (platform.length < 50) {
    throw new Error('Campaign platform must be at least 50 characters.')
  }
  if (
    input.ballotPhotoDataUrl &&
    input.ballotPhotoDataUrl.length > 2_500_000
  ) {
    throw new Error('Campaign photo is too large (try a smaller image).')
  }
  const apps = readApplications()
  const dup = apps.some(
    (a) =>
      a.electionId === input.electionId &&
      a.candidateUserId === input.candidateUserId &&
      a.positionId === input.positionId &&
      (a.status === 'pending' || a.status === 'approved'),
  )
  if (dup) {
    throw new Error(
      'You already have a pending or approved application for this office.',
    )
  }
  const row: CampaignApplicationRecord = {
    id: crypto.randomUUID(),
    electionId: input.electionId,
    candidateUserId: input.candidateUserId,
    positionId: input.positionId,
    platform,
    ballotPhotoDataUrl: input.ballotPhotoDataUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedByUserId: null,
    reviewedByName: null,
  }
  writeApplications([...apps, row])
  emitElectionsChanged()
  return row
}

export function approveCampaignApplication(
  applicationId: string,
  reviewer: { userId: string; fullName: string },
): CampaignApplicationRecord {
  const apps = readApplications()
  const idx = apps.findIndex((a) => a.id === applicationId)
  if (idx < 0) throw new Error('Application not found.')
  const prev = apps[idx]!
  const reviewerUser = findUserById(reviewer.userId)
  if (!reviewerUser || reviewerUser.role !== 'admin') {
    throw new Error('Only administrators can approve campaign applications.')
  }
  const applicant = findUserById(prev.candidateUserId)
  if (!applicant || applicant.role !== 'candidate') {
    throw new Error(
      'This filing is not linked to an active candidate account and cannot be approved.',
    )
  }
  if (prev.status !== 'pending') {
    throw new Error('Only pending applications can be approved.')
  }
  const next = [...apps]
  next[idx] = {
    ...prev,
    status: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedByUserId: reviewer.userId,
    reviewedByName: reviewer.fullName,
  }
  writeApplications(next)
  emitElectionsChanged()
  return next[idx]!
}

export function rejectCampaignApplication(
  applicationId: string,
  reviewer: { userId: string; fullName: string },
): CampaignApplicationRecord {
  const apps = readApplications()
  const idx = apps.findIndex((a) => a.id === applicationId)
  if (idx < 0) throw new Error('Application not found.')
  const prev = apps[idx]!
  const reviewerUser = findUserById(reviewer.userId)
  if (!reviewerUser || reviewerUser.role !== 'admin') {
    throw new Error('Only administrators can reject campaign applications.')
  }
  if (prev.status !== 'pending') {
    throw new Error('Only pending applications can be rejected.')
  }
  const next = [...apps]
  next[idx] = {
    ...prev,
    status: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedByUserId: reviewer.userId,
    reviewedByName: reviewer.fullName,
  }
  writeApplications(next)
  emitElectionsChanged()
  return next[idx]!
}

export function getVoterBallotSelections(
  electionId: string,
  voterUserId: string,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const v of readVotes()) {
    if (v.electionId === electionId && v.voterUserId === voterUserId) {
      map[v.positionId] = v.applicationId
    }
  }
  return map
}

export function castBallotVotes(input: {
  electionId: string
  voterUserId: string
  choices: Record<string, string>
}): void {
  const election = readElections().find((e) => e.id === input.electionId)
  if (!election) throw new Error('Election not found.')
  const lifecycle = getElectionLifecycleStatus(election)
  if (lifecycle !== 'active') {
    throw new Error('Voting is only allowed while the election is active.')
  }
  if (!getEnrollmentForVoter(input.electionId, input.voterUserId)) {
    throw new Error('You are not enrolled in this election.')
  }
  const apps = readApplications()
  const positionIds = new Set(election.positionIds)
  for (const pid of Object.keys(input.choices)) {
    if (!positionIds.has(pid)) {
      throw new Error('Invalid position on ballot.')
    }
  }
  for (const pid of election.positionIds) {
    if (!input.choices[pid]?.trim()) {
      throw new Error('Select a candidate for every office.')
    }
  }
  const castAt = new Date().toISOString()
  for (const pid of election.positionIds) {
    const appId = input.choices[pid]!
    const app = apps.find((a) => a.id === appId)
    if (
      !app ||
      app.electionId !== input.electionId ||
      app.positionId !== pid ||
      app.status !== 'approved'
    ) {
      throw new Error('Invalid candidate selection.')
    }
  }
  const votes = readVotes().filter(
    (v) =>
      !(
        v.electionId === input.electionId &&
        v.voterUserId === input.voterUserId
      ),
  )
  for (const pid of election.positionIds) {
    votes.push({
      electionId: input.electionId,
      voterUserId: input.voterUserId,
      positionId: pid,
      applicationId: input.choices[pid]!,
      castAt,
    })
  }
  writeVotes(votes)
  emitElectionsChanged()
}

export function getElectionResultsDetail(
  electionId: string,
): ElectionResultsDetail | undefined {
  const election = readElections().find((e) => e.id === electionId)
  if (!election) return undefined
  const enrollments = getEnrollmentsForElection(electionId)
  const eligible = enrollments.length
  const votes = readVotes().filter((v) => v.electionId === electionId)
  const participated = new Set(votes.map((v) => v.voterUserId)).size
  const turnoutPercent =
    eligible === 0 ? 0 : Math.round((participated / eligible) * 1000) / 10

  const users = getAllUsers()
  const nameFor = (uid: string) =>
    users.find((u) => u.id === uid)?.fullName ?? 'Unknown'

  const approved = readApplications().filter(
    (a) => a.electionId === electionId && a.status === 'approved',
  )

  const positions = election.positionIds.map((positionId, idx) => {
    const positionTitle = election.positionTitles[idx] ?? positionId
    const candidates = approved.filter((a) => a.positionId === positionId)
    const counts = new Map<string, number>()
    for (const a of candidates) counts.set(a.id, 0)
    for (const v of votes) {
      if (v.positionId !== positionId) continue
      counts.set(v.applicationId, (counts.get(v.applicationId) ?? 0) + 1)
    }
    const total = [...counts.values()].reduce((s, n) => s + n, 0)
    const rows = [...candidates]
      .map((a) => {
        const n = counts.get(a.id) ?? 0
        return {
          rank: 0,
          applicationId: a.id,
          candidateName: nameFor(a.candidateUserId),
          votes: n,
          percentage:
            total === 0 ? 0 : Math.round((n / total) * 1000) / 10,
          ballotPhotoDataUrl: a.ballotPhotoDataUrl,
        }
      })
      .sort(
        (a, b) =>
          b.votes - a.votes || a.candidateName.localeCompare(b.candidateName),
      )
    let rank = 0
    for (let i = 0; i < rows.length; i++) {
      const cur = rows[i]!
      if (i === 0 || cur.votes !== rows[i - 1]!.votes) rank = i + 1
      cur.rank = rank
    }
    return { positionId, positionTitle, rows }
  })

  return {
    election,
    eligibleVoters: eligible,
    votersParticipated: participated,
    turnoutPercent,
    positions,
  }
}
