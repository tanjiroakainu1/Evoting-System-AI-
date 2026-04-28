import type { User } from '../../types/user'
import type {
  BallotPosition,
  BallotVoteRecord,
  CampaignApplicationRecord,
  ElectionRecord,
  ElectionVoterEnrollment,
} from '../../types/election'
import type { ElectionActivityLogEntry } from '../electionActivityLog'
import type { OfficialResultsRelease } from '../electionsStorage'
import { supabase } from './client'

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

function warnSync(scope: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  console.warn(`[supabase][mirror:${scope}] ${message}`)
}

async function replaceTableRows<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  clearColumn: string = 'id',
) {
  if (!hasSupabaseConfig) return
  try {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .neq(clearColumn, '')
    if (deleteError) throw deleteError
    if (!rows.length) return
    const { error: insertError } = await supabase.from(table).insert(rows)
    if (insertError) throw insertError
  } catch (err) {
    warnSync(table, err)
  }
}

/** Clears Supabase Auth tokens from browser storage (no network). Helps avoid slow background refresh after sign-out. */
export function clearLocalSupabaseAuthSession(): void {
  if (!hasSupabaseConfig) return
  void supabase.auth.signOut({ scope: 'local' }).catch(() => {
    /* ignore */
  })
}

export async function ensureSupabaseAuthUser(input: {
  email: string
  password: string
  fullName: string
  role: string
}) {
  if (!hasSupabaseConfig) return
  try {
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: input.role,
        },
      },
    })
    if (error && !/already registered/i.test(error.message)) {
      throw error
    }
  } catch (err) {
    warnSync('auth.signUp', err)
  }
}

export async function mirrorUsers(users: User[]) {
  if (!hasSupabaseConfig) return
  const rows = users.map((u) => ({
    id: u.id,
    auth_user_id: null,
    profile_display_id:
      typeof u.profileDisplayId === 'number' ? u.profileDisplayId : null,
    email: u.email,
    full_name: u.fullName,
    role: u.role,
    demo_password: u.password,
    registration_status: u.registrationStatus ?? 'approved',
    profile_photo_data_url: u.profilePhotoDataUrl ?? null,
    account_type: u.accountType ?? null,
    last_name: u.lastName ?? null,
    first_name: u.firstName ?? null,
    middle_name: u.middleName ?? null,
    extension_name: u.extensionName ?? null,
    gender: u.gender ?? null,
    birthday: u.birthday || null,
    citizenship: u.citizenship ?? null,
    civil_status: u.civilStatus ?? null,
    contact_number: u.contactNumber ?? null,
    province: u.province ?? null,
    town_city: u.townCity ?? null,
    barangay: u.barangay ?? null,
    zip_code: u.zipCode ?? null,
    campus: u.campus ?? null,
    id_number: u.idNumber ?? null,
    department: u.department ?? null,
    course: u.course ?? null,
    year: u.year ?? null,
    academic_year: u.academicYear ?? null,
    semester: u.semester ?? null,
    student_status: u.studentStatus ?? null,
    precinct: u.precinct ?? null,
  }))
  try {
    const { error } = await supabase.from('app_users').upsert(rows, {
      onConflict: 'id',
    })
    if (error) throw error
  } catch (err) {
    warnSync('app_users', err)
  }
}

export async function deleteMirroredUser(userId: string) {
  if (!hasSupabaseConfig) return
  try {
    const { error } = await supabase.from('app_users').delete().eq('id', userId)
    if (error) throw error
  } catch (err) {
    warnSync('app_users.delete', err)
  }
}

export async function mirrorBallotPositions(positions: BallotPosition[]) {
  if (!hasSupabaseConfig) return
  const rows = positions.map((p) => ({
    id: p.id,
    title: p.title,
  }))
  try {
    const { error } = await supabase.from('ballot_positions').upsert(rows, {
      onConflict: 'id',
    })
    if (error) throw error
  } catch (err) {
    warnSync('ballot_positions', err)
  }
}

