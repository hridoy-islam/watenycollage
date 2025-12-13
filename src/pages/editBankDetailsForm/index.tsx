import { useState, useEffect } from 'react';
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
import { MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';

// --- Schema ---
const bankDetailsSchema = z.object({
  houseNumber: z.string().min(1, 'House number is required'),
  bankName: z.string().min(1, 'Bank Name is required'),
  bankAddress: z.string().min(1, 'Bank Address is required'),
  accountName: z.string().min(1, 'Account Name is required'),
  sortCode: z.string().regex(/^\d{2}-?\d{2}-?\d{2}$/, {
    message: 'Sort code must be in format XX-XX-XX'
  }),
  accountNumber: z.string().min(1, 'Account Number is required'),
  buildingSocietyRollNumber: z.string().optional()
});

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>;

export default function EditBankDetailsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [bankDetailsId, setBankDetailsId] = useState<string | null>(null); // State for ID
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      houseNumber: '',
      bankName: '',
      bankAddress: '',
      accountName: '',
      sortCode: '',
      accountNumber: '',
      buildingSocietyRollNumber: ''
    }
  });

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch User Data
      const userRes = await axiosInstance.get(`/users/${id}`);
      const userData = userRes.data.data;
      setUser(userData);

      // 2. Fetch Application Data
      const appRes = await axiosInstance.get(
        `/application-job?applicantId=${id}`
      );
      const appData = appRes.data.data.result[0];
      setApplication(appData);

      // 3. Fetch Existing Bank Details
      let existingBankData = null;
      try {
        const bankRes = await axiosInstance.get(`/bank-details?userId=${id}`);
        if (bankRes.data && bankRes.data.data) {
           // Handle potential array response structure
           existingBankData = Array.isArray(bankRes.data.data.result)
             ? bankRes.data.data.result[0]
             : (Array.isArray(bankRes.data.data) ? bankRes.data.data[0] : bankRes.data.data);
        }
      } catch (err) {
        console.log("No existing bank details found, defaults will be used.");
      }

      if (existingBankData) {
        // Store ID for PATCH request
        setBankDetailsId(existingBankData._id);

        // Pre-fill form with existing data
        form.reset({
          houseNumber: existingBankData.houseNumber || '',
          bankName: existingBankData.bankName || '',
          bankAddress: existingBankData.bankAddress || '',
          accountName: existingBankData.accountName || '',
          sortCode: existingBankData.sortCode || '',
          accountNumber: existingBankData.accountNumber || '',
          buildingSocietyRollNumber: existingBankData.buildingSocietyRollNumber || ''
        });
      } else {
        // Fallback: Pre-fill specific fields from user profile if no bank details exist
        if (userData.houseNumber) {
          form.setValue('houseNumber', userData.houseNumber);
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: error?.response?.data?.message || 'Failed to load data.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onSubmit = async (data: BankDetailsFormValues) => {
    if (!id) return;

    setSubmitting(true);
    try {
      // Construct payload
      const payload = {
        userId: id,
        name: [user?.firstName, user?.initial || '', user?.lastName]
          .filter(Boolean)
          .join(' '),
        jobPost: application?.jobId?.jobTitle || '',
        address: user?.postalAddressLine1 || '',
        postcode: user?.postalPostCode || '',
        ...data
      };

      if (bankDetailsId) {
        // ✅ UPDATE: Use PATCH with the fetched ID
        await axiosInstance.patch(`/bank-details/${bankDetailsId}`, payload);
      } else {
        // CREATE: Fallback to POST if no ID was found (first time submission)
        await axiosInstance.post('/bank-details', payload);
      }

      // Update user status
      await axiosInstance.patch(`/users/${id}`, {
        bankDetailsDone: true,
      });

      toast({
        title: 'Bank details saved successfully.',
      });
      
      // Optional: delay navigation slightly so user sees toast
      setTimeout(() => navigate(-1), 500);

    } catch (error: any) {
      console.error('Error submitting bank details:', error);
      toast({
        title: error?.response?.data?.message || 'Failed to save bank details.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // Format display data
  const fullName = [user?.firstName, user?.initial, user?.lastName]
    .filter(Boolean)
    .join(' ');
  const jobTitle = application?.jobId?.jobTitle || '—';
  const addressVal = user?.postalAddressLine1 || '—';
  const postcodeVal = user?.postalPostCode || '—';

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-watney">
                Bank Account Details
              </CardTitle>
              <Button
                className="border-none bg-watney text-white hover:bg-watney/90"
                onClick={() => navigate(-1)}
              >
                <MoveLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <CardDescription>
              Please provide the bank details where you would like your salary
              to be paid.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Personal Info Section */}
            <div className="pb-8 text-black">
              <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 md:grid-cols-4">
                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-black">
                    Name
                  </span>
                  <h2 className="text-lg font-semibold">{fullName}</h2>
                </div>
                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-black">
                    Job Post
                  </span>
                  <h2 className="text-lg font-semibold">{jobTitle}</h2>
                </div>

                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-black">
                    Address
                  </span>
                  <h2 className="text-lg font-semibold">{addressVal}</h2>
                </div>
                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-black">
                    Post Code
                  </span>
                  <h2 className="text-lg font-semibold">{postcodeVal}</h2>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form {...form}>
                  <form className="space-y-0">
                    <FormField
                      control={form.control}
                      name="houseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div>
                              House No.<span className="text-red-500">*</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. 42 or Rose Cottage"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            </div>

            {/* Bank Details Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div>
                            Name of Bank <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Barclays, HSBC" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div>
                            Account Holder Name{' '}
                            <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Name as it appears on card"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div>
                            Bank Address <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Branch address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div>
                            Sort Code <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="00-00-00"
                            maxLength={8}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, ''); // remove non-numeric
                              if (value.length > 4)
                                value = value.replace(
                                  /(\d{2})(\d{2})(\d+)/,
                                  '$1-$2-$3'
                                );
                              else if (value.length > 2)
                                value = value.replace(/(\d{2})(\d+)/, '$1-$2');
                              field.onChange(value); // send formatted value to form
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div>
                            Account Number{' '}
                            <span className="text-red-500">*</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="please enter your bank number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buildingSocietyRollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Building Society Roll Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Reference number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full min-w-[200px] bg-watney text-white hover:bg-watney/90 md:w-auto"
                  >
                    {submitting ? 'Saving...' : 'Save Bank Details'}
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