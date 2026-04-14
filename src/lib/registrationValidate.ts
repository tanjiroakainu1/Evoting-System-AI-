import type { RegistrationFormState } from '../types/registrationForm'

export function assertPasswordRules(f: RegistrationFormState) {
  if (f.password.length !== 8) {
    throw new Error('Password must be exactly 8 characters.')
  }
  if (f.password !== f.confirmPassword) {
    throw new Error('Passwords do not match.')
  }
}

/** Used when changing password while signed in (same length rule as registration). */
export function assertNewPasswordPair(
  newPassword: string,
  confirmPassword: string,
) {
  if (newPassword.length !== 8) {
    throw new Error('New password must be exactly 8 characters.')
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match.')
  }
}