export async function mirrorElections(elections: ElectionRecord[]) {
  if (!hasSupabaseConfig) return
  const rows = elections.map((e) => ({
    id: e.id,
    display_id: e.displayId,
    title: e.title,
    description: e.description,
    organization_type: e.organizationType,
    voting_venue: e.votingVenue,
    policies: e.policies,
    start_at: e.startAt,
    end_at: e.endAt,
    election_pin: e.electionPin,
    created_by_user_id: e.createdByUserId,
    created_by_name: e.createdByName,
    manual_completed_at: e.manualCompletedAt ?? null,
    created_at: e.createdAt,
  }))
  try {
    const { error } = await supabase.from('elections').upsert(rows, {
      onConflict: 'id',
    })
    if (error) throw error
  } catch (err) {
    warnSync('elections', err)
  }

  const electionPositions = elections.flatMap((e) =>
    e.positionIds.map((pid, idx) => ({
      election_id: e.id,
      position_id: pid,
      position_title_snapshot: e.positionTitles[idx] ?? pid,
    })),
  )
  await replaceTableRows('election_positions', electionPositions, 'election_id')
}

export async function mirrorEnrollments(rows: ElectionVoterEnrollment[]) {
  await replaceTableRows(
    'election_voter_enrollments',
    rows.map((r) => ({
      election_id: r.electionId,
      user_id: r.userId,
      voter_email: r.voterEmail,
      voter_name: r.voterName,
      pin: r.pin,
    })),
    'election_id',
  )
}

export async function mirrorCampaignApplications(rows: CampaignApplicationRecord[]) {
  if (!hasSupabaseConfig) return
  const mapped = rows.map((r) => ({
    id: r.id,
    election_id: r.electionId,
    candidate_user_id: r.candidateUserId,
    position_id: r.positionId,
    platform: r.platform,
    ballot_photo_data_url: r.ballotPhotoDataUrl,
    status: r.status,
    created_at: r.createdAt,
    reviewed_at: r.reviewedAt,
    reviewed_by_user_id: r.reviewedByUserId,
    reviewed_by_name: r.reviewedByName,
  }))
  try {
    const { error } = await supabase.from('campaign_applications').upsert(mapped, {
      onConflict: 'id',
    })
    if (error) throw error
  } catch (err) {
    warnSync('campaign_applications', err)
  }
}

export async function mirrorBallotVotes(rows: BallotVoteRecord[]) {
  await replaceTableRows(
    'ballot_votes',
    rows.map((r) => ({
      election_id: r.electionId,
      voter_user_id: r.voterUserId,
      position_id: r.positionId,
      application_id: r.applicationId,
      cast_at: r.castAt,
    })),
    'election_id',
  )
}

export async function mirrorOfficialResultsReleases(rows: OfficialResultsRelease[]) {
  if (!hasSupabaseConfig) return
  const mapped = rows.map((r) => ({
    id: r.id,
    election_id: r.electionId,
    created_at: r.createdAt,
    created_by_user_id: r.createdByUserId,
    created_by_email: r.createdByEmail,
    created_by_role: r.createdByRole,
  }))
  try {
    const { error } = await supabase
      .from('official_results_releases')
      .upsert(mapped, { onConflict: 'id' })
    if (error) throw error
  } catch (err) {
    warnSync('official_results_releases', err)
  }
}

export async function mirrorElectionActivityLogs(rows: ElectionActivityLogEntry[]) {
  if (!hasSupabaseConfig) return
  const mapped = rows.map((r) => ({
    id: r.id,
    action: r.action,
    election_id: r.electionId,
    election_display_id: r.electionDisplayId,
    election_title: r.electionTitle,
    actor_user_id: r.actorUserId,
    actor_email: r.actorEmail,
    actor_role: r.actorRole,
    created_at: r.at,
  }))
  try {
    const { error } = await supabase
      .from('election_activity_logs')
      .upsert(mapped, { onConflict: 'id' })
    if (error) throw error
  } catch (err) {
    warnSync('election_activity_logs', err)
  }
}
