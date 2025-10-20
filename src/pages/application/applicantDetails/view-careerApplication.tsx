
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  AlertCircle,
  Check,
  Home,
  User,
  Phone,
  Briefcase,
  BookOpen,
  GraduationCap,
  MoveLeft,
  Copy,
  ClipboardList,
  User2Icon,
  UserCircle,
  Wallet,
  FileText,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useNavigate, useParams } from "react-router-dom"
import axiosInstace from "@/lib/axios"
import moment from "moment"

import Loader from "@/components/shared/loader"
import PDFGenerator from "../components/PDFGeneratorCareer"
import { PersonalDetailsTab } from "./components/personal-details-tab"
import { AddressDetailsTab } from "./components/address-details-tab"
import { ApplicationDetailsTab } from "./components/applicatiion-details-tab"
import { DisabilityTab } from "./components/disability-tab"
import { DocumentsTab } from "./components/documents-tab"
import { EducationTab } from "./components/education-tab"
import { EmploymentTab } from "./components/employment-tab"
import { EthnicityTab } from "./components/ethnicity-tab"
import { ExperienceTab } from "./components/experience-tab"
import { NextOfKinTab } from "./components/next-of-kin-tab"
import { PaymentDetailsTab } from "./components/payment-details-tab"
import { PostEmploymentTab } from "./components/post-employment-tab"
import { ReferenceTab } from "./components/reference-tab"
import { TrainingTab } from "./components/training-tab"
import { TermTab } from "./components/terms-tab"
import { TabContent, VerticalTabs } from "./components/VerticalTab"



type TabType =
  | "personalDetails"
  | "addressDetails"
  | "nextToKin"
  | "applicationData"
  | "educationData"
  | "trainingData"
  | "experienceData"
  | "ethnicityData"
  | "employmentData"
  | "disabilityData"
  | "refereeData"
  | "documentData"
  | "postEmployment"
  | "paymentData"

const tabs = [
  { id: "personalDetails" as TabType, label: "Personal Details", icon: <User size={20} /> },
  { id: "addressDetails" as TabType, label: "Address Details", icon: <Home size={20} /> },
  { id: "nextToKin" as TabType, label: "Next of Kin", icon: <Phone size={20} /> },
  { id: "applicationData" as TabType, label: "Application Details", icon: <ClipboardList size={20} /> },
  { id: "educationData" as TabType, label: "Education", icon: <GraduationCap size={20} /> },
  { id: "trainingData" as TabType, label: "Training", icon: <BookOpen size={20} /> },
  { id: "experienceData" as TabType, label: "Experience", icon: <Briefcase size={20} /> },
  { id: "ethnicityData" as TabType, label: "Ethnicity", icon: <User2Icon size={20} /> },
  { id: "employmentData" as TabType, label: "Employment", icon: <Briefcase size={20} /> },
  { id: "disabilityData" as TabType, label: "Disability", icon: <User2Icon size={20} /> },
  { id: "refereeData" as TabType, label: "Reference", icon: <UserCircle size={20} /> },
  { id: "documentData" as TabType, label: "Documents", icon: <FileText size={20} /> },
  { id: "postEmployment" as TabType, label: "Post Employment", icon: <ClipboardList size={20} /> },
  { id: "paymentData" as TabType, label: "Payment Details", icon: <Wallet size={20} /> },
    { id: "terms" as TabType, label: "Terms", icon: <FileText size={20} /> },

]

