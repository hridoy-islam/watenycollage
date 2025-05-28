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
  File
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
import PDFGenerator from './components/PDFGenerator';
import Loader from '@/components/shared/loader';

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
  const [application, setApplication] = useState<Application | null>(null);
  const [applicationJob, setApplicationJob] = useState<Application | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await axiosInstace.get(`/users/${id}`);
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
        const response = await axiosInstace.get(
          `/application-job?applicantId=${id}`
        );
        setApplicationJob(response.data.data.result);
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
    const displayValue = formatValue(value);
    const isCopied = copiedFields[fieldPath] || false;
    const isEmptyValue = value === undefined || value === null || value === '';

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
          {displayValue}
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
          onClick={() => navigate('/dashboard')}
        >
          <MoveLeft /> Back
        </Button>

        <PDFGenerator application={application} />
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
              value="job"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Job Applied</span>
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
                      'Is British Citizen',
                      application?.isBritishCitizen ? 'Yes' : 'No',
                      'isBritishCitizen'
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
              <CardContent className="">
                <h3 className="mb-4 mt-4 text-lg font-semibold">Postal Address</h3>
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
                      'Line 1',
                      application?.postalAddress?.line1,
                      'postalAddress.line1'
                    )}
                    {renderFieldRow(
                      'Line 2',
                      application?.postalAddress?.line2,
                      'postalAddress.line2'
                    )}
                    {renderFieldRow(
                      'City',
                      application?.postalAddress?.city,
                      'postalAddress.city'
                    )}
                    {renderFieldRow(
                      'Post Code',
                      application?.postalAddress?.postCode,
                      'postalAddress.postCode'
                    )}
                    {renderFieldRow(
                      'Country',
                      application?.postalAddress?.country,
                      'postalAddress.country'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="application"
            className="grid -mt-0.5 w-full grid-cols-1 gap-6 md:grid-cols-2"
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
                    {renderFieldRow(
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
            <div className="grid grid-cols-1 -mt-2 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">
                    Employment Status
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
                        'Is Employed',
                        application.isEmployed,
                        'isEmployed'
                      )}
                      {renderFieldRow(
                        'Has Employment Gaps',
                        application.hasEmploymentGaps,
                        'hasEmploymentGaps'
                      )}
                      {renderFieldRow(
                        'Employment Gaps Explanation',
                        application.employmentGapsExplanation,
                        'employmentGapsExplanation'
                      )}
                      {renderFieldRow(
                        'Declaration',
                        application.declaration,
                        'declaration'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  {application.currentEmployment && (
                    <>
                      <h3 className="mb-2 text-lg font-semibold">
                        Current Employment
                      </h3>
                      <Table className="mb-6">
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
                            'Employer',
                            application.currentEmployment.employer,
                            'currentEmployment.employer'
                          )}
                          {renderFieldRow(
                            'Job Title',
                            application.currentEmployment.jobTitle,
                            'currentEmployment.jobTitle'
                          )}
                          {renderFieldRow(
                            'Start Date',
                            application.currentEmployment.startDate,
                            'currentEmployment.startDate'
                          )}
                          {renderFieldRow(
                            'Employment Type',
                            application.currentEmployment.employmentType,
                            'currentEmployment.employmentType'
                          )}
                          {renderFieldRow(
                            'Responsibilities',
                            application.currentEmployment.responsibilities,
                            'currentEmployment.responsibilities'
                          )}
                        </TableBody>
                      </Table>
                    </>
                  )}

                  {application.previousEmployments &&
                    application.previousEmployments.length > 0 && (
                      <>
                        <h3 className="mb-2 text-lg font-semibold">
                          Previous Employment
                        </h3>
                        <div className="space-y-6">
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
                                      'Employer',
                                      employment.employer,
                                      `previousEmployments.${index}.employer`
                                    )}
                                    {renderFieldRow(
                                      'Job Title',
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
                                  </TableBody>
                                </Table>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
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
            <div className="grid grid-cols-1 -mt-1.5 gap-6 md:grid-cols-2">
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
            <div className="grid -mt-1.5 grid-cols-1 gap-6 md:grid-cols-2">
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
                        'Other Relationship',
                        application?.referee1?.otherRelationship,
                        'referee1.otherRelationship'
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
                        'Other Relationship',
                        application?.referee2?.otherRelationship,
                        'referee2.otherRelationship'
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
            <div className="grid -mt-1.5 grid-cols-1 gap-6 md:grid-cols-2">
              {application.documents?.map((doc, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Document {index + 1}
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
                          'Document Type',
                          doc.type,
                          `documents[${index}].type`
                        )}
                        {renderFieldRow(
                          'Custom Title',
                          doc.customTitle || 'N/A',
                          `documents[${index}].customTitle`
                        )}
                        {renderFieldRow(
                          'File Name',
                          doc.file?.name || 'No file uploaded',
                          `documents[${index}].file`
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="job">
            <div className="grid -mt-1.5 grid-cols-1 gap-6 md:grid-cols-2">
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
          </TabsContent>

          <TabsContent value="terms">
            <Card className="w-full -mt-1.5 md:w-1/2">
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
