import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import { countries, nationalities } from '@/types';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import Loader from '@/components/shared/loader';

// Schema

const personalDetailsSchema = z
  .object({
    studentType: z.string().optional(), // used for conditional validation
    title: z.string().optional(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    initial: z.string().optional(),
    dateOfBirth: z.any().optional(), // use z.string() if needed
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    gender: z.string().min(1, { message: 'Please select a gender' }),
    countryOfDomicile: z
      .string()
      .min(1, { message: 'Please select Country of Domicile' }),
    nationality: z
      .string()
      .min(1, { message: 'Please select your nationality' }),
    ethnicity: z.string().min(1, { message: 'Please select an ethnicity' }),
    customEthnicity: z.string().optional(),
    countryOfBirth: z
      .string()
      .min(1, { message: 'Please select country of birth' }),
    maritalStatus: z
      .string()
      .min(1, { message: 'Please select marital status' }),
    requireVisa: z.string().optional(),
    applicationLocation: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (
      data.ethnicity === 'Other' &&
      (!data.customEthnicity || data.customEthnicity.trim() === '')
    ) {
      ctx.addIssue({
        path: ['customEthnicity'],
        code: z.ZodIssueCode.custom,
        message: 'Please specify your ethnicity'
      });
    }
  });

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

interface Props {
  defaultValues?: Partial<PersonalDetailsData>;
  onSaveAndContinue: (data: PersonalDetailsData) => void;
  onSave?: (data: PersonalDetailsData) => void;
  setCurrentStep: (step: number) => void;
  loading: any;
}

export function PersonalDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep,
  loading
}: Props) {
  const form = useForm<PersonalDetailsData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: '',
      firstName: '',
      lastName: '',
      initial: '',
      gender: '',
      phone: '',
      dateOfBirth: '',
      email: '',
      nationality: defaultValues?.nationality || '',
      ethnicity: '',
      countryOfBirth: '',
      maritalStatus: '',
      countryOfDomicile: '',
      studentType: defaultValues?.studentType || '',
      ...defaultValues
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const ethnicity = useWatch({ control: form.control, name: 'ethnicity' });

  function handleBack() {
    setCurrentStep(1);
  }

  function onSubmit(data: PersonalDetailsData) {
    onSaveAndContinue(data);
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const ethnicityOptions = [
    { value: 'white', label: 'White' },
    { value: 'asian', label: 'Asian' },
    { value: 'black', label: 'Black' },
    { value: 'mixed', label: 'Mixed' },
    { value: 'other', label: 'Other' }
  ];

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));
  const nationalityOptions = nationalities.map((nationality) => ({
    value: nationality,
    label: nationality
  }));

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married or in civil partnership' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' }
  ];

  const visaOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <Controller
                        name="title"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={titleOptions}
                            value={titleOptions.find(
                              (opt) => opt.value === value
                            )}
                            onChange={(option) => onChange(option?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select your formal title as it appears on official documents."
                            styles={{
                              placeholder: (provided) => ({
                                ...provided,
                                fontSize: '0.75rem',
                                color: '#9CA3AF'
                              })
                            }}
                          />
                        )}
                      />
                      <p className="text-xs  text-gray-400">
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
                        First Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your given name as it appears in your passport or national ID."
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">Example: Ridoy</p>
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
                          placeholder="If you have a middle name, enter only the first letter."
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">Example: H</p>
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
                        Last Name (Surname){' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="If you have a middle name, enter only the first letter. Leave blank if not applicable."
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">Example: Islam</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? new Date(field.value)
                      : null;

                    return (
                      <FormItem className="mt-2 flex flex-col">
                        <FormLabel>
                          Date of Birth (MM/DD/YYYY)
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            selected={selectedDate}
                            onChange={(date) => field.onChange(date)}
                            placeholder="Enter your date of birth using the format DD/MM/YYYY."
                            // disabled={true}
                       
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
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
                        Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Enter a valid email address that you check regularly. All communication will be sent here."
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          disabled
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: jhondou@gmail.co
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
                        Phone Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          {...field}
                          placeholder="Include your country code if applying from outside the UK."
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: +8801675792314 (for Bangladesh)
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Gender <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={genderOptions}
                          value={
                            field.value
                              ? genderOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Please select your gender."
                          isClearable
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
                        Example: Male, Female, Non-binary, Prefer not to say,
                        Other
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nationality <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={nationalityOptions}
                          value={
                            field.value
                              ? nationalityOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Please select your nationality."
                          isClearable
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
                        Example: Indonesian
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countryOfDomicile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country Of Domicile{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={
                            field.value
                              ? countryOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption?.value)
                          }
                          placeholder="Enter the country where you are legally resident."
                          isClearable
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
                        Example: Bangladesh
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ethnicity */}
                <FormField
                  control={form.control}
                  name="ethnicity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ethnicity <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={ethnicityOptions}
                          value={
                            field.value
                              ? ethnicityOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select Ethnicity"
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Ethnicity */}
                {ethnicity === 'other' && (
                  <FormField
                    control={form.control}
                    name="customEthnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Specify Ethnicity{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="!placeholder:text-gray-500 border-gray-200 p-1  text-sm placeholder:text-xs placeholder:text-gray-500"
                            placeholder="This is collected for equal opportunity monitoring. It will not affect your application."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Country of Birth */}
                <FormField
                  control={form.control}
                  name="countryOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country of Birth <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={
                            field.value
                              ? countryOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select the country where you were born."
                          isClearable
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
                        Example: Bangladesh
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Marital Status */}
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Select
                          options={maritalStatusOptions}
                          value={
                            field.value
                              ? maritalStatusOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select your current marital status."
                          isClearable
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
                        Options: Single, Married, Civil Partnership, Divorced,
                        Widowed, Prefer not to say
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </>
        )}
        <div className="flex justify-end px-5">
          {/* <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button> */}
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
