import { RoleProfileSettings } from '../../components/profile/RoleProfileSettings'
import { useAuth } from '../../context/useAuth'

export function OsaOfficeProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleProfileSettings
      profileUser={user}
      heading="OSA Office profile"
      description="Update your institutional profile details and sign-in password."
    />
  )
}
