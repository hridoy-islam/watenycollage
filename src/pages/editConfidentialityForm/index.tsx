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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  MoveLeft,
  Loader2,
  Pencil,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import SignatureCanvas from 'react-signature-canvas';
import { useToast } from '@/components/ui/use-toast';

const confidentialitySchema = z.object({
  signatureUrl: z.string().min(1, 'Signature is required'),
});

type ConfidentialityFormValues = z.infer<typeof confidentialitySchema>;

export default function EditConfidentialityForm() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [formId, setFormId] = useState<string | null>(null);

  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();

  const form = useForm<ConfidentialityFormValues>({
    resolver: zodResolver(confidentialitySchema),
    defaultValues: {
      signatureUrl: '',
    },
  });

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userRes = await axiosInstance.get(`/application-job?applicantId=${id}`);
      setUserData(userRes.data?.data?.result[0]);

      let existingData = null;
      try {
        const dataRes = await axiosInstance.get(`/confidentiality?userId=${id}`);
        existingData = Array.isArray(dataRes.data.data.result)
          ? dataRes.data.data.result[0]
          : (Array.isArray(dataRes.data.data) ? dataRes.data.data[0] : dataRes.data.data);
      } catch (err) {
        console.log('No existing confidentiality form found.');
      }

      if (existingData) {
        setFormId(existingData._id);
        setSignatureUrl(existingData.signatureUrl || '');
        if (existingData.signatureUrl) {
          form.setValue('signatureUrl', existingData.signatureUrl);
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load user information.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const onSubmit = async (data: ConfidentialityFormValues) => {
    if (!id) return;
    setSubmitting(true);

    try {
      const payload = {
        userId: id,
        name: `${userData?.applicantId?.firstName || ''} ${userData?.applicantId?.initial || ''} ${userData?.applicantId?.lastName || ''}`.trim(),
        signatureUrl: signatureUrl || undefined,
      };

      if (formId) {
        await axiosInstance.patch(`/confidentiality/${formId}`, payload);
        toast({
          title: 'Success',
          description: 'Confidentiality form updated successfully.',
        });
      } else {
        await axiosInstance.post('/confidentiality', payload);
        toast({
          title: 'Success',
          description: 'Confidentiality form submitted successfully.',
        });
      }

      await axiosInstance.patch(`/users/${id}`, { confidentialityFormDone: true });
      navigate(-1);
    } catch (error: any) {
      console.error('Error submitting confidentiality form:', error);
      toast({
        title: 'Submission Failed',
        description: error?.response?.data?.message || 'Could not save confidentiality form.',
        variant: 'destructive',
      });
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

  return (
    <div className="flex min-h-screen justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>Employment Confidentiality</div>
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
              Edit the confidentiality form details.
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
                <div className="space-y-4 text-sm text-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900">Confidentiality Undertaking</h3>

                  <p>In accordance with the Care Standards & Data Protection Acts and Everycare's Policies & Procedures, staff must respect and treat in complete confidence and in the best interests of the service user all information given by service users or their representatives.</p>

                  <p>Service users and their relatives or representatives know that their personal information is handled appropriately and that their personal confidences are respected. In addition, service users have summaries of Everycare's policies and procedures on confidentiality which specifies the circumstances under which confidentiality may be breached and includes the process for dealing with inappropriate breaches of confidentiality.</p>

                  <p>Staff know when information given to them in confidence must be shared with their manager and other staff.</p>

                  <p>The principles of confidentiality are observed in discussion with colleagues and your manager, particularly when undertaking training or group supervision sessions.</p>

                  <p className="font-semibold text-gray-900">On no account should a member of staff do any of the following:</p>

                  <ul className="list-disc space-y-2 pl-5">
                    <li>Mention another service user or member of staff, even their name in front of another person other than in the course of the performance of their duties.</li>
                    <li>Discuss another member of staff or anything that another member of staff has done with any other person other than in the course of the performance of their duties.</li>
                    <li>Discuss anything that goes on in the Everycare office with any other person other than in the course of the performance of their duties.</li>
                    <li>No employee should place any comment or information (whether specific or implied) on social networking sites that could be misunderstood or misinterpreted by any person (whether or not they are associated with Everycare or its associated companies or franchised offices) that would reflect in any way on Everycare, its Business, Directors, Managers, Employees or Service Users. A breach of this may constitute gross misconduct.</li>
                  </ul>

                  <p>If it comes to Everycare's attention that any of the above has been breached, the offending member of staff will be subject to disciplinary procedures.</p>

                  <p>It must be appreciated that neither service user nor staff members are happy about the possibility of their affairs being made public. For some people even the issue that they receive services at all is something they would not wish others to know.</p>

                  <p>I give an undertaking not to disclose anything about any service user, a service user's establishment, a member of staff to any other person or outsider, including the name or address of a service user, other than in the course of your duties. I undertake to maintain the strictest confidentiality in all matters related to Everycare and to abide by all the instructions contained in the Everycare Confidentiality Policy, both during the time of my employment at Everycare and after I have left.</p>

                  <div className="pt-2 text-xs text-gray-500">
                    <p>Also refer to:</p>
                    <p>Policy & Procedure - Confidentiality</p>
                    <p>Policy & Procedure - Data Protection</p>
                  </div>
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
                    Signature <span className="text-red-500">*</span>
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
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowSignaturePad(true);
                            setTimeout(() => signatureRef.current?.clear(), 100);
                          }}
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Update Signature
                        </Button>
                        {/* <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSignatureUrl('');
                            setShowSignaturePad(true);
                            form.setValue('signatureUrl', '', { shouldValidate: true });
                            setTimeout(() => signatureRef.current?.clear(), 100);
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Re-sign
                        </Button> */}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-gray-300 bg-white">
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
                    {submitting ? 'Saving...' : formId ? 'Update' : 'Submit'}
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
