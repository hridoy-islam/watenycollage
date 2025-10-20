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
import { HelperTooltip } from '@/helper/HelperTooltip';

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


    postalAddressLine1: z
      .string()
      .min(1, { message: 'Address line 1 is required' }),
    postalAddressLine2: z.string().optional(),
    postalCity: z.string().min(1, { message: 'City is required' }),
    postalPostCode: z.string().min(1, { message: 'Postal code is required' }),
    postalCountry: z.string().min(1, { message: 'Country is required' }),

  })



type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export function AddressStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  saveAndLogout
}) {
  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      ...defaultValues,


      postalAddressLine1: defaultValues.postalAddressLine1 || '',
      postalAddressLine2: defaultValues.postalAddressLine2 || '',
      postalCity: defaultValues.postalCity || '',
      postalPostCode: defaultValues.postalPostCode || '',
      postalCountry: defaultValues.postalCountry || '',

    }
  });



  const onSubmit = (data: PersonalDetailsFormValues) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(2);
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


  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Address Information</CardTitle>
        <CardDescription className='text-lg'>
          Please provide your current postal address. This helps us verify your location and ensure smooth communication throughout the application process.
        </CardDescription>
      </CardHeader>

  <CardContent>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Postal Address</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Address Line 1 */}
          <FormField
            control={form.control}
            name="postalAddressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div>
                    Address Line 1<span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Provide the first line of your address, including building number and street name. e.g., 12B Parkview Road" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your primary address"
                    className="placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Line 2 */}
          <FormField
            control={form.control}
            name="postalAddressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div>Address Line 2 (Optional)</div>
                  <HelperTooltip text="Add apartment, suite, floor, or unit number if applicable. e.g., Flat 3A" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter additional address info (optional)"
                    className="placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="postalCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div>
                    City<span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Enter the city or town where you reside. e.g., London" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your city"
                    className="placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Postal Code */}
          <FormField
            control={form.control}
            name="postalPostCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div>
                    Postal Code<span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Provide the postal or ZIP code for your area. e.g., SW1A 1AA" />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your postal or ZIP code"
                    className="placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country */}
          <FormField
            control={form.control}
            name="postalCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div>
                    Country<span className="text-red-500">*</span>
                  </div>
                  <HelperTooltip text="Select the country of your postal address. e.g., United Kingdom" />
                </FormLabel>
                <Controller
                  name="postalCountry"
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={countryOptions}
                      value={countryOptions.find((opt) => opt.value === value)}
                      onChange={(option) => onChange(option?.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select your country"
                      styles={{
                        container: (base) => ({ ...base, width: '100%' }),
                        control: (base) => ({
                          ...base,
                          width: '100%',
                          borderRadius: '16px',
                          fontSize: '1.125rem',
                          minHeight: '3rem',
                          height: '3rem',
                          padding: '0 0.75rem',
                        }),
                        menu: (base) => ({ ...base, width: '100%' }),
                        placeholder: (base) => ({
                          ...base,
                          fontSize: '1.125rem',
                          color: '#9CA3AF',
                        }),
                        singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                        input: (base) => ({ ...base, fontSize: '1.125rem' }),
                      }}
                    />
                  )}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
  <Button
    type="button"
    variant="outline"
    onClick={handleBack}
    className="bg-watney text-lg text-white hover:bg-watney/90 w-full sm:w-auto"
  >
    Back
  </Button>

  <Button
    onClick={() => saveAndLogout()}
    className="bg-watney text-white hover:bg-watney/90 w-full sm:w-auto"
  >
    Save And Exit
  </Button>

  <Button
    type="submit"
    className="bg-watney text-lg text-white hover:bg-watney/90 w-full sm:w-auto"
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
