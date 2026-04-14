/** Shared field set for voter self-registration and admin user creation. */
export type RegistrationFormState = {
  accountType: string
  email: string
  lastName: string
  firstName: string
  middleName: string
  extensionName: string
  gender: string
  birthday: string
  citizenship: string
  civilStatus: string
  contactNumber: string
  province: string
  townCity: string
  barangay: string
  zipCode: string
  campus: string
  idNumber: string
  department: string
  course: string
  year: string
  academicYear: string
  semester: string
  studentStatus: string
  password: string
  confirmPassword: string
}

export const initialRegistrationFormState = (): RegistrationFormState => ({
  accountType: '',
  email: '',
  lastName: '',
  firstName: '',
  middleName: '',
  extensionName: '',
  gender: '',
  birthday: '',
  citizenship: 'Filipino',
  civilStatus: '',
  contactNumber: '',
  province: '',
  townCity: '',
  barangay: '',
  zipCode: '',
  campus: '',
  idNumber: '',
  department: '',
  course: '',
  year: '',
  academicYear: '2025-2026',
  semester: '',
  studentStatus: '',
  password: '',
  confirmPassword: '',
})
