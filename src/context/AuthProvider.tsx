import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/user'
import {
  addUser,
  changePasswordForUser,
  findUserByEmail,
  findUserById,
  getSessionUserId,
  setSessionUserId,
  updateUserRecord,
} from '../lib/authStorage'
import { assertUserMaySignIn } from '../lib/loginPolicy'
import { profileFieldsFromForm } from '../lib/profileFromForm'
import { roleFromPublicAccountType } from '../lib/publicRegistration'
import { assertPasswordRules } from '../lib/registrationValidate'
import { clearLocalSupabaseAuthSession } from '../lib/supabase/mirror'
import { AuthContext } from './authContext'
import type { RegistrationFormState } from '../types/registrationForm'

/**
 * Session user is read from localStorage (JSON). A fresh parse runs on each call,
 * so object identity is never stable — do not use useSyncExternalStore(getSnapshot)
 * here; React 19 will error when the snapshot reference changes every read.
 */
function readSessionUser(): User | null {
  let id = getSessionUserId()
  if (!id) return null
  const first = findUserById(id)
  if (first) return first
  // Session id may have been rewritten during `readUsers` migration (e.g. seed-mis-officer → seed-mis-office).
  id = getSessionUserId()
  if (!id) return null
  return findUserById(id) ?? null
}

function subscribeAuth(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener('bevms-auth', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('bevms-auth', callback)
  }
}

function emitAuth() {
  window.dispatchEvent(new Event('bevms-auth'))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSessionUser())

  useEffect(() => {
    function sync() {
      setUser(readSessionUser())
    }
    sync()
    return subscribeAuth(sync)
  }, [])

  const login = useCallback((email: string, password: string) => {
    const u = findUserByEmail(email)
    if (!u || u.password !== password) {
      throw new Error('Invalid email or password.')
    }
    assertUserMaySignIn(u)
    setSessionUserId(u.id)
    emitAuth()
  }, [])

  const logout = useCallback(() => {
    setSessionUserId(null)
    setUser(null)
    document.body.style.removeProperty('overflow')
    clearLocalSupabaseAuthSession()
    emitAuth()
  }, [])

  const updateProfile = useCallback(
    (input: {
      fullName?: string
      profilePhotoDataUrl?: string | null
    }) => {
      const id = getSessionUserId()
      if (!id) throw new Error('Not signed in.')
      updateUserRecord(id, (u) => {
        const next = { ...u }
        if (input.fullName !== undefined) {
          const name = input.fullName.trim()
          if (name) next.fullName = name
        }
        if (input.profilePhotoDataUrl === null) {
          delete next.profilePhotoDataUrl
        } else if (input.profilePhotoDataUrl !== undefined) {
          next.profilePhotoDataUrl = input.profilePhotoDataUrl
        }
        return next
      })
    },
    [],
  )

  const changePassword = useCallback(
    (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ) => {
      const id = getSessionUserId()
      if (!id) throw new Error('Not signed in.')
      changePasswordForUser(
        id,
        currentPassword,
        newPassword,
        confirmPassword,
      )
    },
    [],
  )

  const registerVoter = useCallback(
    (input: {
      form: RegistrationFormState
      profilePhotoDataUrl: string | null
    }) => {
      const f = input.form
      assertPasswordRules(f)
      const email = f.email.trim().toLowerCase()
      if (findUserByEmail(email)) {
        throw new Error('This email is already registered.')
      }
      const mappedRole = roleFromPublicAccountType(f.accountType)
      if (!mappedRole) {
        throw new Error('Please select Voter or Candidate as account type.')
      }
      const profile = profileFieldsFromForm(f)
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        role: mappedRole,
        password: f.password,
        registrationStatus: 'pending',
        profilePhotoDataUrl: input.profilePhotoDataUrl || undefined,
        ...profile,
      }
      addUser(newUser)
    },
    [],
  )

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      registerVoter,
      updateProfile,
      changePassword,
    }),
    [user, login, logout, registerVoter, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
