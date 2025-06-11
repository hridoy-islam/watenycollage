import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import ReactSelect from 'react-select';

const complianceSchema = z
  .object({
    startDateInUK: z.date({
      required_error: 'Please select the date'
    }),
    niNumber: z.string().optional(),
    ltrCode: z.string().optional(),
    immigrationStatus: z.string().min(1, { message: 'Please select status' }),
    disability: z.string().min(1, { message: 'Please select an option' }),
    disabilityDetails: z.string().optional(),

    criminalConviction: z.boolean({
      required_error: 'Please select an option'
    }),
    convictionDetails: z.string().optional(),

    studentFinance: z.string().min(1, { message: 'Please select an option' })
  })
  .superRefine((data, ctx) => {
    // Check if disability is "yes" and if disabilityDetails is provided

    if (data.disability === 'yes' && !data.disabilityDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Disability details are required when disability is "yes".',
        path: ['disabilityDetails']
      });
    }

    // Check if criminalConviction is "yes" and if convictionDetails is provided
    if (data.criminalConviction === true && !data.convictionDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Conviction details are required when criminal conviction is "yes".',
        path: ['convictionDetails']
      });
    }
  });

type ComplianceData = z.infer<typeof complianceSchema>;

export function ComplianceStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<ComplianceData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      startDateInUK: defaultValues?.startDateInUK
        ? new Date(defaultValues.startDateInUK)
        : undefined,
      niNumber: defaultValues?.niNumber || '',
      immigrationStatus: defaultValues?.immigrationStatus || '',
      ltrCode: defaultValues?.ltrCode || '',
      disability: defaultValues?.disability || '',
      disabilityDetails: defaultValues?.disabilityDetails || '',
   
      criminalConviction: defaultValues?.criminalConviction || false,
      convictionDetails: defaultValues?.convictionDetails || '',
      studentFinance: defaultValues?.studentFinance || ''
    }
  });

  const watchDisability = form.watch('disability');
  const watchCriminalConviction = form.watch('criminalConviction');

  function onSubmit(data: ComplianceData) {
    onSaveAndContinue(data);
  }

  // function handleSave() {
  //   const data = form.getValues();
  //   onSave(data);
  // }

  function handleBack() {
    setCurrentStep(5);
  }

  const visaOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const enteredUKOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const completedUKCourseOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const visaRefusalOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const statusOptions = [
    { value: 'uk-citizen', label: 'UK Citizen' },
    { value: 'eu-settled', label: 'EU Settled Status' },
    { value: 'eu-pre-settled', label: 'EU Pre-Settled Status' },
    { value: 'tier4', label: 'Tier 4 Student Visa' },
    { value: 'tier2', label: 'Tier 2 Work Visa' },
    { value: 'other', label: 'Other' }
  ];

  const disabilityOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const benefitsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const studentFinanceOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <h2 className="mb-6 text-2xl font-semibold">Miscellienious</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateInUK"
                render={({ field }) => {
                  const selectedDate = field.value
                    ? new Date(field.value)
                    : undefined;

                  return (
                    <FormItem className="mt-2 flex flex-col">
                      <FormLabel>
                        When did you first enter into the UK (MM/DD/YYYY)
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={selectedDate}
                          onChange={(date) => field.onChange(date)}
                          placeholder="Enter your entry date using the format DD/MM/YYYY."
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: 01/24/2022
                      </p>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="immigrationStatus"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Immigration Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={statusOptions}
                        placeholder="If you have one, please enter your NI number."
                        value={statusOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: UK Citizen, Tier 4 Student Visa, etc.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
                
                  <FormField
                    control={form.control}
                    name="niNumber"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col">
                        <FormLabel>National Insurance (NI) Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="If you have one, please enter your NI number."
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          />
                        </FormControl>

                        <p className="mt-1 text-xs text-gray-400">
                          Example: JM456789B
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ltrCode"
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col">
                        <FormLabel>
                          Please provide your LTR (Leave to Remain) Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Required if you have EU Settled or Pre-Settled Status."
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          />
                        </FormControl>

                        <p className="mt-1 text-xs text-gray-400">
                          Example: LTR123456789
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
             
          
              <FormField
                control={form.control}
                name="disability"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Do you have disability?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={disabilityOptions}
                        placeholder="Select Yes if you have a disability or require support."
                        value={disabilityOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes, No, Prefer not to say
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDisability === 'yes' && (
                <FormField
                  control={form.control}
                  name="disabilityDetails"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>
                        Disability Details{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide your disabiility details"
                          className="!placeholder:text-gray-500  border-gray-200 placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>

                      <p className="mt-1 text-xs text-gray-400">
                        Example: I have a visual impairment that affects my
                        ability to read small text.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Are you in receipt of any benefits?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={benefitsOptions}
                        placeholder="Select Yes if you are in receipt of government benefits."
                        value={benefitsOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes / No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="studentFinance"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Have you applied for Student Finance before?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={studentFinanceOptions}
                        placeholder="Indicate if you have previously applied for UK student finance."
                        value={studentFinanceOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes / No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criminalConviction"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Do you have any criminal conviction?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={[
                          { value: true, label: 'Yes' },
                          { value: false, label: 'No' }
                        ]}
                        placeholder="Please disclose any relevant criminal convictions as per UK law."
                        value={
                          field.value !== null
                            ? {
                                value: field.value,
                                label: field.value ? 'Yes' : 'No'
                              }
                            : null
                        }
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes / No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchCriminalConviction === true && (
                <FormField
                  control={form.control}
                  name="convictionDetails"
                  render={({ field }) => (
                    <FormItem className="col-span-2 flex w-full flex-col">
                      <FormLabel>
                        If yes, Criminal Convictions details
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide the details"
                          className="!placeholder:text-gray-500  border-gray-200 placeholder:text-xs placeholder:text-gray-500 "
                        />
                      </FormControl>

                      <p className="mt-1 text-xs text-gray-400">
                        Example: Convicted of a driving offence in 2022,
                        completed all legal requirements.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="bg-watney text-white hover:bg-watney/90"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="bg-watney text-white hover:bg-watney/90"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
