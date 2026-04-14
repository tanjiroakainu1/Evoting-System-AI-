import type { AppRole } from '../types/roles'

/** Maps public Register "Account type" to system role. */
export function roleFromPublicAccountType(
  accountType: string,
): AppRole | null {
  const t = accountType.trim()
  if (t === 'Voter') return 'voter'
  if (t === 'Candidate') return 'candidate'
  return null
}
