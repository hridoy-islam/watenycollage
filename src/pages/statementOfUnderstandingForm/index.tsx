import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormLabel
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  MoveLeft,
  Loader2,
  CheckCircle,
  Pencil
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import SignatureCanvas from 'react-signature-canvas';

const statementSchema = z.object({
  signatureUrl: z.string().min(1, 'Signature is required'),
});

type StatementFormValues = z.infer<typeof statementSchema>;

export default function StatementOfUnderstandingFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>([]);

  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const navigate = useNavigate();
  const form = useForm<StatementFormValues>({
    resolver: zodResolver(statementSchema),
    defaultValues: {
      signatureUrl: '',
    },
  });
  const { id } = useParams();

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await axiosInstance.get(`/application-job?applicantId=${id}`);
      const userStatusRes = await axiosInstance.get(`/users/${id}`);

      setIsAlreadySubmitted(userStatusRes.data.data.statementOfUnderstandingDone);
      setUserData(userRes.data?.data?.result[0]);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSignature = async () => {
    if (!signatureRef.current) return;
    const dataUrl = signatureRef.current.toDataURL();
    if (!dataUrl) return;
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('entityId', id || '');
    formData.append('file_type', 'careerDoc');
    formData.append('file', file);
    setSignatureSaving(true);
    try {
      const response = await axiosInstance.post('/documents', formData);
      if (response.status === 200) {
        const url = response.data?.data?.fileUrl || response.data?.data?.url || response.data?.url;
        if (url) {
          setSignatureUrl(url);
          form.setValue('signatureUrl', url, { shouldValidate: true });
          setShowSignaturePad(false);
        }
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const onSubmit = async (data: StatementFormValues) => {
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        name: `${userData?.applicantId?.firstName} ${userData?.applicantId?.initial || ''} ${userData?.applicantId?.lastName}`,
        signatureUrl: signatureUrl || undefined,
      };

      await axiosInstance.post('/statement-of-understanding', payload);
      await axiosInstance.patch(`/users/${id}`, { statementOfUnderstandingDone: true });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting statement of understanding form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">
            Form Already Submitted
          </CardTitle>
          <CardDescription className="mb-6">
            You have already completed the Statement of Understanding form.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">
            Thank You!
          </CardTitle>
          <CardDescription className="text-2xl text-black mb-6">
            The Statement of Understanding form has been successfully completed.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate(-1)}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>Statement of Understanding</div>
                <Button
                  className="border-none bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate(-1)}
                >
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Please confirm your agreement to the Statement of Understanding terms.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 md:p-8">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Name
                </p>
                <p className="text-sm font-semibold text-gray-900 md:text-lg">
                  {userData?.applicantId?.firstName}{' '}
                  {userData?.applicantId?.initial}{' '}
                  {userData?.applicantId?.lastName}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Post
                </p>
                <p className="text-sm font-semibold text-gray-800 md:text-lg">
                  {userData?.jobId?.jobTitle}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 text-watney shrink-0" />
                <div className="space-y-4 text-lg text-black">
                  <h3 className="text-lg font-semibold text-gray-900">Statement of Understanding</h3>

                  <p>I hereby confirm that I have received, read and understand the Medication Policy of</p>

                  <p className="font-bold text-gray-900">EVERYCARE ROMFORD</p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <FormLabel className="block text-base font-medium">
                    <div>

                    Signature <span className="text-red-500">*</span>
                    </div>
                  </FormLabel>

                  {signatureUrl && !showSignaturePad ? (
                    <div className="flex flex-col items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="h-16 rounded border border-gray-300 bg-white object-contain"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setShowSignaturePad(true);
                            setTimeout(() => signatureRef.current?.clear(), 100);
                          }}
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Update Signature
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-gray-300 bg-white max-w-sm">
                        <SignatureCanvas
                          ref={signatureRef}
                          penColor="black"
                          canvasProps={{
                            width: 400,
                            height: 120,
                            className: 'rounded-lg signature-canvas w-full max-w-sm',
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearSignature}
                          disabled={signatureSaving}
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveSignature}
                          disabled={signatureSaving}
                          className="bg-watney text-white hover:bg-watney/90"
                        >
                          {signatureSaving ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Signature'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {form.formState.errors.signatureUrl && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.signatureUrl.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || signatureSaving}
                    className="h-12 w-full min-w-[200px] bg-watney text-base text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'I Agree & Submit'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}