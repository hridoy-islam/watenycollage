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
  gender: ['Male', 'Female'],
  maritalStatuses: ['Single', 'Married', 'Divorced', 'Widowed'],
  agents: ['Omniscient', 'Global Education', 'Study International', 'Education First'],
  countries: ['United Kingdom', 'United States', 'Canada', 'Australia', 'New Zealand']
}
export interface Question {
  id: keyof StudentFormData;
  question: string;
  type: 'text' | 'select' | 'date' | 'email' | 'tel';
  options?: string[];
  required: boolean;
}

export const questions: Question[] = [
  { id: 'title', question: "What's your title?", type: 'select', options: mockData.titles, required: true },
  { id: 'firstName', question: "What's your first name?", type: 'text', required: true },
  { id: 'lastName', question: "What's your last name?", type: 'text', required: true },
  { id: 'email', question: "What's your email address?", type: 'email', required: true },
  { id: 'phone', question: "What's your phone number?", type: 'tel', required: true },
  { id: 'dateOfBirth', question: "What's your date of birth?", type: 'date', required: true },
  { id: 'maritalStatus', question: "What's your marital status?", type: 'select', options: mockData.maritalStatuses, required: true },
  { id: 'addressLine1', question: "What's your address (line 1)?", type: 'text', required: true },
  { id: 'addressLine2', question: "What's your address (line 2)?", type: 'text', required: false },
  { id: 'townCity', question: "What's your town/city?", type: 'text', required: true },
  { id: 'state', question: "What's your state/province?", type: 'text', required: false },
  { id: 'postCode', question: "What's your post code?", type: 'text', required: true },
  { id: 'country', question: "What's your country?", type: 'select', options: mockData.countries, required: true },
  { id: 'agent', question: "Who's your agent?", type: 'select', options: mockData.agents, required: true },
];

export interface Student {
  id: string
  title: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  maritalStatus: string
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