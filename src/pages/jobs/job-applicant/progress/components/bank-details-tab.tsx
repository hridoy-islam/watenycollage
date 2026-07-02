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
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BankDetailsPdf } from '@/pages/applicantModulesAdmin/BankDetails/components/BankDetailsPdf';

interface BankDetailsData {
  name: string;
  jobPost: string;
  address: string;
  postcode: string;
  houseNumber: string;
  bankName: string;
  bankAddress: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
  buildingSocietyRollNumber?: string;
  createdAt?: string;
}

interface Props {
  userId: string;
}

export function BankDetailsTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BankDetailsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/bank-details?userId=${userId}`);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Details Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted their bank account details.</p>
        </CardContent>
      </Card>
    );
  }

  const personalInfo = [
    { label: 'Full Name', value: data.name },
    { label: 'Job Title', value: data.jobPost },
    { label: 'House Number', value: data.houseNumber },
    { label: 'Address', value: data.address },
    { label: 'Postcode', value: data.postcode },
  ];

  const bankInfo = [
    { label: 'Bank Name', value: data.bankName },
    { label: 'Branch Address', value: data.bankAddress },
    { label: 'Account Holder', value: data.accountName },
    { label: 'Sort Code', value: data.sortCode },
    { label: 'Account Number', value: data.accountNumber },
    { label: 'Roll Number', value: data.buildingSocietyRollNumber || '—' },
  ];

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Bank Account Details</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/admin/bank-details/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
            <PDFDownloadLink
              document={<BankDetailsPdf data={data} />}
              fileName={`BankDetails_${data.name.replace(/\s+/g, '_')}.pdf`}
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
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Personal Information</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {personalInfo.map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">Bank Information</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {bankInfo.map((field) => (
              <div key={field.label}>
                <p className="text-xs font-medium text-gray-500">{field.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
        {data.createdAt && (
          <p className="text-xs text-gray-400 pt-2 border-t">
            Submitted: {new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
