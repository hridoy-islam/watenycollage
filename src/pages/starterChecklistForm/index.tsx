import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

// --- SCHEMA ---
const starterChecklistSchema = z
  .object({
      startDate: z.date({ required_error: 'Employment Start Date is required' }),
    gender: z.enum(['male', 'female'], {
      required_error: 'Please select your gender',
    }),
    employeeStatement: z.enum(['A', 'B', 'C'], {
      required_error: 'You must select one statement (A, B, or C)',
    }),
    hasStudentLoan: z.enum(['yes', 'no'], { required_error: 'Required' }),
    plan1: z.boolean().default(false),
    plan2: z.boolean().default(false),
    plan4: z.boolean().default(false),
    postgraduateLoan: z.boolean().default(false),
    declarationSigned: z
      .boolean()
      .default(false)
      .refine((val) => val === true, {
        message: 'You must sign the declaration to proceed',
      }),
  })
  .superRefine((data, ctx) => {
    if (data.hasStudentLoan === 'yes') {
      if (!data.plan1 && !data.plan2 && !data.plan4 && !data.postgraduateLoan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select at least one loan plan type',
          path: ['hasStudentLoan'],
        });
      }
    }
  });

type StarterChecklistValues = z.infer<typeof starterChecklistSchema>;

export default function StarterChecklistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const form = useForm<StarterChecklistValues>({
    resolver: zodResolver(starterChecklistSchema),
    defaultValues: {
       startDate: undefined,
      plan1: false,
      plan2: false,
      plan4: false,
      postgraduateLoan: false,
      declarationSigned: false,
    },
  });

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get(`/users/${id}`);
      const userData = res.data.data;

      if (userData.checkListDone) {
        setIsAlreadySubmitted(true);
      }

      setUser(userData);
   

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const onSubmit = async (data: StarterChecklistValues) => {
    if (!id) return;

    setSubmitting(true);
    try {
      const payload = {
        userId: id,
        firstName: user?.firstName,             
      lastName: user?.lastName,               
      dateOfBirth: user?.dateOfBirth,         
      address: user?.postalAddressLine1,      
      postcode: user?.postalPostCode,
      country: user?.postalCountry,    
      nationalInsuranceNumber: user?.nationalInsuranceNumber, 
        ...data,
      };

      await axiosInstance.post('/starter-checklist-form', payload);
      await axiosInstance.patch(`/users/${id}`, { checkListDone: true });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasStudentLoan = form.watch('hasStudentLoan');

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // --- Already Submitted ---
  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-red-500 p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-red-500">Form Already Submitted</CardTitle>
          <CardDescription className="mb-6">
            You have already completed the Starter Checklist.
          </CardDescription>
          <Button className="mx-auto" onClick={() => navigate('/dashboard')}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // --- Submission Success ---
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-3xl border-t-4 border-t-watney p-8 text-center shadow-lg">
          <CardTitle className="mb-4 text-3xl text-watney">Thank You!</CardTitle>
          <CardDescription className="mb-6 text-2xl text-black">
            Your Starter Checklist has been successfully submitted.
          </CardDescription>
          <Button className="mx-auto p-6 " onClick={() => navigate('/dashboard')}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  // Format DOB and ensure address/postcode
  const dob = user?.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString('en-GB')
    : '—';
  const address = user?.postalAddressLine1 || '—';
  const postcode = user?.postalPostCode || '—';
  const niNumber = user?.nationalInsuranceNumber || '—';
  const country = user?.postalCountry || '-'

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-watney">Employee Information</CardTitle>
              <Button
                className="border-none bg-watney text-white hover:bg-watney/90"
                onClick={() => navigate(-1)}
              >
                <MoveLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <CardDescription>
              Please complete the following details. This information is required by HMRC to ensure your tax code is
              correct.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 ">
            <div className='pb-6'>
              <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 md:grid-cols-6">
                <div className="mt-4 flex flex-col items-start md:mt-0">
                  <span className="mb-1 text-xs font-medium uppercase tracking-wide">First Name</span>
                  <span className="rounded bg-white/5 text-lg font-semibold">{user?.firstName || '—'}</span>
                </div>
                <div className="mt-4 flex flex-col items-start md:mt-0">
                  <span className="mb-1 text-xs font-medium uppercase tracking-wide">Last Name</span>
                  <span className="rounded bg-white/5 text-lg font-semibold">{user?.lastName || '—'}</span>
                </div>
               
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide">
                    National Insurance No.
                  </span>
                  <p className="rounded bg-white/5 text-lg font-semibold">{niNumber}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide">Date of Birth</span>
                  <p className="rounded bg-white/5 text-lg font-semibold">{dob}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide">Home Address</span>
                  <p className="rounded bg-white/5  py-2 text-lg font-semibold leading-snug">
                    {address}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide">Post Code</span>
                  <p className="rounded bg-white/5 text-lg font-semibold">{postcode}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide">Country</span>
                  <p className="rounded bg-white/5 text-lg font-semibold">{country}</p>
                </div>
              </div>
           
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
           {/* --- Gender & Employment Start Date --- */}
<section className="space-y-6">
  <h3 className="flex items-center border-b pb-2 text-xl font-bold text-gray-900">
    Additional Details
  </h3>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    {/* Gender */}
    <FormField
      control={form.control}
      name="gender"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium"><div>Gender <span className="text-red-500">*</span></div></FormLabel>
          <FormControl>
            <div className="flex gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gender-male"
                  checked={field.value === 'male'}
                  onCheckedChange={(checked) => checked && field.onChange('male')}
                  className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                />
                <label htmlFor="gender-male" className="cursor-pointer text-gray-700">
                  Male
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gender-female"
                  checked={field.value === 'female'}
                  onCheckedChange={(checked) => checked && field.onChange('female')}
                  className="data-[state=checked]:border-watney data-[state=checked]:bg-watney"
                />
                <label htmlFor="gender-female" className="cursor-pointer text-gray-700">
                  Female
                </label>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Employment Start Date */}
    <FormField
      control={form.control}
      name="startDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-base font-medium">
            <div>

            Employment Start Date <span className="text-red-500">*</span>
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
  </div>
</section>

                {/* Employee Statement */}
                <div className="space-y-4">
                  <h3 className="flex items-center border-b pb-2 text-lg font-semibold text-gray-900">
                    Employee Statement
                  </h3>
                  <p className="text-sm italic text-gray-500">
                    Choose the statement that applies to you (A, B or C).
                  </p>
                  <FormField
                    control={form.control}
                    name="employeeStatement"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormControl>
                          <div className="grid grid-cols-1 gap-4">
                            <label
                              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:border-watney ${
                                field.value === 'A'
                                  ? 'border-watney bg-watney/5 ring-1 ring-watney'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={field.value === 'A'}
                                  onCheckedChange={() => field.onChange('A')}
                                  className="mt-1 data-[state=checked]:bg-watney"
                                />
                                <div>
                                  <span className="font-bold text-gray-900">Statement A</span>
                                  <p className="mt-1 text-sm text-gray-600">
                                    This is my first job since last 6 April and I have not been receiving taxable
                                    Jobseeker's Allowance, Employment and Support Allowance, taxable Incapacity Benefit,
                                    State or Occupational Pension.
                                  </p>
                                </div>
                              </div>
                            </label>

                            <label
                              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:border-watney ${
                                field.value === 'B'
                                  ? 'border-watney bg-watney/5 ring-1 ring-watney'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={field.value === 'B'}
                                  onCheckedChange={() => field.onChange('B')}
                                  className="mt-1 data-[state=checked]:bg-watney"
                                />
                                <div>
                                  <span className="font-bold text-gray-900">Statement B</span>
                                  <p className="mt-1 text-sm text-gray-600">
                                    This is now my only job but since last 6 April I have had another job, or received
                                    taxable Jobseeker's Allowance, Employment and Support Allowance or taxable Incapacity
                                    Benefit. I do not receive a State or Occupational Pension.
                                  </p>
                                </div>
                              </div>
                            </label>

                            <label
                              className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:border-watney ${
                                field.value === 'C'
                                  ? 'border-watney bg-watney/5 ring-1 ring-watney'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={field.value === 'C'}
                                  onCheckedChange={() => field.onChange('C')}
                                  className="mt-1 data-[state=checked]:bg-watney"
                                />
                                <div>
                                  <span className="font-bold text-gray-900">Statement C</span>
                                  <p className="mt-1 text-sm text-gray-600">
                                    As well as my new job, I have another job or receive a State or Occupational
                                    Pension.
                                  </p>
                                </div>
                              </div>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Student Loans */}
                <div className="space-y-6">
                  <h3 className="flex items-center border-b pb-2 text-lg font-semibold text-gray-900">
                    Student Loans
                  </h3>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <FormField
                      control={form.control}
                      name="hasStudentLoan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-gray-900">
                            Do you have a student loan which is not fully repaid?
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-6 pt-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="loan-yes"
                                  checked={field.value === 'yes'}
                                  onCheckedChange={(checked) => {
                                    if (checked) field.onChange('yes');
                                    else if (field.value === 'yes') field.onChange(undefined);
                                  }}
                                  className="data-[state=checked]:bg-watney"
                                />
                                <label htmlFor="loan-yes" className="cursor-pointer font-medium">
                                  Yes
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="loan-no"
                                  checked={field.value === 'no'}
                                  onCheckedChange={(checked) => {
                                    if (checked) field.onChange('no');
                                    else if (field.value === 'no') field.onChange(undefined);
                                  }}
                                />
                                <label htmlFor="loan-no" className="cursor-pointer font-medium">
                                  No
                                </label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {hasStudentLoan === 'yes' && (
                    <div className="ml-4 space-y-4 border-l-2 border-watney/20 pl-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-medium text-gray-900">
                        To avoid repaying more than you need to, tick the correct Student Loans that you have:
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="plan1"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">Plan 1</FormLabel>
                                <p className="text-xs text-gray-500">
                                  Lived in UK/England/Wales & started before 1 Sept 2012
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plan2"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">Plan 2</FormLabel>
                                <p className="text-xs text-gray-500">
                                  Lived in England/Wales & started on/after 1 Sept 2012
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plan4"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">Plan 4</FormLabel>
                                <p className="text-xs text-gray-500">Lived in Scotland & applied through SAAS</p>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postgraduateLoan"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">Postgraduate Loan</FormLabel>
                                <p className="text-xs text-gray-500">
                                  Master's/Doctoral course (England/Wales)
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Declaration */}
                <div className="space-y-4 border-t pt-6">
                  <FormField
                    control={form.control}
                    name="declarationSigned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg bg-gray-50 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-2 leading-none">
                          <FormLabel className="text-base font-medium leading-relaxed">Declaration</FormLabel>
                          <CardDescription>
                            I confirm that the information I have given on this form is correct.
                          </CardDescription>
                          <FormMessage />
                        </div>
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
                    {submitting ? 'Submitting...' : 'Complete Checklist'}
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