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

export default function ViewStudentApplicationPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [applicationCourse, setApplicationCourse] =
    useState<Application | null>(null);
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
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axiosInstace.get(
          `/application-course?studentId=${id}`
        );
        setApplicationCourse(response.data.data.result);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Failed to fetch application data. Please try again.');
        console.error('Error fetching application:', err);
      }
    };

    fetchCourse();
  }, []);

  console.log(applicationCourse);

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
              value="address"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Address</span>
            </TabsTrigger>

            <TabsTrigger
              value="other-information"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Other information</span>
            </TabsTrigger>
            <TabsTrigger
              value="emergency"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
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
              value="course"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Course</span>
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
            className="flex w-full flex-row justify-between gap-x-6"
          >
            {/* First Card */}
            <Card className="w-1/2">
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
                    {renderFieldRow('Gender', application?.gender, 'gender')}
                    {renderFieldRow(
                      'Date of Birth',
                      application?.dateOfBirth,
                      'dateOfBirth'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Second Card */}
            <Card className="w-1/2">
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
                    {renderFieldRow(
                      'Nationality',
                      application?.nationality,
                      'nationality'
                    )}
                    {renderFieldRow(
                      'Ethnicity',
                      application?.ethnicity,
                      'ethnicity'
                    )}
                    {renderFieldRow(
                      'Custom Ethnicity',
                      application?.customEthnicity,
                      'customEthnicity'
                    )}
                    {renderFieldRow(
                      'Country of Birth',
                      application?.countryOfBirth,
                      'countryOfBirth'
                    )}
                    {renderFieldRow(
                      'Marital Status',
                      application?.maritalStatus,
                      'maritalStatus'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="address"
            className="flex w-full flex-row justify-between gap-x-6"
          >
            {/* Residential Address Card */}
            <Card className="w-1/2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Residential Address
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
                      'Address Line 1',
                      application?.residentialAddressLine1,
                      'residentialAddressLine1'
                    )}
                    {renderFieldRow(
                      'Address Line 2',
                      application?.residentialAddressLine2,
                      'residentialAddressLine2'
                    )}
                    {renderFieldRow(
                      'City',
                      application?.residentialCity,
                      'residentialCity'
                    )}
                    {renderFieldRow(
                      'Post Code',
                      application?.residentialPostCode,
                      'residentialPostCode'
                    )}
                    {renderFieldRow(
                      'Country',
                      application?.residentialCountry,
                      'residentialCountry'
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Postal Address Card */}
            <Card className="w-1/2">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Postal Address</h3>
                  <Badge variant="outline" className="bg-watney text-sm">
                    <span className="text-white">
                      {application?.sameAsResidential
                        ? 'Same as residential'
                        : 'Different from residential'}
                    </span>
                  </Badge>
                </div>

                {application?.sameAsResidential ? (
                  <p className="italic text-muted-foreground">
                    Same as residential address
                  </p>
                ) : (
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
                        'Address Line 1',
                        application?.postalAddressLine1,
                        'postalAddressLine1'
                      )}
                      {renderFieldRow(
                        'Address Line 2',
                        application?.postalAddressLine2,
                        'postalAddressLine2'
                      )}
                      {renderFieldRow(
                        'City',
                        application?.postalCity,
                        'postalCity'
                      )}
                      {renderFieldRow(
                        'Post Code',
                        application?.postalPostCode,
                        'postalPostCode'
                      )}
                      {renderFieldRow(
                        'Country',
                        application?.postalCountry,
                        'postalCountry'
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other-information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Other Information
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
                        'Start Date in UK',
                        application.startDateInUK,
                        'startDateInUK'
                      )}
                      {renderFieldRow(
                        'NI Number',
                        application.niNumber,
                        'niNumber'
                      )}
                      {renderFieldRow('Status', application.status, 'status')}
                      {renderFieldRow(
                        'LTR Code',
                        application.ltrCode,
                        'ltrCode'
                      )}
                      {renderFieldRow(
                        'Disability',
                        application.disability,
                        'disability'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
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
                      {renderFieldRow(
                        'Disability Details',
                        application.disabilityDetails,
                        'disabilityDetails'
                      )}
                      {renderFieldRow(
                        'Benefits',
                        application.benefits,
                        'benefits'
                      )}
                      {renderFieldRow(
                        'Criminal Conviction',
                        application.criminalConviction,
                        'criminalConviction'
                      )}
                      {renderFieldRow(
                        'Conviction Details',
                        application.convictionDetails,
                        'convictionDetails'
                      )}
                      {renderFieldRow(
                        'Student Finance',
                        application.studentFinance,
                        'studentFinance'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="emergency">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Other Information
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
                        application.emergencyFullName,
                        'emergencyFullName'
                      )}
                      {renderFieldRow(
                        'Email',
                        application.emergencyEmail,
                        'emergencyEmail'
                      )}
                      {renderFieldRow(
                        'Contact Number',
                        application.emergencyContactNumber,
                        'emergencyContactNumber'
                      )}
                      {renderFieldRow(
                        'Address',
                        application?.emergencyAddress,
                        'emergencyAddress'
                      )}
                      {renderFieldRow(
                        'Relationship',
                        application.emergencyRelationship,
                        'emergencyRelationship'
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
                      {renderFieldRow(
                        'Document Type',
                        application.documentType,
                        'documentType'
                      )}
                      {renderFieldRow(
                        'National ID',
                        application.nationalID,
                        'nationalID'
                      )}
                      {renderFieldRow(
                        'Has Passport',
                        application.hasDocument,
                        'hasDocument'
                      )}
                      {renderFieldRow(
                        'Passport Number',
                        application.passportNumber,
                        'passportNumber'
                      )}
                      {renderFieldRow(
                        'Passport Expiry',
                        application.passportExpiry,
                        'passportExpiry'
                      )}
                      {renderFieldRow(
                        'ID Document Count',
                        application.idDocument?.length,
                        'idDocument.length'
                      )}
                      {renderFieldRow(
                        'Has Certificates',
                        application.hasCertificates,
                        'hasCertificates'
                      )}
                      {renderFieldRow(
                        'Certificates Details',
                        application.certificatesDetails,
                        'certificatesDetails'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
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
                      {renderFieldRow(
                        'Qualification Certificates Count',
                        application.qualificationCertificates?.length,
                        'qualificationCertificates.length'
                      )}
                      {renderFieldRow(
                        'CV/Resume Count',
                        application.cvResume?.length,
                        'cvResume.length'
                      )}
                      {renderFieldRow(
                        'Has Proof of Address',
                        application.hasProofOfAddress,
                        'hasProofOfAddress'
                      )}
                      {renderFieldRow(
                        'Proof of Address Type',
                        application.proofOfAddressType,
                        'proofOfAddressType'
                      )}
                      {renderFieldRow(
                        'Proof of Address Date',
                        application.proofOfAddressDate,
                        'proofOfAddressDate'
                      )}
                      {renderFieldRow(
                        'Proof of Address Count',
                        application.proofOfAddress?.length,
                        'proofOfAddress.length'
                      )}
                      {renderFieldRow(
                        'Other Documents Count',
                        application.otherDocuments?.length,
                        'otherDocuments.length'
                      )}
                      {renderFieldRow(
                        'Other Documents Descriptions',
                        Array.isArray(application.otherDocumentsDescription)
                          ? application.otherDocumentsDescription.join(', ')
                          : application.otherDocumentsDescription,
                        'otherDocumentsDescription'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employment">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                          {renderFieldRow(
                            'Supervisor',
                            application.currentEmployment.supervisor,
                            'currentEmployment.supervisor'
                          )}
                          {renderFieldRow(
                            'Contact Permission',
                            application.currentEmployment.contactPermission,
                            'currentEmployment.contactPermission'
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
                                    {renderFieldRow(
                                      'Responsibilities',
                                      employment.responsibilities,
                                      `previousEmployments.${index}.responsibilities`
                                    )}
                                    {renderFieldRow(
                                      'Contact Permission',
                                      employment.contactPermission,
                                      `previousEmployments.${index}.contactPermission`
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

          <TabsContent value="course">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {applicationCourse && applicationCourse.length > 0 ? (
                applicationCourse?.map((courseEntry, index) => (
                  <Card key={courseEntry._id || index}>
                    <CardContent className="pt-6">
                      <h3 className="mb-4 text-lg font-semibold">
                        Course {index + 1}
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
                            'Course',
                            courseEntry.courseId?.name ?? 'N/A',
                            `applicationCourse.${index}.courseId.name`
                          )}
                          {renderFieldRow(
                            'Intake',
                            courseEntry.intakeId?.termName ?? 'N/A',
                            `applicationCourse.${index}.intakeId.termName`
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="italic text-muted-foreground">
                  No course details provided
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="terms">
            <Card className="w-1/2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">Terms Acceptance</h3>
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
                      'Accept Terms',
                      application.acceptTerms,
                      'acceptTerms'
                    )}
                    {renderFieldRow(
                      'Accept Data Processing',
                      application.acceptDataProcessing,
                      'acceptDataProcessing'
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