type Application = {
  _id: string
  createdAt: string
  updatedAt: string
  seen: boolean
  title?: string
  firstName?: string
  lastName?: string
  otherName?: string
  initial?: string
  dateOfBirth?: string
  nationality?: string
  countryOfResidence?: string
  countryOfBirth?: string
  shareCode?: string
  nationalInsuranceNumber?: string
  postalAddressLine1?: string
  postalAddressLine2?: string
  postalCity?: string
  postalPostCode?: string
  postalCountry?: string
  emergencyContactNumber?: string
  emergencyEmail?: string
  emergencyFullName?: string
  emergencyRelationship?: string
  emergencyAddress?: string
  availableFromDate?: string
  source?: string
  referralEmployee?: string
  availability?: {
    monday?: boolean
    tuesday?: boolean
    wednesday?: boolean
    thursday?: boolean
    friday?: boolean
    saturday?: boolean
    sunday?: boolean
  }
  isStudent?: boolean
  isUnderStatePensionAge?: boolean
  isOver18?: boolean
  isSubjectToImmigrationControl?: boolean
  canWorkInUK?: boolean
  competentInOtherLanguage?: boolean
  otherLanguages?: string[]
  drivingLicense?: boolean
  licenseNumber?: string
  carOwner?: boolean
  travelAreas?: string
  solelyForEverycare?: boolean
  otherEmployers?: string
  professionalBody?: boolean
  professionalBodyDetails?: string
  educationData?: {
    institution?: string
    qualification?: string
    awardDate?: string
    grade?: string
    certificate?: string
  }[]
  trainingData?: {
    trainingName?: string
    awardingBody?: string
    completionDate?: string
    certificate?: string
  }[]
  lifeSkillsAndInterests?: string
  relevantExperience?: string
  ethnicityGroup?: string
  ethnicityValue?: string
  ethnicityOther?: string
  isEmployed?: string
  currentEmployment?: {
    employer?: string
    jobTitle?: string
    startDate?: string
    employmentType?: string
    responsibilities?: string
    supervisor?: string
    contactPermission?: string
  }
  hasPreviousEmployment?: string
  previousEmployments?: {
    employer?: string
    jobTitle?: string
    startDate?: string
    endDate?: string
    reasonForLeaving?: string
    responsibilities?: string
    hasEmploymentGaps?: string
    employmentGapsExplanation?: string
    contactPermission?: string
  }[]
  hasEmploymentGaps?: string
  employmentGapsExplanation?: string
  hasDisability?: boolean
  disabilityDetails?: string
  needsReasonableAdjustment?: boolean
  reasonableAdjustmentDetails?: string
  professionalReferee1?: {
    name?: string
    position?: string
    relationship?: string
    organisation?: string
    address?: string
    tel?: string
    fax?: string
    email?: string
  }
  professionalReferee2?: {
    name?: string
    position?: string
    relationship?: string
    organisation?: string
    address?: string
    tel?: string
    fax?: string
    email?: string
  }
  personalReferee?: {
    name?: string
    position?: string
    relationship?: string
    organisation?: string
    address?: string
    tel?: string
    fax?: string
    email?: string
  }
  cvResume?: string
  proofOfAddress1?: string
  proofOfAddress2?: string
  idDocuments?: string[]
  utilityBills?: string[]
  bankStatement?: string[]
  proofOfNI?: string[]
  immigrationDocument?: string[]
  proofOfAddress?: string[]
  passport?: string[]
  workExperience?: string[]
  personalStatement?: string[]
  sex?: string
  advisedMedicalWorkRestriction?: boolean
  advisedMedicalWorkRestrictionComment?: string
  undueFatigue?: boolean
  undueFatigueDetails?: string
  daysSickLastYear?: string
  accountNumber?: string
  sortCode?: string
  bankName?: string
  branchName?: string
  buildingSocietyRollNo?: string
  [key: string]: any
}

