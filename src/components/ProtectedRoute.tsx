import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { AppRole } from '../types/roles'
import { useAuth } from '../context/useAuth'
import { roleBasePath } from '../lib/rolePaths'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: AppRole | AppRole[]
}) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles) {
    const list = Array.isArray(roles) ? roles : [roles]
    if (!list.includes(user.role)) {
      return (
        <Navigate to={roleBasePath(user.role as AppRole)} replace />
      )
    }
  }

  return children
}
