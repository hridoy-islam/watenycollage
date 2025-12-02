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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import {
  MoveLeft,
  Upload,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Label } from '@/components/ui/label';

// --- SCHEMA ---
const dbsCertificateSchema = z
  .object({
    disclosureNumber: z
      .string()
      .min(10, 'Disclosure number is usually at least 10 digits'),
    dateOfIssue: z.date({
      required_error: 'Date of Issue is required'
    }),
    expiryDate: z.date({
      required_error: 'Expiry Date is required'
    })
  })
  .refine((data) => data.expiryDate > data.dateOfIssue, {
    message: 'Expiry date must be after the date of issue',
    path: ['expiryDate']
  });

type DBSFormValues = z.infer<typeof dbsCertificateSchema>;

export default function DBSDetailsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>([]);

  // --- FILE UPLOAD STATE ---
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const form = useForm<DBSFormValues>({
    resolver: zodResolver(dbsCertificateSchema),
    defaultValues: {
      disclosureNumber: ''
    }
  });
  const { id } = useParams();

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await axiosInstance.get(
        `/application-job?applicantId=${id}`
      );
      const userStatusRes = await axiosInstance.get(`/users/${id}`);

      setIsAlreadySubmitted(userStatusRes.data.data.dbsDone);
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

  // --- FILE HANDLERS ---
  const validateFile = (file: File): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be less than 5MB.');
      return false;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (!validateFile(file)) return;

    setFileToUpload(file);
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('entityId', id);
    formData.append('file_type', 'dbsCertificate');
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', formData);
      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error('No file URL returned');
      setUploadedFileUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Upload failed. Please try again.');
      setFileToUpload(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission if inside form
    setFileToUpload(null);
    setUploadedFileUrl(null);
    setUploadError(null);
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // --- SUBMIT ---
  const onSubmit = async (data: DBSFormValues) => {
    if (!uploadedFileUrl) {
      setUploadError('Please upload the DBS certificate document.');
      return;
    }

    setSubmitting(false);

    try {
      const payload = {
        userId: id,
        name: `${userData?.applicantId?.firstName} ${userData?.applicantId?.initial || ''} ${userData?.applicantId?.lastName}`,
        jobPost: userData?.jobId?.jobTitle,
        dbsDocumentUrl: uploadedFileUrl,
        ...data
      };

      await axiosInstance.post('/dbs-form', payload);
      await axiosInstance.patch(`/users/${id}`, { dbsDone: true });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting DBS form:', error);
    } finally {
      setSubmitting(true);
    }
  };

  // --- RENDERING ---

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
            You have already completed the DBS Certificate.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate('/dashboard')}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 ">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">
            Thank You!
          </CardTitle>
          <CardDescription className="text-2xl text-black mb-6">
            The DBS certificate details have been successfully completed.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate('/dashboard')}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="l w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-watney">
              <div className="flex flex-row items-center justify-between">
                <div>DBS Certificate Details</div>
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
              Please enter the details found on your physical DBS certificate.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="mb-6 flex w-full flex-col items-start justify-start gap-8 md:flex-row md:items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Name
                </p>
                <h1 className="text-lg font-semibold text-gray-900 ">
                  {userData?.applicantId?.firstName}{' '}
                  {userData?.applicantId?.initial}{' '}
                  {userData?.applicantId?.lastName}
                </h1>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Post
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {userData?.jobId?.jobTitle}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* --- Main Grid for Inputs AND Upload --- */}
                <div className="grid grid-cols-1 gap-8 align-top md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="disclosureNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          <div>
                            Disclosure Number{' '}
                            <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. 001944289378"
                            className="h-12 text-lg tracking-wide"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mb-1 text-base">
                          <div>
                            Date of Issue{' '}
                            <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="e.g. 15/10/2025"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mb-1 flex items-center gap-2 text-base">
                          <div>
                            Expiry Date <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="e.g. 15/10/2028"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="mb-1 block text-base font-medium">
                      Certificate Document{' '}
                      <span className="text-red-500">*</span>
                    </Label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />

                    {/* State 1: File is available - Show Document Card */}
                    {uploadedFileUrl ? (
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all animate-in fade-in slide-in-from-bottom-2 hover:border-watney/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="rounded  bg-white p-2">
                            <FileText className="h-6 w-6 text-watney" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {fileToUpload?.name || 'Uploaded Certificate'}
                            </p>
                            <a
                              href={uploadedFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-3 w-3" /> View Document
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                          className="ml-2 shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : (
                      /* State 2: No file - Show Upload Dropzone */
                      <div
                        onClick={triggerFileInput}
                        className={`relative flex h-full min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-all
                          ${
                            isUploading
                              ? 'border-blue-300 bg-blue-50'
                              : uploadError
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 bg-gray-50 hover:border-watney hover:bg-watney/5'
                          }
                        `}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center py-2">
                            <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm font-medium text-blue-700">
                              Uploading...
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-2">
                            <div className="mb-2 rounded-full bg-white p-2 shadow-sm">
                              <Upload className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              Click to upload
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              PDF, JPG or PNG (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || isUploading}
                    className="h-12 w-full min-w-[200px] bg-watney text-base text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? 'Saving...' : 'Submit'}
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
