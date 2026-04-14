import type { RegistrationFormState } from '../types/registrationForm'

/** Display name: "LastName, FirstName MiddleName Extension" */
export function formatRegisteredFullName(
  f: Pick<
    RegistrationFormState,
    'lastName' | 'firstName' | 'middleName' | 'extensionName'
  >,
): string {
  const last = f.lastName.trim()
  const first = f.firstName.trim()
  const mid = f.middleName.trim()
  const ext = f.extensionName.trim()
  if (!last && !first) return ''
  const tail = [first, mid, ext].filter(Boolean).join(' ')
  if (last && tail) return `${last}, ${tail}`
  return last || tail
}
