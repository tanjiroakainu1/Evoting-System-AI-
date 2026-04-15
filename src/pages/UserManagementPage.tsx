import { RoleManagementConsole } from '../components/admin/RoleManagementConsole'
import { ACCOUNT_TYPES } from '../lib/registrationOptions'

/** Administrator accounts only — other roles have dedicated management systems. */
export function UserManagementPage() {
  return (
    <RoleManagementConsole
      title="User management (Administrators)"
      subtitle="Only system administrator accounts are listed here. Voters, candidates, MIS Office, and OSA Office are managed in their own consoles."
      managedRole="admin"
      pendingRoles={[]}
      idPrefix="um-"
      accountTypeOptions={ACCOUNT_TYPES}
      addUserHeading="Register administrator"
      addUserBlurb="Create a new administrator account."
    />
  )
}
