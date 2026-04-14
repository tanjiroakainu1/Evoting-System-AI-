import { RoleProfileSettings } from '../../components/profile/RoleProfileSettings'
import { useAuth } from '../../context/useAuth'

export function AdminProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleProfileSettings
      profileUser={user}
      heading="Administrator profile"
      description="Update your display name, profile photo, and password. Changes apply to this account only."
    />
  )
}
