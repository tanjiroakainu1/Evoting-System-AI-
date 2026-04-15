import type { RegistrationFormState } from '../types/registrationForm'

export function assertPasswordRules(f: RegistrationFormState) {
  if (!f.password.trim()) {
    throw new Error('Password is required.')
  }
  if (f.password !== f.confirmPassword) {
    throw new Error('Passwords do not match.')
  }
}

/** Used when changing password while signed in. */
export function assertNewPasswordPair(
  newPassword: string,
  confirmPassword: string,
) {
  if (!newPassword.trim()) {
    throw new Error('New password is required.')
  }
  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match.')
  }
}
