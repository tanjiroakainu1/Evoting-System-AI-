export type AppRole =
  | 'admin'
  | 'voter'
  | 'candidate'
  | 'mis_office'
  | 'osa_office'

/** Roles provisioned by administrators (no self-registration). */
export const PROVISIONED_ROLES: readonly AppRole[] = [
  'admin',
  'candidate',
  'mis_office',
  'osa_office',
] as const

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  voter: 'Voter',
  candidate: 'Candidate',
  mis_office: 'MIS Office',
  osa_office: 'OSA Office',
}

/** Safe label for any `User.role` string (includes legacy keys from older localStorage). */
export function getRoleDisplayLabel(role: string): string {
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as AppRole]
  }
  if (role === 'mis_officer') {
    return 'MIS Office'
  }
  return role
}
