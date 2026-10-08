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
import { Eye, Pen } from 'lucide-react';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';

interface TEcert {
  _id: string;
  title: string;
  ecertId?: { title: string };
  document?: string;
  createdAt?: string;
}

interface Props {
  userId: string;
}

export function EcertFormTab({ userId }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ecerts, setEcerts] = useState<TEcert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/ecert-form?userId=${userId}`);
        setEcerts(res.data.data.result || []);
      } catch {
        setEcerts([]);
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

  if (ecerts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Training Certificates Not Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">The applicant has not yet submitted any training certificates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Training Certificates</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {ecerts.length} Certificate{ecerts.length !== 1 ? 's' : ''}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/ecert-form/${userId}`)}>
              <Eye className="mr-1 h-3 w-3" /> View All
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/recruitment/admin/ecert-form/${userId}/edit`)}>
              <Pen className="mr-1 h-3 w-3" /> Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {ecerts.map((ecert) => (
            <div key={ecert._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {ecert.ecertId?.title || ecert.title || 'Untitled'}
                </p>
                {ecert.createdAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(ecert.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              {ecert.document && (
                <Button size="sm"  onClick={() => window.open(ecert.document, '_blank')}>
                  <Eye className="mr-1 h-3 w-3" /> View
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
