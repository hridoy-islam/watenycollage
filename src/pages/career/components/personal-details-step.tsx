'use client';

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
import { useState } from 'react';
import type { TCareer } from '@/types/career';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { countries, nationalities } from '@/types';
import 'react-datepicker/dist/react-datepicker.css';
import { format, getMonth, getYear, parse } from 'date-fns';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

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

const personalDetailsSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    initial: z.string().optional(),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    dateOfBirth: z.date({
      required_error: 'Date of birth is required'
    }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    phone: z.string().min(1, { message: 'Phone number is required' }),
    nationality: z.string().min(1, { message: 'Nationality is required' }),
    countryOfResidence: z
      .string()
      .min(1, { message: 'Country of residence is required' }),
    hasNationalInsuranceNumber: z.boolean().optional(),
    nationalInsuranceNumber: z.string().optional(),
    isBritishCitizen: z.boolean(),
    shareCode: z.string().optional(),
    postalAddress: z.object({
      line1: z.string().min(1, { message: 'Address line 1 is required' }),
      line2: z.string().optional(),
      city: z.string().min(1, { message: 'City is required' }),
      postCode: z.string().min(1, { message: 'Postal code is required' }),
      country: z.string().min(1, { message: 'Country is required' })
    })
  })
  .refine(
    (data) => {
      // Only validate shareCode if isBritishCitizen is false
      if (data.isBritishCitizen === false) {
        return (
          typeof data.shareCode === 'string' && data.shareCode.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Share Code is required when not a British Citizen',
      path: ['shareCode'] // This makes the error appear under the shareCode field
    }
  );

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsStepProps {
  value: Partial<TCareer>;
  onNext: (data: Partial<TCareer>) => void;
  onBack: (currentStep?: number) => void;
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export function PersonalDetailsStep({
  value,
  onNext,
  onBack,
  initialStep = 1,
  onStepChange
}: PersonalDetailsStepProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: value.title || '',
      firstName: value.firstName || '',
      initial: value.initial || '',
      lastName: value.lastName || '',
      email: value.email || '',
      phone: value.phone || '',
      nationality: value.nationality || '',
      countryOfResidence: value.countryOfResidence || '',
      dateOfBirth: value.dateOfBirth ? new Date(value.dateOfBirth) : undefined,
      nationalInsuranceNumber: value.nationalInsuranceNumber || '',
      isBritishCitizen:
        value.isBritishCitizen !== undefined
          ? value.isBritishCitizen
          : undefined,
      shareCode: value.shareCode || '',
      postalAddress: {
        line1: value.postalAddress?.line1 || '',
        line2: value.postalAddress?.line2 || '',
        city: value.postalAddress?.city || '',
        postCode: value.postalAddress?.postCode || '',
        country: value.postalAddress?.country || ''
      }
    }
  });

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onNext(data);
  };

  const handleNext = async () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const isValid = await form.trigger([
        'title',
        'firstName',
        'lastName',
        'dateOfBirth',
        'email',
        'phone',
        'nationality',
        'countryOfResidence'
      ]);
      if (!isValid) return;
    } else if (currentStep === 1) {
      const isValid = await form.trigger([
        'postalAddress.line1',
        'postalAddress.city',
        'postalAddress.postCode',
        'postalAddress.country'
      ]);
      if (!isValid) return;
    } else if (currentStep === 1) {
      const nhsRequired = form.watch('hasNhsNumber');

      const fieldsToValidate = [];
      if (nhsRequired) fieldsToValidate.push('nhsNumber');

      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    } else {
      onBack();
    }
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
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  const nationalityOptions = nationalities.map((nationality) => ({
    label: nationality,
    value: nationality.toLowerCase().replace(/\s/g, '-')
  }));

  return (
    <Card className="border-none shadow-none">
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
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 ">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="z-[1002]">
                        <FormLabel>Title</FormLabel>
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
                                  color: '#00000'
                                })
                              }}
                            />
                          )}
                        />
                        <p className="text-xs  text-gray-800">
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
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your first name"
                            className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-800">Example: Emma</p>

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
                            placeholder="Enter the first letter of your middle name, if applicable."
                            className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-800">Example: J</p>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your family name/surname"
                            className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-800">
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
                      const selectedDate = field.value
                        ? new Date(field.value)
                        : null;

                      return (
                        <FormItem className="mt-2 flex w-full flex-col">
                          <FormLabel>Date of Birth (MM/DD/YYYY)</FormLabel>
                          <FormControl className="w-full">
                            <CustomDatePicker
                              selected={selectedDate}
                              onChange={(date) => field.onChange(date)}
                              placeholder="Use your official birth date"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            placeholder="Enter a valid email address you check regularly"
                            className="!placeholder:text-black   placeholder:text-xs  placeholder:text-black "
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-800">
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            {...field}
                            placeholder="Include country code if applying from outside the UK"
                            className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                          />
                        </FormControl>
                        <p className="text-xs  text-gray-800">
                          Example: +44 7123 456789*
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
                              className="!placeholder:text-black  placeholder:text-[12px] placeholder:text-black"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
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
                            <FormLabel>Nationality</FormLabel>
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
                                      color: '#000000'
                                    })
                                  }}
                                />
                              )}
                            />
                            <p className="text-xs text-gray-800">
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
                            <FormLabel>Country of Residence</FormLabel>
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
                                      color: '#000000'
                                    })
                                  }}
                                />
                              )}
                            />
                            <p className="text-xs text-gray-800">
                              Example: Select country (e.g., America)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="isBritishCitizen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Do you currently hold, or have you ever held,
                            British citizenship or any form of British
                            nationality, such as British Overseas Citizen,
                            British Dependent or Overseas Territories Citizen,
                            British National (Overseas), British Protected
                            Person, or British Subject?
                          </FormLabel>
                          <Controller
                            name="isBritishCitizen"
                            control={form.control}
                            render={({ field }) => (
                              <div className="w-[60vw]">
                                <Select
                                  options={yesNoOptions}
                                  value={yesNoOptions.find(
                                    (opt) => opt.value === field.value
                                  )}
                                  onChange={(selected) =>
                                    field.onChange(selected?.value)
                                  }
                                  className="react-select-container "
                                  classNamePrefix="react-select"
                                  placeholder="This includes types such as British Overseas Citizen, British National (Overseas), British Subject, etc."
                                  styles={{
                                    placeholder: (provided) => ({
                                      ...provided,
                                      fontSize: '0.75rem',
                                      color: '#00000'
                                    })
                                  }}
                                />
                              </div>
                            )}
                          />
                          <p className="text-xs  text-gray-800">
                            Example: Select Yes / No
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchIsBritish === false && (
                    <div className="space-y-2">
                      <FormLabel> Please give your Share Code:</FormLabel>
                      <FormField
                        control={form.control}
                        name="shareCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter the 6-character code shared with you"
                                className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                              />
                            </FormControl>
                            <p className="text-xs  text-gray-800">
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
                      name="postalAddress.line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the primary address (e.g., house number, street name)"
                              className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
                            Example: 12B Parkview Road
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalAddress.line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Optional additional address info (e.g., apartment, unit)."
                              className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
                            Example: Flat 3A
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder=" Enter the name of your town or city"
                              className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
                            Example: London
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalAddress.postCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your area’s postal/ZIP code."
                              className="!placeholder:text-black  placeholder:text-xs placeholder:text-black"
                            />
                          </FormControl>
                          <p className="text-xs  text-gray-800">
                            Example: SW1A 1AA
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalAddress.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Controller
                            name="postalAddress.country"
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
                                    color: '#00000'
                                  })
                                }}
                              />
                            )}
                          />
                          <p className="text-xs  text-gray-800">
                            Example: London
                          </p>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

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
                  type="button"
                  onClick={handleNext}
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
