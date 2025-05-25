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
    <Card className="border-none shadow-none ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 ">
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
                    <FormItem className="max-w-md">
                      <FormLabel>
                        Are you currently employed?{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>

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

                      <p className="text-xs text-gray-400">
                        Select "Yes" if you are employed at the moment.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <>
                  {/* Current Employment Section */}
                  {watchIsEmployed === 'yes' && (
                    <div className="rounded-lg border border-gray-200  p-6 shadow-sm">
                      <h3 className="mb-4 text-xl font-medium">
                        Current Employment
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Employer Name */}
                        <FormField
                          name="currentEmployment.employer"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Employer Name{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Company Name"
                                  className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                                />
                              </FormControl>
                              <p className="text-xs  text-gray-400">
                                Enter the name of your current employer (e.g.,
                                NHS Trust){' '}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Job Position */}
                        <FormField
                          name="currentEmployment.jobTitle"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Job Position{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Position"
                                  className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                                />
                              </FormControl>
                              <p className="text-xs  text-gray-400">
                                State your current job title (e.g., Support
                                Worker)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Start Date */}
                        <FormField
                          name="currentEmployment.startDate"
                          control={form.control}
                          render={({ field }) => {
                            const selectedDate = field.value
                              ? new Date(field.value)
                              : null;

                            return (
                              <FormItem>
                                <FormLabel>
                                  Start Date (MM/DD/YYYY){' '}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Employment Start Date"
                                  />
                                </FormControl>
                                <p className="text-xs  text-gray-400">
                                  Select the date you started this position(e.g.
                                  11/01/2000)
                                </p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          name="currentEmployment.employmentType"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Employment Type{' '}
                                <span className="text-red-500">*</span>
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

                              <p className="mt-1 text-xs text-gray-400">
                                Select from options: Full-Time, Part-Time,
                                Contract, Freelance
                              </p>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Main Responsibilities */}
                        <FormField
                          name="currentEmployment.responsibilities"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2 lg:col-span-3">
                              <FormLabel>
                                Main Responsibilities{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="!placeholder:text-gray-400 min-h-[80px] border border-gray-200   placeholder:text-xs  placeholder:text-gray-400"
                                  placeholder="Job Duties"
                                />
                              </FormControl>
                              <p className="mt-1 text-xs text-gray-400">
                                Briefly describe your key responsibilities{' '}
                              </p>
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
                        <FormItem className="mt-4">
                          <FormLabel>
                            Do you have previous employment history?{' '}
                            <span className="text-red-500">*</span>
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

                          <p className="mt-1 text-xs text-gray-400">
                            List any previous jobs you've held. Include job
                            title, employer, dates, and responsibilities.
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('hasPreviousEmployment') === 'yes' && (
                    <div>
                      <h3 className="mb-4 text-xl font-medium">
                        Previous Employment
                      </h3>

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
                                <FormItem>
                                  <FormLabel>
                                    Employer Name{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Company Name"
                                    />
                                  </FormControl>
                                  <p className="text-xs  text-gray-400">
                                    Enter the name of your current employer
                                    (e.g., NHS Trust){' '}
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Job Title */}
                            <FormField
                              name={`previousEmployments.${index}.jobTitle`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Job position{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Position" />
                                  </FormControl>
                                  <p className="text-xs  text-gray-400">
                                    State your current job title (e.g., Support
                                    Worker)
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Start Date */}
                            <FormField
                              name={`previousEmployments.${index}.startDate`}
                              control={form.control}
                              render={({ field }) => {
                                const selectedDate = field.value
                                  ? new Date(field.value)
                                  : null;

                                return (
                                  <FormItem>
                                    <FormLabel>
                                      Start Date (MM/DD/YYYY){' '}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) =>
                                          field.onChange(date)
                                        }
                                        placeholder="Employment Start Date"
                                      />
                                    </FormControl>
                                    <p className="text-xs  text-gray-400">
                                      Select the date you started this position
                                      (e.g. 11/01/2000)
                                    </p>{' '}
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
                                const selectedDate = field.value
                                  ? new Date(field.value)
                                  : null;

                                return (
                                  <FormItem>
                                    <FormLabel>
                                      End Date (MM/DD/YYYY){' '}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) =>
                                          field.onChange(date)
                                        }
                                        placeholder="Employment End Date"
                                      />
                                    </FormControl>
                                    <p className="mt-1 text-xs text-gray-400">
                                      Select the end date (e.g. 11/01/2000)
                                    </p>
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
                                <FormItem>
                                  <FormLabel>
                                    Reason for Leaving{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter the reason"
                                    />
                                  </FormControl>
                                  <p className="mt-1 text-xs text-gray-400">
                                    Reason for Leaving the Position
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Responsibilities */}
                            <FormField
                              name={`previousEmployments.${index}.responsibilities`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2 lg:col-span-3 ">
                                  <FormLabel>
                                    Main Responsibilities{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      className="min-h-[80px] border border-gray-200"
                                      placeholder="Job Duties"
                                    />
                                  </FormControl>
                                  <p className="mt-1 text-xs text-gray-400">
                                    Briefly describe your key responsibilities{' '}
                                  </p>
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
                        Add More Experiance
                      </Button>
                    </div>
                  )}

                  {form.watch('hasPreviousEmployment') === 'yes' && (
                    <>
                      <FormField
                        control={form.control}
                        name="hasEmploymentGaps"
                        render={({ field }) => (
                          <FormItem className="max-w-md">
                            <FormLabel>
                              Any gaps of more than 1 month in the last 5 years?{' '}
                              <span className="text-red-500">*</span>
                            </FormLabel>

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

                            <p className="mt-1 text-xs text-gray-400">
                              Have you had any periods of 1 month or more
                              without employment in the past 5 years?
                            </p>

                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchHasGaps === 'yes' && (
                        <FormField
                          name="employmentGapsExplanation"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="max-w-2xl">
                              <FormLabel>
                                Please explain the reason{' '}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder="Explanation for Gaps
"
                                />
                              </FormControl>
                              <p className="mt-1 text-xs text-gray-400">
                                Briefly explain the reason for any gaps (e.g.,
                                study break, health reasons, relocation)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                  {/* <FormField
                    name="declaration"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                            <span>
                              I confirm that the information provided is
                              accurate.
                            </span>
                          </label>
                        </FormLabel>
                      </FormItem>
                    )}
                  /> */}

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
