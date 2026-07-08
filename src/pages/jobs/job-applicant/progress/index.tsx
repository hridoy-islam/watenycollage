import { useState, useEffect } from "react"
import {
  AlertCircle,
  MoveLeft,
  Settings,
  UserCircle,
  FileText,
  Stethoscope,
  Landmark,
  ShieldCheck,
  ClipboardCheck,
  File
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import axiosInstace from "@/lib/axios"

import Loader from "@/components/shared/loader"
import { RecruitmentActionsTab } from "@/pages/jobs/job-applicant/progress/components/recruitment-actions-tab"
import { RefereeConfirmationTab } from "@/pages/jobs/job-applicant/progress/components/referee-confirmation-tab"
import { DocumentsTab } from "./components/documents-tab"
import { MedicalFormTab } from "./components/medical-form-tab"
import { BankDetailsTab } from "./components/bank-details-tab"
import { DBSFormTab } from "./components/dbs-form-tab"
import { StarterChecklistTab } from "./components/starter-checklist-tab"
import { EcertFormTab } from "./components/ecert-form-tab"
import { EmploymentContractTab } from "./components/employment-contract-tab"
import { JobContractTab } from "./components/job-contract-tab"
import { ConfidentialityFormTab } from "./components/confidentiality-form-tab"

type TabType = "actions" | "referee" | "documents" | "medical" | "bank" | "dbs" | "checklist" | "ecert" | "employmentContract" | "jobContract" | "confidentiality"

const tabs = [
  { id: "actions" as TabType, label: "Actions", icon: <Settings size={20} /> },
  { id: "referee" as TabType, label: "Referee Confirmation", icon: <UserCircle size={20} /> },
  { id: "medical" as TabType, label: "Medical Questionnaire", icon: <Stethoscope size={20} /> },
  { id: "bank" as TabType, label: "Bank Details", icon: <Landmark size={20} /> },
  { id: "dbs" as TabType, label: "DBS Certificate", icon: <ShieldCheck size={20} /> },
  { id: "checklist" as TabType, label: "Starter Checklist", icon: <ClipboardCheck size={20} /> },
  { id: "ecert" as TabType, label: "Training Certificates", icon: <File size={20} /> },
  { id: "employmentContract" as TabType, label: "Employment Contract", icon: <File size={20} /> },
  { id: "jobContract" as TabType, label: "Job Contract", icon: <File size={20} /> },
  { id: "confidentiality" as TabType, label: "Confidentiality", icon: <File size={20} /> },
  { id: "documents" as TabType, label: "Documents", icon: <FileText size={20} /> },
]

export default function ProgressPage() {
  const [application, setApplication] = useState<any>()
  const [applicationJob, setApplicationJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("actions")
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
      <div className="flex items-center justify-between px-4 py-3">
        <Button className="bg-watney text-white hover:bg-watney/90" onClick={() => navigate(-1)}>
          <MoveLeft /> Back
        </Button>
        <div className="font-semibold">{application?.name}</div>
        <div className="font-semibold">{applicationJob?.jobId?.jobTitle}</div>
      </div>

      <div className="p-4 pb-5">
        <div className="flex gap-6 h-full">
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-4">
              <div className="py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          <main className="flex-1 bg-white rounded-lg shadow-lg p-6 overflow-auto">
            {activeTab === "actions" && (
              <RecruitmentActionsTab
                application={application}
                applicationJob={applicationJob}
                userId={userId}
                applicationId={id}
              />
            )}
            {activeTab === "referee" && (
              <RefereeConfirmationTab application={application} />
            )}
            {activeTab === "medical" && (
              <MedicalFormTab userId={userId || ''} />
            )}
            {activeTab === "bank" && (
              <BankDetailsTab userId={userId || ''} />
            )}
            {activeTab === "dbs" && (
              <DBSFormTab userId={userId || ''} />
            )}
            {activeTab === "checklist" && (
              <StarterChecklistTab userId={userId || ''} />
            )}
            {activeTab === "ecert" && (
              <EcertFormTab userId={userId || ''} />
            )}
            {activeTab === "employmentContract" && (
              <EmploymentContractTab userId={userId || ''} />
            )}
            {activeTab === "jobContract" && (
              <JobContractTab userId={userId || ''} />
            )}
            {activeTab === "confidentiality" && (
              <ConfidentialityFormTab userId={userId || ''} />
            )}
            {activeTab === "documents" && (
              <DocumentsTab
                application={application}
                userId={userId}
                onUpdate={() => {
                  const fetchApplication = async () => {
                    try {
                      const response = await axiosInstace.get(`/users/${userId}`)
                      setApplication(response.data.data)
                    } catch (err) {
                      console.error("Error refreshing application:", err)
                    }
                  }
                  fetchApplication()
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
