import type { User } from '../types/user'
import { ROLE_LABELS, type AppRole } from '../types/roles'
import { assertNewPasswordPair } from './registrationValidate'

const USERS_KEY = 'bevms_users'
const SESSION_KEY = 'bevms_session_user_id'

function randomProfileDisplayId(): number {
  return Math.floor(100000 + Math.random() * 900000)
}

function collectUsedProfileDisplayIds(users: User[]): Set<number> {
  const used = new Set<number>()
  for (const u of users) {
    if (
      typeof u.profileDisplayId === 'number' &&
      Number.isFinite(u.profileDisplayId)
    ) {
      used.add(u.profileDisplayId)
    }
  }
  return used
}

function allocateUniqueProfileDisplayId(users: User[]): number {
  const used = collectUsedProfileDisplayIds(users)
  let id = randomProfileDisplayId()
  let guard = 0
  while (used.has(id) && guard < 250) {
    id = randomProfileDisplayId()
    guard += 1
  }
  return id
}

/** Ensure every user row has a unique `profileDisplayId` (localStorage migration). */
function ensureProfileDisplayIds(users: User[]): User[] {
  const used = collectUsedProfileDisplayIds(users)
  let changed = false
  const next = users.map((u) => {
    if (
      typeof u.profileDisplayId === 'number' &&
      Number.isFinite(u.profileDisplayId) &&
      !Number.isNaN(u.profileDisplayId)
    ) {
      return u
    }
    changed = true
    let id = randomProfileDisplayId()
    let guard = 0
    while (used.has(id) && guard < 250) {
      id = randomProfileDisplayId()
      guard += 1
    }
    used.add(id)
    return { ...u, profileDisplayId: id }
  })
  if (changed) {
    writeUsers(next)
    emitUsersChanged()
  }
  return next
}

/** Preloaded accounts for local demo; merged into storage if missing. */
export const defaultSeed: User[] = [
  {
    id: 'seed-admin',
    profileDisplayId: 510001,
    email: 'admin@gmail.com',
    fullName: 'System Administrator',
    role: 'admin',
    password: 'admin123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-mis-office',
    profileDisplayId: 510002,
    email: 'misoffice@gmail.com',
    fullName: 'MIS Office',
    role: 'mis_office',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-osa-office',
    profileDisplayId: 510003,
    email: 'osaoffice@gmail.com',
    fullName: 'OSA Office',
    role: 'osa_office',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-voter',
    profileDisplayId: 510010,
    email: 'voter@gmail.com',
    fullName: 'Demo Voter',
    role: 'voter',
    password: '123',
    registrationStatus: 'approved',
    barangay: 'Tagudin',
    precinct: 'Demo Precinct 001',
  },
  {
    id: 'seed-voter-two',
    profileDisplayId: 510011,
    email: 'votertwo@gmail.com',
    fullName: 'Demo Voter Two',
    role: 'voter',
    password: '123',
    registrationStatus: 'approved',
    barangay: 'Tagudin',
    precinct: 'Demo Precinct 002',
  },
  {
    id: 'seed-voter-three',
    profileDisplayId: 510012,
    email: 'voterthree@gmail.com',
    fullName: 'Demo Voter Three',
    role: 'voter',
    password: '123',
    registrationStatus: 'approved',
    barangay: 'Tagudin',
    precinct: 'Demo Precinct 003',
  },
  {
    id: 'seed-voter-four',
    profileDisplayId: 510013,
    email: 'voterfour@gmail.com',
    fullName: 'Demo Voter Four',
    role: 'voter',
    password: '123',
    registrationStatus: 'approved',
    barangay: 'Tagudin',
    precinct: 'Demo Precinct 004',
  },
  {
    id: 'seed-candidate',
    profileDisplayId: 510020,
    email: 'candidate@gmail.com',
    fullName: 'Demo Candidate',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-cand-test',
    profileDisplayId: 510021,
    email: 'testcandidate@gmail.com',
    fullName: 'Test Candidate',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-cand-alpha',
    profileDisplayId: 510022,
    email: 'alphacandidate@gmail.com',
    fullName: 'Demo Candidate Alpha',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-cand-beta',
    profileDisplayId: 510023,
    email: 'betacandidate@gmail.com',
    fullName: 'Demo Candidate Beta',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-cand-gamma',
    profileDisplayId: 510024,
    email: 'gammacandidate@gmail.com',
    fullName: 'Demo Candidate Gamma',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
  {
    id: 'seed-cand-delta',
    profileDisplayId: 510025,
    email: 'deltacandidate@gmail.com',
    fullName: 'Demo Candidate Delta',
    role: 'candidate',
    password: '123',
    registrationStatus: 'approved',
  },
]

export type DemoCredentialRow = {
  role: AppRole
  roleLabel: string
  email: string
  password: string
}

/** Shown on the login page only (not on the public home page). */
export function getDemoCredentialsForLogin(): DemoCredentialRow[] {
  return defaultSeed.map((u) => ({
    role: u.role,
    roleLabel: ROLE_LABELS[u.role],
    email: u.email,
    password: u.password,
  }))
}

function mergeMissingDemoUsers(users: User[]): User[] {
  const emails = new Set(users.map((u) => u.email.toLowerCase()))
  let changed = false
  const merged = [...users]
  for (const demo of defaultSeed) {
    const key = demo.email.toLowerCase()
    if (!emails.has(key)) {
      merged.push(demo)
      emails.add(key)
      changed = true
    }
  }
  if (changed) {
    localStorage.setItem(USERS_KEY, JSON.stringify(merged))
  }
  return merged
}

/** Older builds used `mis_officer`; normalize so labels and dashboards stay aligned. */
function migrateLegacyMisRole(users: User[]): { list: User[]; changed: boolean } {
  let changed = false
  const list = users.map((u) => {
    if ((u.role as string) === 'mis_officer') {
      changed = true
      return {
        ...u,
        role: 'mis_office' as AppRole,
        fullName:
          u.fullName === 'MIS Officer' ? 'MIS Office' : u.fullName,
      }
    }
    return u
  })
  return { list, changed }
}

/** Demo logins used `misofficer@` / `osaofficer@`; align with MIS Office / OSA Office naming. */
function migrateDemoEmailsAndIds(users: User[]): { list: User[]; changed: boolean } {
  let changed = false
   let list = users.map((u) => {
    const email = u.email.toLowerCase()
    let next = { ...u }
    if (email === 'misofficer@gmail.com') {
      changed = true
      next = { ...next, email: 'misoffice@gmail.com', fullName: 'MIS Office' }
    }
    if (next.email.toLowerCase() === 'osaofficer@gmail.com') {
      changed = true
      next = { ...next, email: 'osaoffice@gmail.com', fullName: 'OSA Office' }
    }
    if (next.id === 'seed-mis-officer') {
      changed = true
      next = { ...next, id: 'seed-mis-office' }
    }
    return next
  })

  if (getSessionUserId() === 'seed-mis-officer') {
    setSessionUserId('seed-mis-office')
    changed = true
  }

  const seen = new Set<string>()
  list = list.filter((u) => {
    const key = u.email.toLowerCase()
    if (seen.has(key)) {
      changed = true
      return false
    }
    seen.add(key)
    return true
  })

  return { list, changed }
}

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultSeed))
      return ensureProfileDisplayIds([...defaultSeed])
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultSeed))
      return ensureProfileDisplayIds([...defaultSeed])
    }
    const asUsers = parsed as User[]
    const r1 = migrateLegacyMisRole(asUsers)
    const r2 = migrateDemoEmailsAndIds(r1.list)
    const list = r2.list
    if (r1.changed || r2.changed) {
      localStorage.setItem(USERS_KEY, JSON.stringify(list))
    }
    return ensureProfileDisplayIds(mergeMissingDemoUsers(list))
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultSeed))
    return ensureProfileDisplayIds([...defaultSeed])
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getAllUsers(): User[] {
  return readUsers()
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase()
  return readUsers().find((u) => u.email.toLowerCase() === normalized)
}

