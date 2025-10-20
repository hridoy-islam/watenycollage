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
import { languages } from '@/types';
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
    }),
    competentInOtherLanguage: z.boolean(),
    otherLanguages: z.array(z.string()).optional(),
    drivingLicense: z.boolean(),
    licenseNumber: z
      .string()
      .regex(/^[A-Za-z0-9]{16}$/, {
        message: 'License number must be exactly 16 characters'
      })
      .or(z.literal(''))
      .nullable(),

    carOwner: z.boolean(),
    travelAreas: z.string().min(1, { message: 'Please specify travel areas' }),
    solelyForEverycare: z.boolean(),
    otherEmployers: z.string().optional(),
    professionalBody: z.boolean(),
    professionalBodyDetails: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (
      data.competentInOtherLanguage &&
      (!data.otherLanguages || data.otherLanguages.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one language',
        path: ['otherLanguages']
      });
    }
    if (data.drivingLicense) {
      if (!data.licenseNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please provide your driving license number',
          path: ['licenseNumber']
        });
      }
    }

    if (!data.solelyForEverycare && !data.otherEmployers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide other employer(s)',
        path: ['otherEmployers']
      });
    }

    if (data.professionalBody && !data.professionalBodyDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide details of your professional body',
        path: ['professionalBodyDetails']
      });
    }
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
  setCurrentStep,
  saveAndLogout
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
      competentInOtherLanguage: undefined,
      otherLanguages: [],
      drivingLicense: undefined,
      licenseNumber: '',
      carOwner: undefined,
      travelAreas: '',
      solelyForEverycare: undefined,
      otherEmployers: '',
      professionalBody: undefined,
      professionalBodyDetails: ''
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
    setCurrentStep(4);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Application Details</CardTitle>
        <CardDescription className="text-lg">
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
                  const selectedDate = field.value
                    ? new Date(field.value)
                    : null;
                  return (
                    <FormItem className="mt-2 flex w-full flex-col">
                      <FormLabel>
                        <div>
                          Available From Date (MM/DD/YYYY)
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the date you’re available to start work. e.g., 01/06/2025" />
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

              {/* Competent in Another Language */}
              <FormField
                control={form.control}
                name="competentInOtherLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you competent in another language?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you can speak or write in any language other than English. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      // 👇 Style the control (input container)
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem', // h-12 = 3rem
                          borderRadius: '16px',
                          fontSize: '1.125rem' // text-lg
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '1.125rem'
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '1.125rem'
                        }),
                        input: (base) => ({ ...base, fontSize: '1.125rem' })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Languages (Multi-select) */}
              {form.watch('competentInOtherLanguage') === true && (
                <FormField
                  control={form.control}
                  name="otherLanguages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-watney">
                        <div>
                          If Yes, specify language(s){' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="List all other languages you can communicate in fluently. e.g., English, Bengali" />
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="otherLanguages"
                        render={({ field }) => (
                          <Select
                            isMulti
                            options={languages.map((lang) => ({
                              value: lang,
                              label:
                                lang.charAt(0).toUpperCase() + lang.slice(1)
                            }))}
                            placeholder="Choose languages"
                            onChange={(selected) =>
                              field.onChange(
                                selected?.map((opt) => opt.value) || []
                              )
                            }
                            value={field.value?.map((val) => ({
                              value: val,
                              label: val.charAt(0).toUpperCase() + val.slice(1)
                            }))}
                            className="text-lg"
                            styles={{
                              control: (base) => ({
                                ...base,
                                height: '3rem',
                                minHeight: '3rem',
                                borderRadius: '16px',
                                fontSize: '1.125rem'
                              }),
                              multiValue: (base) => ({
                                ...base,
                                fontSize: '1.125rem'
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontSize: '1.125rem'
                              }),
                              input: (base) => ({
                                ...base,
                                fontSize: '1.125rem'
                              })
                            }}
                          />
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Driving License */}
              <FormField
                control={form.control}
                name="drivingLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Do you hold a driving license?{' '}
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you hold a valid full UK driving license. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '1.125rem'
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License Number */}
              {form.watch('drivingLicense') && (
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-watney">
                        <div>
                          Valid Uk Driving license{' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter your official UK driving license number as shown on your license card. e.g., ABC1234DG32HS56D" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter license number"
                          className=""
                          maxLength={16}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Car Owner */}
              <FormField
                control={form.control}
                name="carOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Do you own a car?{' '}
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you own or have regular access to a car for work-related travel. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Areas */}
              <FormField
                control={form.control}
                name="travelAreas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        What areas are you prepared to travel to?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="List the cities or areas where you’re available to work or travel. e.g., London, Manchester, Birmingham" />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="List areas..."
                        className="  resize-none border-gray-300 p-4 text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Solely for Everycare */}
              <FormField
                control={form.control}
                name="solelyForEverycare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Will you be working solely for Everycare?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you intend to work exclusively for Everycare and not for any other employer. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Employers */}
              {form.watch('solelyForEverycare') === false && (
                <FormField
                  control={form.control}
                  name="otherEmployers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-watney">
                        <div>
                          Who else do you work for?{' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Mention other employers or organizations you currently work for or are associated with. e.g., NHS Trust, Local Care Agency" />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter employer names"
                          className=" resize-none border-gray-300 p-4 text-lg"
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">
                        Example: NHS Trust, Local Care Agency
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Professional Body */}
              <FormField
                control={form.control}
                name="professionalBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you a member of a professional body?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you are a member of any professional body related to your field. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Professional Body Details */}
              {form.watch('professionalBody') && (
                <FormField
                  control={form.control}
                  name="professionalBodyDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-watney">
                        <div>
                          Please provide details{' '}
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Provide the name of the professional body and your membership number or details. e.g., Royal College of Nursing (RCN)" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter professional body details"
                          className=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Age 18+ */}
              <FormField
                control={form.control}
                name="isOver18"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you aged 18 or over?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you are aged 18 years or above. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you're aged 18 or over."
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Immigration Control */}
              <FormField
                control={form.control}
                name="isSubjectToImmigrationControl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you subject to immigration control?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you are subject to any immigration control or visa requirements. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you're subject to immigration control."
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Can Work in UK */}
              <FormField
                control={form.control}
                name="canWorkInUK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you free to remain and take up employment in the UK?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you are legally eligible to live and work in the United Kingdom without any restrictions. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you can legally work in the UK."
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        How did you hear about us?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Tell us how you found out about this job opportunity (e.g., job portal, referral, or social media). e.g., Indeed, Referral, LinkedIn" />
                    </FormLabel>
                    <Controller
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <Select
                          options={options}
                          placeholder="Let us know how you found out about this opportunity."
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          value={options.find(
                            (option) => option.value === field.value
                          )}
                          isClearable
                          className="text-lg"
                          styles={{
                            control: (base) => ({
                              ...base,
                              height: '3rem',
                              borderRadius: '16px',
                              fontSize: '1.125rem'
                            })
                          }}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Referral Employee */}
              {sourceValue === 'referral' && (
                <FormField
                  control={form.control}
                  name="referralEmployee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-watney">
                        <div>
                          Referred by (Employee Name)
                          <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the full name of the employee who referred you to this position, if applicable. e.g., Emma Watson" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the employee name"
                          className=""
                        />
                      </FormControl>
                      {/* <p className="text-md text-gray-400">Example: Emma Watson</p> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Availability Checkboxes */}
            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-start gap-2">
                    <FormLabel>
                      <div>
                        Availability (Select all that apply)
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select all days of the week when you are available to work. Use 'Select All' if you have full availability. e.g., Monday, Wednesday, Saturday" />
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size={'default'}
                      className="bg-watney hover:bg-watney/90 "
                      onClick={() => {
                        const days = [
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                          'sunday'
                        ];
                        days.forEach((day) =>
                          form.setValue(`availability.${day}`, true)
                        );
                      }}
                    >
                      Select All
                    </Button>
                  </div>
                  {/* <p className="pb-2 text-md text-gray-400">Example: Monday, Wednesday, Saturday</p> */}
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
                            <FormLabel className="text-lg font-normal">
                              {day}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Student & Pension Age */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="isStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you currently a student?
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Select 'Yes' if you are currently enrolled as a student at a college, university, or any educational institution. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you are currently enrolled..."
                      isClearable
                      value={
                        yesNoOptions.find((opt) => opt.value === field.value) ||
                        undefined
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : undefined)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    {/* <p className="text-md text-gray-400">Example: Yes</p> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUnderStatePensionAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div>
                        Are you under state pension age?{' '}
                        <span className="text-red-500">*</span>
                      </div>
                      <HelperTooltip text="Indicate whether you are below the official UK state pension age. This helps us with employment eligibility checks. e.g., Yes" />
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Indicate whether you are below the UK state pension age."
                      isClearable
                      value={
                        yesNoOptions.find(
                          (option) => option.value === field.value
                        ) || null
                      }
                      onChange={(option) =>
                        field.onChange(option ? option.value : null)
                      }
                      className="text-lg"
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem',
                          borderRadius: '16px',
                          fontSize: '1.125rem'
                        })
                      }}
                    />
                    {/* <p className="text-md text-gray-400">Example: Yes</p> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full bg-watney text-lg text-white hover:bg-watney/90 sm:w-auto"
              >
                Back
              </Button>

              <Button
                onClick={() => saveAndLogout()}
                className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
              >
                Save And Exit
              </Button>

              <Button
                type="submit"
                className="w-full bg-watney text-lg text-white hover:bg-watney/90 sm:w-auto"
              >
                Save And Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
