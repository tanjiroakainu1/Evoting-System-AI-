import type { RegistrationFormState } from '../types/registrationForm'
import type { User } from '../types/user'

/** Populate the shared registration form from a stored user (passwords left blank). */
export function registrationFormFromUser(u: User): RegistrationFormState {
  return {
    accountType: u.accountType ?? '',
    email: u.email,
    lastName: u.lastName ?? '',
    firstName: u.firstName ?? '',
    middleName: u.middleName ?? '',
    extensionName: u.extensionName ?? '',
    gender: u.gender ?? '',
    birthday: u.birthday ?? '',
    citizenship: u.citizenship ?? 'Filipino',
    civilStatus: u.civilStatus ?? '',
    contactNumber: u.contactNumber ?? '',
    province: u.province ?? '',
    townCity: u.townCity ?? '',
    barangay: u.barangay ?? '',
    zipCode: u.zipCode ?? '',
    campus: u.campus ?? '',
    idNumber: u.idNumber ?? '',
    department: u.department ?? '',
    course: u.course ?? '',
    year: u.year ?? '',
    academicYear: u.academicYear ?? '2025-2026',
    semester: u.semester ?? '',
    studentStatus: u.studentStatus ?? '',
    password: '',
    confirmPassword: '',
  }
}
