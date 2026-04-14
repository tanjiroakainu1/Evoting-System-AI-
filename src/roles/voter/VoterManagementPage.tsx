import { RoleManagementConsole } from '../../components/admin/RoleManagementConsole'
import { PUBLIC_REGISTRATION_ACCOUNT_TYPES } from '../../lib/registrationOptions'

export function VoterManagementPage() {
  return (
    <RoleManagementConsole
      title="Voters management system"
      subtitle="Approve public voter registrations, register voters manually, and maintain voter records. Pending requests from self-registration appear below."
      managedRole="voter"
      pendingRoles={['voter']}
      idPrefix="vm-"
      accountTypeOptions={PUBLIC_REGISTRATION_ACCOUNT_TYPES}
      addUserHeading="Register voter"
      addUserBlurb="Provision an approved voter account with full institutional profile."
    />
  )
}
