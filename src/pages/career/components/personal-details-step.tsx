'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { TCareer } from '@/types/career';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { countries } from '@/types';

// Define title options for react-select
const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' },
];

// Define yes/no options for react-select
const yesNoOptions = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' }
];

const personalDetailsSchema = z.object({
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
  countryOfResidence: z.string().min(1, { message: 'Country of residence is required' }),
  hasNationalInsuranceNumber: z.boolean().optional(),
  nationalInsuranceNumber: z.string().optional(),
  shareCode: z.string().optional(),
  postalAddress: z.object({
    line1: z.string().min(1, { message: 'Address line 1 is required' }),
    line2: z.string().optional(),
    city: z.string().min(1, { message: 'City is required' }),
    postCode: z.string().min(1, { message: 'Postal code is required' }),
    country: z.string().min(1, { message: 'Country is required' })
  })
});

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
    } else if (currentStep === 2) {
      const isValid = await form.trigger([
        'postalAddress.line1',
        'postalAddress.city',
        'postalAddress.postCode',
        'postalAddress.country'
      ]);
      if (!isValid) return;
    } else if (currentStep === 3) {
      const nhsRequired = form.watch('hasNhsNumber');

      const fieldsToValidate = [];
      if (nhsRequired) fieldsToValidate.push('nhsNumber');

      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < 2) {
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
const countryOptions = countries.map(country => ({
  label: country,
  value: country.toLowerCase().replace(/\s/g, '-'),
}));

  return (
    <Card>
      <CardHeader>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <Controller
                          name="title"
                          control={form.control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              options={titleOptions}
                              value={titleOptions.find(opt => opt.value === value)}
                              onChange={(option) => onChange(option?.value)}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select title"
                            />
                          )}
                        />
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
                          <Input {...field} />
                        </FormControl>
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
                          <Input {...field}  />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2 ">
                        <FormLabel>Date of Birth</FormLabel>
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select date of birth"
                          className="w-full rounded-md border border-gray-300  mt-0.5 px-3 py-2 text-sm"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          dropdownMode="select"
                          maxDate={new Date()}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
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
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              options={countryOptions}
                              value={countryOptions.find(opt => opt.value === value)}
                              onChange={(option) => onChange(option?.value)}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select nationality"
                            />
                          )}
                        />
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
                              value={countryOptions.find(opt => opt.value === value)}
                              onChange={(option) => onChange(option?.value)}
                              className="react-select-container"
                              classNamePrefix="react-select"
                              placeholder="Select country"
                            />
                          )}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <h1 className='font-semibold text-2xl'>Postal Address</h1>
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <FormField
                  control={form.control}
                  name="postalAddress.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
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
                          <Input {...field} />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
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
                          value={countryOptions.find(opt => opt.value === value)}
                          onChange={(option) => onChange(option?.value)}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select country"
                            />
                          )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  </div>
              </div>
              </div>
            )}

           
            
              
       

            {/* Step 3: Optional Numbers */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <FormLabel>National Insurance Number</FormLabel>
                      <FormField
                        control={form.control}
                        name="nationalInsuranceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Enter NI number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                  </div>

                  <div className="space-y-4">
                   
                          <FormLabel>Add Share Code:</FormLabel>
                      <FormField
                        control={form.control}
                        name="shareCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Enter Share Code" />
                            </FormControl>
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
                  {currentStep < 1 ? 'Next' : 'Next'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}