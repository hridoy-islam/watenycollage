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
  studentId: string;
  personalDetailsData: {
    title?: string;
    firstName?: string;
    lastName?: string;
    otherName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    ethnicity?: string;
    customEthnicity?: string;
    countryOfBirth?: string;
    maritalStatus?: string;
  };
  addressData: {
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
  };
  contactData: {
    contactNumber?: string;
    email?: string;
    confirmEmail?: string;
    preferredContactMethod?: string;
  };
  emergencyContactData: {
    emergencyContactNumber?: string;
    emergencyEmail?: string;
    emergencyFullName?: string;
    emergencyRelationship?: string;
  };
  complianceData: {
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
  };
  documentsData: {
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
  };
  employmentData: {
    isEmployed?: string;
    currentEmployment?: {
      employer?: string;
      jobTitle?: string;
      startDate?: string;
      employmentType?: string;
      responsibilities?: string;
      supervisor?: string;
      contactPermission?: string;
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
  };
  termsData: {
    acceptTerms?: boolean;
    acceptDataProcessing?: boolean;
  };
  educationData?: {
    institution: string;
    studyType: string;
    qualification: string;
    awardDate: string;
    certificate?: string;
    transcript?: string;
  }[];
  courseDetailsData?: {
    course: string;
    intake: string;
  };
};

