import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Check,
  ClipboardPenLine,
  Eye,
  FilePlus,
  MoveLeft,
  Users,
  ListTodo,
  Mail,
  MailCheck,
  History,
  File,
  MoreHorizontal,
  LockOpen
} from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// --- Interfaces ---

interface EmailDraft {
  _id: string;
  subject: string;
  body: string;
}

interface Applicant {
  _id?: string;
  email?: string;
  phone?: string;
  title?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
  // Progress Flags
  dbsDone?: boolean;
  medicalDone?: boolean;
  ecertDone?: boolean;
  bankDetailsDone?: boolean;
  checkListDone?: boolean;

  // Unlock Flags
  postEmploymentUnlock?: boolean;
  dbsUnlock?: boolean;
  ecertUnlock?: boolean;
  bankDetailsUnlock?: boolean;
  startDateUnlock?: boolean;

  // Email Flags (Added here so Typescript doesn't complain when updating)
  jobOfferMailSent?: boolean;
  interviewMailSent?: boolean;
  referenceMailSent?: boolean;

  nationality?: string;
  dateOfBirth?: string;
  countryOfResidence?: string;
  countryOfBirth?: string;
  postalAddressLine1?: string;
  postalAddressLine2?: string;
  postalCity?: string;
  postalPostCode?: string;
  postalCountry?: string;
  emergencyContactNumber?: string;
  emergencyEmail?: string;
  emergencyFullName?: string;
  emergencyRelationship?: string;
  emergencyAddress?: string;
}

interface CareerApplication {
  _id: string;
  applicantId?: Applicant;
  jobId?: {
    jobTitle?: string;
    applicationDeadline?: string;
    jobDetail?: string;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  seen?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // These might be on the root or applicant, but UI reads from applicantId
  jobOfferMailSent?: boolean;
  interviewMailSent?: boolean;
  referenceMailSent?: boolean;
}

// Expanded variables list
const AVAILABLE_VARIABLES = [
  'name',
  'title',
  'firstName',
  'lastName',
  'phone',
  'email',
  'nationality',
  'countryOfResidence',
  'dateOfBirth',
  'postalAddressLine1',
  'postalAddressLine2',
  'postalCity',
  'postalCountry',
  'postalPostCode',
  'emergencyAddress',
  'emergencyContactNumber',
  'emergencyEmail',
  'emergencyFullName',
  'emergencyRelationship',
  'admin',
  'adminEmail',
  'applicationStatus',
  'applicationDate',
  'todayDate',
  'applicationTitle'
];

export default function CareerApplicationsPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useSelector((state: any) => state.auth?.user);

  // --- State: Data & UI ---
  const [allApplications, setAllApplications] = useState<CareerApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [jobTitle, setJobTitle] = useState('');

  // --- State: Recruitment ---
  const [recruitDialogOpen, setRecruitDialogOpen] = useState(false);
  const [recruitLoading, setRecruitLoading] = useState(false);

  // --- State: Progress Dialog ---
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  // --- State: Email Dialog (Job Offer & Interview) ---
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{
    draft?: string;
    subject?: string;
    body?: string;
  }>({});

