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
    licenseNumber: z.string().optional(),
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

    if (data.drivingLicense && !data.licenseNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide your driving license number',
        path: ['licenseNumber']
      });
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
        <CardDescription className='text-lg'>
          Please provide specific details about the position you're applying for. This information helps us better understand your suitability and availability.
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
                        Available From Date (MM/DD/YYYY)
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={selectedDate}
                          onChange={(date) => field.onChange(date)}
                          placeholder="When would you be available to start this role?"
                          futureDate={false}
                          // 👇 Pass className to style the internal input if possible
                          className="h-12 rounded-full text-lg"
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">Example: 01/06/2025</p>
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
                      Are you competent in another language?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
                      className="text-lg"
                      // 👇 Style the control (input container)
                      styles={{
                        control: (base) => ({
                          ...base,
                          height: '3rem', // h-12 = 3rem
                          borderRadius: '16px',
                          fontSize: '1.125rem', // text-lg
                        }),
                        placeholder: (base) => ({ ...base, fontSize: '1.125rem' }),
                        singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                        input: (base) => ({ ...base, fontSize: '1.125rem' }),
                      }}
                    />
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      <FormLabel>
                        Select the languages <span className="text-red-500">*</span>
                      </FormLabel>
                      <Controller
                        control={form.control}
                        name="otherLanguages"
                        render={({ field }) => (
                          <Select
                            isMulti
                            options={languages.map((lang) => ({
                              value: lang,
                              label: lang.charAt(0).toUpperCase() + lang.slice(1),
                            }))}
                            placeholder="Choose languages"
                            onChange={(selected) =>
                              field.onChange(selected?.map((opt) => opt.value) || [])
                            }
                            value={field.value?.map((val) => ({
                              value: val,
                              label: val.charAt(0).toUpperCase() + val.slice(1),
                            }))}
                            className="text-lg"
                            styles={{
                              control: (base) => ({
                                ...base,
                                height: '3rem',
                                minHeight: '3rem',
                                borderRadius: '16px',
                                fontSize: '1.125rem',
                              }),
                              multiValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                              placeholder: (base) => ({ ...base, fontSize: '1.125rem' }),
                              input: (base) => ({ ...base, fontSize: '1.125rem' }),
                            }}
                          />
                        )}
                      />
                      <p className="text-md text-gray-400">Example: English, Bengali</p>
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
                      Do you hold a driving license? <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                      }}
                    />
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      <FormLabel>
                        License Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter license number"
                          className=""
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">Example: ABC123456D</p>
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
                      Do you own a car? <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      What areas are you prepared to travel to?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="List areas..."
                        className="  border-gray-300 p-4 text-lg resize-none"
                      />
                    </FormControl>
                    <p className="text-md text-gray-400">Example: London, Manchester, Birmingham</p>
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
                      Will you be working solely for Everycare?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      <FormLabel>
                        Who else do you work for? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter employer names"
                          className=" border-gray-300 p-4 text-lg resize-none"
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">Example: NHS Trust, Local Care Agency</p>
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
                      Are you a member of a professional body?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes or No"
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      <FormLabel>
                        Please provide details <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter professional body details"
                          className=""
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">Example: Royal College of Nursing (RCN)</p>
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
                      Are you aged 18 or over?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you're aged 18 or over."
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      Are you subject to immigration control?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you're subject to immigration control."
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      Are you free to remain and take up employment in the UK?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you can legally work in the UK."
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      How did you hear about us?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Controller
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <Select
                          options={options}
                          placeholder="Let us know how you found out about this opportunity."
                          onChange={(selected) => field.onChange(selected?.value)}
                          value={options.find((option) => option.value === field.value)}
                          isClearable
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
                      )}
                    />
                    <p className="text-md text-gray-400">Example: Indeed, Referral, LinkedIn</p>
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
                      <FormLabel>
                        Referred by (Employee Name)
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the employee name"
                          className=""
                        />
                      </FormControl>
                      <p className="text-md text-gray-400">Example: Emma Watson</p>
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
                      Availability (Select all that apply)
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size={'default'}
                      className="bg-watney hover:bg-watney/90 "
                      onClick={() => {
                        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        days.forEach((day) => form.setValue(`availability.${day}`, true));
                      }}
                    >
                      Select All
                    </Button>
                  </div>
                  <p className="pb-2 text-md text-gray-400">Example: Monday, Wednesday, Saturday</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
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
                            <FormLabel className="font-normal text-lg">{day}</FormLabel>
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
                      Are you currently a student?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Select Yes if you are currently enrolled..."
                      isClearable
                      value={yesNoOptions.find((opt) => opt.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
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
                      Are you under state pension age? <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      options={yesNoOptions}
                      placeholder="Indicate whether you are below the UK state pension age."
                      isClearable
                      value={yesNoOptions.find((option) => option.value === field.value) || null}
                      onChange={(option) => field.onChange(option ? option.value : null)}
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
                    <p className="text-md text-gray-400">Example: Yes</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className=" bg-watney px-6 text-lg text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <Button type="submit" className="bg-watney px-6 text-lg text-white hover:bg-watney/90"
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