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
import { BlinkingDots } from '@/components/shared/blinking-dots';

// Types matching your Mongoose Model references
interface TCapacity {
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
  // Conditional Validation: If 'now' is selected, signature/document is required
  if (data.signNow && !data.documentUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "You must upload a signature document when signing now.",
      path: ["documentUrl"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function AddCapacityFormPage() {
  const navigate = useNavigate();
  const { suid:id } = useParams();
  const userId = id;

  // Data State
  const [capacities, setCapacities] = useState<TCapacity[]>([]);
  const [selectedCapacityId, setSelectedCapacityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Entry & Edit State
  const [isCustomEntryOpen, setIsCustomEntryOpen] = useState(false);
  const [newCapacityTitle, setNewCapacityTitle] = useState('');
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
    },
  });

  const signNow = watch("signNow");
  const reviewPeriod = watch("reviewPeriod");
  const documentUrl = watch("documentUrl");

  // --- API Calls ---
  const fetchCapacities = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/statements?userId=${userId}&limit=all&type=capacity`);
      if (res.data?.data?.result) {
        setCapacities(res.data.data.result);
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load capacity types.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacities();
  }, [userId]);

  // Reset form when changing selection
  useEffect(() => {
    if (selectedCapacityId) {
      reset({
        signNow: false,
        documentUrl: undefined,
        reviewPeriod: undefined,
        nextReviewDate: undefined
      });
      setUploadError(null);
    }
  }, [selectedCapacityId, reset]);

  // --- Date Calculation ---
  useEffect(() => {
    if (reviewPeriod && reviewPeriod !== 'custom') {
      const date = moment();
      if (reviewPeriod === '3months') date.add(3, 'months');
      else if (reviewPeriod === '6months') date.add(6, 'months');
      else if (reviewPeriod === '1year') date.add(1, 'year');
      setValue("nextReviewDate", date.toDate(), { shouldValidate: true });
    }
  }, [reviewPeriod, setValue]);

  // --- Custom Capacity Operations ---
  const handleCreateCapacity = async () => {
    if (!newCapacityTitle.trim() || !userId) return;
    try {
      await axiosInstance.post(`/statements`, { userId, title: newCapacityTitle,type: 'capacity' });
      toast({ title: 'Success', description: 'New capacity statement added.' });
      setNewCapacityTitle('');
      setIsCustomEntryOpen(false);
      fetchCapacities();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create capacity.', variant: 'destructive' });
    }
  };

  const handleUpdateCapacity = async (capacityId: string) => {
    if (!editTitle.trim()) return;
    try {
      await axiosInstance.patch(`/statements/${capacityId}`, { title: editTitle });
      toast({ title: 'Updated', description: 'Capacity statement updated.' });
      setEditingId(null);
      fetchCapacities();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update capacity.', variant: 'destructive' });
    }
  };

  // --- File Logic ---
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
      // toast({ title: 'Success', description: 'Signature file uploaded.' });
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

  // --- Submit ---
  const onSubmit = async (data: FormValues) => {
    if (!selectedCapacityId || !userId) {
      toast({ title: "Error", description: "No capacity selected or invalid user.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const selectedCapacity = capacities.find((c) => c._id === selectedCapacityId);

    // Payload mapped exactly to your Mongoose Schema
    const payload = {
      userId,
      statementId: selectedCapacityId, // Maps to 'statementId' in schema
      title: selectedCapacity?.title || 'Untitled',
      type: 'capacity', // Matches enum ['consent', 'capacity']
      signatureOption: data.signNow ? 'now' : 'later', // Matches enum ['now', 'later']
      signature: data.documentUrl, // Maps to 'signature' in schema
      reviewPeriod: data.reviewPeriod,
      nextReviewDate: moment(data.nextReviewDate).toISOString(),
    };

    try {
      await axiosInstance.post(`/consent-form`, payload);
      toast({ title: 'Success', description: 'Capacity form saved.' });
      navigate(-1);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save form.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => navigate(-1)} >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="h-full border-none shadow-md">
              <CardHeader>
                <CardTitle>Capacity Statements</CardTitle>
                <CardDescription>Select a statement type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="custom-scrollbar max-h-[500px] space-y-2 overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex justify-center p-4">
              <BlinkingDots size="large" color="bg-theme" />
                    </div>
                  ) : capacities.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No statements found.</p>
                  ) : (
                    capacities.map((cap) => (
                      <div
                        key={cap._id}
                        className={`group flex cursor-pointer items-center justify-between rounded-md border border-gray-300 p-3 transition-all ${
                          selectedCapacityId === cap._id ? 'ring-1 ring-gray-300 bg-gray-50' : 'bg-white'
                        }`}
                        onClick={() => setSelectedCapacityId(cap._id)}
                      >
                        {editingId === cap._id ? (
                          <div className="flex w-full items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8 text-sm" autoFocus />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdateCapacity(cap._id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Checkbox id={cap._id} checked={selectedCapacityId === cap._id} onCheckedChange={(checked) => setSelectedCapacityId(checked ? cap._id : null)} />
                              <label htmlFor={cap._id} className="pointer-events-none cursor-pointer truncate text-sm font-medium">{cap.title}</label>
                            </div>
                            <Button size="icon"  onClick={(e) => { e.stopPropagation(); setEditingId(cap._id); setEditTitle(cap.title); }}>
                              <Edit2 className="h-4 w-4" />
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
                    <DialogHeader><DialogTitle>Add Capacity Statement</DialogTitle></DialogHeader>
                    <div className="py-4"><Label>Title</Label><Input value={newCapacityTitle} onChange={(e) => setNewCapacityTitle(e.target.value)} className="mt-2" /></div>
                    <DialogFooter><Button onClick={handleCreateCapacity}>Save</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <Card className="min-h-[600px] border-none shadow-md">
              <CardContent className="p-8">
                {selectedCapacityId ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                      <h2 className="text-2xl font-bold">{capacities.find((c) => c._id === selectedCapacityId)?.title}</h2>
                    </div>

                    {/* File & Sign */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 font-semibold"><Edit2 className="h-4 w-4" /> Signature</h3>
                      <div className="rounded-lg border border-gray-300 bg-gray-50/50 p-4">
                        <div className="mb-4 flex items-center space-x-2">
                          <Controller
                            name="signNow"
                            control={control}
                            render={({ field }) => (
                              <Checkbox id="sign-check" checked={field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                          <Label htmlFor="sign-check" className="cursor-pointer font-semibold">Sign this document now?</Label>
                        </div>

                        {signNow && (
                          <div className="rounded-md border border-gray-300 bg-white p-4 duration-200 animate-in fade-in zoom-in-95">
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
                                    <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRemoveSelectedFile(); }} className="mt-3 h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700">Remove File</Button>
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

                    {/* Date */}
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
                                    <Checkbox id={period} checked={field.value === period} onCheckedChange={(checked) => { if (checked) field.onChange(period); }} />
                                  )}
                                />
                                <Label htmlFor={period} className="cursor-pointer">{period === '3months' ? '3 Months' : period === '6months' ? '6 Months' : '1 Year'}</Label>
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
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Finish Form
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex h-[400px] flex-col items-center justify-center text-muted-foreground">
                    <div className="mb-4 rounded-full bg-gray-100 p-4"><Check className="h-8 w-8 text-gray-400" /></div>
                    <p>Select a statement type from the sidebar to begin.</p>
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