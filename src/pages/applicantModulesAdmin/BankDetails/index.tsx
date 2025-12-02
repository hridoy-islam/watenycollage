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
import { Download, MoveLeft } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BankDetailsPdf } from './components/BankDetailsPdf';
// Define expected data shape
interface BankDetailsData {
  userId: string;
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

export default function AdminBankDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!id) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/bank-details?userId=${id}`);
        const data = res.data?.data?.result?.[0];

        if (!data) {
          setError('No bank details found for this applicant.');
        } else {
          setBankDetails(data);
        }
      } catch (err) {
        console.error('Failed to fetch bank details:', err);
        setError('Failed to load bank details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
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

  if (!bankDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 text-center">
          <CardTitle>No Bank Details</CardTitle>
          <CardDescription>This applicant has not submitted bank details.</CardDescription>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  
  return (
    <div className="flex justify-center ">
      <Card className="w-full  shadow-xl">
        <CardHeader className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-watney">
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Payroll bank information submitted by the applicant.
              </CardDescription>
            </div>
            <div className="flex gap-3">

              <Button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <MoveLeft className="h-4 w-4" />
                Back
              </Button>
              {/* PDF DOWNLOAD BUTTON */}
              <PDFDownloadLink
                document={<BankDetailsPdf data={bankDetails} />}
                fileName={`BankDetails_${bankDetails.name.replace(/\s+/g, '_')}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button disabled={pdfLoading} variant="outline" className="flex items-center gap-2">
                   
                        <Download className="h-4 w-4" />
                        Download PDF
                     
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
     
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Personal Info */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Full Name" value={bankDetails.name} />
            <InfoItem label="Job Title" value={bankDetails.jobPost} />
            <InfoItem label="House Number" value={bankDetails.houseNumber} />
            <InfoItem label="Address" value={bankDetails.address} />
            <InfoItem label="Postcode" value={bankDetails.postcode} />
          </div>

          {/* Bank Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Bank Information</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoItem label="Bank Name" value={bankDetails.bankName} />
              <InfoItem label="Branch Address" value={bankDetails.bankAddress} />
              <InfoItem label="Account Holder Name" value={bankDetails.accountName} />
              <InfoItem label="Sort Code" value={bankDetails.sortCode} />
              <InfoItem label="Account Number" value={bankDetails.accountNumber} />
              <InfoItem
                label="Building Society Roll Number"
                value={bankDetails.buildingSocietyRollNumber || '—'}
              />
            </div>
          </div>

          {/* Submission Timestamp */}
          {bankDetails.createdAt && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(bankDetails.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable info row
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 break-words text-lg font-semibold text-gray-900">{value}</p>
  </div>
);