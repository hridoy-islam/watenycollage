import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Mail, MailCheck, File, ClipboardPenLine, Check, LockOpen, Loader2, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import axiosInstace from "@/lib/axios"
import Select from "react-select"
import moment from "moment"

interface EmailDraft {
  _id: string
  subject: string
  body: string
}

interface Applicant {
  _id?: string
  email?: string
  title?: string
  firstName?: string
  initial?: string
  lastName?: string
  phone?: string
  nationality?: string
  countryOfResidence?: string
  dateOfBirth?: string
  postalAddressLine1?: string
  postalAddressLine2?: string
  postalCity?: string
  postalCountry?: string
  postalPostCode?: string
  emergencyAddress?: string
  emergencyContactNumber?: string
  emergencyEmail?: string
  emergencyFullName?: string
  emergencyRelationship?: string
  jobOfferMailSent?: boolean
  interviewMailSent?: boolean
  referenceMailSent?: boolean
  [key: string]: any
}

const AVAILABLE_VARIABLES = [
  'name', 'title', 'firstName', 'lastName', 'phone', 'email',
  'nationality', 'countryOfResidence', 'dateOfBirth',
  'postalAddressLine1', 'postalAddressLine2', 'postalCity',
  'postalCountry', 'postalPostCode', 'emergencyAddress',
  'emergencyContactNumber', 'emergencyEmail', 'emergencyFullName',
  'emergencyRelationship', 'admin', 'adminEmail',
  'applicationStatus', 'applicationDate', 'todayDate', 'applicationTitle'
]

interface RecruitmentActionsTabProps {
  application: any
  applicationJob: any
  userId?: string
  applicationId?: string
}

