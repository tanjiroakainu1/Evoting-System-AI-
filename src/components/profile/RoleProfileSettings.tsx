import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import { readFileAsDataUrl } from '../../lib/readDataUrl'
import type { User } from '../../types/user'
import { getRoleDisplayLabel } from '../../types/roles'

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-stone-900 shadow-inner shadow-stone-300/40 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const panelClass =
  'rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm sm:p-7'

type PhotoDraft = 'unchanged' | 'removed' | string

export function RoleProfileSettings({
  heading,
  description,
  profileUser,
}: {
  heading: string
  description: string
  profileUser: User
}) {
  const { updateProfile, changePassword } = useAuth()
  const [fullName, setFullName] = useState(profileUser.fullName)
  const [photoDraft, setPhotoDraft] = useState<PhotoDraft>('unchanged')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const previewSrc =
    photoDraft === 'removed'
      ? null
      : photoDraft === 'unchanged'
        ? profileUser.profilePhotoDataUrl ?? null
        : photoDraft

  async function onPhotoFile(file: File | null) {
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setPhotoDraft(dataUrl)
      setProfileError(null)
    } catch {
      setProfileError('Could not read the image file.')
    }
  }

  function onProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileMessage(null)
    try {
      const patch: {
        fullName?: string
        profilePhotoDataUrl?: string | null
      } = {}
      const trimmed = fullName.trim()
      if (trimmed && trimmed !== profileUser.fullName) {
        patch.fullName = trimmed
      }
      if (photoDraft === 'removed') {
        patch.profilePhotoDataUrl = null
      } else if (photoDraft !== 'unchanged') {
        patch.profilePhotoDataUrl = photoDraft
      }
      if (
        patch.fullName === undefined &&
        patch.profilePhotoDataUrl === undefined
      ) {
        setProfileMessage('No profile changes to save.')
        return
      }
      updateProfile(patch)
      setPhotoDraft('unchanged')
      if (patch.fullName !== undefined) {
        setFullName(patch.fullName)
      }
      setProfileMessage('Profile updated.')
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Could not update profile.',
      )
    }
  }

  function onPasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    try {
      changePassword(currentPassword, newPassword, confirmPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password updated. Use your new password next sign-in.')
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Could not change password.',
      )
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
          {heading}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-400">
          <span className="rounded-md border border-stone-300 bg-stone-50 px-2 py-0.5 font-display text-[0.65rem] font-medium uppercase tracking-wide text-red-800/85">
            {getRoleDisplayLabel(profileUser.role)}
          </span>
          <span className="text-stone-500">System profile ID</span>
          <span className="font-mono tabular-nums text-lg tracking-wide text-red-900/95">
            {profileUser.profileDisplayId ?? '—'}
          </span>
          <span className="text-xs text-stone-600">
            (unique; assigned when your account was created)
          </span>
        </p>
      </div>

      <form onSubmit={onProfileSubmit} className={panelClass}>
        <h2 className="font-display text-lg font-semibold text-red-900">
          Profile & photo
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Photo is stored locally for this demo (data URL). Use a small image
          for best performance.
        </p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
              Profile photo
            </p>
            <div className="mt-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-stone-600">No photo</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-lg border border-red-800/50 bg-red-50 px-3 py-2 text-xs font-medium text-red-900 hover:bg-red-900/50">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onPhotoFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {previewSrc ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDraft('removed')
                    setProfileError(null)
                  }}
                  className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <label
                htmlFor="profile-full-name"
                className="text-xs font-medium uppercase tracking-wide text-red-800/85"
              >
                Full name
              </label>
              <input
                id="profile-full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
                autoComplete="name"
              />
            </div>
            <div>
              <label
                htmlFor="profile-email-readonly"
                className="text-xs font-medium uppercase tracking-wide text-red-800/85"
              >
                Email
              </label>
              <input
                id="profile-email-readonly"
                value={profileUser.email}
                readOnly
                className={`${fieldClass} cursor-not-allowed opacity-80`}
              />
            </div>
          </div>
        </div>

        {profileError ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {profileError}
          </p>
        ) : null}
        {profileMessage ? (
          <p className="mt-4 rounded-lg border border-red-800/40 bg-red-50 px-3 py-2 text-sm text-red-900">
            {profileMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="font-display mt-6 rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-red-950/35 transition-all hover:from-red-500 active:scale-[0.99]"
        >
          Save profile
        </button>
      </form>

      <form onSubmit={onPasswordSubmit} className={panelClass}>
        <h2 className="font-display text-lg font-semibold text-red-900">
          Change password
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Use a secure password for this account.
        </p>

        <div className="mt-6 max-w-md space-y-4">
          <div>
            <label
              htmlFor="profile-current-password"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Current password
            </label>
            <input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="profile-new-password"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              New password
            </label>
            <input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label
              htmlFor="profile-confirm-password"
              className="text-xs font-medium uppercase tracking-wide text-red-800/85"
            >
              Confirm new password
            </label>
            <input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        {passwordError ? (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {passwordError}
          </p>
        ) : null}
        {passwordMessage ? (
          <p className="mt-4 rounded-lg border border-red-800/40 bg-red-50 px-3 py-2 text-sm text-red-900">
            {passwordMessage}
          </p>
        ) : null}

        <button
          type="submit"
          className="font-display mt-6 rounded-xl border border-red-600 bg-red-700 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-red-800 active:scale-[0.99]"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
