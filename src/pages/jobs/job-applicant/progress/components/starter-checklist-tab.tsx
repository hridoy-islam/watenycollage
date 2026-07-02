import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Download, Pen } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StarterCheckListPdf } from '@/pages/applicantModulesAdmin/starterCheckList/components/StarterChecklistPdf';

interface StarterChecklistData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  postcode: string;
  nationalInsuranceNumber: string;
  startDate: string;
  gender: string;
  employeeStatement: string;
  hasStudentLoan: string;
  plan1: boolean;
  plan2: boolean;
  plan4: boolean;
  postgraduateLoan: boolean;
  declarationSigned: boolean;
  signatureUrl?: string;
  createdAt?: string;
  [key: string]: any;
}

interface Props {
  userId: string;
}

const formatDate = (dateStr?: string) =>
  dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : '—';

export function StarterChecklistTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StarterChecklistData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/starter-checklist-form?userId=${userId}`);
        const result = res.data?.data?.result?.[0];
        setData(result || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Starter Checklist Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted the starter checklist form.</p>
        </CardContent>
      </Card>
    );
  }

  const statementLabels: Record<string, string> = {
    A: 'Statement A — First job since last 6 April',
    B: 'Statement B — Now my only job',
    C: 'Statement C — I have another job or pension',
  };

  const fields = [
    { label: 'First Name', value: data.firstName },
    { label: 'Last Name', value: data.lastName },
    { label: 'Date of Birth', value: formatDate(data.dateOfBirth) },
    { label: 'NI Number', value: data.nationalInsuranceNumber },
    { label: 'Address', value: data.address },
    { label: 'Postcode', value: data.postcode },
    { label: 'Gender', value: data.gender === 'male' ? 'Male' : 'Female' },
    { label: 'Start Date', value: formatDate(data.startDate) },
  ];

  const pdfData = {
    employee: {
      lastName: data.lastName || '',
      firstName: data.firstName || '',
      gender: data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : '',
      dob: formatDate(data.dateOfBirth),
      address: data.address || '',
      postcode: data.postcode || '',
      country: data.country,
      niNumber: data.nationalInsuranceNumber || '',
      startDate: formatDate(data.startDate),
    },
    statement: data.employeeStatement || null,
    studentLoan: {
      hasNoLoans: data.hasStudentLoan === 'no',
      plan1: data.plan1 || false,
      plan2: data.plan2 || false,
      plan4: data.plan4 || false,
      postgradLoan: data.postgraduateLoan || false,
    },
    declaration: {
      fullName: `${data.firstName} ${data.lastName}`,
      date: formatDate(data.createdAt),
    },
    signatureUrl: data.signatureUrl,
    createdAt: data.createdAt,
  };

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Starter Checklist</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/admin/starter-checklist-form/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
            <PDFDownloadLink
              document={<StarterCheckListPdf data={pdfData} />}
              fileName={`starter-checklist-${data.firstName}-${data.lastName}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button size="sm" variant="outline" disabled={pdfLoading}>
                  <Download className="mr-1 h-3 w-3" />
                  {pdfLoading ? 'Generating...' : 'PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{field.value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Employee Statement</p>
          <p className="text-sm font-semibold text-gray-900">{statementLabels[data.employeeStatement] || data.employeeStatement}</p>
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Student Loan</p>
          <p className="text-sm font-semibold text-gray-900">
            {data.hasStudentLoan === 'yes' ? 'Has student loan' : 'No student loan'}
          </p>
          {data.hasStudentLoan === 'yes' && (
            <div className="mt-1 ml-2 text-xs text-gray-600">
              {data.plan1 && <p>- Plan 1</p>}
              {data.plan2 && <p>- Plan 2</p>}
              {data.plan4 && <p>- Plan 4</p>}
              {data.postgraduateLoan && <p>- Postgraduate Loan</p>}
            </div>
          )}
        </div>
        <div className="border-t pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Declaration Signed</p>
          <Badge className={data.declarationSigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {data.declarationSigned ? 'Yes' : 'No'}
          </Badge>
        </div>
        {data.signatureUrl && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Signature</p>
            <img src={data.signatureUrl} alt="Signature" className="h-12 rounded border border-gray-200" />
          </div>
        )}
        {data.createdAt && (
          <p className="text-xs text-gray-400 pt-2 border-t">
            Submitted: {format(new Date(data.createdAt), 'dd MMM yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