export function RecruitmentActionsTab({ application, applicationJob, userId, applicationId }: RecruitmentActionsTabProps) {
  const navigate = useNavigate()
  const user = useSelector((state: any) => state.auth?.user)

  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailErrors, setEmailErrors] = useState<{ draft?: string; subject?: string; body?: string }>({})
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [activeEmailContext, setActiveEmailContext] = useState<string>("")

  const [referenceAlertOpen, setReferenceAlertOpen] = useState(false)
  const [referenceLoading, setReferenceLoading] = useState(false)

  // Loading states for each action
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [unlockLoading, setUnlockLoading] = useState<{ [key: string]: boolean }>({})
  
  // Local state to track sent/done status for immediate UI updates
  const [localJobOfferSent, setLocalJobOfferSent] = useState(application?.jobOfferMailSent)
  const [localInterviewSent, setLocalInterviewSent] = useState(application?.interviewMailSent)
  const [localReferenceSent, setLocalReferenceSent] = useState(application?.referenceMailSent)
  const [localUnlocks, setLocalUnlocks] = useState<{ [key: string]: boolean }>({
    postEmploymentUnlock: !!application?.postEmploymentUnlock,
    dbsUnlock: !!application?.dbsUnlock,
    ecertUnlock: !!application?.ecertUnlock,
    bankDetailsUnlock: !!application?.bankDetailsUnlock,
    startDateUnlock: !!application?.startDateUnlock,
  })

  // Update local states when application prop changes
  useEffect(() => {
    setLocalJobOfferSent(application?.jobOfferMailSent)
    setLocalInterviewSent(application?.interviewMailSent)
    setLocalReferenceSent(application?.referenceMailSent)
    setLocalUnlocks({
      postEmploymentUnlock: !!application?.postEmploymentUnlock,
      dbsUnlock: !!application?.dbsUnlock,
      ecertUnlock: !!application?.ecertUnlock,
      bankDetailsUnlock: !!application?.bankDetailsUnlock,
      startDateUnlock: !!application?.startDateUnlock,
    })
  }, [application])

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await axiosInstace.get('/email-drafts?limit=all')
        setEmailDrafts(res.data.data.result)
      } catch (error) {
        console.error('Failed to fetch email drafts:', error)
      }
    }
    fetchDrafts()
  }, [])

  const handleOpenEmailDialog = async (context: "job-offer" | "interview") => {
    if (!userId) {
      toast.error("Applicant ID missing")
      return
    }
    setEmailLoading(true)
    try {
      setActiveEmailContext(context)
      setSelectedDraft(null)
      setEmailSubject("")
      setEmailBody("")
      setEmailErrors({})
      setEmailDialogOpen(true)
    } catch (error) {
      console.error("Failed to open email dialog", error)
    } finally {
      setEmailLoading(false)
    }
  }

  const templateOptions = emailDrafts.map((draft) => ({
    value: draft._id,
    label: draft.subject
  }))

  const formatText = (text: string) => {
    if (!text) return ""
    return String(text).replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const replaceVariables = async (text: string, userDetail: Applicant | null) => {
    let replacedText = text
    const applicant = userDetail || application

    const basicVariables = AVAILABLE_VARIABLES.filter(
      (v) => !["applicationStatus", "applicationDate", "todayDate", "applicationTitle"].includes(v)
    )

    basicVariables.forEach((variable) => {
      let value = ""
      if (variable === "admin") {
        value = "Everycare Romford"
      } else if (variable === "adminEmail") {
        value = "admin@everycareromford.co.uk"
      } else {
        value = applicant?.[variable] || ""
        if (variable === "name") {
          value = `${applicant?.firstName || ""} ${applicant?.lastName || ""}`
        }
        if (variable.toLowerCase().includes("email")) {
          value = String(value).toLowerCase()
        } else if (variable === "dateOfBirth" || variable.toLowerCase().includes("date")) {
          if (value && moment(value).isValid()) {
            value = moment(value).format("DD MMM, YYYY")
          }
        } else {
          value = formatText(value)
        }
      }
      replacedText = replacedText.replace(new RegExp(`\\[${variable}\\]`, "g"), value)
    })

    const today = moment().format("DD MMM, YYYY")
    const appDate = applicationJob?.createdAt
      ? moment(applicationJob.createdAt).format("DD MMM, YYYY")
      : ""
    const appStatus = formatText(applicationJob?.status || "")
    const appTitle = formatText(applicationJob?.jobId?.jobTitle || "")

    replacedText = replacedText
      .replace(/\[todayDate\]/g, today)
      .replace(/\[applicationDate\]/g, appDate)
      .replace(/\[applicationStatus\]/g, appStatus)
      .replace(/\[applicationTitle\]/g, appTitle)

    const signatureRegex = /\[signature\s+id=["'](\d+)["']\]/g
    const signatureMatches = [...replacedText.matchAll(signatureRegex)]
    const signaturePromises = signatureMatches.map(async (match) => {
      const signatureId = match[1]
      const placeholder = match[0]
      try {
        const res = await axiosInstace.get(`/signature?signatureId=${signatureId}`)
        const url = res.data.data?.result[0]?.documentUrl
        return { placeholder, replacement: url }
      } catch {
        return { placeholder, replacement: "[Signature]" }
      }
    })

    if (signaturePromises.length > 0) {
      const replacements = await Promise.all(signaturePromises)
      replacements.forEach(({ placeholder, replacement }) => {
        replacedText = replacedText.replace(placeholder, replacement)
      })
    }

    return replacedText
  }

  const handleTemplateChange = async (selectedOption: { value: string; label: string } | null) => {
    if (!selectedOption) return
    const draft = emailDrafts.find((d) => d._id === selectedOption.value)
    if (draft) {
      setSelectedDraft(draft)
      setEmailSubject(draft.subject)
      const replacedBody = await replaceVariables(draft.body, {
        _id: userId,
        ...application
      })
      setEmailBody(replacedBody)
    }
  }

  const handleSendEmail = async () => {
    const newErrors: typeof emailErrors = {}
    if (!selectedDraft) newErrors.draft = "Template is required"
    if (!emailSubject.trim()) newErrors.subject = "Subject is required"
    if (!emailBody.trim()) newErrors.body = "Body is required"
    setEmailErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    if (!user) return

    setSendingEmail(true)
    try {
      const payload: any = {
        emailDraft: selectedDraft!._id,
        userId,
        issuedBy: user._id,
        subject: emailSubject,
        body: emailBody,
        applicationId
      }

      if (activeEmailContext === "job-offer") {
        payload.jobOfferMailSent = true
      } else if (activeEmailContext === "interview") {
        payload.interviewMailSent = true
      }

      const res = await axiosInstace.post("/email", payload)
      if (res.data.success) {
        toast.success("Email Sent successfully")
        // Update local state to show "Sent" immediately
        if (activeEmailContext === "job-offer") {
          setLocalJobOfferSent(true)
        } else if (activeEmailContext === "interview") {
          setLocalInterviewSent(true)
        }
        setEmailDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send email")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSendReferenceEmail = async () => {
    if (!userId || !user) return
    setReferenceLoading(true)
    try {
      const res = await axiosInstace.patch(`/users/${userId}`, { referenceMailSent: true, jobApplicationId: applicationId })
      if (res.data.success) {
        toast.success("Reference Request Sent")
        setLocalReferenceSent(true)
        setReferenceAlertOpen(false)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reference email")
    } finally {
      setReferenceLoading(false)
    }
  }

  const isJobOfferSent = localJobOfferSent
  const isInterviewSent = localInterviewSent
  const isReferenceSent = localReferenceSent

  const handleUnlockAction = async (field: string) => {
    if (!userId) return
    // Set loading for this specific unlock button
    setUnlockLoading(prev => ({ ...prev, [field]: true }))
    try {
      const payload = { [field]: true, jobApplicationId: applicationId }
      await axiosInstace.patch(`/users/${userId}`, payload)
      toast.success("Section Unlocked Successfully")
      // Update local state to show "Done" immediately
      setLocalUnlocks(prev => ({ ...prev, [field]: true }))
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to unlock section")
    } finally {
      setUnlockLoading(prev => ({ ...prev, [field]: false }))
    }
  }

  // Set loading for email actions
  const handleActionClick = async (actionType: string) => {
    if (actionType === "job-offer" || actionType === "interview") {
      await handleOpenEmailDialog(actionType)
    } else if (actionType === "reference") {
      setReferenceAlertOpen(true)
    }
  }

  const unlockItems = [
    { field: "postEmploymentUnlock", label: "Unlock Medical", done: localUnlocks.postEmploymentUnlock },
    { field: "dbsUnlock", label: "Unlock DBS", done: localUnlocks.dbsUnlock },
    { field: "ecertUnlock", label: "Unlock E-Cert", done: localUnlocks.ecertUnlock },
    { field: "bankDetailsUnlock", label: "Unlock Bank Details", done: localUnlocks.bankDetailsUnlock },
    { field: "startDateUnlock", label: "Unlock Starter Checklist", done: localUnlocks.startDateUnlock },
  ]

  const actions = [
    {
      label: "Job Offer",
      sent: isJobOfferSent,
      loading: actionLoading["jobOffer"],
      icon: isJobOfferSent ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />,
      onClick: () => handleActionClick("job-offer"),
      isViewOnly: false
    },
    {
      label: "Interview Mail",
      sent: isInterviewSent,
      loading: actionLoading["interview"],
      icon: isInterviewSent ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />,
      onClick: () => handleActionClick("interview"),
      isViewOnly: false
    },
    {
      label: "Reference Mail",
      sent: isReferenceSent,
      loading: referenceLoading,
      icon: isReferenceSent ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />,
      onClick: () => setReferenceAlertOpen(true),
      isViewOnly: false
    },
    {
      label: "DBS",
      sent: false,
      loading: false,
      icon: <File className="h-4 w-4" />,
      onClick: () => navigate(`/dashboard/admin/dbs-form/${userId}/edit`),
      isViewOnly: true
    },
    {
      label: "Interview Score",
      sent: false,
      loading: false,
      icon: <ClipboardPenLine className="h-4 w-4" />,
      onClick: () => navigate(`/dashboard/career-application/${applicationId}/${userId}/interview`),
      isViewOnly: true
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200 rounded-lg">
        <CardHeader className="border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-base font-bold text-black">Communication Mails</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black">Action</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action, i) => (
                <TableRow 
                  key={action.label} 
                  className={`cursor-pointer ${i !== actions.length - 1 ? "border-b border-gray-200" : ""}`} 
                  onClick={action.onClick}
                >
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center gap-3 text-sm font-medium text-black">
                      {action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                      {action.label}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {action.isViewOnly ? (
                      <Button
                        size="sm"
                        className="border-watney  h-8 px-4 text-xs font-medium rounded"
                        onClick={(e) => { e.stopPropagation(); action.onClick() }}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                    ) : action.sent ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 px-2.5 py-1 rounded">
                        <Check className="h-3.5 w-3.5" /> Sent
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-watney text-white hover:bg-watney/90 h-8 px-4 text-xs font-medium rounded"
                        onClick={(e) => { e.stopPropagation(); action.onClick() }}
                        disabled={action.loading || emailLoading}
                      >
                        {action.loading ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-lg">
        <CardHeader className="border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-base font-bold text-black">Unlock Sections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black">Section</TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlockItems.map((item, i) => (
                <TableRow
                  key={item.field}
                  className={`cursor-pointer ${i !== unlockItems.length - 1 ? "border-b border-gray-200" : ""}`}
                  onClick={() => !item.done && handleUnlockAction(item.field)}
                >
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center gap-3 text-sm font-medium text-black">
                      {unlockLoading[item.field] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : item.done ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <LockOpen className="h-4 w-4" />
                      )}
                      {item.label.replace("Unlock ", "")}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {item.done ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 px-2.5 py-1 rounded">
                        <Check className="h-3.5 w-3.5" /> Done
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-watney text-white hover:bg-watney/90 h-8 px-4 text-xs font-medium rounded"
                        onClick={(e) => { e.stopPropagation(); handleUnlockAction(item.field) }}
                        disabled={unlockLoading[item.field]}
                      >
                        {unlockLoading[item.field] ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Unlocking...
                          </>
                        ) : (
                          "Unlock"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reference Email Confirmation Dialog */}
      <AlertDialog open={referenceAlertOpen} onOpenChange={setReferenceAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Reference Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will send an automated reference request email to {application?.firstName} {application?.lastName}'s referees. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReferenceAlertOpen(false)} disabled={referenceLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleSendReferenceEmail() }}
              className="bg-watney text-white hover:bg-watney/90"
              disabled={referenceLoading}
            >
              {referenceLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Confirm Send"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Email Dialog (Job Offer & Interview) */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-h-[95vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Send {activeEmailContext === "job-offer" ? "Job Offer" : "Interview"} Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Select Template</label>
              <Select
                options={templateOptions}
                value={selectedDraft ? { value: selectedDraft._id, label: selectedDraft.subject } : null}
                onChange={handleTemplateChange}
                placeholder="Choose a template..."
                isClearable
              />
              {emailErrors.draft && <p className="mt-1 text-sm text-red-500">{emailErrors.draft}</p>}
            </div>

            <div>
              <label className="mb-1 block font-medium">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-watney"
              />
              {emailErrors.subject && <p className="mt-1 text-sm text-red-500">{emailErrors.subject}</p>}
            </div>

            <div>
              <label className="mb-1 block font-medium">Body</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="h-[250px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
              {emailErrors.body && <p className="mt-1 text-sm text-red-500">{emailErrors.body}</p>}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              className="ml-2 bg-watney text-white hover:bg-watney/90"
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}