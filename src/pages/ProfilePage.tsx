import { useAuth } from '../context/useAuth'
import { AdminProfilePage } from '../roles/admin/AdminProfilePage'
import { CandidateProfilePage } from '../roles/candidate/CandidateProfilePage'
import { MisOfficeProfilePage } from '../roles/mis-office/MisOfficeProfilePage'
import { OsaOfficeProfilePage } from '../roles/osa-office/OsaOfficeProfilePage'
import { VoterProfilePage } from '../roles/voter/VoterProfilePage'

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'admin':
      return <AdminProfilePage key={user.id} />
    case 'voter':
      return <VoterProfilePage key={user.id} />
    case 'candidate':
      return <CandidateProfilePage key={user.id} />
    case 'mis_office':
      return <MisOfficeProfilePage key={user.id} />
    case 'osa_office':
      return <OsaOfficeProfilePage key={user.id} />
    default:
      return null
  }
}
