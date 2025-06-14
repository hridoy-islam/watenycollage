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
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

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
  useEffect(() => {
    fetchCourse();
  }, []);

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(
      () => {
        // Set this field as copied
        setCopiedFields((prev) => ({ ...prev, [field]: true }));

        // Show toast notification
        // toast.success('Copied to clipboard!');

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedFields((prev) => ({ ...prev, [field]: false }));
        }, 1000);
      },
      () => {
        console.log('Failed to copy text');
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
        <div className="flex flex-row items-center gap-4">
          <Button
            className="bg-watney text-white hover:bg-watney/90 "
            onClick={() => navigate('/dashboard/student-applications')}
          >
            <MoveLeft /> Back
          </Button>

          <div className="flex flex-row items-center gap-2">
            <h1 className="text-md font-semibold">
              {application?.title} {application?.firstName}{' '}
              {application?.initial} {application?.lastName}
            </h1>
            <Badge className="bg-watney text-white hover:bg-watney">
              {application?.studentType === 'international'
                ? 'International'
                : application?.studentType === 'eu'
                  ? 'Home'
                  : 'Not provided'}
            </Badge>
          </div>
        </div>

        <PDFGenerator application={application} />
      </div>
      <div className=" p-4 pb-5">
        <Tabs
          defaultValue="personal"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 grid grid-cols-2 gap-x-2 gap-y-3 rounded-md bg-white p-2 text-xs shadow-lg sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {[
              { value: 'personal', label: 'Personal' },
              { value: 'address', label: 'Address' },
              { value: 'other-information', label: 'Miscellaneous' },
              { value: 'emergency', label: 'Emergency Contact' },
              { value: 'documents', label: 'Documents' },
              { value: 'employment', label: 'Employment' },
              { value: 'education', label: 'Education' },
              { value: 'course', label: 'Course' },
              { value: 'funding', label: 'Funding ' },
              { value: 'terms', label: 'Terms' }
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center justify-center rounded px-2 py-1 text-xs transition-colors duration-200 ease-in-out focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
              >
                <span className="text-center">{label}</span>
              </TabsTrigger>
            ))}
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
                    {renderFieldRow('Email', application?.email, 'email')}
                    {renderFieldRow('Gender', application?.gender, 'gender')}
                    {renderFieldRow(
                      'Date of Birth',
                      application?.dateOfBirth,
                      'dateOfBirth'
                    )}
                    {renderFieldRow('Phone', application?.phone, 'phone')}
                    {renderFieldRow(
                      'Country Of Domicile',
                      application?.countryOfDomicile,
                      'countryOfDomicile'
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
                    {application?.studentType === 'eu' &&
                      renderFieldRow(
                        'Nationality',
                        application?.nationality,
                        'nationality'
                      )}
                    {renderFieldRow(
                      'Ethnicity',
                      application?.ethnicity,
                      'ethnicity'
                    )}

                    {application?.ethnicity === 'other' &&
                      renderFieldRow(
                        'Specify Ethnicity',
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

                    {application?.studentType === 'international' && (
                      <>
                        {renderFieldRow(
                          'Do you require a visa to come to the UK?',
                          application?.requireVisa,
                          'requireVisa'
                        )}
                        {renderFieldRow(
                          'From where are you making your application?',
                          application?.applicationLocation,
                          'applicationLocation'
                        )}
                      </>
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
                      {application?.studentType === 'international' && (
                        <>
                          {renderFieldRow(
                            'Do you require visa to come or stay to the UK? *',
                            application?.visaRequired,
                            'visaRequired'
                          )}
                          {renderFieldRow(
                            'Have you entered into the UK before?',
                            application?.enteredUKBefore,
                            'enteredUKBefore'
                          )}
                          {renderFieldRow(
                            'Have you completed any course from the UK before?',
                            application?.completedUKCourse,
                            'completedUKCourse'
                          )}
                          {renderFieldRow(
                            'Do you have any visa refusal?',
                            application?.visaRefusal,
                            'visaRefusal'
                          )}

                          {application?.visaRefusal === 'yes' &&
                            renderFieldRow(
                              'Visa Refusal Details',
                              application?.visaRefusalDetail,
                              'visaRefusalDetail'
                            )}
                        </>
                      )}

                      {application?.studentType === 'eu' && (
                        <>
                          {renderFieldRow(
                            'Immigration Status',
                            application?.immigrationStatus,
                            'immigrationStatus'
                          )}
                          {renderFieldRow(
                            'National Insurance (NI) Number',
                            application?.niNumber,
                            'niNumber'
                          )}
                          {renderFieldRow(
                            'lease provide your LTR (Leave to Remain) Code',
                            application?.ltrCode,
                            'ltrCode'
                          )}
                        </>
                      )}

                      {renderFieldRow(
                        'Where did you hear about us?',
                        application?.hearAboutUs,
                        'hearAboutUs'
                      )}

                      {renderFieldRow(
                        'Do you have disability?',
                        application?.disability,
                        'disability'
                      )}

                      {application?.disability === 'yes' &&
                        renderFieldRow(
                          'Disability Details ',
                          application?.disabilityDetails,
                          'disabilityDetails'
                        )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {application?.studentType === 'eu' && (
                <Card>
                  <CardContent className="pt-6">
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
                          'Criminal Conviction',
                          application.criminalConviction,
                          'criminalConviction'
                        )}
                        {renderFieldRow(
                          'Conviction Details',
                          application.convictionDetails,
                          'convictionDetails'
                        )}
                        {application?.studentType === 'eu' &&
                          renderFieldRow(
                            'Student Finance',
                            application.studentFinance,
                            'studentFinance'
                          )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
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
                      {application?.studentType === 'eu' && (
                        <>
                          {application?.photoId?.map(
                            (url: string, index: number) =>
                              renderFieldRow(
                                `Photo ID `,
                                url,
                                `photoId[${index}]`
                              )
                          )}
                        </>
                      )}

                      {application?.studentType === 'international' && (
                        <>
                          {application?.passport?.map(
                            (url: string, index: number) =>
                              renderFieldRow(
                                `Passport File `,
                                url,
                                `passport[${index}]`
                              )
                          )}
                        </>
                      )}

                      {application?.workExperience?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Work Experience File `,
                            url,
                            `workExperience[${index}]`
                          )
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
                      {application?.studentType === 'eu' && (
                        <>
                          {application?.proofOfAddress?.map(
                            (url: string, index: number) =>
                              renderFieldRow(
                                `Proof Of Address `,
                                url,
                                `proofOfAddress[${index}]`
                              )
                          )}
                        </>
                      )}

                      {application?.studentType === 'international' && (
                        <>
                          {application?.bankStatement?.map(
                            (url: string, index: number) =>
                              renderFieldRow(
                                `Bank Statement File `,
                                url,
                                `bankStatement[${index}]`
                              )
                          )}
                        </>
                      )}

                      {application?.personalStatement?.map(
                        (url: string, index: number) =>
                          renderFieldRow(
                            `Personal Statement File `,
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

                          {renderFieldRow(
                            'Do you have previous employment history?',
                            application?.hasPreviousEmployment,
                            'hasPreviousEmployment'
                          )}
                        </>
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

                                      {renderFieldRow(
                                        'Has Employment Gaps',
                                        application.hasEmploymentGaps,
                                        'hasEmploymentGaps'
                                      )}
                                      {application.hasEmploymentGaps ===
                                        'yes' &&
                                        renderFieldRow(
                                          'Employment Gaps Explanation',
                                          application.employmentGapsExplanation,
                                          'employmentGapsExplanation'
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
                                'Grade',
                                education.grade,
                                `educationData.${index}.grade`
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
                {application?.studentType === 'international' && (
                  <>
                    {/* English Qualification Card */}
                    {application.englishQualification && (
                      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="mb-2 flex items-center">
                              <h4 className="font-medium">
                                English Language Test
                              </h4>
                              <Separator className="mx-4 flex-1" />
                            </div>
                            <Table>
                              <TableBody>
                                {renderFieldRow(
                                  'Test Type',
                                  application.englishQualification
                                    .englishTestType,
                                  'englishQualification.englishTestType'
                                )}
                                {renderFieldRow(
                                  'Test Score',
                                  application.englishQualification
                                    .englishTestScore,
                                  'englishQualification.englishTestScore'
                                )}
                                {renderFieldRow(
                                  'Test Date',
                                  application.englishQualification
                                    .englishTestDate,
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
                  </>
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
                      <div className="flex flex-row items-center justify-between">
                        <h3 className="mb-4 text-lg font-semibold">
                          Course {index + 1}
                        </h3>

                        <Button
                          className="mb-4 bg-watney text-white hover:bg-watney/90"
                          variant="default"
                          size="sm"
                          disabled={courseEntry.status === 'approved'}
                          onClick={async () => {
                            try {
                              await axiosInstance.patch(
                                `/application-course/${courseEntry._id}`,
                                {
                                  status: 'approved'
                                }
                              );

                              toast({ title: 'Course approved successfully!' });
                              fetchCourse();
                            } catch (error) {
                              console.error('Error approving course:', error);
                              toast({
                                title: 'Failed to approve course.',
                                className:
                                  'bg-destructive text-white border-none'
                              });
                            }
                          }}
                        >
                          {courseEntry.status === 'approved'
                            ? 'Approved'
                            : 'Approve'}
                        </Button>
                      </div>

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
                          {renderFieldRow(
                            'Status',
                            courseEntry.status ?? 'N/A',
                            `applicationCourse.${index}.status`
                          )}
                          {renderFieldRow(
                            'Application Date',
                            courseEntry.createdAt ?? 'N/A',
                            `applicationCourse.${index}.createdAt`
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

          <TabsContent value="funding">
            <Card className="w-1/2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Funding Information
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
                      'Funding Type',
                      application.fundingType,
                      'fundingType'
                    )}
                    {application?.fundingType === 'Bursary/Grant' &&
                      renderFieldRow(
                        'Grant Details',
                        application?.grantDetails,
                        'grantDetails'
                      )}
                    {application?.fundingType === 'Employer-sponsored' && (
                      <>
                        {renderFieldRow(
                          'Company Name',
                          application?.fundingCompanyName,
                          'fundingCompanyName'
                        )}
                        {renderFieldRow(
                          'Contact Person',
                          application?.fundingContactPerson,
                          'fundingContactPerson'
                        )}
                        {renderFieldRow(
                          'Email',
                          application?.fundingEmail,
                          'fundingEmail'
                        )}
                        {renderFieldRow(
                          'Phone Number',
                          application?.fundingPhoneNumber,
                          'fundingPhoneNumber'
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
