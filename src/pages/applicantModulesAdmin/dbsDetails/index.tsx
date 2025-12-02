import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoveLeft, Download, ExternalLink } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { format } from 'date-fns';

interface DBSDetails {
  disclosureNumber: string;
  dateOfIssue: string;
  expiryDate: string;
  name: string;
  jobPost: string;
  createdAt?: string;
  dbsDocumentUrl?: string; // Field for the uploaded file URL
}

export default function AdminDBSDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dbsDetails, setDbsDetails] = useState<DBSDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDBSDetails = async () => {
      if (!id) {
        setError('Invalid applicant ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/dbs-form?userId=${id}`);
        const data = res.data?.data?.result?.[0];

        if (!data) {
          setError('No DBS record found for this applicant.');
        } else {
          setDbsDetails(data);
        }
      } catch (err) {
        console.error('Failed to fetch DBS details:', err);
        setError('Failed to load DBS details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDBSDetails();
  }, [id]);

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
          <CardDescription className="mt-2 text-red-600">
            {error}
          </CardDescription>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!dbsDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 text-center">
          <CardTitle>No DBS Data</CardTitle>
          <CardDescription>
            No DBS certificate has been submitted for this applicant.
          </CardDescription>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full shadow-xl">
        <CardHeader className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-watney">
                DBS Certificate Details
              </CardTitle>
              {/* <CardDescription>
                View-only details submitted by the applicant.
              </CardDescription> */}
            </div>
            <div className="flex flex-row items-center gap-4">
              <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <MoveLeft className="h-4 w-4" />
                Back
              </Button>
              
              
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Applicant Info */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Applicant Name
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {dbsDetails.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Applied For
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {dbsDetails.jobPost}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Disclosure Number
              </p>
              <p className="mt-2 font-mono text-lg text-gray-900">
                {dbsDetails.disclosureNumber}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Date of Issue
              </p>
              <p className="mt-2 text-lg text-gray-900">
                {dbsDetails.dateOfIssue
                  ? format(new Date(dbsDetails.dateOfIssue), 'dd/MM/yyyy')
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Expiry Date
              </p>
              <p className="mt-2 text-lg text-gray-900">
                {dbsDetails.expiryDate
                  ? format(new Date(dbsDetails.expiryDate), 'dd/MM/yyyy')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500 pb-2">
                DBS Document
              </p>
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                disabled={!dbsDetails.dbsDocumentUrl}
                onClick={() => {
                  if (dbsDetails.dbsDocumentUrl) {
                    window.open(dbsDetails.dbsDocumentUrl, '_blank');
                  }
                }}
              >
                {dbsDetails.dbsDocumentUrl ? (
                  <>
                    View Document
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    No Document Attached
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Optional: Submission Timestamp */}
          {dbsDetails.createdAt && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Submitted On
              </p>
              <p className="mt-2 text-gray-700">
                {format(new Date(dbsDetails.createdAt), 'dd MMM yyyy')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}