import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/useAuth'
import type { AppRole } from '../../types/roles'
import { getRoleDisplayLabel, ROLE_LABELS } from '../../types/roles'
import type { User } from '../../types/user'
import {
  addUser,
  approveRegistration,
  deleteUserById,
  getDirectoryUsersForRole,
  getPendingRegistrationsForRoles,
  rejectRegistration,
  updateUserRecord,
} from '../../lib/authStorage'
import { registrationStatusLabel } from '../../lib/loginPolicy'
import { profileFieldsFromForm } from '../../lib/profileFromForm'
import { registrationFormFromUser } from '../../lib/registrationFromUser'
import { assertPasswordRules } from '../../lib/registrationValidate'
import { readFileAsDataUrl } from '../../lib/readDataUrl'
import {
  initialRegistrationFormState,
  type RegistrationFormState,
} from '../../types/registrationForm'
import { IspscSealGraphic } from '../landing/LandingIcons'
import { FullRegistrationFormFields } from '../registration/FullRegistrationFormFields'

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-stone-900 shadow-inner shadow-stone-300/40 transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const btnSecondary =
  'rounded-lg border border-red-800/50 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-900/50'

const btnDanger =
  'rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200'

const btnPrimary =
  'rounded-lg border border-red-600 bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800'

function detailLabel(k: string): string {
  return k
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

export type RoleManagementConsoleProps = {
  title: string
  subtitle: string
  managedRole: AppRole
  pendingRoles: AppRole[]
  idPrefix: string
  accountTypeOptions: readonly string[]
  addUserHeading: string
  addUserBlurb: string
}

export function RoleManagementConsole({
  title,
  subtitle,
  managedRole,
  pendingRoles,
  idPrefix,
  accountTypeOptions,
  addUserHeading,
  addUserBlurb,
}: RoleManagementConsoleProps) {
  const { user: actingUser } = useAuth()
  const [directory, setDirectory] = useState(() =>
    getDirectoryUsersForRole(managedRole),
  )
  const [form, setForm] = useState<RegistrationFormState>(() =>
    initialRegistrationFormState(),
  )
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(
    null,
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [pendingActionError, setPendingActionError] = useState<string | null>(
    null,
  )

  const [detailsUser, setDetailsUser] = useState<User | null>(null)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<RegistrationFormState | null>(null)
  const [editPhotoDraft, setEditPhotoDraft] = useState<
    'unchanged' | 'removed' | string
  >('unchanged')
  const [editError, setEditError] = useState<string | null>(null)

  const pending = getPendingRegistrationsForRoles(pendingRoles)

  const passwordMismatch =
    Boolean(form.confirmPassword) && form.password !== form.confirmPassword
  const editPasswordMismatch =
    editForm != null &&
    Boolean(editForm.confirmPassword) &&
    editForm.password !== editForm.confirmPassword

  function refreshDirectory() {
    setDirectory(getDirectoryUsersForRole(managedRole))
  }

  function patchForm(p: Partial<RegistrationFormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function patchEditForm(p: Partial<RegistrationFormState>) {
    setEditForm((prev) => (prev ? { ...prev, ...p } : prev))
  }

  async function onPhotoChange(file: File | null) {
    if (!file) {
      setProfilePhotoDataUrl(null)
      return
    }
    try {
      setProfilePhotoDataUrl(await readFileAsDataUrl(file))
    } catch {
      setFormError('Could not read the profile photo.')
    }
  }

  async function onEditPhotoChange(file: File | null) {
    if (!file) return
    try {
      setEditPhotoDraft(await readFileAsDataUrl(file))
      setEditError(null)
    } catch {
      setEditError('Could not read the profile photo.')
    }
  }

  function resetAddForm() {
    setForm(initialRegistrationFormState())
    setProfilePhotoDataUrl(null)
  }

  function onAddUser(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    try {
      assertPasswordRules(form)
      const email = form.email.trim().toLowerCase()
      const profile = profileFieldsFromForm(form)
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        role: managedRole,
        password: form.password,
        registrationStatus: 'approved',
        profilePhotoDataUrl: profilePhotoDataUrl || undefined,
        ...profile,
      }
      addUser(newUser)
      refreshDirectory()
      setFormSuccess(
        `Added ${ROLE_LABELS[managedRole]}: ${newUser.fullName}`,
      )
      resetAddForm()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not add this user.',
      )
    }
  }

  function onApprove(userId: string) {
    setPendingActionError(null)
    try {
      approveRegistration(userId)
      refreshDirectory()
    } catch (err) {
      setPendingActionError(
        err instanceof Error ? err.message : 'Could not approve.',
      )
    }
  }

  function onReject(userId: string) {
    setPendingActionError(null)
    try {
      rejectRegistration(userId)
      refreshDirectory()
    } catch (err) {
      setPendingActionError(
        err instanceof Error ? err.message : 'Could not reject.',
      )
    }
  }

  function openEdit(u: User) {
    setEditError(null)
    setEditTarget(u)
    setEditForm(registrationFormFromUser(u))
    setEditPhotoDraft('unchanged')
  }

  function closeEdit() {
    setEditTarget(null)
    setEditForm(null)
    setEditPhotoDraft('unchanged')
    setEditError(null)
  }

  const editPreviewSrc =
    editTarget && editPhotoDraft === 'removed'
      ? null
      : editTarget && editPhotoDraft === 'unchanged'
        ? editTarget.profilePhotoDataUrl ?? null
        : typeof editPhotoDraft === 'string'
          ? editPhotoDraft
          : null

  function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editTarget || !editForm) return
    setEditError(null)
    try {
      if (editForm.password.length > 0) {
        assertPasswordRules(editForm)
      } else if (editForm.confirmPassword.length > 0) {
        throw new Error('Enter both new password fields, or leave both blank.')
      }
      const profile = profileFieldsFromForm(editForm)
      const nextPassword =
        editForm.password.length > 0 ? editForm.password : editTarget.password

      updateUserRecord(editTarget.id, (prev) => {
        const next: User = {
          ...prev,
          ...profile,
          email: prev.email,
          password: nextPassword,
          role: managedRole,
        }
        if (editPhotoDraft === 'removed') {
          delete next.profilePhotoDataUrl
        } else if (
          editPhotoDraft !== 'unchanged' &&
          typeof editPhotoDraft === 'string'
        ) {
          next.profilePhotoDataUrl = editPhotoDraft
        }
        return next
      })
      refreshDirectory()
      closeEdit()
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : 'Could not save changes.',
      )
    }
  }

  function onDelete(u: User) {
    if (
      !window.confirm(
        `Delete account for ${u.fullName} (${u.email})? This cannot be undone.`,
      )
    ) {
      return
    }
    try {
      deleteUserById(u.id, { actingUserId: actingUser?.id ?? null })
      refreshDirectory()
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Could not delete user.',
      )
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-red-900">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">{subtitle}</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-300 bg-white shadow-lg">
          <IspscSealGraphic className="h-11 w-11" />
        </div>
      </div>

      {pending.length > 0 ? (
        <div className="rounded-2xl border border-amber-900/35 bg-amber-50 p-6 shadow-xl ring-1 ring-amber-900/25 backdrop-blur-sm">
          <h2 className="font-display text-lg font-semibold text-amber-900">
            Pending registration approvals
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {pending.length} request{pending.length === 1 ? '' : 's'} awaiting
            your decision ({pendingRoles.map((r) => ROLE_LABELS[r]).join(', ')}
            ).
          </p>
          {pendingActionError ? (
            <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
              {pendingActionError}
            </p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {pending.map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-stone-800">{u.fullName}</p>
                  <p className="text-sm text-stone-500">{u.email}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Account type:{' '}
                    <span className="text-red-800/90">
                      {u.accountType ?? '—'}
                    </span>
                    {' · '}
                    Role:{' '}
                    <span className="text-red-800/90">
                      {getRoleDisplayLabel(u.role)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailsUser(u)}
                    className={btnSecondary}
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove(u.id)}
                    className={btnPrimary}
                  >
                    Approve registration
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(u.id)}
                    className={btnDanger}
                  >
                    Reject registration
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        onSubmit={onAddUser}
        className="max-w-5xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm sm:p-8"
      >
        <div className="mb-8 border-b border-stone-200 pb-6">
          <h2 className="font-display text-lg font-semibold text-red-900">
            {addUserHeading}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{addUserBlurb}</p>
          <p className="mt-2 text-xs text-stone-600">
            New account role:{' '}
            <span className="font-medium text-red-800/90">
              {ROLE_LABELS[managedRole]}
            </span>
            . Password must be exactly 8 characters.
          </p>
        </div>

        <FullRegistrationFormFields
          idPrefix={idPrefix}
          value={form}
          onChange={patchForm}
          profilePhotoPreview={profilePhotoDataUrl}
          onPhotoChange={onPhotoChange}
          passwordMode="admin"
          showPasswordFields
          passwordMismatch={passwordMismatch}
          accountTypeOptions={accountTypeOptions}
        />

        {formError ? (
          <p className="mt-8 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {formError}
          </p>
        ) : null}
        {formSuccess ? (
          <p className="mt-8 rounded-lg border border-red-800/40 bg-red-50 px-3 py-2 text-sm text-red-900">
            {formSuccess}
          </p>
        ) : null}

        <button
          type="submit"
          className="font-display mt-8 w-full max-w-md rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-red-950/35 transition-all duration-200 hover:from-red-500 hover:shadow-xl active:scale-[0.99]"
        >
          Save user
        </button>
      </form>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200/90 backdrop-blur-sm">
        <h2 className="font-display text-lg font-semibold text-red-900">
          Directory
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {directory.length} active{' '}
          {ROLE_LABELS[managedRole].toLowerCase()}
          {directory.length === 1 ? '' : 's'} (pending requests appear above)
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <th className="px-3 py-3 font-medium text-red-800/80">Photo</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Name</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Email</th>
                <th className="px-3 py-3 font-medium text-red-800/80">
                  Account type
                </th>
                <th className="px-3 py-3 font-medium text-red-800/80">Campus</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Course</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Status</th>
                <th className="px-3 py-3 font-medium text-red-800/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directory.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-stone-200/80 transition-colors last:border-0 hover:bg-stone-50/80"
                >
                  <td className="px-3 py-2 align-middle">
                    {u.profilePhotoDataUrl ? (
                      <img
                        src={u.profilePhotoDataUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg border border-stone-200 object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-xs text-stone-600">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-stone-800">
                    {u.fullName}
                  </td>
                  <td className="px-3 py-2 text-stone-400">{u.email}</td>
                  <td className="px-3 py-2 text-stone-400">
                    {u.accountType ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-stone-400">
                    {u.campus ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-stone-400">{u.course ?? '—'}</td>
                  <td className="px-3 py-2 text-stone-400">
                    <span
                      className={
                        u.registrationStatus === 'rejected'
                          ? 'text-red-700'
                          : 'text-stone-500'
                      }
                    >
                      {registrationStatusLabel(u)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsUser(u)}
                        className={btnSecondary}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className={btnPrimary}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u)}
                        disabled={actingUser?.id === u.id}
                        className={`${btnDanger} disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailsUser ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-details-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-300 bg-stone-50 p-6 shadow-2xl">
            <h2
              id="user-details-title"
              className="font-display text-lg font-semibold text-red-900"
            >
              Account details
            </h2>
            <p className="mt-1 text-sm text-stone-500">{detailsUser.email}</p>
            <dl className="mt-4 space-y-2 text-sm">
              {(Object.keys(detailsUser) as (keyof User)[]).map((key) => {
                const val = detailsUser[key]
                if (val === undefined || val === '') return null
                if (key === 'password') {
                  return (
                    <div
                      key={key}
                      className="flex justify-between gap-4 border-b border-stone-200/80 py-2"
                    >
                      <dt className="text-stone-500">{detailLabel(String(key))}</dt>
                      <dd className="text-right text-stone-400">••••••••</dd>
                    </div>
                  )
                }
                if (key === 'profilePhotoDataUrl' && typeof val === 'string') {
                  return (
                    <div key={key} className="py-2">
                      <dt className="text-stone-500">{detailLabel(String(key))}</dt>
                      <dd className="mt-2">
                        <img
                          src={val}
                          alt=""
                          className="h-24 w-24 rounded-lg border border-stone-200 object-cover"
                        />
                      </dd>
                    </div>
                  )
                }
                return (
                  <div
                    key={key}
                    className="flex justify-between gap-4 border-b border-stone-200/80 py-2"
                  >
                    <dt className="text-stone-500">{detailLabel(String(key))}</dt>
                    <dd className="max-w-[55%] text-right break-words text-stone-700">
                      {String(val)}
                    </dd>
                  </div>
                )
              })}
            </dl>
            <button
              type="button"
              onClick={() => setDetailsUser(null)}
              className="font-display mt-6 w-full rounded-xl border border-red-600 bg-red-700 py-2.5 text-sm font-medium text-white hover:bg-red-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {editTarget && editForm ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-title"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-stone-300 bg-white p-6 shadow-2xl sm:p-8">
            <h2
              id="edit-user-title"
              className="font-display text-lg font-semibold text-red-900"
            >
              Edit account
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {editTarget.email} · {ROLE_LABELS[managedRole]}
            </p>
            <p className="mt-2 text-xs text-stone-600">
              Leave password fields blank to keep the current password.
            </p>

            <form
              onSubmit={onSaveEdit}
              className="mt-6 space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor={`${idPrefix}-edit-email-ro`}
                  className="text-xs font-medium uppercase tracking-wide text-red-800/85"
                >
                  Email (read-only)
                </label>
                <input
                  id={`${idPrefix}-edit-email-ro`}
                  value={editForm.email}
                  readOnly
                  className={`${fieldClass} mt-1.5 cursor-not-allowed opacity-80`}
                />
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-red-800/85">
                  Profile photo
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white">
                    {editPreviewSrc ? (
                      <img
                        src={editPreviewSrc}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-stone-600">No photo</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg border border-red-800/50 bg-red-50 px-3 py-2 text-xs font-medium text-red-900 hover:bg-red-900/50">
                      Upload new
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          onEditPhotoChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    {editTarget.profilePhotoDataUrl ||
                    editPhotoDraft !== 'unchanged' ? (
                      <button
                        type="button"
                        onClick={() => setEditPhotoDraft('removed')}
                        className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200"
                      >
                        Remove photo
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <FullRegistrationFormFields
                idPrefix={`${idPrefix}-edit-`}
                value={editForm}
                onChange={patchEditForm}
                profilePhotoPreview={null}
                onPhotoChange={() => {}}
                passwordMode="admin"
                showPasswordFields
                passwordMismatch={editPasswordMismatch}
                accountTypeOptions={accountTypeOptions}
                hideProfilePhotoSection
                passwordFieldsOptional
              />

              {editError ? (
                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {editError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="font-display rounded-xl bg-gradient-to-r from-red-600 via-red-800 to-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/35 hover:from-red-500"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-stone-300 bg-stone-100 px-6 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
