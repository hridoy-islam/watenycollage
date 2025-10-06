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
import { useEffect, useState } from 'react';
import type { TCareer } from '@/types/career';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import {
  countries,
  emergencyContactRelationships,
  nationalities
} from '@/types';
import 'react-datepicker/dist/react-datepicker.css';
import { format, getMonth, getYear, parse } from 'date-fns';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import moment from 'moment';

// Define title options for react-select
const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' }
];

// Define yes/no options for react-select
const yesNoOptions = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' }
];

export const personalDetailsSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    initial: z.string().optional(),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    nationality: z.string().min(1, { message: 'Nationality is required' }),
    countryOfResidence: z
      .string()
      .min(1, { message: 'Country of residence is required' }),
    hasNationalInsuranceNumber: z.boolean().optional(),
    nationalInsuranceNumber: z.string().optional(),
    isBritishCitizen: z.boolean().optional(),
    shareCode: z.string().optional(),


  })
  .superRefine((data, ctx) => {
    if (data.nationality !== 'british') {
      // if (typeof data.isBritishCitizen !== 'boolean') {
      //   ctx.addIssue({
      //     path: ['isBritishCitizen'],
      //     code: z.ZodIssueCode.custom,
      //     message: 'This field is required if not British'
      //   });
      // }

      if (!data.shareCode || data.shareCode.trim() === '') {
        ctx.addIssue({
          path: ['shareCode'],
          code: z.ZodIssueCode.custom,
          message: 'Share Code is required if not British'
        });
      }
    }
  });

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export function PersonalDetailsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  saveAndLogout
}) {
  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      ...defaultValues,

      title: defaultValues?.title || '',
      firstName: '',
      initial: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      countryOfResidence: '',
      dateOfBirth: undefined,
      nationalInsuranceNumber: '',
      isBritishCitizen: undefined,
      shareCode: '',

    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        dateOfBirth: defaultValues.dateOfBirth
          ? new Date(defaultValues.dateOfBirth)
          : undefined,
        nationality: defaultValues.nationality
          ? defaultValues.nationality.toLowerCase().replace(/\s/g, '-')
          : '',

      });
    }
  }, [defaultValues, form]);

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };
  const watchIsBritish = form.watch('isBritishCitizen');

  // const handleSkip = () => {
  //   if (currentStep === 3) {
  //     if (form.watch('hasNationalInsuranceNumber')) {
  //       form.setValue('hasNationalInsuranceNumber', false);
  //       form.setValue('nationalInsuranceNumber', '');
  //     }
  //     if (form.watch('hasNhsNumber')) {
  //       form.setValue('hasNhsNumber', false);
  //       form.setValue('nhsNumber', '');
  //     }
  //   }
  //   handleNext();
  // };
  const countryOptions = countries.map((country) => ({
    label: country,
    value: country.toLowerCase().replace(/\s/g, '-')
  }));
  const yesNoOptions = [
    { value: true, label: 'British citizen' },
    {
      value: false,
      label:
        'Hold settled or pre-settled status, have indefinite leave to remain, or are you on a visa'
    }
  ];

  const nationalityOptions = nationalities.map((nationality) => ({
    label: nationality,
    value: nationality.toLowerCase().replace(/\s/g, '-')
  }));

  console.log(defaultValues, 'defaultValues in personal details step');
  const relationshipOptions = emergencyContactRelationships.map((relation) => ({
    value: relation,
    label: relation
  }));
  const watchNationality = form.watch('nationality');

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Personal Information</CardTitle>
        <CardDescription className='text-lg'>
          Please provide your basic details. This information helps us tailor
          your application experience and ensure accurate communication.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="z-[1002]">
                      <FormLabel>
                        Title<span className="text-red-500">*</span>
                      </FormLabel>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={titleOptions}
                            value={titleOptions.find((opt) => opt.value === value)}
                            onChange={(option) => onChange(option?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select your preferred title"
                            styles={{
                              placeholder: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem',
                                color: '#9CA3AF'
                              }),
                              control: (provided) => ({
                                ...provided,
                                borderRadius: '16px',
                                fontSize: '1.125rem',
                                minHeight: '3rem', // h-12 = 48px
                                height: '3rem'
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              input: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: '0 0.75rem' // px-3 for better spacing
                              })
                            }}
                          />
                        )}
                      />
                      <p className="text-md text-gray-500">
                        Example: Mr., Ms., Mrs., Dr., etc
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        First Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">Example: Emma</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Initial (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your middle name, if applicable."
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">Example: J</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your family name/surname"
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">Example: Williams</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const value = field.value ? new Date(field.value) : null;
                    return (
                      <FormItem className="mt-2 flex w-full flex-col">
                        <FormLabel>
                          Date of Birth (MM/DD/YYYY)
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl className="w-full">
                          <CustomDatePicker
                            selected={value}
                            onChange={(date) => field.onChange(date)}
                            placeholder="Use your official birth date"
                            className="h-12 w-full rounded-full text-lg"
                          />
                        </FormControl>
                        <p className="text-md text-gray-500">
                          Example: MM/DD/YYYY or 01/24/1995
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Enter a valid email address you check regularly"
                          className=" placeholder:text-gray-500"
                          disabled
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
                        Example: emma.williams@email.com
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          placeholder="Include country code if applying from outside the UK"
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
                        Example: +44 7123 456789
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>National Insurance Number</FormLabel>
                  <FormField
                    control={form.control}
                    name="nationalInsuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="UK applicants only. Format: Two letters, six numbers, and a final letter"
                            className=" placeholder:text-gray-500"
                          />
                        </FormControl>
                        <p className="text-md text-gray-500">
                          Example: QQ 12 34 56 C
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-full space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nationality<span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            name="nationality"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                options={nationalityOptions}
                                value={nationalityOptions.find((opt) => opt.value === value)}
                                onChange={(option) => onChange(option?.value)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select your nationality as stated on your passport or legal documents."
                                styles={{
                                  container: (base) => ({ ...base, width: '100%' }),
                                  control: (base) => ({
                                    ...base,
                                    width: '100%',
                                    borderRadius: '16px',
                                    fontSize: '1.125rem',
                                    minHeight: '3rem',
                                    height: '3rem'
                                  }),
                                  menu: (base) => ({ ...base, width: '100%' }),
                                  placeholder: (base) => ({
                                    ...base,
                                    fontSize: '1.125rem',
                                    color: '#9CA3AF'
                                  }),
                                  singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                                  input: (base) => ({ ...base, fontSize: '1.125rem' }),
                                  valueContainer: (base) => ({
                                    ...base,
                                    padding: '0 0.75rem'
                                  })
                                }}
                              />
                            )}
                          />
                          <p className="text-md text-gray-500">
                            Choose a nationality (e.g., American)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="countryOfResidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Country of Residence
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Controller
                            name="countryOfResidence"
                            control={form.control}
                            render={({ field: { onChange, value } }) => (
                              <Select
                                options={countryOptions}
                                value={countryOptions.find((opt) => opt.value === value)}
                                onChange={(option) => onChange(option?.value)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Choose the country where you currently reside"
                                styles={{
                                  container: (base) => ({ ...base, width: '100%' }),
                                  control: (base) => ({
                                    ...base,
                                    width: '100%',
                                    borderRadius: '16px',
                                    fontSize: '1.125rem',
                                    minHeight: '3rem',
                                    height: '3rem'
                                  }),
                                  menu: (base) => ({ ...base, width: '100%' }),
                                  placeholder: (base) => ({
                                    ...base,
                                    fontSize: '1.125rem',
                                    color: '#9CA3AF'
                                  }),
                                  singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                                  input: (base) => ({ ...base, fontSize: '1.125rem' }),
                                  valueContainer: (base) => ({
                                    ...base,
                                    padding: '0 0.75rem'
                                  })
                                }}
                              />
                            )}
                          />
                          <p className="text-md text-gray-500">
                            Example: Select country (e.g., America)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchNationality !== 'british' && (
                      <FormField
                        control={form.control}
                        name="shareCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-watney'>Please give your Share Code:
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter the code"
                                onChange={(e) => {
                                  let value = e.target.value
                                    .toUpperCase()
                                    .replace(/[^A-Z0-9]/g, '');
                                  value = value.match(/.{1,3}/g)?.join('-') || '';
                                  field.onChange(value);
                                }}
                                value={field.value}
                                className=" placeholder:text-gray-500"
                              />
                            </FormControl>
                            <p className="text-md text-gray-500">
                              For Non Uk Citizen only. Example:{' '}
                              <span className="font-semibold text-gray-700">ABC-12D-CFD</span>
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>


                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-watney  text-lg text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <Button
                onClick={() => saveAndLogout()}
                className="bg-watney  text-white hover:bg-watney/90"
              >
                Save and Logout
              </Button>
              <Button
                type="submit"
                className="bg-watney  text-lg text-white hover:bg-watney/90"
              >
                Save and Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
