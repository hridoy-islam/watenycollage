export interface TCareer {
  profilePictureUrl?: string // Uploaded profile photo URL (optional)
  title: string
  firstName: string
  initial?: string // Middle initial (optional)
  lastName: string
  dateOfBirth: Date

  // Official Numbers
  nationalInsuranceNumber?: string
  nhsNumber?: string

  // Application Details
  applicationDate: Date
  availableFromDate: Date
  employmentType: string // Full-time, Part-time, Temp, etc.
  position: string // Desired job position
  source: string // Where the candidate came from (e.g., Referral, Indeed)
  branch: string // Office location

  // Contact Information
  homePhone?: string
  mobilePhone?: string
  otherPhone?: string
  email: string
  address: string
  cityOrTown: string
  stateOrProvince: string
  postCode: string
  country: string

  // Demographic Information
  gender: string // Male, Female, Other
  maritalStatus: string // Single, Married, etc.
  ethnicOrigin?: string // Ethnic background

  // Disability Information
  hasDisability: boolean
  disabilityDetails?: string
  needsReasonableAdjustment: boolean
  reasonableAdjustmentDetails?: string

  status: "applied" | "shortlisted" | "interviewing" | "offered" | "hired" | "rejected" // default: applied
  notes?: string // for recruiter to add comments during stages
  availableFrom: Date
  startDate: Date
  wtrDocumentUrl?: string // WTR = Working Time Regulation Document
  area: string
  isFullTime: boolean
  carTravelAllowance: boolean
  employmentType: "full-time" | "part-time" | "contractor" | "temporary" | "intern" // Enum
  rightToWork: {
    hasExpiry: boolean
    expiryDate?: Date
  }
  payroll: {
    payrollNumber: string
    paymentMethod: "bank-transfer" | "cheque" | "cash"
  }
  equalityInformation: {
    nationality: string
    religion: string
    hasDisability: boolean
    disabilityDetails?: string
  }
  beneficiary: {
    fullName: string
    relationship: string
    email: string
    mobile: string
    sameAddress: boolean
    address: {
      line1: string
      line2?: string
      city: string
      state?: string
      postCode: string
      country: string
    }
  }
}
