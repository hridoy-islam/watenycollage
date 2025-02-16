import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToLowerCase = (value) => {
  return value.toLowerCase();
};

export const isStudentDataComplete = (student, hasRequiredDocuments) => {
  if (!student) return false; // If student is null or undefined, return false

  const requiredFields = [
    "title",
    "firstName",
    "lastName",
    "dob",
    "phone",
    "email",
    "gender",
    "maritualStatus",
    "nationality",
    "countryResidence",
    "countryBirth",
    "nativeLanguage",
    "addressLine1",
    "townCity",
    "postCode",
    "country",
    "disabilities",
    "ethnicity",
    "genderIdentity",
    "sexualOrientation",
    "religion",
  ];

  // Check if all required fields have a value
  const allFieldsFilled = requiredFields.every((field) => {
    const value = field.includes("?") // Check if the field is nested
      ? field.split(".").reduce((obj, key) => obj?.[key], student)
      : student[field];

    return Boolean(value); // Returns false if any required field is empty/null/undefined
  });
  // Check if emergencyContact array is not empty
  const hasEmergencyContact = Array.isArray(student.emergencyContact) && student.emergencyContact.length > 0;
  // Check if academicHistory is required and if it's present when required
  
  // Logic for academicHistory
  const hasAcademicHistory = student.academicHistoryRequired || (Array.isArray(student.academicHistory) && student.academicHistory.length > 0);

  // Logic for englishLanguageExam
  const hasEnglishLanguageExam = student.englishLanguageRequired || (Array.isArray(student.englishLanguageExam) && student.englishLanguageExam.length > 0);

  // Logic for workExperience
  const hasWorkExperience = student.workExperience || (Array.isArray(student.workDetails) && student.workDetails.length > 0);

  // Return the final result, checking all conditions
  return allFieldsFilled && hasEmergencyContact && hasAcademicHistory && hasEnglishLanguageExam && hasWorkExperience && hasRequiredDocuments;
  
};
