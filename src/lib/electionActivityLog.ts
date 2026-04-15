import type { AppRole } from '../types/roles'
import { mirrorElectionActivityLogs } from './supabase/mirror'

export type ElectionActivityActorRole = AppRole

/** Roles allowed to perform logged election actions in this demo. */
export const ELECTION_ACTIVITY_ROLES: readonly ElectionActivityActorRole[] = [
  'admin',
  'mis_office',
  'osa_office',
]

export type ElectionActivityActor = {
  userId: string
  email: string
  role: ElectionActivityActorRole
}

export function electionActivityActorFromUser(
  user: { id: string; email: string; role: string } | null | undefined,
): ElectionActivityActor | undefined {
  if (!user) return undefined
  const r = user.role as AppRole
  if (r === 'admin' || r === 'mis_office' || r === 'osa_office') {
    return { userId: user.id, email: user.email, role: r }
  }
  return undefined
}

export type ElectionActivityAction =
  | 'election_create'
  | 'election_update'
  | 'election_delete'
  | 'election_manual_complete'
  | 'results_publish'
  | 'vote_cast'

export type ElectionActivityLogEntry = {
  id: string
  at: string
  action: ElectionActivityAction
  electionId: string
  electionDisplayId: number
  electionTitle: string
  actorUserId: string
  actorEmail: string
  actorRole: ElectionActivityActorRole
  detail?: string
}

const LOG_KEY = 'bevms_election_activity_log'
const MAX_ENTRIES = 500

function emitElectionActivityLogChanged() {
  window.dispatchEvent(new Event('bevms-election-activity-log'))
}

function readRaw(): ElectionActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ElectionActivityLogEntry[]
  } catch {
    return []
  }
}

function writeRaw(rows: ElectionActivityLogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(rows))
  void mirrorElectionActivityLogs(rows)
}

export function appendElectionActivityLog(
  entry: Omit<ElectionActivityLogEntry, 'id' | 'at'>,
): void {
  const row: ElectionActivityLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  }
  const next = [row, ...readRaw()].slice(0, MAX_ENTRIES)
  writeRaw(next)
  emitElectionActivityLogChanged()
}

export function getElectionActivityLogs(): ElectionActivityLogEntry[] {
  return readRaw()
}

export function electionActivityActionLabel(
  action: ElectionActivityAction,
): string {
  switch (action) {
    case 'election_create':
      return 'Election created'
    case 'election_update':
      return 'Election updated'
    case 'election_delete':
      return 'Election deleted'
    case 'election_manual_complete':
      return 'Election marked complete (backup)'
    case 'results_publish':
      return 'Official results recorded'
    case 'vote_cast':
      return 'Ballot submitted'
  }
}
