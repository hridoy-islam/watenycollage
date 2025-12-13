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
import { useToast } from '@/components/ui/use-toast';

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

export default function EditStarterChecklistForm() {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [checklistId, setChecklistId] = useState<string | null>(null); // To store existing form ID
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

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
      // 1. Fetch User Data (for read-only display)
      const userRes = await axiosInstance.get(`/users/${id}`);
      const userData = userRes.data.data;
      setUser(userData);

      // 2. Fetch Existing Checklist Data (for Edit Mode)
      let existingData = null;
      try {
        const formRes = await axiosInstance.get(`/starter-checklist-form?userId=${id}`);
        if (formRes.data && formRes.data.data) {
           // Handle potential array vs object response
           existingData = Array.isArray(formRes.data.data.result)
             ? formRes.data.data.result[0]
             : (Array.isArray(formRes.data.data) ? formRes.data.data[0] : formRes.data.data);
        }
      } catch (err) {
        console.log("No existing checklist found, defaults will be used.");
      }

      // 3. Pre-fill Form if data exists
      if (existingData) {
        setChecklistId(existingData._id); // Store ID for PATCH

        form.reset({
          startDate: existingData.startDate ? new Date(existingData.startDate) : undefined,
          gender: existingData.gender,
          employeeStatement: existingData.employeeStatement,
          hasStudentLoan: existingData.hasStudentLoan,
          plan1: existingData.plan1 || false,
          plan2: existingData.plan2 || false,
          plan4: existingData.plan4 || false,
          postgraduateLoan: existingData.postgraduateLoan || false,
          declarationSigned: true, // Assuming if it exists, they signed it previously
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to load information.',
        variant: 'destructive',
      });
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

      if (checklistId) {
        // ✅ UPDATE (PATCH)
        await axiosInstance.patch(`/starter-checklist-form/${checklistId}`, payload);
        toast({
            title: 'Success',
            description: 'Starter Checklist updated successfully.',
        });
      } else {
        // ✅ CREATE (POST)
        await axiosInstance.post('/starter-checklist-form', payload);
        toast({
            title: 'Success',
            description: 'Starter Checklist submitted successfully.',
            className: 'bg-green-600 text-white',
        });
      }
      
      // Always update user status
      await axiosInstance.patch(`/users/${id}`, { checkListDone: true });
      
      navigate(-1);

    } catch (error: any) {
      console.error('Submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: error?.response?.data?.message || 'Could not submit the checklist. Please try again.',
        variant: 'destructive',
      });
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

  // Format DOB and ensure address/postcode
  const dob = user?.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString('en-GB')
    : '—';
  const address = user?.postalAddressLine1 || '—';
  const postcode = user?.postalPostCode || '—';
  const niNumber = user?.nationalInsuranceNumber || '—';
  const country = user?.postalCountry || '-';

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

          <CardContent className="p-8">
            
            <div className='pb-6'>
              <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 md:grid-cols-6">
                <div className="mt-4 flex flex-col items-start md:mt-0">
                  <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">First Name</span>
                  <span className="rounded  py-1 text-lg font-semibold text-gray-800">{user?.firstName || '—'}</span>
                </div>
                <div className="mt-4 flex flex-col items-start md:mt-0">
                  <span className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Last Name</span>
                  <span className="rounded  py-1 text-lg font-semibold text-gray-800">{user?.lastName || '—'}</span>
                </div>
                
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    National Insurance No.
                  </span>
                  <p className="rounded  py-1 text-lg font-semibold text-gray-800">{niNumber}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Date of Birth</span>
                  <p className="rounded  py-1 text-lg font-semibold text-gray-800">{dob}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Home Address</span>
                  <p className="rounded  py-1 text-lg font-semibold leading-snug text-gray-800">
                    {address}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Post Code</span>
                  <p className="rounded  py-1 text-lg font-semibold text-gray-800">{postcode}</p>
                </div>
                <div>
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Country</span>
                  <p className="rounded  py-1 text-lg font-semibold text-gray-800">{country}</p>
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
                            {['A', 'B', 'C'].map((option) => (
                              <label
                                key={option}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:border-watney ${
                                  field.value === option
                                    ? 'border-watney bg-watney/5 ring-1 ring-watney'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={field.value === option}
                                    onCheckedChange={() => field.onChange(option)}
                                    className="mt-1 data-[state=checked]:bg-watney"
                                  />
                                  <div>
                                    <span className="font-bold text-gray-900">Statement {option}</span>
                                    <p className="mt-1 text-sm text-gray-600">
                                      {option === 'A' && "This is my first job since last 6 April and I have not been receiving taxable Jobseeker's Allowance, Employment and Support Allowance, taxable Incapacity Benefit, State or Occupational Pension."}
                                      {option === 'B' && "This is now my only job but since last 6 April I have had another job, or received taxable Jobseeker's Allowance, Employment and Support Allowance or taxable Incapacity Benefit. I do not receive a State or Occupational Pension."}
                                      {option === 'C' && "As well as my new job, I have another job or receive a State or Occupational Pension."}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            ))}
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
                                <label htmlFor="loan-yes" className="cursor-pointer font-medium">Yes</label>
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
                                <label htmlFor="loan-no" className="cursor-pointer font-medium">No</label>
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
                                <p className="text-xs text-gray-500">Lived in UK/England/Wales & started before 1 Sept 2012</p>
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
                                <p className="text-xs text-gray-500">Lived in England/Wales & started on/after 1 Sept 2012</p>
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
                                <p className="text-xs text-gray-500">Master's/Doctoral course (England/Wales)</p>
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
                    {submitting ? 'Submitting...' : checklistId ? 'Update Checklist' : 'Complete Checklist'}
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