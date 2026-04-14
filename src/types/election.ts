/** A contestable office that can be attached to elections (managed separately). */
export type BallotPosition = {
  id: string
  title: string
}

export type ElectionRecord = {
  id: string
  /** Short numeric id for admin-facing labels (e.g. “ID 1842”). */
  displayId: number
  title: string
  description: string
  organizationType: string
  votingVenue: string
  policies: string
  startAt: string
  endAt: string
  positionIds: string[]
  /** Snapshot of position titles at creation time. */
  positionTitles: string[]
  /** Unique 6-digit PIN for this election (system-generated; not voter PINs). */
  electionPin: string
  createdAt: string
  createdByUserId: string
  createdByName: string
  /**
   * When set, the election is treated as completed immediately (backup / manual
   * close) regardless of the scheduled `endAt`.
   */
  manualCompletedAt?: string
}

/** One row per voter per election — `pin` is six digits (demo storage). */
export type ElectionVoterEnrollment = {
  electionId: string
  userId: string
  voterEmail: string
  voterName: string
  pin: string
}

export type ElectionLifecycleStatus = 'scheduled' | 'active' | 'completed'

export function getElectionLifecycleStatus(
  election: Pick<ElectionRecord, 'startAt' | 'endAt' | 'manualCompletedAt'>,
  nowMs: number = Date.now(),
): ElectionLifecycleStatus {
  if (election.manualCompletedAt) return 'completed'
  const start = new Date(election.startAt).getTime()
  const end = new Date(election.endAt).getTime()
  if (nowMs < start) return 'scheduled'
  if (nowMs > end) return 'completed'
  return 'active'
}

export function electionStatusLabel(s: ElectionLifecycleStatus): string {
  if (s === 'scheduled') return 'Scheduled'
  if (s === 'active') return 'Active'
  return 'Completed'
}

export type CampaignApplicationStatus = 'pending' | 'approved' | 'rejected'

/** Candidate filing for a specific election office (local demo storage). */
export type CampaignApplicationRecord = {
  id: string
  electionId: string
  candidateUserId: string
  positionId: string
  platform: string
  ballotPhotoDataUrl: string | null
  status: CampaignApplicationStatus
  createdAt: string
  reviewedAt: string | null
  reviewedByUserId: string | null
  reviewedByName: string | null
}

/** One choice per voter per position (local demo). */
export type BallotVoteRecord = {
  electionId: string
  voterUserId: string
  positionId: string
  applicationId: string
  castAt: string
}

export type ElectionPositionResultRow = {
  rank: number
  applicationId: string
  candidateName: string
  votes: number
  percentage: number
  ballotPhotoDataUrl: string | null
}

export type ElectionResultsPositionBlock = {
  positionId: string
  positionTitle: string
  rows: ElectionPositionResultRow[]
}

export type ElectionResultsDetail = {
  election: ElectionRecord
  eligibleVoters: number
  votersParticipated: number
  turnoutPercent: number
  positions: ElectionResultsPositionBlock[]
}
