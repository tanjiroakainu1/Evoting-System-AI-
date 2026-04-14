import { RoleManagementConsole } from '../../components/admin/RoleManagementConsole'
import { ACCOUNT_TYPES } from '../../lib/registrationOptions'

export function OsaOfficeManagementPage() {
  return (
    <RoleManagementConsole
      title="OSA Office management system"
      subtitle="Create and maintain OSA Office accounts. There is no self-registration queue for this role."
      managedRole="osa_office"
      pendingRoles={[]}
      idPrefix="osa-"
      accountTypeOptions={ACCOUNT_TYPES}
      addUserHeading="Register OSA Office account"
      addUserBlurb="Add an approved OSA Office staff account with full profile."
    />
  )
}
