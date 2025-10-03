import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Select from 'react-select';

// Define job role options
const jobRoleOptions = [
  { value: 'Care Worker', label: 'Care Worker' },
  { value: 'Near Care Worker', label: 'Near Care Worker' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Healthcare Support Worker', label: 'Healthcare Support Worker' },
  { value: 'Healthcare Assistant', label: 'Healthcare Assistant' },
  { value: 'Auxiliary Nurse or Nursing Assistant', label: 'Auxiliary Nurse or Nursing Assistant' },
  { value: 'Nursing Supervisor', label: 'Nursing Supervisor' },
  { value: 'Registered Manager', label: 'Registered Manager' },
  { value: 'Other', label: 'Other' }
];

// Extract values for Zod enum validation
const jobRoleValues = jobRoleOptions.map(opt => opt.value) as [
  'Care Worker',
  'Near Care Worker',
  'Admin',
  'Healthcare Support Worker',
  'Healthcare Assistant',
  'Auxiliary Nurse or Nursing Assistant',
  'Nursing Supervisor',
  'Registered Manager',
  'Other'
];

// Schema for bank/payment details
const paymentSchema = z.object({
 
  accountNumber: z.string().min(1, 'Account Number is required'),
  sortCode: z.string().min(1, 'Sort code is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  branchName: z.string().optional(), // Made required since UI shows * 
  buildingSocietyRollNo: z.string().optional()
}).superRefine((data, ctx) => {
  // If "Other" is selected, require otherJobRole
  if (data.jobRole === 'Other' && !data.otherJobRole?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify your job role',
      path: ['otherJobRole']
    });
  }
});

// Infer form values type
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  setSubstep
}) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      
      accountNumber: defaultValues?.accountNumber || '',
      sortCode: defaultValues?.sortCode || '',
      bankName: defaultValues?.bankName || '',
      branchName: defaultValues?.branchName || '',
      buildingSocietyRollNo: defaultValues?.buildingSocietyRollNo || ''
    }
  });


  const onSubmit = (data: PaymentFormValues) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(14); // Adjust step number as needed
    setSubstep(9)
  };

 return (
  <Card className="border-none shadow-none">
    <CardHeader>
      <h2 className="text-2xl font-semibold">Payment Details</h2>
      <p className="text-lg text-gray-400">
        Please provide your bank or building society details for payment
        processing.
      </p>
    </CardHeader>
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Bank/Building Society Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Account Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="12345678"
                        className=""
                      />
                    </FormControl>
                    <p className="text-md text-gray-400">Account number</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Sort Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="12-34-56"
                        className=""
                      />
                    </FormControl>
                    <p className="text-md text-gray-400">Format: 12-34-56</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Bank Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Barclays Bank"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Branch Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Oxford Street Branch"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buildingSocietyRollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Building Society Roll No. (if applicable)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ROLL123456"
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className=" text-lg  bg-watney text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              className=" text-lg  bg-watney text-white hover:bg-watney/90"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
);

}