export function findUserById(id: string): User | undefined {
  return readUsers().find((u) => u.id === id)
}

export function upsertUser(user: User) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx >= 0) users[idx] = user
  else users.push(user)
  writeUsers(users)
}

export function updateUserRecord(
  userId: string,
  updater: (user: User) => User,
): User {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('User not found.')
  const updated = updater(users[idx])
  users[idx] = updated
  writeUsers(users)
  emitUsersChanged()
  return updated
}

export function changePasswordForUser(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): void {
  assertNewPasswordPair(newPassword, confirmPassword)
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('User not found.')
  if (users[idx].password !== currentPassword) {
    throw new Error('Current password is incorrect.')
  }
  users[idx] = { ...users[idx], password: newPassword }
  writeUsers(users)
  emitUsersChanged()
}

export function addUser(user: User) {
  const users = readUsers()
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const withId =
    typeof user.profileDisplayId === 'number' &&
    Number.isFinite(user.profileDisplayId)
      ? user
      : { ...user, profileDisplayId: allocateUniqueProfileDisplayId(users) }
  users.push(withId)
  writeUsers(users)
  emitUsersChanged()
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function setSessionUserId(id: string | null) {
  if (id === null) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, id)
}

export function getPendingRegistrations(): User[] {
  return readUsers().filter((u) => u.registrationStatus === 'pending')
}

export function getPendingRegistrationsForRoles(roles: AppRole[]): User[] {
  const set = new Set(roles)
  return readUsers().filter(
    (u) => u.registrationStatus === 'pending' && set.has(u.role),
  )
}

/** Approved / rejected / legacy rows for a single role (excludes pending). */
export function getDirectoryUsersForRole(role: AppRole): User[] {
  return readUsers().filter(
    (u) => u.role === role && u.registrationStatus !== 'pending',
  )
}

export function deleteUserById(
  userId: string,
  options?: { actingUserId?: string | null },
): void {
  if (options?.actingUserId && options.actingUserId === userId) {
    throw new Error('You cannot delete the account you are signed in with.')
  }
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('User not found.')
  users.splice(idx, 1)
  writeUsers(users)
  emitUsersChanged()
}

function emitUsersChanged() {
  window.dispatchEvent(new Event('bevms-auth'))
}

export function approveRegistration(userId: string) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('User not found.')
  const u = users[idx]
  if (u.registrationStatus !== 'pending') {
    throw new Error('This account is not awaiting approval.')
  }
  users[idx] = { ...u, registrationStatus: 'approved' }
  writeUsers(users)
  emitUsersChanged()
}

export function rejectRegistration(userId: string) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) throw new Error('User not found.')
  const u = users[idx]
  if (u.registrationStatus !== 'pending') {
    throw new Error('This account is not awaiting approval.')
  }
  users[idx] = { ...u, registrationStatus: 'rejected' }
  writeUsers(users)
  emitUsersChanged()
}
