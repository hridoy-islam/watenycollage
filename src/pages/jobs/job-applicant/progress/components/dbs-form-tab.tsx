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
import { ExternalLink, Download, Pen } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DBSPdf from '@/pages/applicantModulesAdmin/dbsDetails/component/DBSPdf';

interface DBSDetails {
  disclosureNumber: string;
  dateOfIssue: string;
  expiryDate: string;
  name: string;
  jobPost: string;
  dbsDocumentUrl?: string;
  createdAt?: string;
}

interface Props {
  userId: string;
}

export function DBSFormTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DBSDetails | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/dbs-form?userId=${userId}`);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">DBS Certificate Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted their DBS certificate details.</p>
        </CardContent>
      </Card>
    );
  }

  const fields = [
    { label: 'Applicant Name', value: data?.name },
    { label: 'Applied For', value: data.jobPost },
    { label: 'Disclosure Number', value: data.disclosureNumber },
    { label: 'Date of Issue', value: data.dateOfIssue ? format(new Date(data.dateOfIssue), 'dd/MM/yyyy') : '—' },
    { label: 'Expiry Date', value: data.expiryDate ? format(new Date(data.expiryDate), 'dd/MM/yyyy') : '—' },
  ];

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">DBS Certificate Details</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/dbs-form/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
            <PDFDownloadLink
              document={<DBSPdf dbsDetails={data} />}
              fileName={`DBS_${data.name.replace(/\s+/g, '_')}.pdf`}
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
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{field.value}</p>
            </div>
          ))}
          {data.dbsDocumentUrl && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 pb-1">DBS Document</p>
              <Button size="sm"  onClick={() => window.open(data.dbsDocumentUrl, '_blank')}>
                <ExternalLink className="mr-1 h-3 w-3" /> View Document
              </Button>
            </div>
          )}
        </div>
        {data.createdAt && (
          <p className="mt-4 text-xs text-gray-400">Submitted: {format(new Date(data.createdAt), 'dd MMM yyyy')}</p>
        )}
      </CardContent>
    </Card>
  );
}
