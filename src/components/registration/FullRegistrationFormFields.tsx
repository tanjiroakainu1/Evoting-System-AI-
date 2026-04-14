import type { RegistrationFormState } from '../../types/registrationForm'
import {
  ACCOUNT_TYPES,
  CIVIL_STATUSES,
  EXTENSION_NAMES,
  GENDERS,
  SEMESTERS,
  STUDENT_STATUSES,
} from '../../lib/registrationOptions'

const label =
  'mb-1.5 block text-xs font-medium uppercase tracking-wide text-red-800/85'

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-inner shadow-stone-300/40 placeholder:text-stone-500 transition-colors duration-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/35'

const selectClass = `${inputClass} cursor-pointer`

type Props = {
  value: RegistrationFormState
  onChange: (patch: Partial<RegistrationFormState>) => void
  profilePhotoPreview: string | null
  onPhotoChange: (file: File | null) => void
  passwordMode: 'register' | 'admin'
  showPasswordFields: boolean
  /** When true, show mismatch hint under confirm password */
  passwordMismatch: boolean
  idPrefix?: string
  /** Account type dropdown options (public register vs institutional admin). */
  accountTypeOptions?: readonly string[]
  /** When true, omit the profile photo block (e.g. custom photo UI elsewhere). */
  hideProfilePhotoSection?: boolean
  /** When true, password fields are not HTML-required (edit flows: leave blank to keep). */
  passwordFieldsOptional?: boolean
}

function SelectPlaceholder({
  id,
  labelText,
  required: req,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  labelText: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder: string
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={label}>
        {labelText}
        {req ? ' *' : ''}
      </label>
      <select
        id={id}
        required={req}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        <option value="">{placeholder}</option>
        {options
          .filter((o) => o !== '')
          .map((o) => (
            <option key={o} value={o} className="bg-white">
              {o}
            </option>
          ))}
      </select>
    </div>
  )
}

