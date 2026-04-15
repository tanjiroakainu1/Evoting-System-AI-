/** Institutional / admin-created accounts (user management). */
export const ACCOUNT_TYPES = [
  '',
  'Student',
  'Faculty',
  'Staff',
  'Alumni',
] as const

/** Public self-registration — requires admin approval before login. */
export const PUBLIC_REGISTRATION_ACCOUNT_TYPES = ['', 'Voter', 'Candidate'] as const

export const EXTENSION_NAMES = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'] as const

export const GENDERS = ['', 'Male', 'Female', 'Other', 'Prefer not to say'] as const

/** Civil status choices (registration & user management). */
export const CIVIL_STATUSES = [
  '',
  'Single',
  'Married',
  'Divorced',
  'Widowed',
] as const

export const STUDENT_STATUSES = [
  '',
  'Regular',
  'Irregular',
  'Graduating',
  'Returnee',
  'Transferee',
] as const

export const SEMESTERS = ['', '1st Semester', '2nd Semester', 'Summer'] as const

export const YEAR_LEVELS = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'] as const
