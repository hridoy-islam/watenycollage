import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoveLeft, Download, Pen } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StarterCheckListPdf } from './components/StarterChecklistPdf';

// Define the expected shape of the checklist data
interface StarterChecklistData {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  country:string;
  postcode: string;
  nationalInsuranceNumber: string;
  startDate: string;
  gender: 'male' | 'female';
  employeeStatement: 'A' | 'B' | 'C';
  hasStudentLoan: 'yes' | 'no';
  plan1: boolean;
  plan2: boolean;
  plan4: boolean;
  postgraduateLoan: boolean;
  declarationSigned: boolean;
  createdAt?: string;
}

export default function AdminStarterChecklist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<StarterChecklistData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      if (!id) {
        setError('Invalid applicant ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/starter-checklist-form?userId=${id}`);
        const data = res.data?.data?.result?.[0];

        if (!data) {
          setError('No starter checklist found for this applicant.');
        } else {
          setChecklist(data);
        }
      } catch (err) {
        console.error('Failed to fetch starter checklist:', err);
        setError('Failed to load checklist details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [id]);

  // Transform data for PDF component
  const transformDataForPdf = () => {
    if (!checklist) return null;

    return {
      employee: {
        lastName: checklist.lastName || '',
        firstName: checklist.firstName || '',
        gender: checklist.gender === 'male' ? 'Male' : checklist.gender === 'female' ? 'Female' : '',
        dob: formatDate(checklist.dateOfBirth) || '',
        address: checklist.address || '',
        postcode: checklist.postcode || '',
        country: checklist.country, 
        niNumber: checklist.nationalInsuranceNumber || '',
        startDate: formatDate(checklist.startDate) || '',
      },
      statement: checklist.employeeStatement || null,
      studentLoan: {
        hasNoLoans: checklist.hasStudentLoan === 'no',
        plan1: checklist.plan1 || false,
        plan2: checklist.plan2 || false,
        plan4: checklist.plan4 || false,
        postgradLoan: checklist.postgraduateLoan || false,
      },
      declaration: {
        fullName: `${checklist.firstName} ${checklist.lastName}`,
        date: formatDate(checklist.createdAt) || '',
      },
    };
  };

  // Helper to format date
  const formatDate = (dateStr?: string) =>
    dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : '';

  // Helper for gender
  const renderGender = (gender: string) =>
    gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : '—';

  // Helper for employee statement
  const statementLabels: Record<string, string> = {
    A: 'Statement A',
    B: 'Statement B',
    C: 'Statement C',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-red-500 bg-red-50 p-8 text-center">
          <CardTitle className="text-xl text-red-700">Error</CardTitle>
          <CardDescription className="mt-2 text-red-600">{error}</CardDescription>
          <Button
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 text-center">
          <CardTitle>No Checklist Data</CardTitle>
          <CardDescription>No starter checklist has been submitted for this applicant.</CardDescription>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Card>
      </div>
    );
  }

  const pdfData = transformDataForPdf();

  return (
    <div className="flex justify-center">
      <Card className="w-full shadow-xl">
        <CardHeader className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-watney">
                Starter Checklist Details
              </CardTitle>
              <CardDescription>
                Submitted employee tax and loan declaration details.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
                >
                <MoveLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => navigate('edit')}
                className="flex items-center gap-2"
                >
                <Pen className="h-4 w-4 mr-2" />
                Edit
              </Button>
                {pdfData && (
                  <PDFDownloadLink
                    document={<StarterCheckListPdf data={pdfData} />}
                    fileName={`starter-checklist-${checklist.firstName}-${checklist.lastName}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        disabled={loading}
                        variant='outline'
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Personal Info */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="First Name" value={`${checklist.firstName}`} />
            <InfoItem label="Last Name" value={` ${checklist.lastName}`} />
            <InfoItem label="Date of Birth" value={formatDate(checklist.dateOfBirth)} />
            <InfoItem label="National Insurance No." value={checklist.nationalInsuranceNumber} />
            <InfoItem label="Home Address" value={checklist.address} />
            <InfoItem label="Postcode" value={checklist.postcode} />
            <InfoItem label="Gender" value={renderGender(checklist.gender)} />
            <InfoItem label="Employment Start Date" value={formatDate(checklist.startDate)} />
          </div>

          {/* Employee Statement */}
          <div className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Employee Statement</h3>
            <p className="text-gray-700">
              <span className="font-medium">{statementLabels[checklist.employeeStatement]}</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {checklist.employeeStatement === 'A' && (
                'This is my first job since last 6 April and I have not been receiving taxable Jobseeker\'s Allowance, Employment and Support Allowance, taxable Incapacity Benefit, State or Occupational Pension.'
              )}
              {checklist.employeeStatement === 'B' && (
                'This is now my only job but since last 6 April I have had another job, or received taxable Jobseeker\'s Allowance, Employment and Support Allowance or taxable Incapacity Benefit. I do not receive a State or Occupational Pension.'
              )}
              {checklist.employeeStatement === 'C' && (
                'As well as my new job, I have another job or receive a State or Occupational Pension.'
              )}
            </p>
          </div>

          {/* Student Loan Section */}
          <div className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Student Loan</h3>
            <p className="text-gray-700">
              Has student loan: <span className="font-medium">{checklist.hasStudentLoan === 'yes' ? 'Yes' : 'No'}</span>
            </p>

            {checklist.hasStudentLoan === 'yes' && (
              <div className="mt-3 ml-4 border-l-2 border-watney/20 pl-4">
                <p className="font-medium text-gray-900">Selected Plans:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {checklist.plan1 && <li>• Plan 1 (UK/England/Wales, started before 1 Sept 2012)</li>}
                  {checklist.plan2 && <li>• Plan 2 (England/Wales, started on/after 1 Sept 2012)</li>}
                  {checklist.plan4 && <li>• Plan 4 (Scotland, via SAAS)</li>}
                  {checklist.postgraduateLoan && <li>• Postgraduate Loan (Master's/Doctoral)</li>}
                  {!checklist.plan1 &&
                    !checklist.plan2 &&
                    !checklist.plan4 &&
                    !checklist.postgraduateLoan && (
                      <li className="text-red-500">— No plans selected (possible error)</li>
                    )}
                </ul>
              </div>
            )}
          </div>

          {/* Declaration */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Declaration</h3>
            <div className="flex items-start space-x-3">
              <div>
                <p className="text-sm text-gray-600 mt-1">
                  I confirm that the information I have given on this form is correct.
                </p>
              </div>
              <div className="ml-auto mt-1">
                {checklist.declarationSigned ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                    No
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submission Timestamp */}
          {checklist.createdAt && (
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Submitted on: {format(new Date(checklist.createdAt), 'dd MMM yyyy')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Info Display Component
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-gray-900">{value || '—'}</p>
  </div>
);