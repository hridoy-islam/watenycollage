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
import { Pen, Download } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StatementOfUnderstandingPdf } from './statement-of-understanding-pdf';

interface StatementOfUnderstanding {
  _id: string;
  userId: string;
  name: string;
  signatureUrl?: string;
  createdAt?: string;
}

interface Props {
  userId: string;
}

export function StatementOfUnderstandingTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatementOfUnderstanding | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/statement-of-understanding?userId=${userId}`);
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Statement of Understanding Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted the statement of understanding.</p>
        </CardContent>
      </Card>
    );
  }

  const fields = [
    { label: 'Applicant Name', value: data?.name },
  ];

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Statement of Understanding</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>
            <PDFDownloadLink
              document={<StatementOfUnderstandingPdf name={data.name} signatureUrl={data.signatureUrl} createdAt={data.createdAt} />}
              fileName={`statement-of-understanding-${data.name?.replace(/\s+/g, '_')}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button size="sm" variant="outline" disabled={pdfLoading}>
                  <Download className="mr-1 h-3 w-3" /> PDF
                </Button>
              )}
            </PDFDownloadLink>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/statement-of-understanding/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
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
        </div>
        {data.createdAt && (
          <p className="mt-4 text-xs text-gray-400">Submitted: {format(new Date(data.createdAt), 'dd MMM yyyy')}</p>
        )}
      </CardContent>
    </Card>
  );
}