import { RoleManagementConsole } from '../../components/admin/RoleManagementConsole'
import { ACCOUNT_TYPES } from '../../lib/registrationOptions'

export function MisOfficeManagementPage() {
  return (
    <RoleManagementConsole
      title="MIS Office management system"
      subtitle="Create and maintain MIS Office accounts. There is no self-registration queue for this role."
      managedRole="mis_office"
      pendingRoles={[]}
      idPrefix="mis-"
      accountTypeOptions={ACCOUNT_TYPES}
      addUserHeading="Register MIS Office account"
      addUserBlurb="Add an approved MIS Office staff account with full profile."
    />
  )
}
