import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Edit2,
  Plus,
  Loader2,
  Check,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

interface TConsent {
  _id: string;
  userId: string;
  title: string;
}

// --- Strict Zod Schema ---
const formSchema = z.object({
  signNow: z.boolean().default(false),
  documentUrl: z.string().optional(),
  reviewPeriod: z.string({
    required_error: "Please select a review period",
    invalid_type_error: "Review period is required"
  }).min(1, "Review period is required"),
  nextReviewDate: z.date({
    required_error: "Next review date is required",
    invalid_type_error: "Please select a valid date",
  }),
}).superRefine((data, ctx) => {
  // Conditional Validation: If Sign Now is checked, Document URL is MANDATORY
  if (data.signNow && !data.documentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "You must upload a signature document when signing now.",
      path: ["documentUrl"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function EditConsentFormPage() {
  const navigate = useNavigate();
  // Expecting route: /users/:id/edit-consent-form/:consentId
  const { suid: userId, consentId } = useParams();

  // Data State
  const [consents, setConsents] = useState<TConsent[]>([]);
  const [selectedConsentId, setSelectedConsentId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState('');

  // Custom Entry & Edit State
  const [isCustomEntryOpen, setIsCustomEntryOpen] = useState(false);
  const [newConsentTitle, setNewConsentTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- React Hook Form ---
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signNow: false,
      reviewPeriod: undefined,
      nextReviewDate: undefined,
    },
  });

  const signNow = watch("signNow");
  const reviewPeriod = watch("reviewPeriod");
  const documentUrl = watch("documentUrl");

  // --- 1. Fetch Consent Statements (Sidebar List) ---
  const fetchConsents = async () => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/statements?userId=${userId}&type=consent&limit=all`);
      if (res.data?.data?.result) {
        setConsents(res.data.data.result);
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load consent types.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [userId]);

  // --- 2. Fetch Existing Form Data (To Edit) ---
  useEffect(() => {
    const fetchFormData = async () => {
      if (!consentId) return;
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/consent-form/${consentId}`);
        const data = res.data?.data;

        if (data) {
          setFormTitle(data.title);
          setSelectedConsentId(data.statementId); // Pre-select the sidebar item
          
          // Pre-fill form
          reset({
            signNow: data.signatureOption === 'now',
            documentUrl: data.signature || undefined,
            reviewPeriod: data.reviewPeriod,
            nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
          });
        }
      } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to load form details.', variant: 'destructive' });
        navigate(-1); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [consentId, navigate, reset]);

  // --- Sidebar Operations ---
  const handleCreateConsent = async () => {
    if (!newConsentTitle.trim() || !userId) return;
    try {
      await axiosInstance.post(`/statements`, { userId, title: newConsentTitle, type: 'consent' });
      toast({ title: 'Success', description: 'New consent category added.' });
      setNewConsentTitle('');
      setIsCustomEntryOpen(false);
      fetchConsents();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create consent.', variant: 'destructive' });
    }
  };

  const handleUpdateConsent = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await axiosInstance.patch(`/statements/${id}`, { title: editTitle });
      toast({ title: 'Updated', description: 'Consent category updated.' });
      setEditingId(null);
      fetchConsents();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update consent.', variant: 'destructive' });
    }
  };

  // --- Date Calculation ---
  const handlePeriodChange = (newPeriod: string) => {
    setValue("reviewPeriod", newPeriod);
    
    if (newPeriod && newPeriod !== 'custom') {
      const date = moment();
      if (newPeriod === '3months') date.add(3, 'months');
      else if (newPeriod === '6months') date.add(6, 'months');
      else if (newPeriod === '1year') date.add(1, 'year');
      setValue("nextReviewDate", date.toDate(), { shouldValidate: true });
    }
  };

  // --- File Upload Logic ---
  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!validateFile(file)) return;

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('entityId', userId);
    formData.append('file_type', 'serviceUserDoc');
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', formData);
      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error('No file URL');
      setValue("documentUrl", url, { shouldValidate: true });
    //   toast({ title: 'Success', description: 'File uploaded successfully.' });
    } catch (err) {
      setUploadError('Upload failed.');
      setValue("documentUrl", undefined);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSelectedFile = () => {
    setValue("documentUrl", undefined);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  // --- Update Handler ---
  const onSubmit = async (data: FormValues) => {
    if (!consentId || !selectedConsentId) {
      toast({ title: "Error", description: "Invalid form state", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);

    const currentStatement = consents.find(c => c._id === selectedConsentId);

    const payload = {
      statementId: selectedConsentId,
      title: currentStatement?.title || formTitle,
      type: 'consent',
      signatureOption: data.signNow ? 'now' : 'later',
      signature: data.documentUrl,
      reviewPeriod: data.reviewPeriod,
      nextReviewDate: moment(data.nextReviewDate).toISOString(),
    };

    try {
      await axiosInstance.patch(`/consent-form/${consentId}`, payload);
      toast({ title: 'Updated', description: 'Consent form updated successfully.' });
      navigate(-1);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update form.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div >
      <div className="mx-auto  space-y-6">
        
        {/* Header */}
        <div className="flex justify-end">
          <Button onClick={() => navigate(-1)} >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Sidebar: List of Consents */}
          <div className="lg:col-span-4">
            <Card className="h-full border-none shadow-md overflow-y-auto">
              <CardHeader>
                <CardTitle>Consent Types</CardTitle>
                <CardDescription>Select a consent type to assign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="custom-scrollbar max-h-[500px] space-y-2 overflow-y-auto pr-2">
                  {consents.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No types found.</p>
                  ) : (
                    consents.map((consent) => (
                      <div
                        key={consent._id}
                        className={`group flex cursor-pointer items-center justify-between rounded-md border border-gray-300 p-3 transition-all ${
                          selectedConsentId === consent._id
                            ? 'ring-1 ring-gray-300 bg-gray-50'
                            : 'bg-white'
                        }`}
                        onClick={() => setSelectedConsentId(consent._id)}
                      >
                        {editingId === consent._id ? (
                          <div className="flex w-full items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateConsent(consent._id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Checkbox
                                id={consent._id}
                                checked={selectedConsentId === consent._id}
                                onCheckedChange={(checked) => setSelectedConsentId(checked ? consent._id : null)}
                              />
                              <label htmlFor={consent._id} className="pointer-events-none cursor-pointer truncate text-sm font-medium">
                                {consent.title}
                              </label>
                            </div>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingId(consent._id); setEditTitle(consent.title); }}>
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Dialog open={isCustomEntryOpen} onOpenChange={setIsCustomEntryOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" ><Plus className="mr-2 h-4 w-4" /> Custom Entry</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add New Consent Type</DialogTitle></DialogHeader>
                    <div className="py-4">
                      <Label>Title</Label>
                      <Input value={newConsentTitle} onChange={(e) => setNewConsentTitle(e.target.value)} className="mt-2" />
                    </div>
                    <DialogFooter><Button onClick={handleCreateConsent}>Save</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <Card className="min-h-[600px] border-none shadow-md">
              <CardContent className="p-8">
                {selectedConsentId ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {consents.find(c => c._id === selectedConsentId)?.title || formTitle}
                      </h2>
                      <p className="text-muted-foreground text-sm">Edit details for this consent record.</p>
                    </div>

                    {/* Signature Section */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-semibold"><Edit2 className="h-4 w-4" /> Signature</h3>
                      <div className="rounded-lg border border-gray-300 bg-gray-50/50 p-4">
                        <div className="mb-4 flex items-center space-x-2">
                          <Controller
                            name="signNow"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id="sign-check"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label htmlFor="sign-check" className="cursor-pointer font-semibold">Sign this document now?</Label>
                        </div>

                        {signNow && (
                          <div className="rounded-md border border-gray-300 bg-white p-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                              <Label className="block text-sm font-medium">Upload Document <span className="text-red-500">*</span></Label>
                              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" disabled={isUploading} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                              
                              <div onClick={triggerFileInput} className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${isUploading ? 'cursor-wait border-blue-300 bg-blue-50' : documentUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-100'}`}>
                                {isUploading ? (
                                  <><Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-500" /><p className="text-sm font-medium text-blue-700">Uploading...</p></>
                                ) : documentUrl ? (
                                  <>
                                    <CheckCircle className="mb-2 h-8 w-8 text-green-500" />
                                    <p className="text-sm font-medium text-green-700">File Attached</p>
                                    <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRemoveSelectedFile(); }} className="mt-3 h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">Remove / Change File</Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="mb-2 rounded-full bg-white p-2 shadow-sm"><Upload className="h-6 w-6 text-gray-400" /></div>
                                    <p className="text-sm font-medium text-gray-900">Click to upload</p>
                                  </>
                                )}
                              </div>
                              {uploadError && <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> {uploadError}</div>}
                              {errors.documentUrl && <p className="text-xs text-red-500 font-medium">{errors.documentUrl.message}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Review Date */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-semibold"><CalendarIcon className="h-4 w-4" /> Review Schedule</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Period <span className="text-red-500">*</span></Label>
                          <div className="flex flex-col gap-2">
                            {['3months', '6months', '1year'].map((period) => (
                              <div key={period} className="flex items-center space-x-2">
                                <Controller
                                  name="reviewPeriod"
                                  control={control}
                                  render={({ field }) => (
                                    <Checkbox
                                      id={period}
                                      checked={field.value === period}
                                      onCheckedChange={(checked) => { if (checked) handlePeriodChange(period); }}
                                    />
                                  )}
                                />
                                <Label htmlFor={period} className="cursor-pointer">
                                  {period === '3months' ? '3 Months' : period === '6months' ? '6 Months' : '1 Year'}
                                </Label>
                              </div>
                            ))}
                          </div>
                          {errors.reviewPeriod && <p className="text-xs text-red-500 font-medium">{errors.reviewPeriod.message}</p>}
                        </div>
                        
                        <div className="space-y-2 md:w-1/2">
                          <Label>Next Review Date <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Controller
                              control={control}
                              name="nextReviewDate"
                              render={({ field }) => (
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date) => field.onChange(date)}
                                  dateFormat="dd MMM yyyy"
                                  className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  wrapperClassName="w-full"
                                  placeholderText="Select a date"
                                />
                              )}
                            />
                            <CalendarIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                          {errors.nextReviewDate && <p className="text-xs text-red-500 font-medium">{errors.nextReviewDate.message}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Update Form
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <p>Select a consent type from the sidebar to view or edit details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}