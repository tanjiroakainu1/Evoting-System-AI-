import { isSafeInternalRedirectPath } from './rolePaths'

/**
 * Validates `redirect` query / referrer pathname before login.
 * Allows `/app` (legacy) and role-scoped paths (`/admin/...`, etc.).
 */
export function safePostLoginPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null
  const p = raw.trim()
  if (!p.startsWith('/')) return null
  if (p.includes('//') || p.includes('..') || p.includes('\\')) return null
  if (p.startsWith('/app')) return p
  if (isSafeInternalRedirectPath(p)) return p.split('?')[0]!.split('#')[0]!
  return null
}

/** For login state that may store full location object. */
export function safePostLoginPathFromState(
  pathname: string | null | undefined,
): string | null {
  return safePostLoginPath(pathname)
}
