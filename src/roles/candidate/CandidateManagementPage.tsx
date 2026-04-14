import { RoleManagementConsole } from '../../components/admin/RoleManagementConsole'
import { PUBLIC_REGISTRATION_ACCOUNT_TYPES } from '../../lib/registrationOptions'

export function CandidateManagementPage() {
  return (
    <RoleManagementConsole
      title="Candidates management system"
      subtitle="Approve public candidate registrations, add candidates manually, and manage candidate records."
      managedRole="candidate"
      pendingRoles={['candidate']}
      idPrefix="cm-"
      accountTypeOptions={PUBLIC_REGISTRATION_ACCOUNT_TYPES}
      addUserHeading="Register candidate"
      addUserBlurb="Provision an approved candidate account with full institutional profile."
    />
  )
}