  // --- State: Reference Email (Alert Dialog) ---
  const [referenceAlertOpen, setReferenceAlertOpen] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);

  // --- Selected Application Tracker ---
  const [selectedApplication, setSelectedApplication] =
    useState<CareerApplication | null>(null);

  // --- Selected Full User Profile (Fetched from /users/:id) ---
  const [selectedUserDetail, setSelectedUserDetail] =
    useState<Applicant | null>(null);

  // Context: 'job-offer', 'interview', 'reference'
  const [activeEmailContext, setActiveEmailContext] = useState<string>('');

  const fetchAllApplications = async (page: number, limit: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const [applicationsRes, jobRes] = await Promise.all([
        axiosInstance.get(`/application-job`, {
          params: {
            jobId: id,
            status: 'applied',
            page,
            limit
          }
        }),
        axiosInstance.get(`/jobs/${id}`)
      ]);

      const applicationsData = applicationsRes.data.data;
      setAllApplications(applicationsData.result || []);
      setTotalPages(applicationsData.meta.totalPage);
      setJobTitle(jobRes?.data?.data?.jobTitle || '');
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllApplications(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage, id]);

  // Fetch Drafts once
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await axiosInstance.get('/email-drafts?limit=all');
        setEmailDrafts(res.data.data.result);
      } catch (error) {
        console.error('Failed to fetch email drafts:', error);
      }
    };
    fetchDrafts();
  }, []);

  // --- Handlers: Unlock Fields ---
  const handleUnlockAction = async (
    applicationId: string,
    applicantId: string,
    field: keyof Applicant
  ) => {
    try {
      // 1. Send API Request
      const payload = { [field]: true };
      await axiosInstance.patch(`/users/${applicantId}`, payload);

      // 2. Optimistic UI Update
      setAllApplications((prev) =>
        prev.map((app) => {
          if (app._id === applicationId) {
            return {
              ...app,
              applicantId: {
                ...app.applicantId,
                [field]: true
              }
            };
          }
          return app;
        })
      );

      toast({
        title: 'Section Unlocked Successfully',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: error?.response?.data?.message || 'Failed to unlock section',
        className: 'bg-destructive text-white border-none'
      });
    }
  };

  // --- Handlers: Recruitment ---

  const handleRecruitClick = (application: CareerApplication) => {
    setSelectedApplication(application);
    setRecruitDialogOpen(true);
  };

  const confirmRecruit = async () => {
    if (!selectedApplication?._id) return;
    setRecruitLoading(true);
    try {
      await axiosInstance.patch(`/application-job/${selectedApplication._id}`, {
        status: 'recruit'
      });
      // Remove locally
      setAllApplications((prev) =>
        prev.filter((app) => app._id !== selectedApplication._id)
      );
      if (allApplications.length === 1 && currentPage > 1)
        setCurrentPage((prev) => prev - 1);
      toast({ title: 'Applicant has been successfully recruited' });
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Failed to recruit',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setRecruitLoading(false);
      setRecruitDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  // --- Handlers: Progress Dialog ---

  const handleOpenProgress = (application: CareerApplication) => {
    setSelectedApplication(application);
    setProgressDialogOpen(true);
  };

  // --- Handlers: Reference Email (Shadcn Alert) ---

  const handleReferenceClick = (application: CareerApplication) => {
    if (!application.applicantId?._id) {
      toast({
        title: 'Applicant ID missing',
        className: 'bg-destructive text-white border-none'
      });
      return;
    }
    setSelectedApplication(application);
    setReferenceAlertOpen(true);
  };

  const handleSendReferenceEmail = async () => {
    if (!selectedApplication || !user) return;
    setReferenceLoading(true);

    try {
      // Specific payload for Reference Mail (No body/subject manual entry)
      const payload = {
        referenceMailSent: true
      };

      const res = await axiosInstance.patch(
        `/users/${selectedApplication.applicantId?._id}`,
        payload
      );

      if (res.data.success) {
        toast({
          title: 'Reference Request Sent',
          className: 'bg-watney text-white border-none'
        });

        // Fixed: Update nested applicantId
        setAllApplications((prev) =>
          prev.map((app) =>
            app._id === selectedApplication._id
              ? {
                  ...app,
                  applicantId: {
                    ...app.applicantId,
                    referenceMailSent: true
                  }
                }
              : app
          )
        );
        setReferenceAlertOpen(false);
      }
    } catch (error: any) {
      toast({
        title:
          error.response?.data?.message || 'Failed to send reference email',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setReferenceLoading(false);
    }
  };

  // --- Handlers: Job & Interview Email (Editor Dialog) ---

  const handleOpenEmailDialog = async (
    application: CareerApplication,
    context: 'job-offer' | 'interview'
  ) => {
    if (!application.applicantId?._id) {
      toast({
        title: 'Applicant ID missing',
        className: 'bg-destructive text-white border-none'
      });
      return;
    }

    setEmailLoading(true);

    try {
      // Fetch full user details first
      const userRes = await axiosInstance.get(
        `/users/${application.applicantId._id}`
      );
      const fullUserData = userRes.data?.data;

      setSelectedUserDetail(fullUserData);
      setSelectedApplication(application);
      setActiveEmailContext(context);

      // Reset form
      setSelectedDraft(null);
      setEmailSubject('');
      setEmailBody('');
      setEmailErrors({});
      setEmailDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch user details', error);
      toast({
        title: 'Failed to load applicant details for email',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTemplateChange = async (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (!selectedOption || !selectedApplication) return;

    const draft = emailDrafts.find((d) => d._id === selectedOption.value);
    if (draft) {
      setSelectedDraft(draft);
      setEmailSubject(draft.subject);

      // Perform Variable Replacement using the fetched user detail
      const replacedBody = await replaceVariables(
        draft.body,
        selectedApplication,
        selectedUserDetail // Pass the fetched user data
      );
      setEmailBody(replacedBody);
    }
  };

  // Helper to format text: Capitalize Words and remove hyphens
  const formatText = (text: string) => {
    if (!text) return '';
    return String(text)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Enhanced replace logic
  const replaceVariables = async (
    text: string,
    application: CareerApplication,
    userDetail: Applicant | null
  ) => {
    let replacedText = text;
    // Use the fetched userDetail if available, otherwise fallback to application.applicantId
    const applicant = userDetail || application.applicantId;

    // 1. Basic Variables
    const basicVariables = AVAILABLE_VARIABLES.filter(
      (v) =>
        ![
          'applicationStatus',
          'applicationDate',
          'todayDate',
          'applicationTitle'
        ].includes(v)
    );

    basicVariables.forEach((variable) => {
      // @ts-ignore - dynamic access
      let value = applicant?.[variable] || '';

      if (variable === 'name') {
        value = `${applicant?.firstName || ''} ${applicant?.lastName || ''}`;
      }

      // Formatting Rules
      if (variable.toLowerCase().includes('email')) {
        // Emails: Lowercase
        value = String(value).toLowerCase();
      } else if (
        variable === 'dateOfBirth' ||
        variable.toLowerCase().includes('date')
      ) {
        // Dates: Use moment
        if (value && moment(value).isValid()) {
          value = moment(value).format('DD MMM, YYYY');
        }
      } else {
        // Text: Capitalize & remove hyphens (e.g. united-kingdom -> United Kingdom)
        value = formatText(value);
      }

      replacedText = replacedText.replace(
        new RegExp(`\\[${variable}\\]`, 'g'),
        value
      );
    });

    // 2. Dates and Titles (Fixed variables)
    const today = moment().format('DD MMM, YYYY');
    const appDate = application.createdAt
      ? moment(application.createdAt).format('DD MMM, YYYY')
      : '';
    const appStatus = formatText(application.status || '');
    const appTitle = formatText(application.jobId?.jobTitle || '');

    replacedText = replacedText
      .replace(/\[todayDate\]/g, today)
      .replace(/\[applicationDate\]/g, appDate)
      .replace(/\[applicationStatus\]/g, appStatus)
      .replace(/\[applicationTitle\]/g, appTitle);

    // 3. Signature Logic
    const signatureRegex = /\[signature\s+id=["'](\d+)["']\]/g;
    const signatureMatches = [...replacedText.matchAll(signatureRegex)];

    const signaturePromises = signatureMatches.map(async (match) => {
      const signatureId = match[1];
      const placeholder = match[0];
      try {
        const res = await axiosInstance.get(
          `/signature?signatureId=${signatureId}`
        );
        const url = res.data.data?.result[0]?.documentUrl;
        return { placeholder, replacement: url };
      } catch (error) {
        return { placeholder, replacement: '[Signature]' };
      }
    });

    if (signaturePromises.length > 0) {
      const replacements = await Promise.all(signaturePromises);
      replacements.forEach(({ placeholder, replacement }) => {
        replacedText = replacedText.replace(placeholder, replacement);
      });
    }

    return replacedText;
  };

  const handleSendEmail = async () => {
    const newErrors: typeof emailErrors = {};
    if (!selectedDraft) newErrors.draft = 'Template is required';
    if (!emailSubject.trim()) newErrors.subject = 'Subject is required';
    if (!emailBody.trim()) newErrors.body = 'Body is required';

    setEmailErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!selectedApplication || !user) return;

    setSendingEmail(true);
    try {
      let payload = {};

      // Different payload construction based on context
      if (activeEmailContext === 'job-offer') {
        payload = {
          emailDraft: selectedDraft!._id,
          userId: selectedApplication.applicantId?._id,
          issuedBy: user._id,
          subject: emailSubject,
          body: emailBody,
          applicationId: selectedApplication._id,
          jobOfferMailSent: true
        };
      } else if (activeEmailContext === 'interview') {
        payload = {
          emailDraft: selectedDraft!._id,
          userId: selectedApplication.applicantId?._id,
          issuedBy: user._id,
          subject: emailSubject,
          body: emailBody,
          applicationId: selectedApplication._id,
          interviewMailSent: true
        };
      }

      const res = await axiosInstance.post('/email', payload);

      if (res.data.success) {
        toast({
          title: 'Email Sent successfully',
          className: 'bg-watney text-white border-none'
        });

        // Fixed: Update nested applicantId
        setAllApplications((prev) =>
          prev.map((app) => {
            if (app._id === selectedApplication._id) {
              return {
                ...app,
                applicantId: {
                  ...app.applicantId,
                  jobOfferMailSent:
                    activeEmailContext === 'job-offer'
                      ? true
                      : app.applicantId?.jobOfferMailSent,
                  interviewMailSent:
                    activeEmailContext === 'interview'
                      ? true
                      : app.applicantId?.interviewMailSent
                }
              };
            }
            return app;
          })
        );

        setEmailDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Failed to send email',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // --- Helper: Render Progress Row ---
  const renderProgressRow = (
    label: string,
    isDone?: boolean,
    type?: string,
    applicantId?: string
  ) => {
    const routeMap: Record<string, string> = {
      medical: `/dashboard/admin/medical-form/${applicantId}`,
      dbs: `/dashboard/admin/dbs-form/${applicantId}`,
      ecert: `/dashboard/admin/ecert-form/${applicantId}`,
      bank: `/dashboard/admin/bank-details/${applicantId}`,
      checklist: `/dashboard/admin/starter-checklist-form/${applicantId}`
    };

    return (
      <div className="flex items-center justify-between border-b py-2 last:border-0">
        <span className="font-medium">{label}</span>
        {isDone ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-green-600">
              Completed
            </span>
            {type && applicantId && (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigate(routeMap[type])}
              >
                View
              </Button>
            )}
          </div>
        ) : (
          <span className="text-sm italic text-gray-400">Pending</span>
        )}
      </div>
    );
  };

  const templateOptions = emailDrafts.map((draft) => ({
    value: draft._id,
    label: draft.subject
  }));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{jobTitle}</h2>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard/jobs')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-end py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : allApplications.length === 0 ? (
          <div className="flex justify-end py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                {/* Consolidated Progress Column */}
                <TableHead className="text-center">Progress</TableHead>
                {/* Specific Mail Buttons */}
                <TableHead className="text-center">Job Offer</TableHead>
                <TableHead className="text-center">Interview Mail</TableHead>
                <TableHead className="text-center">Reference Mail</TableHead>
                <TableHead className="text-center">DBS</TableHead>

                <TableHead className="text-right">Recruit</TableHead>
                <TableHead className="text-right">Referee</TableHead>
                <TableHead className="text-right">Interview</TableHead>
                <TableHead className="text-right">Mail</TableHead>
                <TableHead className="text-right">Logs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map((app) => (
                <TableRow key={app._id}>
                  {/* Name */}
                  <TableCell className="font-medium">
                    <div>
                      <div>
                        {app.applicantId?.title} {app.applicantId?.firstName}{' '}
                        {app.applicantId?.initial} {app.applicantId?.lastName}
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {app.applicantId?.email ?? 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Progress Button */}
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-watney hover:bg-watney hover:text-white"
                      onClick={() => handleOpenProgress(app)}
                    >
                      <ListTodo className="h-4 w-4" />
                      Check Status
                    </Button>
                  </TableCell>

                  {/* Job Offer Mail */}
                  <TableCell className="text-center">
                    <Button
                      variant={
                        app.applicantId?.jobOfferMailSent
                          ? 'default'
                          : 'secondary'
                      }
                      size="sm"
                      className={`gap-2 ${app.applicantId?.jobOfferMailSent ? 'bg-green-600 hover:bg-green-700' : 'bg-watney text-white hover:bg-watney/90'}`}
                      onClick={() => handleOpenEmailDialog(app, 'job-offer')}
                      disabled={emailLoading}
                    >
                      {app.applicantId?.jobOfferMailSent ? (
                        <MailCheck className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {app.applicantId?.jobOfferMailSent ? 'Sent' : 'Send'}
                    </Button>
                  </TableCell>

                  {/* Interview Mail */}
                  <TableCell className="text-center">
                    <Button
                      variant={
                        app.applicantId?.interviewMailSent
                          ? 'default'
                          : 'secondary'
                      }
                      size="sm"
                      className={`gap-2 ${app.applicantId?.interviewMailSent ? 'bg-green-600 hover:bg-green-700' : 'bg-watney text-white hover:bg-watney/90'}`}
                      onClick={() => handleOpenEmailDialog(app, 'interview')}
                      disabled={emailLoading}
                    >
                      {app.applicantId?.interviewMailSent ? (
                        <MailCheck className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {app.applicantId?.interviewMailSent ? 'Sent' : 'Send'}
                    </Button>
                  </TableCell>

                  {/* Reference Mail - Alert Trigger */}
                  <TableCell className="text-center">
                    <Button
                      variant={
                        app.applicantId?.referenceMailSent
                          ? 'default'
                          : 'secondary'
                      }
                      size="sm"
                      className={`gap-2 ${app.applicantId?.referenceMailSent ? 'bg-green-600 hover:bg-green-700' : 'bg-watney text-white hover:bg-watney/90'}`}
                      onClick={() => handleReferenceClick(app)}
                      disabled={referenceLoading}
                    >
                      {app.applicantId?.referenceMailSent ? (
                        <MailCheck className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {app.applicantId?.referenceMailSent ? 'Sent' : 'Send'}
                    </Button>
                  </TableCell>

                  {/* Recruit Action */}
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/dbs-form/${app.applicantId?._id}`
                                )
                              }
                            >
                              <File className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>DBS</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  {/* Recruit Action */}
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() => handleRecruitClick(app)}
                              disabled={recruitLoading}
                            >
                              <FilePlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Recruit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  {/* Referee View */}
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/references/${app.applicantId?._id}`
                                )
                              }
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reference Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  {/* Interview View */}
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/${app.applicantId?._id}/interview`
                                )
                              }
                            >
                              <ClipboardPenLine className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Interview</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  {/* Mail Logs View */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/mail/${app.applicantId?._id}`
                                )
                              }
                            >
                              <ListTodo className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Email Logs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  {/* Logs View */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/logs/${app.applicantId?._id}`
                                )
                              }
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Logs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  {/* Action Column with Dropdown */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/${app.applicantId?._id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Application</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Unlock Sections</DropdownMenuLabel>

                          {/* Post Employment Unlock */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUnlockAction(
                                app._id,
                                app.applicantId!._id!,
                                'postEmploymentUnlock'
                              )
                            }
                            disabled={app.applicantId?.postEmploymentUnlock}
                          >
                            {app.applicantId?.postEmploymentUnlock ? (
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                              <LockOpen className="mr-2 h-4 w-4" />
                            )}
                            Unlock Medical
                          </DropdownMenuItem>

                          {/* DBS Unlock */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUnlockAction(
                                app._id,
                                app.applicantId!._id!,
                                'dbsUnlock'
                              )
                            }
                            disabled={app.applicantId?.dbsUnlock}
                          >
                            {app.applicantId?.dbsUnlock ? (
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                              <LockOpen className="mr-2 h-4 w-4" />
                            )}
                            Unlock DBS
                          </DropdownMenuItem>

                          {/* E-Cert Unlock */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUnlockAction(
                                app._id,
                                app.applicantId!._id!,
                                'ecertUnlock'
                              )
                            }
                            disabled={app.applicantId?.ecertUnlock}
                          >
                            {app.applicantId?.ecertUnlock ? (
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                              <LockOpen className="mr-2 h-4 w-4" />
                            )}
                            Unlock E-Cert
                          </DropdownMenuItem>

                          {/* Bank Details Unlock */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUnlockAction(
                                app._id,
                                app.applicantId!._id!,
                                'bankDetailsUnlock'
                              )
                            }
                            disabled={app.applicantId?.bankDetailsUnlock}
                          >
                            {app.applicantId?.bankDetailsUnlock ? (
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                              <LockOpen className="mr-2 h-4 w-4" />
                            )}
                            Unlock Bank Details
                          </DropdownMenuItem>

                          {/* Start Date / Checklist Unlock */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleUnlockAction(
                                app._id,
                                app.applicantId!._id!,
                                'startDateUnlock'
                              )
                            }
                            disabled={app.applicantId?.startDateUnlock}
                          >
                            {app.applicantId?.startDateUnlock ? (
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                            ) : (
                              <LockOpen className="mr-2 h-4 w-4" />
                            )}
                            Unlock Starter Checklist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* --- Dialogs --- */}

      {/* 1. Recruit Confirmation Dialog */}
      <AlertDialog open={recruitDialogOpen} onOpenChange={setRecruitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Recruitment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to recruit{' '}
              {selectedApplication?.applicantId?.firstName}{' '}
              {selectedApplication?.applicantId?.lastName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecruitDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRecruit}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {recruitLoading ? 'Processing...' : 'Confirm Recruit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. Reference Email Confirmation Dialog (New) */}
      <AlertDialog
        open={referenceAlertOpen}
        onOpenChange={setReferenceAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Reference Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will send an automated reference request email to{' '}
              {selectedApplication?.applicantId?.firstName}{' '}
              {selectedApplication?.applicantId?.lastName}'s referees. Are you
              sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReferenceAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendReferenceEmail}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {referenceLoading ? 'Sending...' : 'Confirm Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 3. Progress Status Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Progress</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            {selectedApplication && (
              <>
                {renderProgressRow(
                  'Medical Form',
                  selectedApplication.applicantId?.medicalDone,
                  'medical',
                  selectedApplication.applicantId?._id
                )}
                {renderProgressRow(
                  'DBS Check',
                  selectedApplication.applicantId?.dbsDone,
                  'dbs',
                  selectedApplication.applicantId?._id
                )}
                {renderProgressRow(
                  'E-Certificate',
                  selectedApplication.applicantId?.ecertDone,
                  'ecert',
                  selectedApplication.applicantId?._id
                )}
                {renderProgressRow(
                  'Bank Details',
                  selectedApplication.applicantId?.bankDetailsDone,
                  'bank',
                  selectedApplication.applicantId?._id
                )}
                {renderProgressRow(
                  'Starter Checklist',
                  selectedApplication.applicantId?.checkListDone,
                  'checklist',
                  selectedApplication.applicantId?._id
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setProgressDialogOpen(false)}
              variant="secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Send Email Dialog (Job Offer & Interview) */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-h-[95vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              Send{' '}
              {activeEmailContext === 'job-offer' ? 'Job Offer' : 'Interview'}{' '}
              Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Select Template</label>
              <Select
                options={templateOptions}
                value={
                  selectedDraft
                    ? { value: selectedDraft._id, label: selectedDraft.subject }
                    : null
                }
                onChange={handleTemplateChange}
                placeholder="Choose a template..."
                isClearable
              />
              {emailErrors.draft && (
                <p className="mt-1 text-sm text-red-500">{emailErrors.draft}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-watney"
              />
              {emailErrors.subject && (
                <p className="mt-1 text-sm text-red-500">
                  {emailErrors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium">Body</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="h-[250px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
              {emailErrors.body && (
                <p className="mt-1 text-sm text-red-500">{emailErrors.body}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              className="ml-2 bg-watney text-white hover:bg-watney/90"
              disabled={sendingEmail}
            >
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}