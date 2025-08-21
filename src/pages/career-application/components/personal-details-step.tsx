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
import { countries, nationalities } from '@/types';
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
    shareCode: z.string().optional(),

    postalAddressLine1: z
      .string()
      .min(1, { message: 'Address line 1 is required' }),
    postalAddressLine2: z.string().optional(),
    postalCity: z.string().min(1, { message: 'City is required' }),
    postalPostCode: z.string().min(1, { message: 'Postal code is required' }),
    postalCountry: z.string().min(1, { message: 'Country is required' }),
    prevPostalAddressLine1: z.string().optional(),
    prevPostalAddressLine2: z.string().optional(),
    prevPostalCity: z.string().optional(),
    prevPostalPostCode: z.string().optional(),
    prevPostalCountry: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.nationality !== 'british') {
    
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
  setCurrentStep
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
      shareCode: '',

      postalAddressLine1: '',
      postalAddressLine2: '',
      postalCity: '',
      postalPostCode: '',
      postalCountry: '',
      prevPostalAddressLine1: '',
      prevPostalAddressLine2: '',
      prevPostalCity: '',
      prevPostalPostCode: '',
      prevPostalCountry: ''
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
          : ''
      });
    }
  }, [defaultValues, form]);

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

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

  const watchNationality = form.watch('nationality');

  return (
    <Card className="border-none shadow-none ">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>

        <CardDescription>
          Please provide your basic details. This information helps us tailor
          your application experience and ensure accurate communication.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 ">
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
                            value={titleOptions.find(
                              (opt) => opt.value === value
                            )}
                            onChange={(option) => onChange(option?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select your preferred title"
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
                        First Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your first name"
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-500">Example: Emma</p>

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
                          className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">Example: J</p>

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
                          className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">
                        Example: Williams
                      </p>

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
                          />
                        </FormControl>
                        <p className="text-xs text-gray-400">
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
                          className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400 "
                          disabled
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">
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
                          className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">
                        Example: +44 7123 456789
                        <span className="text-red-500">*</span>
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
                            className="!placeholder:text-gray-400  placeholder:text-[12px] placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
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
                                value={nationalityOptions.find(
                                  (opt) => opt.value === value
                                )}
                                onChange={(option) => onChange(option?.value)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select your nationality as stated on your passport or legal documents."
                                styles={{
                                  container: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  control: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  placeholder: (base) => ({
                                    ...base,
                                    fontSize: '0.75rem',
                                    color: '#9CA3AF'
                                  })
                                }}
                              />
                            )}
                          />
                          <p className="text-xs text-gray-400">
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
                                value={countryOptions.find(
                                  (opt) => opt.value === value
                                )}
                                onChange={(option) => onChange(option?.value)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Choose the country where you currently reside"
                                styles={{
                                  container: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  control: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    width: '100%'
                                  }),
                                  placeholder: (base) => ({
                                    ...base,
                                    fontSize: '0.75rem',
                                    color: '#9CA3AF'
                                  })
                                }}
                              />
                            )}
                          />
                          <p className="text-xs text-gray-400">
                            Example: Select country (e.g., America)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {watchNationality !== 'british' && (
                  // <div className="col-span-full">
                  //   <FormField
                  //     control={form.control}
                  //     name="isBritishCitizen"
                  //     render={({ field }) => (
                  //       <FormItem>
                  //         <FormLabel>
                  //           What is your current immigration status in the UK?
                  //           For example, are you a British citizen, hold
                  //           settled or pre-settled status, have indefinite
                  //           leave to remain, or are you on a visa?
                  //         </FormLabel>
                  //         <Controller
                  //           name="isBritishCitizen"
                  //           control={form.control}
                  //           render={({ field }) => (
                  //             <div className="w-[60vw]">
                  //               <Select
                  //                 options={yesNoOptions}
                  //                 value={yesNoOptions.find(
                  //                   (opt) => opt.value === field.value
                  //                 )}
                  //                 onChange={(selected) =>
                  //                   field.onChange(selected?.value)
                  //                 }
                  //                 className="react-select-container"
                  //                 classNamePrefix="react-select"
                  //                 placeholder="Select your immigration status"
                  //                 styles={{
                  //                   placeholder: (provided) => ({
                  //                     ...provided,
                  //                     fontSize: '0.75rem',
                  //                     color: '#9CA3AF'
                  //                   })
                  //                 }}
                  //               />
                  //             </div>
                  //           )}
                  //         />
                  //         <p className="text-xs text-gray-400">
                  //           Example: British citizen
                  //         </p>
                  //         <FormMessage />
                  //       </FormItem>
                  //     )}
                  //   />

                  // </div>

                  <div className="space-y-2">
                    <FormLabel>Please give your Share Code:</FormLabel>
                    <FormField
                      control={form.control}
                      name="shareCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the 6-character code shared with you"
                              className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                            />
                          </FormControl>
                          <p className="text-xs text-gray-400">
                            Example: 5J7K9Q
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h1 className="text-xl font-semibold">Postal Address</h1>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="postalAddressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address Line 1<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the primary address (e.g., house number, street name)"
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: 12B Parkview Road
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalAddressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Optional additional address info (e.g., apartment, unit)."
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: Flat 3A
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=" Enter the name of your town or city"
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: London
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Postal Code<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your area’s postal/ZIP code."
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: SW1A 1AA
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country<span className="text-red-500">*</span>
                        </FormLabel>
                        <Controller
                          name="postalCountry"
                          control={form.control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              options={countryOptions}
                              value={countryOptions.find(
                                (opt) => opt.value === value
                              )}
                              onChange={(option) => onChange(option?.value)}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select the country corresponding to the above address"
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
                          Example: London
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold">Previous Address</h1>
                  <h1 className="text-[14px] font-medium text-gray-400">
                    If you have lived at your present address for less than 12
                    months
                  </h1>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="prevPostalAddressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the primary address (e.g., house number, street name)"
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: 12B Parkview Road
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prevPostalAddressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Optional additional address info (e.g., apartment, unit)."
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: Flat 3A
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prevPostalCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder=" Enter the name of your town or city"
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: London
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prevPostalPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your area’s postal/ZIP code."
                            className="!placeholder:text-gray-400 placeholder:text-xs placeholder:text-gray-400"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-400">
                          Example: SW1A 1AA
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prevPostalCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Controller
                          name="prevPostalCountry"
                          control={form.control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              options={countryOptions}
                              value={countryOptions.find(
                                (opt) => opt.value === value
                              )}
                              onChange={(option) => onChange(option?.value)}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select the country corresponding to the above address"
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
                          Example: London
                        </p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <div className="space-x-2">
                {/* {currentStep === 2 && (
                  <Button type="button" variant="outline" onClick={handleSkip}>
                    Skip
                  </Button>
                )} */}
                <Button
                  type="submit"
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  Next
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
