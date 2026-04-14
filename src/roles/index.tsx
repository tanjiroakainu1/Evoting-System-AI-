import type { AppRole } from '../types/roles'
import { AdminDashboard } from './admin/AdminDashboard'
import { VoterDashboard } from './voter/VoterDashboard'
import { CandidateDashboard } from './candidate/CandidateDashboard'
import { MisOfficeDashboard } from './mis-office/MisOfficeDashboard'
import { OsaOfficeDashboard } from './osa-office/OsaOfficeDashboard'

export function RoleDashboard({ role }: { role: AppRole }) {
  switch (role) {
    case 'admin':
      return <AdminDashboard />
    case 'voter':
      return <VoterDashboard />
    case 'candidate':
      return <CandidateDashboard />
    case 'mis_office':
      return <MisOfficeDashboard />
    case 'osa_office':
      return <OsaOfficeDashboard />
    default:
      return (
        <div className="rounded-2xl border border-red-800/50 bg-red-50 p-6 text-red-900">
          This account has an unrecognized role. Sign out and contact an
          administrator if this persists.
        </div>
      )
  }
}
