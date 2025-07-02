import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertCircle,
  Check,
  ClipboardCopy,
  FileText,
  Home,
  Info,
  Loader2,
  User,
  Phone,
  Briefcase,
  BookOpen,
  FileCheck,
  Shield,
  GraduationCap,
  MoveLeft,
  Copy,
  File,
  User2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, set } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstace from '@/lib/axios';
import moment from 'moment';

import Loader from '@/components/shared/loader';
import PDFGenerator from './components/PDFGeneratorCareer';

// Type definition for application data
type Application = {
  _id: string;
  createdAt: string;
  updatedAt: string;
  seen: boolean;
  //personal
  title?: string;
  firstName?: string;
  lastName?: string;
  inital?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  studentType?: string;
  applicationLocation?: string;
  requireVisa?: string;
  ethnicity?: string;
  customEthnicity?: string;
  countryOfBirth?: string;
  maritalStatus?: string;

  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialPostCode?: string;
  residentialCountry?: string;
  sameAsResidential?: boolean;
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
  startDateInUK?: string;
  niNumber?: string;
  status?: string;
  ltrCode?: string;
  disability?: string;
  disabilityDetails?: string;
  benefits?: string;
  criminalConviction?: string;
  convictionDetails?: string;
  studentFinance?: string;

  hasDocument?: boolean;
  passportNumber?: string;
  passportExpiry?: string;
  idDocument?: string[];
  hasCertificates?: boolean;
  certificatesDetails?: string;
  qualificationCertificates?: string[];
  cvResume?: string[];
  hasProofOfAddress?: boolean;
  proofOfAddressType?: string;
  proofOfAddressDate?: string;
  proofOfAddress?: string[];
  otherDocuments?: string[];
  otherDocumentsDescription?: string;
  documentType?: string;
  nationalID?: string;

  isEmployed?: string;
  currentEmployment?: {
    employer?: string;
    jobTitle?: string;
    startDate?: string;
    employmentType?: string;
    responsibilities?: string;
  };
  previousEmployments?: {
    employer?: string;
    jobTitle?: string;
    startDate?: string;
    endDate?: string;
    reasonForLeaving?: string;
    responsibilities?: string;
    contactPermission?: string;
  }[];
  hasEmploymentGaps?: string;
  employmentGapsExplanation?: string;
  declaration?: boolean;

  acceptTerms?: boolean;
  acceptDataProcessing?: boolean;

  educationData?: {
    institution: string;
    grade: string;
    qualification: string;
    awardDate: string;
    certificate?: string;
  }[];

  englishQualification: {
    englishCertificate: string;
    englishTestDate: string;
    englishTestScore: string;
    englishTestType: string;
  };

  courseDetailsData?: {
    course: string;
    intake: string;
  };
};

