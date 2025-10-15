import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { HelperTooltip } from '@/helper/HelperTooltip';

// Zod Schema for Employment Form
const employmentSchema = z
  .object({
    isEmployed: z.string(),
    hasPreviousEmployment: z.string(),
    currentEmployment: z
      .object({
        employer: z.string().optional(),
        jobTitle: z.string().optional(),
        startDate: z.date().nullable().optional(),
        employmentType: z.string().optional(),
        responsibilities: z.string().optional()
      })
      .optional(),
    previousEmployments: z
      .array(
        z.object({
          employer: z.string({ required_error: 'Employer is required.' }),
          jobTitle: z.string({ required_error: 'Job title is required.' }),
          startDate: z.date().nullable().optional(),
          endDate: z.date().nullable().optional(),
          reasonForLeaving: z.string(),
          responsibilities: z.string()
        })
      )
      .optional(),
    hasEmploymentGaps: z.string().optional(),
    employmentGapsExplanation: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // Validate current employment if employed
    if (data.isEmployed === 'yes') {
      const current = data.currentEmployment;

      if (!current) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Current employment details are required.',
          path: ['currentEmployment']
        });
        return;
      }

      const requiredFields: Array<keyof typeof current> = [
        'employer',
        'jobTitle',
        'startDate',
        'employmentType',
        'responsibilities'
      ];

      requiredFields.forEach((field) => {
        if (!current[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
            path: ['currentEmployment', field]
          });
        }
      });
    }

    // Validate previous employment if applicable
    if (data.hasPreviousEmployment === 'yes') {
      if (!data.previousEmployments?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one previous employment entry is required.',
          path: ['previousEmployments']
        });
        return;
      }

      data.previousEmployments.forEach((job, index) => {
        const requiredFields: Array<keyof typeof job> = [
          'employer',
          'jobTitle',
          'startDate',
          'endDate',
          'reasonForLeaving',
          'responsibilities'
        ];

        requiredFields.forEach((field) => {
          if (
            (typeof job[field] === 'string' && !job[field]?.trim()) ||
            ((field === 'startDate' || field === 'endDate') &&
              !(job[field] instanceof Date))
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
              path: ['previousEmployments', index, field]
            });
          }
        });
      });
    }

    if (
      data.hasPreviousEmployment === 'yes' &&
      !data.hasEmploymentGaps?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify if there were employment gaps.',
        path: ['hasEmploymentGaps']
      });
    }

    if (
      data.hasEmploymentGaps === 'yes' &&
      !data.employmentGapsExplanation?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Explanation for employment gaps is required.',
        path: ['employmentGapsExplanation']
      });
    }
  });

type EmploymentData = z.infer<typeof employmentSchema>;

