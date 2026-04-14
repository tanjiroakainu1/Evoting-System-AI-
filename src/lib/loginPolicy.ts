import type { User } from '../types/user'

export function assertUserMaySignIn(u: User) {
  const s = u.registrationStatus
  if (s === 'pending') {
    throw new Error(
      'Your registration is pending administrator approval. You will be able to sign in once it is approved.',
    )
  }
  if (s === 'rejected') {
    throw new Error(
      'Your registration was not approved. Please contact the administrator.',
    )
  }
}

/** For display in directory / tables */
export function registrationStatusLabel(u: User): string {
  const s = u.registrationStatus
  if (s === 'pending') return 'Pending approval'
  if (s === 'rejected') return 'Rejected'
  return 'Approved'
}
