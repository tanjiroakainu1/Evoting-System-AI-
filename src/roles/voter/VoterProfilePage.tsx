import { RoleProfileSettings } from '../../components/profile/RoleProfileSettings'
import { useAuth } from '../../context/useAuth'

export function VoterProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleProfileSettings
      profileUser={user}
      heading="Voter profile"
      description="Keep your profile photo and contact name up to date, and change your password when needed."
    />
  )
}
