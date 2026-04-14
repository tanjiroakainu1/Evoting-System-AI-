import { RoleProfileSettings } from '../../components/profile/RoleProfileSettings'
import { useAuth } from '../../context/useAuth'

export function CandidateProfilePage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <RoleProfileSettings
      profileUser={user}
      heading="Candidate profile"
      description="Manage your public-facing name, photo, and account password."
    />
  )
}