export default function ViewCareerApplicationPage() {
  const [application, setApplication] = useState<Application>()
  const [applicationJob, setApplicationJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("personalDetails")
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const { id, userId } = useParams()

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        const response = await axiosInstace.get(`/users/${userId}`)
        setApplication(response.data.data)
        setLoading(false)
      } catch (err) {
        setLoading(false)
        setError("Failed to fetch application data. Please try again.")
        console.error("Error fetching application:", err)
      }
    }

    fetchApplication()
  }, [userId])

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await axiosInstace.get(`/application-job/${id}`)
        setApplicationJob(response.data.data)
        setLoading(false)
      } catch (err) {
        setLoading(false)
        setError("Failed to fetch application data. Please try again.")
        console.error("Error fetching application:", err)
      }
    }

    if (id) fetchJob()
  }, [id])

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        setCopiedFields((prev) => ({ ...prev, [field]: true }))
        toast.success("Copied to clipboard!")
        setTimeout(() => {
          setCopiedFields((prev) => ({ ...prev, [field]: false }))
        }, 2000)
      },
      () => {
        toast.error("Failed to copy text")
      },
    )
  }

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return "Not provided"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (value === "") return "Not provided"
    if (typeof value === "object" && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} items` : "None"
    }
    if (typeof value === "string" && moment(value, moment.ISO_8601, true).isValid()) {
      return moment(value).format("MM-DD-YYYY")
    }
    if (typeof value === "object") return "Complex data"
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return String(value)
  }

  const renderFieldRow = (label: string, value: any, fieldPath: string) => {
    const isCopied = copiedFields[fieldPath] || false
    const isEmptyValue = value === undefined || value === null || value === ""
    const isUrl = typeof value === "string" && value.startsWith("http")
    const isEmail = typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

    const displayValue = isUrl
      ? null
      : isEmail
        ? value.toLowerCase()
        : typeof value === "string" && /^\d+$/.test(value)
          ? value
          : formatValue(value)

    return (
      <TableRow key={fieldPath} className="hover:bg-muted/10">
        <TableCell className="text-left align-middle font-medium">{label}</TableCell>
        <TableCell className={cn("text-right align-middle", isEmptyValue && "italic text-muted-foreground")}>
          {isUrl ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 underline hover:text-blue-800"
            >
              View File
            </a>
          ) : (
            displayValue
          )}
        </TableCell>
        <TableCell className="w-10 text-right">
          {!isEmptyValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(String(value), fieldPath)}
              className="h-8 w-8"
              aria-label={`Copy ${label}`}
            >
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </TableCell>
      </TableRow>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No application data found.</AlertDescription>
        </Alert>
      </div>
    )
  }

return (
  <div className="w-full">
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3">
      <Button className="bg-watney text-white hover:bg-watney/90" onClick={() => navigate(-1)}>
        <MoveLeft /> Back
      </Button>
      <div className="font-semibold">{applicationJob?.jobId?.jobTitle}</div>
      <PDFGenerator application={application} applicationJob={applicationJob} />
    </div>

    {/* Main Content with Vertical Tabs */}
    <div className="p-4 pb-5">
      <VerticalTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Personal Details */}
        <TabContent value="personalDetails" activeTab={activeTab}>
          <PersonalDetailsTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="addressDetails" activeTab={activeTab}>
          <AddressDetailsTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="nextToKin" activeTab={activeTab}>
          <NextOfKinTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="applicationData" activeTab={activeTab}>
          <ApplicationDetailsTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="educationData" activeTab={activeTab}>
          <EducationTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="trainingData" activeTab={activeTab}>
          <TrainingTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="experienceData" activeTab={activeTab}>
          <ExperienceTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="ethnicityData" activeTab={activeTab}>
          <EthnicityTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="employmentData" activeTab={activeTab}>
          <EmploymentTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="disabilityData" activeTab={activeTab}>
          <DisabilityTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="refereeData" activeTab={activeTab}>
          <ReferenceTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="documentData" activeTab={activeTab}>
          <DocumentsTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="postEmployment" activeTab={activeTab}>
          <PostEmploymentTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="paymentData" activeTab={activeTab}>
          <PaymentDetailsTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>

        <TabContent value="terms" activeTab={activeTab}>
          <TermTab application={application} renderFieldRow={renderFieldRow} />
        </TabContent>
      </VerticalTabs>
    </div>
  </div>
);
}