export default function ViewApplicationPage() {
  const [application, setApplication] = useState<Application | null>(null);
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
        const response = await axiosInstace.get(`/applications/${id}`);
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
          onClick={() => navigate('/dashboard/applications')}
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
              value="contact"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="other-information"
              className="flex items-center gap-1 focus:bg-watney active:bg-watney data-[state=active]:bg-watney"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Other information</span>
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
                    {renderFieldRow(
                      'Title',
                      application.personalDetailsData.title,
                      'personalDetailsData.title'
                    )}
                    {renderFieldRow(
                      'First Name',
                      application.personalDetailsData.firstName,
                      'personalDetailsData.firstName'
                    )}
                    {renderFieldRow(
                      'Last Name',
                      application.personalDetailsData.lastName,
                      'personalDetailsData.lastName'
                    )}
                    {renderFieldRow(
                      'Other Name',
                      application.personalDetailsData.otherName,
                      'personalDetailsData.otherName'
                    )}
                    {renderFieldRow(
                      'Gender',
                      application.personalDetailsData.gender,
                      'personalDetailsData.gender'
                    )}
                    {renderFieldRow(
                      'Date of Birth',
                      application.personalDetailsData.dateOfBirth,
                      'personalDetailsData.dateOfBirth'
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
                      application.personalDetailsData.nationality,
                      'personalDetailsData.nationality'
                    )}
                    {renderFieldRow(
                      'Ethnicity',
                      application.personalDetailsData.ethnicity,
                      'personalDetailsData.ethnicity'
                    )}
                    {renderFieldRow(
                      'Custom Ethnicity',
                      application.personalDetailsData.customEthnicity,
                      'personalDetailsData.customEthnicity'
                    )}
                    {renderFieldRow(
                      'Country of Birth',
                      application.personalDetailsData.countryOfBirth,
                      'personalDetailsData.countryOfBirth'
                    )}
                    {renderFieldRow(
                      'Marital Status',
                      application.personalDetailsData.maritalStatus,
                      'personalDetailsData.maritalStatus'
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
                      application.addressData.residentialAddressLine1,
                      'addressData.residentialAddressLine1'
                    )}
                    {renderFieldRow(
                      'Address Line 2',
                      application.addressData.residentialAddressLine2,
                      'addressData.residentialAddressLine2'
                    )}
                    {renderFieldRow(
                      'City',
                      application.addressData.residentialCity,
                      'addressData.residentialCity'
                    )}
                    {renderFieldRow(
                      'Post Code',
                      application.addressData.residentialPostCode,
                      'addressData.residentialPostCode'
                    )}
                    {renderFieldRow(
                      'Country',
                      application.addressData.residentialCountry,
                      'addressData.residentialCountry'
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
                      {application.addressData.sameAsResidential
                        ? 'Same as residential'
                        : 'Different from residential'}
                    </span>
                  </Badge>
                </div>

                {application.addressData.sameAsResidential ? (
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
                        application.addressData.postalAddressLine1,
                        'addressData.postalAddressLine1'
                      )}
                      {renderFieldRow(
                        'Address Line 2',
                        application.addressData.postalAddressLine2,
                        'addressData.postalAddressLine2'
                      )}
                      {renderFieldRow(
                        'City',
                        application.addressData.postalCity,
                        'addressData.postalCity'
                      )}
                      {renderFieldRow(
                        'Post Code',
                        application.addressData.postalPostCode,
                        'addressData.postalPostCode'
                      )}
                      {renderFieldRow(
                        'Country',
                        application.addressData.postalCountry,
                        'addressData.postalCountry'
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Contact Information
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
                        'Contact Number',
                        application.contactData.contactNumber,
                        'contactData.contactNumber'
                      )}
                      {renderFieldRow(
                        'Email',
                        application.contactData.email,
                        'contactData.email'
                      )}
                      {renderFieldRow(
                        'Confirm Email',
                        application.contactData.confirmEmail,
                        'contactData.confirmEmail'
                      )}
                      {renderFieldRow(
                        'Preferred Contact Method',
                        application.contactData.preferredContactMethod,
                        'contactData.preferredContactMethod'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
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
                        application.emergencyContactData.emergencyFullName,
                        'emergencyContactData.emergencyFullName'
                      )}
                      {renderFieldRow(
                        'Relationship',
                        application.emergencyContactData.emergencyRelationship,
                        'emergencyContactData.emergencyRelationship'
                      )}
                      {renderFieldRow(
                        'Contact Number',
                        application.emergencyContactData.emergencyContactNumber,
                        'emergencyContactData.emergencyContactNumber'
                      )}
                      {renderFieldRow(
                        'Email',
                        application.emergencyContactData.emergencyEmail,
                        'emergencyContactData.emergencyEmail'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="other-information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* First Card */}
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
                        application.complianceData.startDateInUK,
                        'complianceData.startDateInUK'
                      )}
                      {renderFieldRow(
                        'NI Number',
                        application.complianceData.niNumber,
                        'complianceData.niNumber'
                      )}
                      {renderFieldRow(
                        'Status',
                        application.complianceData.status,
                        'complianceData.status'
                      )}
                      {renderFieldRow(
                        'LTR Code',
                        application.complianceData.ltrCode,
                        'complianceData.ltrCode'
                      )}
                      {renderFieldRow(
                        'Disability',
                        application.complianceData.disability,
                        'complianceData.disability'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Second Card */}
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
                        application.complianceData.disabilityDetails,
                        'complianceData.disabilityDetails'
                      )}
                      {renderFieldRow(
                        'Benefits',
                        application.complianceData.benefits,
                        'complianceData.benefits'
                      )}
                      {renderFieldRow(
                        'Criminal Conviction',
                        application.complianceData.criminalConviction,
                        'complianceData.criminalConviction'
                      )}
                      {renderFieldRow(
                        'Conviction Details',
                        application.complianceData.convictionDetails,
                        'complianceData.convictionDetails'
                      )}
                      {renderFieldRow(
                        'Student Finance',
                        application.complianceData.studentFinance,
                        'complianceData.studentFinance'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* First Card */}
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
                        application.documentsData.documentType,
                        'documentsData.documentType'
                      )}
                      {renderFieldRow(
                        'National ID',
                        application.documentsData.nationalID,
                        'documentsData.nationalID'
                      )}
                      {renderFieldRow(
                        'Has Passport',
                        application.documentsData.hasDocument,
                        'documentsData.hasDocument'
                      )}
                      {renderFieldRow(
                        'Passport Number',
                        application.documentsData.passportNumber,
                        'documentsData.passportNumber'
                      )}
                      {renderFieldRow(
                        'Passport Expiry',
                        application.documentsData.passportExpiry,
                        'documentsData.passportExpiry'
                      )}
                      {renderFieldRow(
                        'ID Document Count',
                        application.documentsData.idDocument?.length,
                        'documentsData.idDocument.length'
                      )}
                      {renderFieldRow(
                        'Has Certificates',
                        application.documentsData.hasCertificates,
                        'documentsData.hasCertificates'
                      )}
                      {renderFieldRow(
                        'Certificates Details',
                        application.documentsData.certificatesDetails,
                        'documentsData.certificatesDetails'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Second Card */}
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
                        application.documentsData.qualificationCertificates
                          ?.length,
                        'documentsData.qualificationCertificates.length'
                      )}
                      {renderFieldRow(
                        'CV/Resume Count',
                        application.documentsData.cvResume?.length,
                        'documentsData.cvResume.length'
                      )}
                      {renderFieldRow(
                        'Has Proof of Address',
                        application.documentsData.hasProofOfAddress,
                        'documentsData.hasProofOfAddress'
                      )}
                      {renderFieldRow(
                        'Proof of Address Type',
                        application.documentsData.proofOfAddressType,
                        'documentsData.proofOfAddressType'
                      )}
                      {renderFieldRow(
                        'Proof of Address Date',
                        application.documentsData.proofOfAddressDate,
                        'documentsData.proofOfAddressDate'
                      )}
                      {renderFieldRow(
                        'Proof of Address Count',
                        application.documentsData.proofOfAddress?.length,
                        'documentsData.proofOfAddress.length'
                      )}
                      {renderFieldRow(
                        'Other Documents Count',
                        application.documentsData.otherDocuments?.length,
                        'documentsData.otherDocuments.length'
                      )}
                      {renderFieldRow(
                        'Other Documents Descriptions',
                        Array.isArray(
                          application.documentsData.otherDocumentsDescription
                        )
                          ? application.documentsData.otherDocumentsDescription.join(
                              ', '
                            )
                          : application.documentsData.otherDocumentsDescription,
                        'documentsData.otherDocumentsDescription'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employment">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Card 1: Employment Status */}
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
                        application.employmentData.isEmployed,
                        'employmentData.isEmployed'
                      )}
                      {renderFieldRow(
                        'Has Employment Gaps',
                        application.employmentData.hasEmploymentGaps,
                        'employmentData.hasEmploymentGaps'
                      )}
                      {renderFieldRow(
                        'Employment Gaps Explanation',
                        application.employmentData.employmentGapsExplanation,
                        'employmentData.employmentGapsExplanation'
                      )}
                      {renderFieldRow(
                        'Declaration',
                        application.employmentData.declaration,
                        'employmentData.declaration'
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Card 2: Current & Previous Employment */}
              <Card>
                <CardContent className="pt-6">
                  {application.employmentData.currentEmployment && (
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
                            application.employmentData.currentEmployment
                              .employer,
                            'employmentData.currentEmployment.employer'
                          )}
                          {renderFieldRow(
                            'Job Title',
                            application.employmentData.currentEmployment
                              .jobTitle,
                            'employmentData.currentEmployment.jobTitle'
                          )}
                          {renderFieldRow(
                            'Start Date',
                            application.employmentData.currentEmployment
                              .startDate,
                            'employmentData.currentEmployment.startDate'
                          )}
                          {renderFieldRow(
                            'Employment Type',
                            application.employmentData.currentEmployment
                              .employmentType,
                            'employmentData.currentEmployment.employmentType'
                          )}
                          {renderFieldRow(
                            'Responsibilities',
                            application.employmentData.currentEmployment
                              .responsibilities,
                            'employmentData.currentEmployment.responsibilities'
                          )}
                          {renderFieldRow(
                            'Supervisor',
                            application.employmentData.currentEmployment
                              .supervisor,
                            'employmentData.currentEmployment.supervisor'
                          )}
                          {renderFieldRow(
                            'Contact Permission',
                            application.employmentData.currentEmployment
                              .contactPermission,
                            'employmentData.currentEmployment.contactPermission'
                          )}
                        </TableBody>
                      </Table>
                    </>
                  )}

                  {application.employmentData.previousEmployments &&
                    application.employmentData.previousEmployments.length >
                      0 && (
                      <>
                        <h3 className="mb-2 text-lg font-semibold">
                          Previous Employment
                        </h3>
                        <div className="space-y-6">
                          {application.employmentData.previousEmployments.map(
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
                                      `employmentData.previousEmployments.${index}.employer`
                                    )}
                                    {renderFieldRow(
                                      'Job Title',
                                      employment.jobTitle,
                                      `employmentData.previousEmployments.${index}.jobTitle`
                                    )}
                                    {renderFieldRow(
                                      'Start Date',
                                      employment.startDate,
                                      `employmentData.previousEmployments.${index}.startDate`
                                    )}
                                    {renderFieldRow(
                                      'End Date',
                                      employment.endDate,
                                      `employmentData.previousEmployments.${index}.endDate`
                                    )}
                                    {renderFieldRow(
                                      'Reason for Leaving',
                                      employment.reasonForLeaving,
                                      `employmentData.previousEmployments.${index}.reasonForLeaving`
                                    )}
                                    {renderFieldRow(
                                      'Responsibilities',
                                      employment.responsibilities,
                                      `employmentData.previousEmployments.${index}.responsibilities`
                                    )}
                                    {renderFieldRow(
                                      'Contact Permission',
                                      employment.contactPermission,
                                      `employmentData.previousEmployments.${index}.contactPermission`
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
                                education.studyType,
                                `educationData.${index}.studyType`
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
                              {renderFieldRow(
                                'Transcript',
                                education.transcript,
                                `educationData.${index}.transcript`
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="course">
            <Card className="w-1/2">
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">Course Details</h3>

                {!application.courseDetailsData ? (
                  <p className="italic text-muted-foreground">
                    No course details provided
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
                        'Course',
                        application.courseDetailsData.course,
                        'courseDetailsData.course'
                      )}
                      {renderFieldRow(
                        'Intake',
                        application.courseDetailsData.intake,
                        'courseDetailsData.intake'
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New TabsContent for Terms Acceptance */}
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
                      application.termsData.acceptTerms,
                      'termsData.acceptTerms'
                    )}
                    {renderFieldRow(
                      'Accept Data Processing',
                      application.termsData.acceptDataProcessing,
                      'termsData.acceptDataProcessing'
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