export function FullRegistrationFormFields({
  value,
  onChange,
  profilePhotoPreview,
  onPhotoChange,
  passwordMode,
  showPasswordFields,
  passwordMismatch,
  idPrefix = '',
  accountTypeOptions = ACCOUNT_TYPES as unknown as string[],
  hideProfilePhotoSection = false,
  passwordFieldsOptional = false,
}: Props) {
  const v = value
  const set = onChange
  const p = idPrefix

  return (
    <div className="space-y-10">
      <section>
        <h3 className="font-display mb-6 border-b border-stone-200 pb-2 text-sm font-semibold tracking-[0.2em] text-red-800">
          Personal information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectPlaceholder
            id={`${p}account-type`}
            labelText="Account type"
            required
            value={v.accountType}
            onChange={(accountType) => set({ accountType })}
            options={accountTypeOptions}
            placeholder="Select..."
          />
          <div>
            <label htmlFor={`${p}email`} className={label}>
              Email address *
            </label>
            <input
              id={`${p}email`}
              type="email"
              autoComplete="email"
              required
              value={v.email}
              onChange={(e) => set({ email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}last-name`} className={label}>
              Last name *
            </label>
            <input
              id={`${p}last-name`}
              autoComplete="family-name"
              required
              value={v.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}first-name`} className={label}>
              First name *
            </label>
            <input
              id={`${p}first-name`}
              autoComplete="given-name"
              required
              value={v.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}middle-name`} className={label}>
              Middle name
            </label>
            <input
              id={`${p}middle-name`}
              autoComplete="additional-name"
              value={v.middleName}
              onChange={(e) => set({ middleName: e.target.value })}
              className={inputClass}
            />
          </div>
          <SelectPlaceholder
            id={`${p}extension-name`}
            labelText="Extension name"
            value={v.extensionName}
            onChange={(extensionName) => set({ extensionName })}
            options={EXTENSION_NAMES as unknown as string[]}
            placeholder="Select..."
          />
          <SelectPlaceholder
            id={`${p}gender`}
            labelText="Gender"
            required
            value={v.gender}
            onChange={(gender) => set({ gender })}
            options={GENDERS as unknown as string[]}
            placeholder="Select..."
          />
          <div>
            <label htmlFor={`${p}birthday`} className={label}>
              Birthday *
            </label>
            <input
              id={`${p}birthday`}
              type="date"
              required
              value={v.birthday}
              onChange={(e) => set({ birthday: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}citizenship`} className={label}>
              Citizenship *
            </label>
            <input
              id={`${p}citizenship`}
              required
              value={v.citizenship}
              onChange={(e) => set({ citizenship: e.target.value })}
              className={inputClass}
            />
          </div>
          <SelectPlaceholder
            id={`${p}civil-status`}
            labelText="Civil status"
            required
            value={v.civilStatus}
            onChange={(civilStatus) => set({ civilStatus })}
            options={CIVIL_STATUSES as unknown as string[]}
            placeholder="Select..."
          />
          <div>
            <label htmlFor={`${p}contact`} className={label}>
              Contact number *
            </label>
            <input
              id={`${p}contact`}
              type="tel"
              autoComplete="tel"
              required
              value={v.contactNumber}
              onChange={(e) => set({ contactNumber: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}province`} className={label}>
              Province *
            </label>
            <input
              id={`${p}province`}
              required
              value={v.province}
              onChange={(e) => set({ province: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}town`} className={label}>
              Town / City *
            </label>
            <input
              id={`${p}town`}
              required
              value={v.townCity}
              onChange={(e) => set({ townCity: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}barangay`} className={label}>
              Barangay *
            </label>
            <input
              id={`${p}barangay`}
              required
              value={v.barangay}
              onChange={(e) => set({ barangay: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}zip`} className={label}>
              Zip code *
            </label>
            <input
              id={`${p}zip`}
              required
              inputMode="numeric"
              value={v.zipCode}
              onChange={(e) => set({ zipCode: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-display mb-6 border-b border-stone-200 pb-2 text-sm font-semibold tracking-[0.2em] text-red-800">
          Educational information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${p}campus`} className={label}>
              Campus *
            </label>
            <input
              id={`${p}campus`}
              required
              value={v.campus}
              onChange={(e) => set({ campus: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}id-number`} className={label}>
              ID number *
            </label>
            <input
              id={`${p}id-number`}
              required
              value={v.idNumber}
              onChange={(e) => set({ idNumber: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}department`} className={label}>
              Department *
            </label>
            <input
              id={`${p}department`}
              required
              value={v.department}
              onChange={(e) => set({ department: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}course`} className={label}>
              Course *
            </label>
            <input
              id={`${p}course`}
              required
              value={v.course}
              onChange={(e) => set({ course: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}year-level`} className={label}>
              Year *
            </label>
            <input
              id={`${p}year-level`}
              required
              placeholder="e.g. 4th Year"
              value={v.year}
              onChange={(e) => set({ year: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${p}academic-year`} className={label}>
              Academic year *
            </label>
            <input
              id={`${p}academic-year`}
              required
              placeholder="2025-2026"
              value={v.academicYear}
              onChange={(e) => set({ academicYear: e.target.value })}
              className={inputClass}
            />
          </div>
          <SelectPlaceholder
            id={`${p}semester`}
            labelText="Semester"
            required
            value={v.semester}
            onChange={(semester) => set({ semester })}
            options={SEMESTERS as unknown as string[]}
            placeholder="Select..."
          />
          <SelectPlaceholder
            id={`${p}student-status`}
            labelText="Student status"
            required
            value={v.studentStatus}
            onChange={(studentStatus) => set({ studentStatus })}
            options={STUDENT_STATUSES as unknown as string[]}
            placeholder="Select..."
          />
        </div>
      </section>

      {showPasswordFields ? (
        <section>
          <h3 className="font-display mb-6 border-b border-stone-200 pb-2 text-sm font-semibold tracking-[0.2em] text-red-800">
            Account security
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`${p}password-main`} className={label}>
                Password{passwordFieldsOptional ? ' (optional)' : ' *'}
              </label>
              <input
                id={`${p}password-main`}
                type="password"
                autoComplete="new-password"
                required={!passwordFieldsOptional}
                minLength={passwordFieldsOptional ? undefined : 8}
                maxLength={passwordFieldsOptional ? undefined : 8}
                value={v.password}
                onChange={(e) => set({ password: e.target.value })}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-stone-500">
                {passwordFieldsOptional
                  ? 'Leave blank to keep the current password. Otherwise use exactly 8 characters.'
                  : passwordMode === 'register'
                    ? 'Password must be exactly 8 characters.'
                    : 'Use exactly 8 characters for new accounts (demo rule).'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={`${p}password-confirm`} className={label}>
                Confirm password{passwordFieldsOptional ? ' (optional)' : ' *'}
              </label>
              <input
                id={`${p}password-confirm`}
                type="password"
                autoComplete="new-password"
                required={!passwordFieldsOptional}
                value={v.confirmPassword}
                onChange={(e) => set({ confirmPassword: e.target.value })}
                className={`${inputClass} ${passwordMismatch ? 'border-red-500 ring-1 ring-red-500/40' : ''}`}
              />
              {passwordMismatch ? (
                <p className="mt-1.5 text-xs text-red-700">
                  Passwords do not match.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {hideProfilePhotoSection ? null : (
        <section>
          <h3 className="font-display mb-4 border-b border-stone-200 pb-2 text-sm font-semibold tracking-[0.2em] text-red-800">
            Profile photo
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="cursor-pointer">
              <span className="inline-flex rounded-xl border border-red-800/50 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-900 transition-colors hover:bg-red-50">
                Choose file
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  onPhotoChange(file)
                  e.target.value = ''
                }}
              />
            </label>
            <span className="text-sm text-stone-500">
              {profilePhotoPreview ? 'Photo selected' : 'No file chosen'}
            </span>
          </div>
          {profilePhotoPreview ? (
            <img
              src={profilePhotoPreview}
              alt="Profile preview"
              className="mt-4 h-24 w-24 rounded-2xl border border-stone-200 object-cover"
            />
          ) : null}
        </section>
      )}
    </div>
  )
}