export function EmploymentStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}: any) {
  const form = useForm<EmploymentData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultValues || {
      isEmployed: '',
      hasPreviousEmployment: '',
      previousEmployments: [],
      hasEmploymentGaps: ''
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        currentEmployment: {
          ...defaultValues.currentEmployment,
          startDate: defaultValues.currentEmployment?.startDate
            ? new Date(defaultValues.currentEmployment.startDate)
            : undefined
        },
        previousEmployments:
          defaultValues.previousEmployments?.map((employment) => ({
            ...employment,
            startDate: employment.startDate
              ? new Date(employment.startDate)
              : undefined,
            endDate: employment.endDate
              ? new Date(employment.endDate)
              : undefined
          })) || []
      });
    }
  }, [defaultValues, form]);

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'previousEmployments'
  });

  const watchIsEmployed = form.watch('isEmployed');
  const watchHasGaps = form.watch('hasEmploymentGaps');

  const onSubmit = (data: EmploymentData) => {
    onSaveAndContinue(data);
  };

  // Initially show only the first question
  const [showFullForm, setShowFullForm] = React.useState(false);

  // Handle the initial employment status selection
  const handleEmploymentStatusChange = (value: string) => {
    form.setValue('isEmployed', value);
    setShowFullForm(true);
  };

  const currentlyEmployed = form.watch('isEmployed');

  useEffect(() => {
    if (form.watch('hasPreviousEmployment') === 'yes' && fields.length === 0) {
      append({
        employer: '',
        jobTitle: '',
        startDate: undefined,
        endDate: undefined,
        reasonForLeaving: '',
        responsibilities: ''
      });
    }
  }, [form.watch('hasPreviousEmployment')]);

  const employmentStatusOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const employmentTypeOptions = [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Self-Employed', label: 'Self-Employed' },
    { value: 'Casual', label: 'Casual' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  const contactPermissionOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const previousEmploymentOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const employmentGapOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  function handleBack() {
    setCurrentStep(4);
  }

  return (
  <Card className="border-none shadow-none">
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-8">
        <div>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Employment History
            </CardTitle>
            <CardDescription>
              Please provide your current and previous employment details.
              This information helps us understand your experience and
              assess your application more accurately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isEmployed"
              render={({ field }) => (
                <FormItem className="mt-2 flex flex-col max-w-md">
                  <FormLabel>
                    <div className="flex items-center gap-1">
                      Are you currently employed?
                      <span className="text-red-500">*</span>
                    </div>
<HelperTooltip text="Select 'Yes' if you are currently employed, otherwise 'No'." />
                  </FormLabel>
                  <FormControl>
                    <Select
                      options={employmentStatusOptions}
                      placeholder="Select an option"
                      isClearable
                      value={
                        employmentStatusOptions.find(
                          (opt) => opt.value === field.value
                        ) || null
                      }
                      onChange={(option) => {
                        field.onChange(option ? option.value : '');
                        handleEmploymentStatusChange(option?.value);
                      }}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <>
              {/* Current Employment Section */}
              {watchIsEmployed === 'yes' && (
                <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-medium">Current Employment</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Employer Name */}
                    <FormField
                      name="currentEmployment.employer"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-col">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Employer Name
                              <span className="text-red-500">*</span>
                            </div>
<HelperTooltip text="Enter the name of your current employer. Example: NHS Trust" />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Company Name"
                              className="placeholder:text-xs placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Job Position */}
                    <FormField
                      name="currentEmployment.jobTitle"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-col">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Job Position
                              <span className="text-red-500">*</span>
                            </div>
<HelperTooltip text="State your current job title. Example: Support Worker" />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Position"
                              className="placeholder:text-xs placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Start Date */}
                    <FormField
                      name="currentEmployment.startDate"
                      control={form.control}
                      render={({ field }) => {
                        const selectedDate = field.value ? new Date(field.value) : null;
                        return (
                          <FormItem className="mt-2 flex flex-col">
                            <FormLabel>
                              <div className="flex items-center gap-1">
                                Start Date (MM/DD/YYYY)
                                <span className="text-red-500">*</span>
                              </div>
<HelperTooltip text="Select the date you started your current position. Example: 11/01/2020" />
                            </FormLabel>
                            <FormControl>
                              <CustomDatePicker
                                selected={selectedDate}
                                onChange={(date) => field.onChange(date)}
                                placeholder="Employment Start Date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Employment Type */}
                    <FormField
                      name="currentEmployment.employmentType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-col">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Employment Type
                              <span className="text-red-500">*</span>
                            </div>
<HelperTooltip text="Select your employment type. Example: Full-Time, Part-Time, Contract" />
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={employmentTypeOptions}
                              placeholder="Select Type of Employment"
                              isClearable
                              value={
                                employmentTypeOptions.find(
                                  (option) => option.value === field.value
                                ) || null
                              }
                              onChange={(option) =>
                                field.onChange(option ? option.value : '')
                              }
                              className="text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Main Responsibilities */}
                    <FormField
                      name="currentEmployment.responsibilities"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-col sm:col-span-2 lg:col-span-3">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Main Responsibilities
                              <span className="text-red-500">*</span>
                            </div>
<HelperTooltip text="Briefly describe your key responsibilities in this role." />
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[80px] border border-gray-200 placeholder:text-xs placeholder:text-gray-400"
                              placeholder="Job Duties"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  name="hasPreviousEmployment"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="mt-2 flex flex-col">
                      <FormLabel>
                        <div className="flex items-center gap-1">
                          Do you have previous employment history?
                          <span className="text-red-500">*</span>
                        </div>
<HelperTooltip text="Indicate if you have held any previous jobs before your current employment." />
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={previousEmploymentOptions}
                          placeholder="Select an option"
                          isClearable
                          value={
                            previousEmploymentOptions.find(
                              (option) => option.value === field.value
                            ) || null
                          }
                          onChange={(option) =>
                            field.onChange(option ? option.value : '')
                          }
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('hasPreviousEmployment') === 'yes' && (
                <div>
                  <h3 className="mb-4 text-xl font-medium">Previous Employment</h3>

                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Employer */}
                        <FormField
                          name={`previousEmployments.${index}.employer`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="mt-2 flex flex-col">
                              <FormLabel>
                                <div className="flex items-center gap-1">
                                  Employer Name
                                  <span className="text-red-500">*</span>
                                </div>
<HelperTooltip text="Enter the name of your previous employer. Example: NHS Trust" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company Name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Job Title */}
                        <FormField
                          name={`previousEmployments.${index}.jobTitle`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="mt-2 flex flex-col">
                              <FormLabel>
                                <div className="flex items-center gap-1">
                                  Job Position
                                  <span className="text-red-500">*</span>
                                </div>
<HelperTooltip text="State your job title for this role. Example: Support Worker" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Position" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Start Date */}
                        <FormField
                          name={`previousEmployments.${index}.startDate`}
                          control={form.control}
                          render={({ field }) => {
                            const selectedDate = field.value ? new Date(field.value) : null;
                            return (
                              <FormItem className="mt-2 flex flex-col">
                                <FormLabel>
                                  <div className="flex items-center gap-1">
                                    Start Date (MM/DD/YYYY)
                                    <span className="text-red-500">*</span>
                                  </div>
<HelperTooltip text="Select the date you started this previous job. Example: 05/01/2018" />
                                </FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Employment Start Date"
                                    futureDate={true}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        {/* End Date */}
                        <FormField
                          name={`previousEmployments.${index}.endDate`}
                          control={form.control}
                          render={({ field }) => {
                            const selectedDate = field.value ? new Date(field.value) : null;
                            return (
                              <FormItem className="mt-2 flex flex-col">
                                <FormLabel>
                                  <div className="flex items-center gap-1">
                                    End Date (MM/DD/YYYY)
                                    <span className="text-red-500">*</span>
                                  </div>
<HelperTooltip text="Select the date you ended this previous job. Example: 04/30/2020" />
                                </FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Employment End Date"
                                    futureDate={true}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        {/* Reason for Leaving */}
                        <FormField
                          name={`previousEmployments.${index}.reasonForLeaving`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="mt-2 flex flex-col">
                              <FormLabel>
                                <div className="flex items-center gap-1">
                                  Reason for Leaving
                                  <span className="text-red-500">*</span>
                                </div>
<HelperTooltip text="Briefly explain why you left this role. Example: Career growth" />
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter the reason" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Responsibilities */}
                        <FormField
                          name={`previousEmployments.${index}.responsibilities`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="mt-2 flex flex-col sm:col-span-2 lg:col-span-3">
                              <FormLabel>
                                <div className="flex items-center gap-1">
                                  Main Responsibilities
                                  <span className="text-red-500">*</span>
                                </div>
<HelperTooltip text="Summarize your key responsibilities in this role." />
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[80px] border border-gray-200"
                                  placeholder="Job Duties"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        employer: '',
                        jobTitle: '',
                        startDate: undefined,
                        endDate: undefined,
                        reasonForLeaving: '',
                        responsibilities: '',
                      })
                    }
                    className="bg-watney text-white hover:bg-watney/90"
                  >
                    Add More Experience
                  </Button>
                </div>
              )}

              {form.watch('hasPreviousEmployment') === 'yes' && (
                <>
                  <FormField
                    control={form.control}
                    name="hasEmploymentGaps"
                    render={({ field }) => (
                      <FormItem className="mt-2 flex flex-col max-w-md">
                        <FormLabel>
                          <div className="flex items-center gap-1">
                            Any gaps of more than 1 month in the last 5 years?
                            <span className="text-red-500">*</span>
                          </div>
<HelperTooltip text="Indicate if you have had any employment gaps of 1 month or more in the last 5 years." />
                        </FormLabel>
                        <FormControl>
                          <Select
                            options={employmentGapOptions}
                            placeholder="Select"
                            isClearable
                            value={
                              employmentGapOptions.find(
                                (option) => option.value === field.value
                              ) || null
                            }
                            onChange={(option) =>
                              field.onChange(option ? option.value : '')
                            }
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchHasGaps === 'yes' && (
                    <FormField
                      name="employmentGapsExplanation"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-col">
                          <FormLabel>
                            <div className="flex items-center gap-1">
                              Please explain the reason
                              <span className="text-red-500">*</span>
                            </div>
<HelperTooltip text="Provide a brief reason for any employment gaps. Example: Study break, health reasons, relocation." />
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[100px] border-gray-200"
                              placeholder="Explanation for gaps"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-watney text-white hover:bg-watney/90"
                  onClick={() => {
                    if (showFullForm) {
                      setShowFullForm(false);
                    } else {
                      handleBack();
                    }
                  }}
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
            </>
          </CardContent>
        </div>
      </div>
    </form>
  </Form>
</Card>
  );
}