export default function ViewCareerApplicationPage() {
  const [application, setApplication] = useState<Application>();
  const [applicationJob, setApplicationJob] = useState<Application | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { id, userId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await axiosInstace.get(`/users/${userId}`);
        setApplication(response.data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Failed to fetch application data. Please try again.');
        console.error('Error fetching application:', err);
      }
    };

    fetchApplication();
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axiosInstace.get(`/application-job/${id}`);
        setApplicationJob(response.data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Failed to fetch application data. Please try again.');
        console.error('Error fetching application:', err);
      }
    };

    fetchJob();
  }, []);

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        // Set this field as copied
        setCopiedFields((prev) => ({ ...prev, [field]: true }));

        // Show toast notification
        toast.success('Copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedFields((prev) => ({ ...prev, [field]: false }));
        }, 2000);
      },
      () => {
        toast.error('Failed to copy text');
      }
    );
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return 'Not provided';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (value === '') return 'Not provided';

    if (typeof value === 'object' && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} items` : 'None';
    }

    // Handle Date objects or ISO date strings
    if (
      value instanceof Date ||
      (typeof value === 'string' &&
        moment(value, moment.ISO_8601, true).isValid())
    ) {
      return moment(value).format('MM-DD-YYYY'); // Customize format as needed
    }

    if (typeof value === 'object') {
      return 'Complex data';
    }

    // Capitalize first letter of string values
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return String(value);
  };

  const renderFieldRow = (label: string, value: any, fieldPath: string) => {
    const isCopied = copiedFields[fieldPath] || false;
    const isEmptyValue = value === undefined || value === null || value === '';
    const isUrl = typeof value === 'string' && value.startsWith('http');

    const isEmail =
      typeof value === 'string' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const displayValue = isUrl
      ? null
      : isEmail
        ? value.toLowerCase()
        : formatValue(value);

    return (
      <TableRow key={fieldPath} className="hover:bg-muted/10">
        <TableCell className="text-left align-middle font-medium">
          {label}
        </TableCell>

        <TableCell
          className={cn(
            'text-right align-middle',
            isEmptyValue && 'italic text-muted-foreground'
          )}
        >
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
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-150px)] flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
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
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4">
        <Button
          className="bg-watney text-white hover:bg-watney/90 "
          onClick={() => navigate(-1)}
        >
          <MoveLeft /> Back
        </Button>
        <div className='font-semibold'>{applicationJob?.jobId?.jobTitle}</div>
        <PDFGenerator
          application={application}
          applicationJob={applicationJob}
        />
      </div>
      <div className=" p-4 pb-5">
        <Tabs
          defaultValue="personal"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 grid grid-cols-3 rounded-md bg-white shadow-lg md:grid-cols-5 lg:grid-cols-9">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="emergencyContact"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <User2 className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="application"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Application</span>
            </TabsTrigger>

            <TabsTrigger
              value="employment"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Employment</span>
            </TabsTrigger>
            <TabsTrigger
              value="education"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger
              value="disability"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Disability</span>
            </TabsTrigger>
            <TabsTrigger
              value="referee"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Reference</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>

            <TabsTrigger
              value="terms"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Terms & Conditions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="personal"
            className="flex w-full flex-row  justify-between gap-4"
          >
            {/* First Card */}
            <Card className="w-[50%]">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Personal Information
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 text-left">Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderFieldRow('Title', application?.title, 'title')}
                    {renderFieldRow(
                      'First Name',
                      application?.firstName,
                      'firstName'
                    )}
                    {renderFieldRow('Initial', application?.initial, 'initial')}
                    {renderFieldRow(
                      'Last Name',
                      application?.lastName,
                      'lastName'
                    )}
                    {renderFieldRow('Email', application?.email, 'email')}
                    {renderFieldRow('Phone', application?.phone, 'phone')}
                    {renderFieldRow(
                      'Date of Birth',
                      application?.dateOfBirth,
                      'dateOfBirth'
                    )}
                    {renderFieldRow(
                      'Nationality',
                      application?.nationality,
                      'nationality'
                    )}
                    {renderFieldRow(
                      'Country of Residence',
                      application?.countryOfResidence,
                      'countryOfResidence'
                    )}
                    {renderFieldRow(
                      'National Insurance Number',
                      application?.nationalInsuranceNumber,
                      'nationalInsuranceNumber'
                    )}

                    {renderFieldRow(
                      'Share Code',
                      application?.shareCode,
                      'shareCode'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Second Card - Postal Address */}
            <Card className="w-[50%]">
              <CardContent>
                <h3 className="mb-4 mt-4 text-lg font-semibold">
                  Postal Address
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 text-left">Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderFieldRow(
                      'Postal Address Line1',
                      application?.postalAddressLine1,
                      'postalAddressLine1'
                    )}
                    {renderFieldRow(
                      'Postal Address Line2',
                      application?.postalAddressLine2,
                      'postalAddressLine2'
                    )}
                    {renderFieldRow(
                      'Postal City',
                      application?.postalCity,
                      'postalCity'
                    )}
                    {renderFieldRow(
                      'Post Code',
                      application?.postalPostCode,
                      'postalPostCode'
                    )}
                    {renderFieldRow(
                      'Postal Country',
                      application?.postalCountry,
                      'postalCountry'
                    )}

                    {(application?.prevPostalAddressLine1 ||
                      application?.prevPostalAddressLine2 ||
                      application?.prevPostalCity ||
                      application?.prevPostalPostCode ||
                      application?.prevPostalCountry) && (
                      <>
                        <tr>
                          <td
                            colSpan={3}
                            className="pb-2 pt-6 text-left font-semibold text-gray-900"
                          >
                            Previous Address
                          </td>
                        </tr>
                        {renderFieldRow(
                          'Previous Address Line1',
                          application?.prevPostalAddressLine1,
                          'prevPostalAddressLine1'
                        )}
                        {renderFieldRow(
                          'Previous Address Line2',
                          application?.prevPostalAddressLine2,
                          'prevPostalAddressLine2'
                        )}
                        {renderFieldRow(
                          'Previous City',
                          application?.prevPostalCity,
                          'prevPostalCity'
                        )}
                        {renderFieldRow(
                          'Previous Post Code',
                          application?.prevPostalPostCode,
                          'prevPostalPostCode'
                        )}
                        {renderFieldRow(
                          'Previous Country',
                          application?.prevPostalCountry,
                          'prevPostalCountry'
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value="emergencyContact"
            className="flex w-full flex-row  justify-between gap-4"
          >
            {/* First Card */}
            <Card className="w-[50%]">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Emergency Contact
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 text-left">Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderFieldRow(
                      'Full Name',
                      application?.emergencyFullName,
                      'emergencyFullName'
                    )}
                    {renderFieldRow(
                      'Relationship',
                      application?.emergencyRelationship,
                      'emergencyRelationship'
                    )}
                    {renderFieldRow(
                      'Emergency Contact Number',
                      application?.emergencyContactNumber,
                      'emergencyContactNumber'
                    )}
                    {renderFieldRow(
                      'Emergency Email',
                      application?.emergencyEmail,
                      'emergencyEmail'
                    )}
                    {renderFieldRow(
                      'Emergency Address',
                      application?.emergencyAddress,
                      'emergencyAddress'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="application"
            className="-mt-0.5 grid w-full grid-cols-1 gap-6 md:grid-cols-2"
          >
            {/* Availability Details Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Availability Details
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 text-left">Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderFieldRow(
                      'Available From',
                      application?.availableFromDate,
                      'availableFromDate'
                    )}
                    {renderFieldRow('Source', application?.source, 'source')}

                    {/* Conditionally show Referral Employee if source is referral */}
                    {application?.source === 'referral' &&
                      renderFieldRow(
                        'Referral Employee',
                        application?.referralEmployee,
                        'referralEmployee'
                      )}

                    {renderFieldRow(
                      'Is Student',
                      application?.isStudent ? 'Yes' : 'No',
                      'isStudent'
                    )}
                    {renderFieldRow(
                      'Under State Pension Age',
                      application?.isUnderStatePensionAge ? 'Yes' : 'No',
                      'isUnderStatePensionAge'
                    )}
                    {renderFieldRow(
                      'Over 18',
                      application?.isOver18 ? 'Yes' : 'No',
                      'isOver18'
                    )}
                    {renderFieldRow(
                      'Subject To Immigration Control',
                      application?.isSubjectToImmigrationControl ? 'Yes' : 'No',
                      'isSubjectToImmigrationControl'
                    )}
                    {renderFieldRow(
                      'Can Work In UK',
                      application?.canWorkInUK ? 'Yes' : 'No',
                      'canWorkInUK'
                    )}
                 
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Weekly Availability Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Weekly Availability
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Day</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(application?.availability || {}).map(
                      ([day, isAvailable]) =>
                        renderFieldRow(
                          day.charAt(0).toUpperCase() + day.slice(1),
                          isAvailable ? 'Yes' : 'No',
                          `availability.${day}`
                        )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    Current Employment
                  </h3>
                  <Table className="mb-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderFieldRow(
                        'Are you currently employed?',
                        application.isEmployed,
                        'isEmployed'
                      )}
                      {application.isEmployed === 'yes' && (
                        <>
                          {renderFieldRow(
                            'Employer',
                            application?.currentEmployment?.employer,
                            'currentEmployment.employer'
                          )}
                          {renderFieldRow(
                            'Job Title',
                            application?.currentEmployment?.jobTitle,
                            'currentEmployment.jobTitle'
                          )}
                          {renderFieldRow(
                            'Start Date',
                            application?.currentEmployment?.startDate,
                            'currentEmployment.startDate'
                          )}
                          {renderFieldRow(
                            'Employment Type',
                            application?.currentEmployment?.employmentType,
                            'currentEmployment.employmentType'
                          )}
                          {renderFieldRow(
                            'Responsibilities',
                            application?.currentEmployment?.responsibilities,
                            'currentEmployment.responsibilities'
                          )}
                        </>
                      )}
                      {renderFieldRow(
                        'Do you have previous employment history?',
                        application?.hasPreviousEmployment,
                        'hasPreviousEmployment'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {application?.hasPreviousEmployment === 'yes' && (
                <Card>
                  <CardContent className="pt-6">
                    {application.previousEmployments &&
                      application.previousEmployments.length > 0 && (
                        <>
                          <h3 className="mb-2 text-lg font-semibold">
                            Previous Employment
                          </h3>
                          <div className="space-y-6">
                            {/* Previous Employments */}
                            {application.previousEmployments.map(
                              (employment, index) => (
                                <div key={index}>
                                  <div className="mb-2 flex items-center">
                                    <h4 className="font-medium">
                                      Previous Employment {index + 1}
                                    </h4>
                                    <Separator className="mx-4 flex-1" />
                                  </div>

                                  <Table>
                                    <TableBody>
                                      {renderFieldRow(
                                        'Employer Name',
                                        employment.employer,
                                        `previousEmployments.${index}.employer`
                                      )}
                                      {renderFieldRow(
                                        'Job Position',
                                        employment.jobTitle,
                                        `previousEmployments.${index}.jobTitle`
                                      )}
                                      {renderFieldRow(
                                        'Start Date',
                                        employment.startDate,
                                        `previousEmployments.${index}.startDate`
                                      )}
                                      {renderFieldRow(
                                        'End Date',
                                        employment.endDate,
                                        `previousEmployments.${index}.endDate`
                                      )}
                                      {renderFieldRow(
                                        'Reason for Leaving',
                                        employment.reasonForLeaving,
                                        `previousEmployments.${index}.reasonForLeaving`
                                      )}
                                      {renderFieldRow(
                                        'Main Responsibilities',
                                        employment.responsibilities,
                                        `previousEmployments.${index}.responsibilities`
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              )
                            )}

                            {/* Employment Gap Question (only once, after all previous employment) */}
                            <div className="mt-6">
                              <div className="mb-2 flex items-center">
                                <h4 className="font-medium">
                                  Employment Gap Details
                                </h4>
                                <Separator className="mx-4 flex-1" />
                              </div>
                              <Table>
                                <TableBody>
                                  {renderFieldRow(
                                    'Has Employment Gaps',
                                    application.hasEmploymentGaps,
                                    'hasEmploymentGaps'
                                  )}
                                  {application.hasEmploymentGaps === 'yes' &&
                                    renderFieldRow(
                                      'Employment Gaps Explanation',
                                      application.employmentGapsExplanation,
                                      'employmentGapsExplanation'
                                    )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="education">
            <div>
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  Education History
                </h3>

                {!application.educationData ||
                application.educationData.length === 0 ? (
                  <p className="italic text-muted-foreground">
                    No education history provided
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {application.educationData.map((education, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="mb-2 flex items-center">
                            <h4 className="font-medium">
                              Education {index + 1}
                            </h4>
                            <Separator className="mx-4 flex-1" />
                          </div>
                          <Table>
                            <TableBody>
                              {renderFieldRow(
                                'Institution',
                                education.institution,
                                `educationData.${index}.institution`
                              )}
                              {renderFieldRow(
                                'Study Type',
                                education.grade,
                                `educationData.${index}.grade`
                              )}
                              {renderFieldRow(
                                'Qualification',
                                education.qualification,
                                `educationData.${index}.qualification`
                              )}
                              {renderFieldRow(
                                'Award Date',
                                education.awardDate,
                                `educationData.${index}.awardDate`
                              )}
                              {renderFieldRow(
                                'Certificate',
                                education.certificate,
                                `educationData.${index}.certificate`
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* English Qualification Card */}
                {application.englishQualification && (
                  <div className="mt-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      English Qualification
                    </h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="mb-2 flex items-center">
                          <h4 className="font-medium">English Test</h4>
                          <Separator className="mx-4 flex-1" />
                        </div>
                        <Table>
                          <TableBody>
                            {renderFieldRow(
                              'Test Type',
                              application.englishQualification.englishTestType,
                              'englishQualification.englishTestType'
                            )}
                            {renderFieldRow(
                              'Test Score',
                              application.englishQualification.englishTestScore,
                              'englishQualification.englishTestScore'
                            )}
                            {renderFieldRow(
                              'Test Date',
                              application.englishQualification.englishTestDate,
                              'englishQualification.englishTestDate'
                            )}
                            {renderFieldRow(
                              'Certificate',
                              application.englishQualification
                                .englishCertificate,
                              'englishQualification.englishCertificate'
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disability">
            <div className="-mt-1.5 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Disability Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Disability Information
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderFieldRow(
                        'Has Disability',
                        application?.hasDisability ? 'Yes' : 'No',
                        'hasDisability'
                      )}
                      {renderFieldRow(
                        'Disability Details',
                        application?.disabilityDetails,
                        'disabilityDetails'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Reasonable Adjustment Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Reasonable Adjustment
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderFieldRow(
                        'Needs Adjustment',
                        application?.needsReasonableAdjustment ? 'Yes' : 'No',
                        'needsReasonableAdjustment'
                      )}
                      {renderFieldRow(
                        'Adjustment Details',
                        application?.reasonableAdjustmentDetails,
                        'reasonableAdjustmentDetails'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referee">
            <div className="-mt-1.5 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Referee 1 */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Reference 1</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderFieldRow(
                        'Full Name',
                        application?.referee1?.name,
                        'referee1.name'
                      )}
                      {renderFieldRow(
                        'Organisation',
                        application?.referee1?.organisation,
                        'referee1.organisation'
                      )}
                      {renderFieldRow(
                        'Address',
                        application?.referee1?.address,
                        'referee1.address'
                      )}
                      {renderFieldRow(
                        'Relationship',
                        application?.referee1?.relationship,
                        'referee1.relationship'
                      )}

                      {renderFieldRow(
                        'Email',
                        application?.referee1?.email,
                        'referee1.email'
                      )}
                      {renderFieldRow(
                        'Phone',
                        application?.referee1?.phone,
                        'referee1.phone'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Referee 2 */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Reference 2</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {renderFieldRow(
                        'Full Name',
                        application?.referee2?.name,
                        'referee2.name'
                      )}
                      {renderFieldRow(
                        'Organisation',
                        application?.referee2?.organisation,
                        'referee2.organisation'
                      )}
                      {renderFieldRow(
                        'Address',
                        application?.referee2?.address,
                        'referee2.address'
                      )}
                      {renderFieldRow(
                        'Relationship',
                        application?.referee2?.relationship,
                        'referee2.relationship'
                      )}

                      {renderFieldRow(
                        'Email',
                        application?.referee2?.email,
                        'referee2.email'
                      )}
                      {renderFieldRow(
                        'Phone',
                        application?.referee2?.phone,
                        'referee2.phone'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Documents</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-left">Field</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="w-10 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <>
                        {renderFieldRow(
                          'Photograph',
                          application?.image,
                          'image'
                        )}
                      </>
                      {application?.proofOfAddress?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Proof Of Address`,
                            url,
                            `proofOfAddress[${index}]`
                          )
                      )}
                      {application?.passport?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Passport Or ID`,
                            url,
                            `passport[${index}]`
                          )
                      )}
                      {application?.immigrationDocument?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Immigration Status Document`,
                            url,
                            `immigrationDocument[${index}]`
                          )
                      )}

                      {application?.workExperience?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Work Experience`,
                            url,
                            `workExperience[${index}]`
                          )
                      )}

                      {application?.bankStatement?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Bank Statement`,
                            url,
                            `bankStatement[${index}]`
                          )
                      )}

                      {application?.personalStatement?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Personal Statement `,
                            url,
                            `personalStatement[${index}]`
                          )
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* <TabsContent value="job">
            <div className="-mt-1.5 grid grid-cols-1 gap-6 md:grid-cols-2">
              {applicationJob && applicationJob.length > 0 ? (
                applicationJob.map((jobEntry, index) => (
                  <Card key={jobEntry._id || index}>
                    <CardContent className="pt-6">
                      <h3 className="mb-4 text-lg font-semibold">
                        Job {index + 1}
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3 text-left">
                              Field
                            </TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="w-10 text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {renderFieldRow(
                            'Job Title',
                            jobEntry.jobId?.jobTitle ?? 'N/A',
                            `applicationJob.${index}.jobId.jobTitle`
                          )}
                          {renderFieldRow(
                            'Application Deadline',
                            jobEntry.jobId?.applicationDeadline
                              ? new Date(
                                  jobEntry.jobId.applicationDeadline
                                ).toLocaleDateString()
                              : 'N/A',
                            `applicationJob.${index}.jobId.applicationDeadline`
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="italic text-muted-foreground">
                  No job details provided
                </p>
              )}
            </div>
          </TabsContent> */}

          <TabsContent value="terms">
            <Card className="-mt-1.5 w-full md:w-1/2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Terms & Declarations
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3 text-left">Field</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-10 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderFieldRow(
                      'Correct Upload Declaration',
                      application.declarationCorrectUpload,
                      'declarationCorrectUpload'
                    )}
                    {renderFieldRow(
                      'Contact Referee Declaration',
                      application.declarationContactReferee,
                      'declarationContactReferee'
                    )}
                    {renderFieldRow(
                      'Criminal Conviction',
                      application.criminalConviction,
                      'criminalConviction'
                    )}
                    {renderFieldRow(
                      'Criminal Conviction Details',
                      application.criminalConvictionDetails,
                      'criminalConvictionDetails'
                    )}
                    {renderFieldRow(
                      'Applied Before',
                      application.appliedBefore,
                      'appliedBefore'
                    )}
                    {renderFieldRow(
                      'Accept Terms',
                      application.termsAccepted,
                      'termsAccepted'
                    )}
                    {renderFieldRow(
                      'Accept Data Processing',
                      application.dataProcessingAccepted,
                      'dataProcessingAccepted'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
