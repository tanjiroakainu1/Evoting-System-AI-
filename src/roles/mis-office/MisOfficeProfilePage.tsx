import { RoleProfileSettings } from '../../components/profile/RoleProfileSettings'
import { useAuth } from '../../context/useAuth'

export function MisOfficeProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleProfileSettings
      profileUser={user}
      heading="MIS Office profile"
      description="Update your institutional profile details and sign-in password."
    />
  )
}
