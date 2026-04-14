import { useAuth } from '../context/useAuth'
import { RoleDashboard } from '../roles'

export function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null
  return <RoleDashboard role={user.role} />
}
