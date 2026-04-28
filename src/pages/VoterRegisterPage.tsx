import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AppRole } from '../types/roles'
import { roleBasePath } from '../lib/rolePaths'
import { InstitutionalTopBar } from '../components/InstitutionalTopBar'
import { IspscSealGraphic } from '../components/landing/LandingIcons'
import { FullRegistrationFormFields } from '../components/registration/FullRegistrationFormFields'
import { PUBLIC_REGISTRATION_ACCOUNT_TYPES } from '../lib/registrationOptions'
import {
  initialRegistrationFormState,
  type RegistrationFormState,
} from '../types/registrationForm'
import { readFileAsDataUrl } from '../lib/readDataUrl'

export function VoterRegisterPage() {
  const { user, registerVoter } = useAuth()
  const [form, setForm] = useState<RegistrationFormState>(() =>
    initialRegistrationFormState(),
  )
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const passwordMismatch =
    Boolean(form.confirmPassword) && form.password !== form.confirmPassword

  function patchForm(p: Partial<RegistrationFormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  async function onPhotoChange(file: File | null) {
    if (!file) {
      setProfilePhotoDataUrl(null)
      return
    }
    try {
      const url = await readFileAsDataUrl(file)
      setProfilePhotoDataUrl(url)
    } catch {
      setError('Could not read the profile photo.')
    }
  }

  if (user) {
    return <Navigate to={roleBasePath(user.role as AppRole)} replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (passwordMismatch) {
      setError('Passwords do not match.')
      return
    }
    try {
      registerVoter({ form, profilePhotoDataUrl })
      setSubmitted(true)
      setForm(initialRegistrationFormState())
      setProfilePhotoDataUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      <InstitutionalTopBar containerClass="max-w-4xl">
        <div>
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-200/85">
            E‑Vote · ISPSC Tagudin
          </p>
          <p className="font-display text-base font-semibold text-white">
            Voter / candidate registration
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Home
        </Link>
      </InstitutionalTopBar>
      <div className="pointer-events-none fixed inset-0 top-14 bg-[radial-gradient(ellipse_at_top,_rgba(185,28,28,0.08),transparent_55%)] sm:top-16" />
      <div className="relative mx-auto max-w-4xl flex-1 px-3 py-8 sm:px-5 sm:py-12">
        <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white shadow-lg shadow-stone-200/50 sm:h-20 sm:w-20">
              <IspscSealGraphic className="h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-red-700/90">
                ISPSC
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900 sm:text-3xl">
                Register
              </h1>
              <p className="mt-1 text-sm font-medium text-stone-600">
                Create your account to participate in elections
              </p>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Choose <span className="text-red-800/90">Voter</span> or{' '}
                <span className="text-red-800/90">Candidate</span>. An
                administrator must approve your registration before you can sign
                in.
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-red-700/90 transition-colors hover:text-red-800"
          >
            ← Back to home
          </Link>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-red-800/40 bg-red-950/25 p-8 text-center shadow-xl ring-1 ring-red-900/30 backdrop-blur-sm">
            <p className="font-display text-lg font-semibold text-red-900">
              Registration submitted
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-stone-400">
              Your account is pending administrator approval. You will be able to
              sign in after an admin approves your registration in User
              management.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-xl border border-red-800/50 bg-white px-5 py-2.5 text-sm font-medium text-red-900 hover:bg-red-50"
              >
                Register another account
              </button>
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-900 px-5 py-2.5 text-sm font-semibold text-white hover:from-red-500"
              >
                Go to login
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl shadow-stone-300/50 ring-1 ring-stone-200 backdrop-blur-sm sm:p-8"
          >
            <FullRegistrationFormFields
              idPrefix="vf-"
              value={form}
              onChange={patchForm}
              profilePhotoPreview={profilePhotoDataUrl}
              onPhotoChange={onPhotoChange}
              passwordMode="register"
              showPasswordFields
              passwordMismatch={passwordMismatch}
              accountTypeOptions={
                PUBLIC_REGISTRATION_ACCOUNT_TYPES as unknown as string[]
              }
            />

            {error ? (
              <p className="mt-8 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="font-display mt-8 w-full rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-lg shadow-red-950/35 transition-all duration-200 hover:from-red-500 hover:shadow-xl active:scale-[0.99]"
            >
              Submit registration
            </button>

            <p className="mt-6 text-center text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-red-700 hover:text-red-800"
              >
                Login here
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
