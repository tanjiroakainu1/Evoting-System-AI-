import type { RegistrationFormState } from '../types/registrationForm'
import type { User } from '../types/user'
import { formatRegisteredFullName } from './fullName'

/** Maps registration form values onto `User` profile fields (no id, role, email, password). */
export function profileFieldsFromForm(
  f: RegistrationFormState,
): Omit<
  User,
  'id' | 'email' | 'role' | 'password' | 'fullName' | 'profilePhotoDataUrl'
> & { fullName: string } {
  return {
    fullName: formatRegisteredFullName(f),
    accountType: f.accountType.trim() || undefined,
    lastName: f.lastName.trim() || undefined,
    firstName: f.firstName.trim() || undefined,
    middleName: f.middleName.trim() || undefined,
    extensionName: f.extensionName.trim() || undefined,
    gender: f.gender.trim() || undefined,
    birthday: f.birthday.trim() || undefined,
    citizenship: f.citizenship.trim() || undefined,
    civilStatus: f.civilStatus.trim() || undefined,
    contactNumber: f.contactNumber.trim() || undefined,
    province: f.province.trim() || undefined,
    townCity: f.townCity.trim() || undefined,
    barangay: f.barangay.trim() || undefined,
    zipCode: f.zipCode.trim() || undefined,
    campus: f.campus.trim() || undefined,
    idNumber: f.idNumber.trim() || undefined,
    department: f.department.trim() || undefined,
    course: f.course.trim() || undefined,
    year: f.year.trim() || undefined,
    academicYear: f.academicYear.trim() || undefined,
    semester: f.semester.trim() || undefined,
    studentStatus: f.studentStatus.trim() || undefined,
  }
}
