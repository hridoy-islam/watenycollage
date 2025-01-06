import { Icons } from '@/components/ui/icons';
export type UserRole = 'admin' | 'director' | 'user' | 'creator' | 'company';
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  roles: UserRole[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;


export interface StudentFormData {
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  maritalStatus: string
  addressLine1: string
  addressLine2: string
  townCity: string
  state: string
  postCode: string
  country: string
  agent: string
}

export const initialFormData: StudentFormData = {
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  maritalStatus: '',
  addressLine1: '',
  addressLine2: '',
  townCity: '',
  state: '',
  postCode: '',
  country: '',
  agent: ''
}

export const mockData = {
  titles: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
  gender: ['Male', 'Female', 'Other'],
  maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed'],
  agents: ['Omniscient', 'Global Education', 'Study International', 'Education First'],
  ethnicities: [
    "White",
    "White - Scottish",
    "Gypsy or Traveller",
    "Other White background",
    "Black or Black British - Caribbean",
    "Black or Black British - African",
    "Other Black background",
    "Asian or Asian British - Indian",
    "Asian or Asian British - Pakistani",
    "Asian or Asian British - Bangladeshi",
    "Chinese",
    "Other Asian background",
    "Mixed - White and Black Caribbean",
    "Mixed - White and Black African",
    "Mixed - White and Asian",
    "Other mixed background",
    "Arab",
    "Other ethnic background",
    "Not known",
    "Information refused"
  ],
  religion: [
    "No religion",
    "Buddhist",
    "Christian",
    "Hindu",
    "Jewish",
    "Muslim",
    "Sikh",
    "Spiritual",
    "Any other religion or belief",
    "Information refused",
    "Christian - Church of Scotland",
    "Christian - Roman Catholic",
    "Christian - Other denomination",
    "Not known"
  ],
  sexualOrientation: [
    "Bisexual",
    "Gay man",
    "Gay woman/lesbian",
    "Heterosexual",
    "Other",
    "Information refused"
  ],
  visaTypes: [
    "Business Visa",
    "Study Visa",
    "Work Visa"
  ],
  refusalTypes: ["Visa", "Permission", "Asylum", "Deportation"],
  DocumentType : ['Passport', 'Bank_Statement', 'Qualification', 'Work_Experience', 'CV'],
};

export interface Question {
  id: keyof StudentFormData;
  question: string;
  type: 'text' | 'select' | 'date' | 'email' | 'tel';
  options?: string[];
  required: boolean;
}

export const questions: Question[] = [

  { id: 'firstName', question: "What's your first name?", type: 'text', required: true },
  { id: 'lastName', question: "What's your last name?", type: 'text', required: true },
  { id: 'email', question: "What's your email address?", type: 'email', required: true },
  { id: 'phone', question: "What's your phone number?", type: 'tel', required: true },
  { id: 'dateOfBirth', question: "What's your date of birth?", type: 'date', required: true },

  { id: 'addressLine1', question: "What's your address (line 1)?", type: 'text', required: true },
  { id: 'addressLine2', question: "What's your address (line 2)?", type: 'text', required: false },
  { id: 'townCity', question: "What's your town/city?", type: 'text', required: true },
  { id: 'state', question: "What's your state/province?", type: 'text', required: false },
  { id: 'postCode', question: "What's your post code?", type: 'text', required: true },

  { id: 'agent', question: "Who's your agent?", type: 'select', options: mockData.agents, required: true },
];

export interface Student {
  id: string
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  maritualStatus: string
  gender: string
  nationality: string
  countryOfResidence: string
  countryOfBirth: string
  nativeLanguage: string
  institution: string
  passportName: string
  passportIssueLocation: string
  passportNumber: string
  profileImage?: string
  address: {
    street: string
    city: string
    country: string
    postalCode: string
  }
}

export interface VisaHistory {
  id: string
  purpose: string
  arrival: string
  departure: string
  visaStart: string
  visaExpiry: string
  visaType: string
  status: string
}

export interface RefusalHistory {
  id: string
  refusalType: string
  refusalDate: string
  details: string
  country: string
  visaType: string
  status: string
}

export interface AcademicRecord {
  id: string
  institution: string
  course: string
  studyLevel: string
  resultScore: string
  startDate: string
  endDate: string
  status: string
}

export interface EnglishExam {
  id: string
  exam: string
  examDate: string
  score: string
  status: string
}

export interface WorkExperience {
  id: string
  jobTitle: string
  organizationName: string
  organizationAddress: string
  phone: string
  fromDate: string
  toDate: string | null
  currentlyWorking: boolean
  status: string
}
export type DocumentType = 'passport' | 'bankStatement' | 'qualification' | 'workExperience' | 'cv'

export interface Document {
  id: string
  type: DocumentType
  fileName: string
  fileUrl: string
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface Application {
  id: number
  institution: string
  course: string
  term: string
  type: 'Local' | 'International'
  amount: number
  status: 'Pending' | 'Approved' | 'Rejected'
  statusDate?: string
  actions?: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email: string
  address: string
  relationship: string
  status: boolean
}

export interface PersonalInfo {
  disabilities: string
  ethnicity: string
  genderIdentity: string
  sexualOrientation: string
  religion: string
}

export const countries = [
  "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo - Brazzaville", "Congo - Kinshasa", "Costa Rica", "Côte d’Ivoire", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "South Korea", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

