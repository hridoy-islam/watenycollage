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

// --- Schema ---
const bankDetailsSchema = z.object({
  houseNumber: z.string().min(1, 'House number is required'), // now required
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

export default function BankDetailsForm() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(true);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
      const userRes = await axiosInstance.get(`/users/${id}`);
      const userData = userRes.data.data;

      const appRes = await axiosInstance.get(
        `/application-job?applicantId=${id}`
      );
      const appData = appRes.data.data.result[0];

      setIsAlreadySubmitted(userData.bankDetailsDone === true);
      setUser(userData);
      setApplication(appData);

      // Pre-fill houseNumber if already exists (e.g., from previous partial save)
      if (userData.houseNumber) {
        form.setValue('houseNumber', userData.houseNumber);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      const payload = {
        userId: id,
        name: [user.firstName, user.initial || '', user.lastName]
          .filter(Boolean)
          .join(' '),
        jobPost: application?.jobId?.jobTitle || '',
        address: user.postalAddressLine1 || '',
        postcode: user.postalPostCode || '',

        ...data
      };

      await axiosInstance.post('/bank-details', payload);
      await axiosInstance.patch(`/users/${id}`, {
        bankDetailsDone: true,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting bank details:', error);
      alert('Failed to save bank details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // Already submitted
  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">
            Form Already Submitted
          </CardTitle>
          <CardDescription className="mb-6">
            You have already submitted your bank details.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate('/dashboard')}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // Success
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">
           Thank you!
          </CardTitle>
          <CardDescription className="text-xl text-black pb-4">
           Your bank details have been securely received.
          </CardDescription>
          <Button className="mx-auto p-6" onClick={() => navigate('/dashboard')}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  // Format full name
  const fullName = [user?.firstName, user?.initial, user?.lastName]
    .filter(Boolean)
    .join(' ');
  const jobTitle = application?.jobId?.jobTitle || '—';
  const address = user?.postalAddressLine1 || '—';
  const postcode = user?.postalPostCode || '—';

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
                  <h2 className="text-lg font-semibold">{address}</h2>
                </div>
                <div>
                  <span className="mb-1 block text-xs uppercase tracking-wide text-black">
                    Post Code
                  </span>
                  <h2 className="text-lg font-semibold">{postcode}</h2>
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
                            Name of BanK <span className="text-red-500">*</span>
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
