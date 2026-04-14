import type { AppRole } from '../types/roles'

/** URL path segment for each app role (e.g. /admin/...). */
export const ROLE_URL_SEGMENT: Record<AppRole, string> = {
  admin: 'admin',
  voter: 'voter',
  candidate: 'candidate',
  mis_office: 'mis-office',
  osa_office: 'osa-office',
}

const SEGMENT_TO_ROLE: Record<string, AppRole> = {
  admin: 'admin',
  voter: 'voter',
  candidate: 'candidate',
  'mis-office': 'mis_office',
  'osa-office': 'osa_office',
}

export function roleBasePath(role: AppRole): string {
  return `/${ROLE_URL_SEGMENT[role]}`
}

export function rolePath(role: AppRole, ...segments: string[]): string {
  const base = roleBasePath(role)
  const rest = segments.filter(Boolean).join('/')
  return rest ? `${base}/${rest}` : base
}

export function pathMatchesRole(pathname: string, role: AppRole): boolean {
  const seg = pathname.split('/').filter(Boolean)[0]
  return seg === ROLE_URL_SEGMENT[role]
}

/** Allow only role-scoped in-app redirects (no open redirect). */
export function isSafeInternalRedirectPath(p: string): boolean {
  const pathOnly = p.split('?')[0]!.split('#')[0]!
  const seg = pathOnly.split('/').filter(Boolean)[0]
  return seg !== undefined && seg in SEGMENT_TO_ROLE
}

/**
 * Map legacy `/app/...` URLs to role-scoped paths. Uses `role` for shared
 * routes like `/app/profile`.
 */
export function mapLegacyAppPath(pathname: string, role: AppRole): string {
  const normalized = (pathname.split('?')[0]!.split('#')[0] || '').replace(
    /\/$/,
    '',
  )
  if (!normalized.startsWith('/app')) {
    return normalized || roleBasePath(role)
  }

  if (normalized === '/app') {
    return roleBasePath(role)
  }

  if (normalized === '/app/profile') {
    return `${roleBasePath(role)}/profile`
  }

  const vote = normalized.match(/^\/app\/vote\/([^/]+)$/)
  if (vote) {
    return `/voter/vote/${vote[1]}`
  }

  if (normalized === '/app/users') {
    return '/admin/users'
  }

  if (normalized.startsWith('/app/management/')) {
    return `/admin/${normalized.slice('/app/management/'.length)}`
  }

  if (normalized.startsWith('/app/campaign/')) {
    return `/candidate/${normalized.slice('/app/campaign/'.length)}`
  }

  return roleBasePath(role)
}

export function resolvePostLoginRedirect(
  from: string | null | undefined,
  user: { role: string },
): string {
  const role = user.role as AppRole
  const raw = from?.trim()
  if (!raw || raw.includes('..') || raw.includes('\\')) {
    return roleBasePath(role)
  }

  let path = raw.split('?')[0]!.split('#')[0]!
  if (!path.startsWith('/')) {
    return roleBasePath(role)
  }

  if (path.startsWith('/app')) {
    path = mapLegacyAppPath(path, role)
  } else if (!isSafeInternalRedirectPath(path)) {
    return roleBasePath(role)
  }

  if (!pathMatchesRole(path, role)) {
    return roleBasePath(role)
  }

  return path
}
