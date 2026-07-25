import { useState, useEffect, useMemo, useCallback } from "react"
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
import { Mail, MailCheck, File, ClipboardPenLine, Check, LockOpen, Loader2, Eye, FileText, UserPlus, Save, X, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axiosInstace from "@/lib/axios"
import Select from "react-select"
import moment from "moment"
import { useToast } from "@/components/ui/use-toast"
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { EmailPDF } from "./email-pdf"

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
  'applicationStatus', 'applicationDate', 'todayDate', 'applicationTitle',
  'jobTitle'
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
  const { toast } = useToast()

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

  // Contract type dialog state
  const [contractTypeDialogOpen, setContractTypeDialogOpen] = useState(false)
  const [contractTypes, setContractTypes] = useState<{ _id: string; title: string; body?: string }[]>([])
  const [selectedContractType, setSelectedContractType] = useState<string>("")
  const [contractTypeLoading, setContractTypeLoading] = useState(false)
  const [contractTypeSelectError, setContractTypeSelectError] = useState("")
  const [editableTemplate, setEditableTemplate] = useState("")
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [previewBody, setPreviewBody] = useState("")

  // Preview dialog state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{ subject: string; body: string; type: string; email: string; sentDate?: string } | null>(null)

  // Recruit dialog state
  const [recruitDialogOpen, setRecruitDialogOpen] = useState(false)
  const [designations, setDesignations] = useState<{ _id: string; title: string }[]>([])
  const [selectedDesignationIds, setSelectedDesignationIds] = useState<string[]>([])
  const [recruiting, setRecruiting] = useState(false)
  const [designationError, setDesignationError] = useState("")

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
    jobContractUnlock: !!application?.jobContractUnlock,
    confidentialityFormUnlock: !!application?.confidentialityFormUnlock,
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
      jobContractUnlock: !!application?.jobContractUnlock,
      confidentialityFormUnlock: !!application?.confidentialityFormUnlock,
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

  // Fetch designations when recruit dialog opens
  useEffect(() => {
    if (recruitDialogOpen) {
      axiosInstace.get("/designation?limit=all")
        .then(res => setDesignations(res.data.data?.result || []))
        .catch(() => toast({
          title: "Error",
          description: "Failed to load designations",
          variant: "destructive"
        }))
    }
  }, [recruitDialogOpen])

  const handleOpenEmailDialog = async (context: "job-offer" | "interview") => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Applicant ID missing",
        variant: "destructive"
      })
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

  const replaceVariables = async (text: string, userDetail: Applicant | null, appJob: any = null) => {
    let replacedText = text
    const applicant = userDetail || application
    const jobData = appJob || applicationJob

    const basicVariables = AVAILABLE_VARIABLES.filter(
      (v) => !["applicationStatus", "applicationDate", "todayDate", "applicationTitle", "jobTitle"].includes(v)
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
    const appDate = jobData?.createdAt
      ? moment(jobData.createdAt).format("DD MMM, YYYY")
      : ""
    const appStatus = formatText(jobData?.status || "")
    const appTitle = formatText(jobData?.jobId?.jobTitle || "")
    const jobTitleVal = formatText(jobData?.jobId?.jobTitle || "")

    replacedText = replacedText
      .replace(/\[todayDate\]/g, today)
      .replace(/\[applicationDate\]/g, appDate)
      .replace(/\[applicationStatus\]/g, appStatus)
      .replace(/\[applicationTitle\]/g, appTitle)
      .replace(/\[jobTitle\]/g, jobTitleVal)

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
      }, applicationJob)
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
        payload.jobOfferMailTemplate = emailBody
        payload.jobOfferMailSubject = emailSubject
      } else if (activeEmailContext === "interview") {
        payload.interviewMailSent = true
        payload.interviewMailTemplate = emailBody
        payload.interviewMailSubject = emailSubject
      }

      const res = await axiosInstace.post("/email", payload)
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Email Sent successfully",
        })
        setPreviewData({
          subject: emailSubject,
          body: emailBody,
          type: activeEmailContext,
          email: application?.email || "",
          sentDate: new Date().toISOString()
        })
        if (activeEmailContext === "job-offer") {
          setLocalJobOfferSent(true)
        } else if (activeEmailContext === "interview") {
          setLocalInterviewSent(true)
        }
        setEmailDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send email",
        variant: "destructive"
      })
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
        toast({
          title: "Success",
          description: "Reference Request Sent",
        })
        setLocalReferenceSent(true)
        setReferenceAlertOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reference email",
        variant: "destructive"
      })
    } finally {
      setReferenceLoading(false)
    }
  }

  const handleRecruit = async () => {
    if (selectedDesignationIds.length === 0) {
      setDesignationError("Please select at least one designation")
      return
    }
    setDesignationError("")
    setRecruiting(true)
    try {
      await axiosInstace.patch(`/users/${userId}`, {
        role: "employee",
        designationId: selectedDesignationIds
      })
      toast({
        title: "Success",
        description: "User recruited successfully",
      })
      setRecruitDialogOpen(false)
      navigate(-1)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to recruit user",
        variant: "destructive"
      })
      console.error(err)
    } finally {
      setRecruiting(false)
    }
  }

  const isJobOfferSent = localJobOfferSent
  const isInterviewSent = localInterviewSent
  const isReferenceSent = localReferenceSent

  const handleUnlockAction = async (field: string) => {
    if (!userId) return

    if (field === "jobContractUnlock") {
      setContractTypeLoading(true)
      setContractTypeDialogOpen(true)
      try {
        const res = await axiosInstace.get("/contract-type?limit=all")
        setContractTypes(res.data.data?.result || [])
      } catch {
        toast({
          title: "Error",
          description: "Failed to load contract types",
          variant: "destructive"
        })
      } finally {
        setContractTypeLoading(false)
      }
      return
    }

    setUnlockLoading(prev => ({ ...prev, [field]: true }))
    try {
      const payload = { [field]: true, jobApplicationId: applicationId }
      await axiosInstace.patch(`/users/${userId}`, payload)

      toast({
        title: "Success",
        description: "Section Unlocked Successfully",
      })
      setLocalUnlocks(prev => ({ ...prev, [field]: true }))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to unlock section",
        variant: "destructive"
      })
    } finally {
      setUnlockLoading(prev => ({ ...prev, [field]: false }))
    }
  }

  const renderTextWithImages = (text: string, keyPrefix: string) => {
    const imgRegex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp|svg)(\?[^\s]*)?/gi
    const parts: JSX.Element[] = []
    let lastIdx = 0
    let m: RegExpExecArray | null
    const regex = new RegExp(imgRegex.source, 'gi')
    while ((m = regex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        parts.push(<span key={`${keyPrefix}-t-${lastIdx}`}>{text.slice(lastIdx, m.index)}</span>)
      }
      parts.push(
        <img
          key={`${keyPrefix}-img-${m.index}`}
          src={m[0]}
          alt="signature"
          className="inline-block h-12 object-contain"
        />
      )
      lastIdx = m.index + m[0].length
    }
    if (lastIdx < text.length) {
      parts.push(<span key={`${keyPrefix}-t-${lastIdx}`}>{text.slice(lastIdx)}</span>)
    }
    return parts.length > 0 ? parts : text
  }

  const renderFormattedText = (text: string) => {
    if (!text) return null
    const centerParts = text.split(/(<center>|<\/center>)/g)
    const allElements: JSX.Element[] = []
    let isCentered = false
    let centerIndex = 0

    centerParts.forEach((part) => {
      if (part === '<center>') { isCentered = true; return }
      if (part === '</center>') { isCentered = false; centerIndex++; return }
      if (!part.trim()) return

      const lines = part.split('\n')
      const localElements: JSX.Element[] = []

      lines.forEach((line, i) => {
        if (i > 0) localElements.push(<br key={`nl-${i}`} />)

        const headerMatch = line.match(/^<header>(.*)<\/header>$/)
        const subtitleMatch = line.match(/^<subtitle>(.*)<\/subtitle>$/)

        if (headerMatch) {
          const inner = headerMatch[1]
          const innerEls: JSX.Element[] = []
          let lastIdx = 0
          const tagRx = /<(b|i)>(.*?)<\/\1>/g
          let m
          while ((m = tagRx.exec(inner)) !== null) {
            if (m.index > lastIdx) innerEls.push(<span key={`h-${i}-${lastIdx}`}>{inner.slice(lastIdx, m.index)}</span>)
            const T = m[1] === 'b' ? 'strong' : 'em'
            innerEls.push(<T key={`h-${i}-${m.index}`}>{m[2]}</T>)
            lastIdx = m.index + m[0].length
          }
          if (lastIdx < inner.length) innerEls.push(<span key={`h-${i}-${lastIdx}`}>{inner.slice(lastIdx)}</span>)
          localElements.push(<div key={`header-${i}`} style={{ fontWeight: 'bold', fontSize: '18px', margin: '8px 0' }}>{innerEls}</div>)
          return
        }

        if (subtitleMatch) {
          const inner = subtitleMatch[1]
          const innerEls: JSX.Element[] = []
          let lastIdx = 0
          const tagRx = /<(b|i)>(.*?)<\/\1>/g
          let m
          while ((m = tagRx.exec(inner)) !== null) {
            if (m.index > lastIdx) innerEls.push(<span key={`s-${i}-${lastIdx}`}>{inner.slice(lastIdx, m.index)}</span>)
            const T = m[1] === 'b' ? 'strong' : 'em'
            innerEls.push(<T key={`s-${i}-${m.index}`}>{m[2]}</T>)
            lastIdx = m.index + m[0].length
          }
          if (lastIdx < inner.length) innerEls.push(<span key={`s-${i}-${lastIdx}`}>{inner.slice(lastIdx)}</span>)
          localElements.push(<div key={`subtitle-${i}`} style={{ fontSize: '15px', margin: '6px 0' }}>{innerEls}</div>)
          return
        }

        const brParts = line.split(/(<br\s*\/?>)/g)
        brParts.forEach((seg, j) => {
          if (/<br\s*\/?>/.test(seg)) {
            localElements.push(<br key={`br-${i}-${j}`} />)
            return
          }
          let lastIndex = 0
          const tagRegex = /<(b|i)>(.*?)<\/\1>/g
          let match
          while ((match = tagRegex.exec(seg)) !== null) {
            if (match.index > lastIndex) {
              const textChunk = seg.slice(lastIndex, match.index)
              const chunkWithImg = renderTextWithImages(textChunk, `t-${i}-${j}-${lastIndex}`)
              if (Array.isArray(chunkWithImg)) {
                localElements.push(...chunkWithImg)
              } else {
                localElements.push(<span key={`t-${i}-${j}-${lastIndex}`}>{chunkWithImg}</span>)
              }
            }
            const filteredContent = renderTextWithImages(match[2], `tag-${i}-${j}-${match.index}`)
            const Tag = match[1] === 'b' ? 'strong' : 'em'
            localElements.push(
              <Tag key={`tag-${i}-${j}-${match.index}`}>
                {filteredContent}
              </Tag>
            )
            lastIndex = match.index + match[0].length
          }
          if (lastIndex < seg.length) {
            const remaining = seg.slice(lastIndex)
            const remainingWithImg = renderTextWithImages(remaining, `t-${i}-${j}-${lastIndex}`)
            if (Array.isArray(remainingWithImg)) {
              localElements.push(...remainingWithImg)
            } else {
              localElements.push(<span key={`t-${i}-${j}-${lastIndex}`}>{remainingWithImg}</span>)
            }
          }
        })
      })

      if (isCentered) {
        allElements.push(<div key={`center-${centerIndex}`} style={{ textAlign: 'center' }}>{localElements}</div>)
      } else {
        allElements.push(...localElements)
      }
    })

    return allElements
  }

  const replaceTemplateVars = useCallback(async (template: string) => {
    if (!template) return ""
    const replaced = await replaceVariables(template, {
      _id: userId,
      ...application
    }, applicationJob)
    return replaced
  }, [application, userId, applicationJob])

  useEffect(() => {
    if (!editableTemplate) {
      setPreviewBody("")
      return
    }
    replaceTemplateVars(editableTemplate).then(setPreviewBody)
  }, [editableTemplate, replaceTemplateVars])

  const handleContractTypeChange = async (option: { value: string; label: string } | null) => {
    if (!option) {
      setSelectedContractType("")
      setEditableTemplate("")
      return
    }
    setSelectedContractType(option.value)
    setContractTypeSelectError("")
    const ct = contractTypes.find(c => c._id === option.value)
    if (ct?.body) {
      setEditableTemplate(ct.body)
    } else {
      try {
        const res = await axiosInstace.get(`/contract-type/${option.value}`)
        const fullCt = res.data.data
        if (fullCt?.body) {
          setEditableTemplate(fullCt.body)
        }
      } catch {
        toast({ title: "Error", description: "Failed to load contract type body", variant: "destructive" })
      }
    }
  }

  const handleSaveTemplateToUser = async () => {
    if (!userId) return
    setSavingTemplate(true)
    try {
      await axiosInstace.patch(`/users/${userId}`, {
        jobContractTemplate: editableTemplate,
        contractTypeId: selectedContractType
      })
      toast({ title: "Success", description: "Template saved to user profile" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save template",
        variant: "destructive"
      })
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleContractTypeConfirm = async () => {
    if (!selectedContractType) {
      setContractTypeSelectError("Please select a contract type")
      return
    }
    setContractTypeSelectError("")

    if (editableTemplate) {
      await handleSaveTemplateToUser()
    }

    setUnlockLoading(prev => ({ ...prev, jobContractUnlock: true }))
    try {
      const payload = { contractTypeId: selectedContractType, jobContractUnlock: true, jobApplicationId: applicationId }
      await axiosInstace.patch(`/users/${userId}`, payload)
      toast({
        title: "Success",
        description: "Job Contract Unlocked Successfully",
      })
      setLocalUnlocks(prev => ({ ...prev, jobContractUnlock: true }))
      setContractTypeDialogOpen(false)
      setSelectedContractType("")
      setEditableTemplate("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to unlock job contract",
        variant: "destructive"
      })
    } finally {
      setUnlockLoading(prev => ({ ...prev, jobContractUnlock: false }))
    }
  }

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
    { field: "jobContractUnlock", label: "Unlock Job Contract", done: localUnlocks.jobContractUnlock },
    { field: "confidentialityFormUnlock", label: "Unlock Confidentiality", done: localUnlocks.confidentialityFormUnlock },
  ]

  const actions = [
    {
      label: "Job Offer",
      sent: isJobOfferSent,
      loading: actionLoading["jobOffer"],
      icon: isJobOfferSent ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />,
      onClick: () => handleActionClick("job-offer"),
      isViewOnly: false,
      hasPreview: true
    },
    {
      label: "Interview Mail",
      sent: isInterviewSent,
      loading: actionLoading["interview"],
      icon: isInterviewSent ? <MailCheck className="h-4 w-4" /> : <Mail className="h-4 w-4" />,
      onClick: () => handleActionClick("interview"),
      isViewOnly: false,
      hasPreview: true
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
      onClick: () => navigate(`/dashboard/recruitment/admin/dbs-form/${userId}/edit`),
      isViewOnly: true
    },
    {
      label: "Interview Score",
      sent: false,
      loading: false,
      icon: <ClipboardPenLine className="h-4 w-4" />,
      onClick: () => navigate(`/dashboard/recruitment/career-application/${applicationId}/${userId}/interview`),
      isViewOnly: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Recruit CTA */}
      <Card className="border border-watney/20 bg-watney/10 rounded-lg">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-black">Ready to recruit this applicant?</p>
            <p className="mt-0.5 text-xs text-gray-600">
              This converts {application?.firstName || "the applicant"} into an employee.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setRecruitDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Recruit Applicant
          </Button>
        </CardContent>
      </Card>

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
                          className="border-watney h-8 px-4 text-xs font-medium rounded text-white"
                          onClick={(e) => { e.stopPropagation(); action.onClick() }}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          View
                        </Button>
                      ) : action.sent ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 px-2.5 py-1 rounded">
                            <Check className="h-3.5 w-3.5" /> Sent
                          </span>
                          {action.hasPreview && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-xs font-medium"
                              onClick={async (e) => {
                                e.stopPropagation()
                                const label = action.label === "Job Offer" ? "job-offer" : "interview"
                                const templateField = label === "job-offer" ? "jobOfferMailTemplate" : "interviewMailTemplate"
                                const subjectField = label === "job-offer" ? "jobOfferMailSubject" : "interviewMailSubject"
                                const sentDateField = label === "job-offer" ? "jobOfferMailSentDate" : "interviewMailSentDate"
                                try {
                                  const res = await axiosInstace.get(`/users/${userId}?fields=${templateField},${subjectField},${sentDateField},email`)
                                  const userData = res.data.data
                                  setPreviewData({
                                    subject: userData?.[subjectField] || "",
                                    body: userData?.[templateField] || "",
                                    type: label,
                                    email: application?.email || userData?.email || "",
                                    sentDate: userData?.[sentDateField] || ""
                                  })
                                } catch {
                                  setPreviewData({
                                    subject: "",
                                    body: "",
                                    type: label,
                                    email: application?.email || ""
                                  })
                                }
                                setPreviewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              Preview
                            </Button>
                          )}
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
      </div>

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

      {/* Job Contract Full-Screen Dialog */}
      <Dialog open={contractTypeDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setContractTypeDialogOpen(false)
          setSelectedContractType("")
          setContractTypeSelectError("")
          setEditableTemplate("")
          setPreviewBody("")
        }
      }}>
        <DialogContent className="max-h-screen !max-w-[98vw] !p-0 overflow-y-auto" style={{ maxHeight: '95vh', height: '95vh' }}>
          {contractTypeLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-watney" />
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-lg font-semibold">Job Contract Template Editor</DialogTitle>
                  {applicationJob?.jobId?.jobTitle && (
                    <span className="rounded bg-watney/10 px-2.5 py-0.5 text-sm font-medium text-watney">
                      {applicationJob.jobId.jobTitle}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setContractTypeDialogOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="flex w-2/5 flex-col border-r border-gray-200">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Select Contract Type <span className="text-red-500">*</span>
                      </label>
                      <Select
                        options={contractTypes.map(ct => ({ value: ct._id, label: ct.title }))}
                        value={selectedContractType ? { value: selectedContractType, label: contractTypes.find(ct => ct._id === selectedContractType)?.title || "" } : null}
                        onChange={handleContractTypeChange}
                        placeholder="Choose a contract type..."
                        isClearable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      {contractTypeSelectError && <p className="mt-1 text-sm text-red-500">{contractTypeSelectError}</p>}
                    </div>

                    {editableTemplate && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Template Body</label>
                          <Button
                            size="sm"
                            onClick={handleSaveTemplateToUser}
                            disabled={savingTemplate}
                            className="bg-watney text-white hover:bg-watney/90"
                          >
                            {savingTemplate ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="mr-1 h-3 w-3" />
                            )}
                            Save Template
                          </Button>
                        </div>
                        <textarea
                          value={editableTemplate}
                          onChange={(e) => setEditableTemplate(e.target.value)}
                          className="min-h-[50vh] w-full resize-none rounded-md border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-4">
                    <Button variant="outline" onClick={() => setContractTypeDialogOpen(false)} disabled={unlockLoading.jobContractUnlock}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleContractTypeConfirm}
                      className="bg-watney text-white hover:bg-watney/90"
                      disabled={!selectedContractType || unlockLoading.jobContractUnlock}
                    >
                      {unlockLoading.jobContractUnlock ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Unlocking...
                        </>
                      ) : (
                        "Unlock Job Contract"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="flex w-3/5 flex-col">
                  <div className="border-b border-gray-100 bg-white px-6 py-4">
                    <h3 className="text-base font-semibold text-gray-800">Contract Preview</h3>
                    <p className="text-xs text-gray-500">Preview how the contract will look with applicant data.</p>
                  </div>
                  <div className="overflow-y-auto p-6" style={{ height: '70vh' }}>
                    {previewBody ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                          {renderFormattedText(previewBody)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Select a contract type to see the preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recruit Dialog */}
      <Dialog open={recruitDialogOpen} onOpenChange={(open) => { setRecruitDialogOpen(open); if (!open) setDesignationError("") }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recruit Applicant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <label className="block font-medium">Designation <span className="text-red-500">*</span></label>
            <Select
              options={designations.map(d => ({ value: d._id, label: d.title }))}
              value={designations.filter(d => selectedDesignationIds.includes(d._id)).map(d => ({ value: d._id, label: d.title }))}
              onChange={(opts) => { setSelectedDesignationIds((opts as { value: string; label: string }[] | null)?.map(o => o.value) || []); setDesignationError("") }}
              placeholder="Select designations..."
              isMulti
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '9999px',
                  minHeight: '40px',
                  paddingLeft: '4px'
                }),
                valueContainer: (base) => ({
                  ...base,
                  padding: '2px 8px'
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  paddingRight: '8px'
                })
              }}
            />
            {designationError && <p className="text-sm text-red-500">{designationError}</p>}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => { setRecruitDialogOpen(false); setDesignationError(""); setSelectedDesignationIds([]) }}>
              Cancel
            </Button>
            <Button onClick={handleRecruit} disabled={recruiting} className="bg-watney text-white hover:bg-watney/90">
              {recruiting ? "Recruiting..." : "Recruit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email PDF Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-h-screen overflow-hidden sm:max-h-[95vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>PDF Document Preview</DialogTitle>
          </DialogHeader>

          <div className="h-[75vh] w-full overflow-hidden rounded-md border border-gray-200">
            {previewData && (
              <PDFViewer width="100%" height="100%" className="border-0">
                <EmailPDF
                  fromEmail="admin@everycareromford.co.uk"
                  toEmail={previewData.email || application?.email}
                  sentDate={previewData.sentDate}
                  subject={previewData.subject}
                  bodyText={previewData.body}
                />
              </PDFViewer>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            {previewData && (
              <PDFDownloadLink
                document={
                  <EmailPDF
                    fromEmail="admin@everycareromford.co.uk"
                    toEmail={previewData.email || application?.email}
                    sentDate={previewData.sentDate}
                    subject={previewData.subject}
                    bodyText={previewData.body}
                  />
                }
                fileName={`${
                  previewData.type === "job-offer" ? "Job_Offer" : "Interview_Invitation"
                }_${application?.firstName || "applicant"}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    className="bg-watney text-white hover:bg-watney/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}