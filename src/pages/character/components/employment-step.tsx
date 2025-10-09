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
import moment from 'moment';

// Helper function to calculate months between dates
const monthsBetween = (a: Date, b: Date) =>
  moment(b).startOf("day").diff(moment(a).startOf("day"), "months", true);

// Employment schema with gap validation
export const employmentSchema = z
  .object({
    isEmployed: z.string().min(1, "Please select an option"),
    hasPreviousEmployment: z.string().min(1, "Please select an option"),
    currentEmployment: z
      .object({
        employer: z.string().optional(),
        jobTitle: z.string().optional(),
        startDate: z.date().nullable().optional(),
        employmentType: z.string().optional(),
        responsibilities: z.string().optional(),
      })
      .optional(),
    previousEmployments: z
      .array(
        z.object({
          employer: z.string().optional(),
          jobTitle: z.string().optional(),
          startDate: z.date().nullable().optional(),
          endDate: z.date().nullable().optional(),
          reasonForLeaving: z.string().optional(),
          responsibilities: z.string().optional(),
          hasEmploymentGaps: z.string().optional(),
          employmentGapsExplanation: z.string().optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // ✅ Current employment validation
    if (data.isEmployed === "yes") {
      const current = data.currentEmployment;
      if (!current) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current employment details are required.",
          path: ["currentEmployment"],
        });
        return;
      }

      if (!current.employer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employer name is required.",
          path: ["currentEmployment", "employer"],
        });
      }
      if (!current.jobTitle?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Job title is required.",
          path: ["currentEmployment", "jobTitle"],
        });
      }
      if (!(current.startDate instanceof Date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date is required.",
          path: ["currentEmployment", "startDate"],
        });
      }
      if (!current.employmentType?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Employment type is required.",
          path: ["currentEmployment", "employmentType"],
        });
      }
      if (!current.responsibilities?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Responsibilities are required.",
          path: ["currentEmployment", "responsibilities"],
        });
      }
    }

    // ✅ Previous employment validation
    if (data.hasPreviousEmployment === "yes") {
      if (!data.previousEmployments?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one previous employment entry is required.",
          path: ["previousEmployments"],
        });
        return;
      }

      data.previousEmployments.forEach((job, index) => {
        if (!job.employer?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Employer name is required.",
            path: ["previousEmployments", index, "employer"],
          });
        }
        if (!job.jobTitle?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Job title is required.",
            path: ["previousEmployments", index, "jobTitle"],
          });
        }
        if (!(job.startDate instanceof Date)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required.",
            path: ["previousEmployments", index, "startDate"],
          });
        }
        if (!(job.endDate instanceof Date)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date is required.",
            path: ["previousEmployments", index, "endDate"],
          });
        }
        if (!job.reasonForLeaving?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reason for leaving is required.",
            path: ["previousEmployments", index, "reasonForLeaving"],
          });
        }
        if (!job.responsibilities?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Responsibilities are required.",
            path: ["previousEmployments", index, "responsibilities"],
          });
        }
        if (!job.hasEmploymentGaps?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please select if there were employment gaps.",
            path: ["previousEmployments", index, "hasEmploymentGaps"],
          });
        }
        if (job.hasEmploymentGaps === "yes" && !job.employmentGapsExplanation?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Explanation for employment gaps is required.",
            path: ["previousEmployments", index, "employmentGapsExplanation"],
          });
        }
        // ✅ Start must be before end
        if (job.startDate instanceof Date && job.endDate instanceof Date) {
          if (!moment(job.startDate).isBefore(moment(job.endDate))) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Start date must be before end date.",
              path: ["previousEmployments", index, "endDate"],
            });
          }
        }
      });

      // ✅ Gap validation logic
      const datedJobs = (data.previousEmployments || [])
        .map((job, idx) => ({ ...job, originalIndex: idx }))
        .filter(
          (j) => j.startDate instanceof Date && j.endDate instanceof Date
        );

      if (datedJobs.length > 0) {
        // Sort jobs by start date
        const sorted = [...datedJobs].sort((a, b) =>
          moment(a.startDate).isBefore(moment(b.startDate)) ? -1 : 1
        );

        // 1️⃣ Gaps between previous jobs
        for (let i = 1; i < sorted.length; i++) {
          const earlier = sorted[i - 1];
          const later = sorted[i];

          const endM = moment(earlier.endDate).startOf("day");
          const startM = moment(later.startDate).startOf("day");

          if (endM.isBefore(startM)) {
            const gapMonths = monthsBetween(
              earlier.endDate as Date,
              later.startDate as Date
            );

            if (gapMonths > 1 && earlier.hasEmploymentGaps !== "yes") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Gap of ${gapMonths.toFixed(
                  1
                )} months detected between jobs (ended ${endM.format(
                  "MM/DD/YYYY"
                )} → started ${startM.format(
                  "MM/DD/YYYY"
                )}). You must select 'Yes' for employment gaps.`,
                path: [
                  "previousEmployments",
                  earlier.originalIndex,
                  "hasEmploymentGaps",
                ],
              });
            }
          }
        }

        // 2️⃣ Gap between most recent job and current job
        if (
          data.isEmployed === "yes" &&
          data.currentEmployment?.startDate instanceof Date
        ) {
          const mostRecent = sorted.reduce((latest, cur) =>
            moment(cur.endDate).isAfter(moment(latest.endDate)) ? cur : latest
          );

          const lastEnd = moment(mostRecent.endDate).startOf("day");
          const currentStart = moment(
            data.currentEmployment.startDate
          ).startOf("day");

          if (lastEnd.isBefore(currentStart)) {
            const gapMonths = monthsBetween(
              mostRecent.endDate as Date,
              data.currentEmployment.startDate as Date
            );

            if (gapMonths > 1 && mostRecent.hasEmploymentGaps !== "yes") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Gap of ${gapMonths.toFixed(
                  1
                )} months detected between your last job (ended ${lastEnd.format(
                  "MM/DD/YYYY"
                )}) and your current job (started ${currentStart.format(
                  "MM/DD/YYYY"
                )}). You must select 'Yes' for employment gaps.`,
                path: [
                  "previousEmployments",
                  mostRecent.originalIndex,
                  "hasEmploymentGaps",
                ],
              });
            }
          }
        }

        // 3️⃣ Gap from most recent job to today (if unemployed)
        if (data.isEmployed === "no") {
          const mostRecent = sorted.reduce((latest, cur) =>
            moment(cur.endDate).isAfter(moment(latest.endDate)) ? cur : latest
          );

          const lastEnd = moment(mostRecent.endDate).startOf("day");
          const today = moment().startOf("day");

          const gapMonths = monthsBetween(
            mostRecent.endDate as Date,
            today.toDate()
          );
          if (gapMonths > 1 && mostRecent.hasEmploymentGaps !== "yes") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Gap of ${gapMonths.toFixed(
                1
              )} months detected since your last job (ended ${lastEnd.format(
                "MM/DD/YYYY"
              )}). You must select 'Yes' for employment gaps.`,
              path: [
                "previousEmployments",
                mostRecent.originalIndex,
                "hasEmploymentGaps",
              ],
            });
          }
        }
      }
    }
  });

type EmploymentData = z.infer<typeof employmentSchema>;

export function EmploymentStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  saveAndLogout
}: any) {
  const form = useForm<EmploymentData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultValues || {
      isEmployed: '',
      hasPreviousEmployment: '',
      previousEmployments: [],
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
          defaultValues.previousEmployments?.map((employment: any) => ({
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'previousEmployments'
  });

  const watchIsEmployed = form.watch('isEmployed');

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

  useEffect(() => {
    if (form.watch('hasPreviousEmployment') === 'yes' && fields.length === 0) {
      append({
        employer: '',
        jobTitle: '',
        startDate: undefined,
        endDate: undefined,
        reasonForLeaving: '',
        responsibilities: '',
        hasEmploymentGaps: '',
        employmentGapsExplanation: ''
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

  const previousEmploymentOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const employmentGapOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  function handleBack() {
    setCurrentStep(7);
  }

  return (
    <Card className="border-none shadow-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            <div>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Employment History</CardTitle>
                <CardDescription className='text-lg'>
                  Please provide your current and previous employment details. This information helps us understand your experience and assess your application more accurately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isEmployed"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel className="text-lg font-medium">
                        Are you currently employed? <span className="text-red-500">*</span>
                      </FormLabel>

                      <Select
                        options={employmentStatusOptions}
                        placeholder="Select an option"
                        isClearable
                        value={employmentStatusOptions.find((opt) => opt.value === field.value) || null}
                        onChange={(option) => {
                          field.onChange(option ? option.value : '');
                          handleEmploymentStatusChange(option?.value);
                        }}
                        className="text-lg"
                        styles={{
                          control: (base) => ({
                            ...base,
                            height: '3rem',
                            borderRadius: '16px',
                            fontSize: '1.125rem',
                          }),
                          placeholder: (base) => ({ ...base, fontSize: '1.125rem' }),
                          singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                          input: (base) => ({ ...base, fontSize: '1.125rem' }),
                        }}
                      />

                      <p className="text-md text-gray-400">
                        Select "Yes" if you are employed at the moment.
                      </p>

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
                            <FormItem>
                              <FormLabel className="text-watney">
                                Employer Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Company Name"
                                  className=" !placeholder:text-gray-400"
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                Enter the name of your current employer (e.g., NHS Trust)
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
                              <FormLabel className="text-watney">
                                Job Position <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Position"
                                  className=" !placeholder:text-gray-400"
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                State your current job title (e.g., Support Worker)
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
                            const selectedDate = field.value ? new Date(field.value) : null;
                            return (
                              <FormItem>
                                <FormLabel className="text-watney">
                                  Start Date (MM/DD/YYYY) <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Employment Start Date"
                                    className=" text-lg w-full"
                                  />
                                </FormControl>
                                <p className="text-md text-gray-400">
                                  Select the date you started this position (e.g. 11/01/2000)
                                </p>
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
                            <FormItem>
                              <FormLabel className="text-watney">
                                Employment Type <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Select
                                  options={employmentTypeOptions}
                                  placeholder="Select Type of Employment"
                                  isClearable
                                  value={employmentTypeOptions.find((option) => option.value === field.value) || null}
                                  onChange={(option) => field.onChange(option ? option.value : '')}
                                  className="text-lg"
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      height: '3rem',
                                      borderRadius: '16px',
                                      fontSize: '1.125rem',
                                    }),
                                  }}
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                Select from options: Full-Time, Part-Time, Contract, Freelance
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
                              <FormLabel className="text-watney">
                                Main Responsibilities <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[100px] border border-gray-200 p-4 text-lg resize-none"
                                  placeholder="Job Duties"
                                />
                              </FormControl>
                              <p className="text-md text-gray-400">
                                Briefly describe your key responsibilities
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
                          <FormLabel className="text-lg font-medium">
                            Do you have previous employment history?{' '}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={previousEmploymentOptions}
                              placeholder="Select an option"
                              isClearable
                              value={previousEmploymentOptions.find((option) => option.value === field.value) || null}
                              onChange={(option) => field.onChange(option ? option.value : '')}
                              className="text-lg"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  height: '3rem',
                                  borderRadius: '16px',
                                  fontSize: '1.125rem',
                                }),
                              }}
                            />
                          </FormControl>
                          <p className="text-md text-gray-400">
                            List any previous jobs you've held. Include job title, employer, dates, and responsibilities.
                          </p>
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
                          className="mb-6 rounded-lg border border-gray-200 p-6 shadow-sm"
                        >
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Employer */}
                            <FormField
                              name={`previousEmployments.${index}.employer`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-watney">
                                    Employer Name <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Company Name"
                                      className=""
                                    />
                                  </FormControl>
                                  <p className="text-md text-gray-400">
                                    Enter the name of your employer (e.g., NHS Trust)
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
                                  <FormLabel className="text-watney">
                                    Job Position <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Position"
                                      className=""
                                    />
                                  </FormControl>
                                  <p className="text-md text-gray-400">
                                    State your job title (e.g., Support Worker)
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
                                const selectedDate = field.value ? new Date(field.value) : null;
                                return (
                                  <FormItem>
                                    <FormLabel className="text-watney">
                                      Start Date (MM/DD/YYYY) <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) => field.onChange(date)}
                                        placeholder="Employment Start Date"
                                        futureDate={true}
                                        className=" text-lg w-full"
                                      />
                                    </FormControl>
                                    <p className="text-md text-gray-400">
                                      Select the date you started this position (e.g. 11/01/2000)
                                    </p>
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
                                  <FormItem>
                                    <FormLabel className="text-watney">
                                      End Date (MM/DD/YYYY) <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) => field.onChange(date)}
                                        placeholder="Employment End Date"
                                        futureDate={true}
                                        className=" text-lg w-full"
                                      />
                                    </FormControl>
                                    <p className="text-md text-gray-400">
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
                                  <FormLabel className="text-watney">
                                    Reason for Leaving <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Enter the reason"
                                      className=""
                                    />
                                  </FormControl>
                                  <p className="text-md text-gray-400">
                                    Reason for leaving the position
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
                                <FormItem className="sm:col-span-2 lg:col-span-3">
                                  <FormLabel className="text-watney">
                                    Main Responsibilities <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      className="min-h-[100px] border border-gray-200 p-4 text-lg resize-none"
                                      placeholder="Job Duties"
                                    />
                                  </FormControl>
                                  <p className="text-md text-gray-400">
                                    Briefly describe your key responsibilities
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Employment Gaps */}
                            <FormField
                              name={`previousEmployments.${index}.hasEmploymentGaps`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem className="max-w-md">
                                  <FormLabel className="text-watney">
                                    Any gaps of more than 1 month after this role?{' '}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    options={employmentGapOptions}
                                    placeholder="Select"
                                    isClearable
                                    value={employmentGapOptions.find((option) => option.value === field.value) || null}
                                    onChange={(option) => field.onChange(option ? option.value : '')}
                                    className="text-lg"
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        height: '3rem',
                                        borderRadius: '16px',
                                        fontSize: '1.125rem',
                                      }),
                                    }}
                                  />
                                  <p className="text-md text-gray-400">
                                    Were there employment gaps after this job?
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Explanation if gaps = yes */}
                            {form.watch(`previousEmployments.${index}.hasEmploymentGaps`) === 'yes' && (
                              <FormField
                                name={`previousEmployments.${index}.employmentGapsExplanation`}
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2 lg:col-span-3">
                                    <FormLabel className="text-watney">
                                      Please explain the reason <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        {...field}
                                        className="min-h-[100px]  border border-gray-200 p-4 text-lg resize-none"
                                        placeholder="Explanation for gaps after this employment"
                                      />
                                    </FormControl>
                                    <p className="text-md text-gray-400">
                                      Briefly explain the reason (e.g., study break, health, relocation)
                                    </p>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>

                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => remove(index)}
                              className="mt-4  text-lg"
                            >
                              Remove This Experience
                            </Button>
                          )}
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
                            hasEmploymentGaps: '',
                            employmentGapsExplanation: '',
                          })
                        }
                        className=" bg-watney text-lg text-white hover:bg-watney/90"
                      >
                        Add More Experience
                      </Button>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className=" bg-watney text-lg text-white hover:bg-watney/90"
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
                      onClick={() => saveAndLogout()}
                      className="bg-watney  text-white hover:bg-watney/90"
                    >
                      Save And Exit
                    </Button>
                    <Button
                      type="submit"
                      className=" bg-watney text-lg text-white hover:bg-watney/90"
                    >
                      Save And Next
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