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
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
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
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
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
                          placeholder="Enter the name of your town or city"
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
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
                          className=" placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="text-md text-gray-500">
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
                            value={countryOptions.find((opt) => opt.value === value)}
                            onChange={(option) => onChange(option?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select the country corresponding to the above address"
                            styles={{
                              container: (base) => ({ ...base, width: '100%' }),
                              control: (base) => ({
                                ...base,
                                width: '100%',
                                borderRadius: '16px',
                                fontSize: '1.125rem',
                                minHeight: '3rem',
                                height: '3rem',
                                padding: '0 0.75rem'
                              }),
                              menu: (base) => ({ ...base, width: '100%' }),
                              placeholder: (base) => ({
                                ...base,
                                fontSize: '1.125rem',
                                color: '#9CA3AF'
                              }),
                              singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                              input: (base) => ({ ...base, fontSize: '1.125rem' })
                            }}
                          />
                        )}
                      />
                      <p className="text-md text-gray-500">
                        Example: United Kingdom
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                Save And Logout
              </Button>
              <Button
                type="submit"
                className="bg-watney  text-lg text-white hover:bg-watney/90"
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
