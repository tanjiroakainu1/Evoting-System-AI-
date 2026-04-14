import { createContext } from 'react'
import type { User } from '../types/user'
import type { RegistrationFormState } from '../types/registrationForm'

export type AuthState = {
  user: User | null
  login: (email: string, password: string) => void
  logout: () => void
  registerVoter: (input: {
    form: RegistrationFormState
    profilePhotoDataUrl: string | null
  }) => void
  updateProfile: (input: {
    fullName?: string
    /** Omit = leave unchanged; `null` = remove photo; string = new image (data URL). */
    profilePhotoDataUrl?: string | null
  }) => void
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => void
}

export const AuthContext = createContext<AuthState | null>(null)
