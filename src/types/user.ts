import type { AppRole } from './roles'

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export type User = {
  id: string
  /**
   * Unique numeric account ID for this user (local demo). Shown on profile;
   * assigned when the account is created or on storage migration.
   */
  profileDisplayId?: number
  email: string
  /** Computed display name; kept for directory and legacy seeds. */
  fullName: string
  role: AppRole
  /** Demo-only credential storage; replace with a secure backend in production. */
  password: string
  /**
   * Public self-registration (Voter/Candidate) starts as `pending` until an admin approves.
   * Omitted or `approved` = may sign in (legacy seeds and admin-created accounts).
   */
  registrationStatus?: RegistrationStatus
  /** Base64 data URL or external URL for profile image (demo). */
  profilePhotoDataUrl?: string
  // Personal
  accountType?: string
  lastName?: string
  firstName?: string
  middleName?: string
  extensionName?: string
  gender?: string
  birthday?: string
  citizenship?: string
  civilStatus?: string
  contactNumber?: string
  province?: string
  townCity?: string
  barangay?: string
  zipCode?: string
  // Educational
  campus?: string
  idNumber?: string
  department?: string
  course?: string
  year?: string
  academicYear?: string
  semester?: string
  studentStatus?: string
  /** Legacy field from early demo */
  precinct?: string
}
