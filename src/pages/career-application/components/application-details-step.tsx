import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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

import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';
import { HelperTooltip } from '@/helper/HelperTooltip';

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const applicationDetailsSchema = z
  .object({
    availableFromDate: z.date({
      required_error: 'Application date is required'
    }),
    source: z.string().min(1, { message: 'Source is required' }),

    availability: z
      .object(
        Object.fromEntries(
          daysOfWeek.map((day) => [day, z.boolean().optional()])
        )
      )
      .refine((data) => Object.values(data).some((val) => val), {
        message: 'Please select at least one day of availability'
      }),
    isStudent: z.boolean().refine((val) => val === true || val === false, {
      message: 'Please select if you are a student'
    }),
    referralEmployee: z.string().optional(),
    isUnderStatePensionAge: z
      .boolean()
      .refine((val) => val === true || val === false, {
        message: 'Please indicate if you are under the state pension age'
      }),
    isOver18: z.boolean().refine((val) => val === true || val === false, {
      message: 'Please confirm if you are aged 18 or over'
    }),
    isSubjectToImmigrationControl: z
      .boolean()
      .refine((val) => val === true || val === false, {
        message: 'Please confirm if you are subject to immigration control'
      }),
    canWorkInUK: z.boolean().refine((val) => val === true || val === false, {
      message: 'Please confirm if you are free to work in the UK'
    })
  })
  .superRefine((data, ctx) => {


    // If source is "referral", referralEmployee must be provided
    if (data.source === 'referral' && !data.referralEmployee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide the name of the referring employee',
        path: ['referralEmployee']
      });
    }
  });

type ApplicationDetailsFormValues = z.infer<typeof applicationDetailsSchema>;

export function ApplicationDetailsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<ApplicationDetailsFormValues>({
    resolver: zodResolver(applicationDetailsSchema),
    defaultValues: {
      availableFromDate: undefined,
      source: '',

      availability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      isStudent: undefined,
      referralEmployee: '',
      isUnderStatePensionAge: undefined,
      isOver18: undefined,
      isSubjectToImmigrationControl: undefined,
      canWorkInUK: undefined,

    },
    ...defaultValues
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        availableFromDate: defaultValues.availableFromDate
          ? new Date(defaultValues.availableFromDate)
          : undefined
      });
    }
  }, [defaultValues, form]);

  const options = [
    { value: 'website', label: 'Company Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'other', label: 'Other' }
  ];

  const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  // Watch source field to show referral input conditionally
  const sourceValue = form.watch('source');

  function onSubmit(data: ApplicationDetailsFormValues) {
    onSaveAndContinue(data);
  }

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <Card className="border-0 shadow-none ">
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Please provide specific details about the position you're applying
          for. This information helps us better understand your suitability and
          availability.
        </CardDescription>
      </CardHeader>
      <CardContent>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Available From Date */}
        <FormField
          control={form.control}
          name="availableFromDate"
          render={({ field }) => {
            const selectedDate = field.value ? new Date(field.value) : null;
            return (
              <FormItem className="mt-2 flex w-full flex-col">
                <FormLabel>
                  <div>
                    Available From Date (MM/DD/YYYY)
                    <span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Enter the date you are available to start working. Example: 01/06/2025" />
                </FormLabel>
                <FormControl>
                  <CustomDatePicker
                    selected={selectedDate}
                    onChange={(date) => field.onChange(date)}
                    placeholder="When would you be available to start this role?"
                    futureDate={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Are you aged 18 or over? */}
        <FormField
          control={form.control}
          name="isOver18"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  Are you aged 18 or over?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select ‘Yes’ if you are 18 years old or older. Example: Yes" />
              </FormLabel>
              <FormControl>
                <Select
                  options={yesNoOptions}
                  placeholder="Select Yes if you're aged 18 or over."
                  isClearable
                  value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Immigration Control */}
        <FormField
          control={form.control}
          name="isSubjectToImmigrationControl"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  Are you subject to immigration control?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select ‘Yes’ if you require permission to live or work in the UK. Example: No" />
              </FormLabel>
              <FormControl>
                <Select
                  options={yesNoOptions}
                  placeholder="Select Yes if you're subject to immigration control."
                  isClearable
                  value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Can Work in UK */}
        <FormField
          control={form.control}
          name="canWorkInUK"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  Are you free to remain and take up employment in the UK?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select ‘Yes’ if you are legally eligible to work in the United Kingdom. Example: Yes" />
              </FormLabel>
              <FormControl>
                <Select
                  options={yesNoOptions}
                  placeholder="Select Yes if you can legally work in the UK."
                  isClearable
                  value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* How did you hear about us? */}
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  How did you hear about us?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Indicate how you discovered this job opportunity. Example: Company Website, Referral, LinkedIn" />
              </FormLabel>
              <FormControl>
                <Select
                  options={options}
                  placeholder="Let us know how you found out about this opportunity."
                  isClearable
                  value={options.find((option) => option.value === field.value) || null}
                  onChange={(selected) => field.onChange(selected?.value)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Referred by (conditional) */}
        {sourceValue === 'referral' && (
          <FormField
            control={form.control}
            name="referralEmployee"
            render={({ field }) => (
              <FormItem className="mt-2 flex w-full flex-col">
                <FormLabel>
                  <div>
                    Referred by (Employee Name)
                    <span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Provide the name of the employee who referred you. Example: Emma Watson" />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter the employee name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Availability (Select all that apply) */}
      <FormField
        control={form.control}
        name="availability"
        render={() => (
          <FormItem className="mt-2 flex w-full flex-col">
            <div className="flex items-center justify-start gap-2">
              <FormLabel>
                <div>
                  Availability (Select all that apply)
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select all days you are available to work. Example: Monday, Wednesday, Friday" />
              </FormLabel>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-watney hover:bg-watney/90"
                onClick={() => {
                  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  days.forEach((day) => {
                    form.setValue(`availability.${day}`, true);
                  });
                }}
              >
                Select All
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
              ].map((day) => (
                <FormField
                  key={day}
                  control={form.control}
                  name={`availability.${day.toLowerCase()}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{day}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Student Status */}
        <FormField
          control={form.control}
          name="isStudent"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  Are you currently a student?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select ‘Yes’ if you are currently enrolled in any educational institution. Example: No" />
              </FormLabel>
              <FormControl>
                <Select
                  options={yesNoOptions}
                  placeholder="Select Yes if you are currently enrolled in any educational institution."
                  isClearable
                  value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Under State Pension Age */}
        <FormField
          control={form.control}
          name="isUnderStatePensionAge"
          render={({ field }) => (
            <FormItem className="mt-2 flex w-full flex-col">
              <FormLabel>
                <div>
                  Are you under state pension age?
                  <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select ‘Yes’ if you are below the official state pension age. Example: Yes" />
              </FormLabel>
              <FormControl>
                <Select
                  options={yesNoOptions}
                  placeholder="Indicate whether you are below the UK state pension age."
                  isClearable
                  value={yesNoOptions.find((option) => option.value === field.value) || null}
                  onChange={(option) => field.onChange(option ? option.value : null)}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="bg-watney text-white hover:bg-watney/90"
        >
          Back
        </Button>
        <Button type="submit" className="bg-watney text-white hover:bg-watney/90">
          Next
        </Button>
      </div>
    </form>
  </Form>
</CardContent>
    </Card>
  );
}
