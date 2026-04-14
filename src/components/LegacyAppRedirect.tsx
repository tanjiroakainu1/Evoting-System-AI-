import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import type { AppRole } from '../types/roles'
import { mapLegacyAppPath } from '../lib/rolePaths'

/** Sends `/app/*` bookmarks to role-scoped URLs after login. */
export function LegacyAppRedirect() {
  const { user } = useAuth()
  const loc = useLocation()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: loc.pathname, search: loc.search } }}
      />
    )
  }

  const pathOnly =
    (loc.pathname || '/app').replace(/\/$/, '') || '/app'
  const target = mapLegacyAppPath(pathOnly, user.role as AppRole)
  return <Navigate to={target + (loc.search || '')} replace />
}
