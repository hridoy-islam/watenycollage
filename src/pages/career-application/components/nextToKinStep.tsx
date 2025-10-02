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
    
    emergencyContactNumber: z
      .string()
      .min(1, { message: 'Emergency contact number is required' }),
    emergencyEmail: z
      .string()
      .email({ message: 'Please enter a valid email address' }),
    emergencyFullName: z.string().min(1, { message: 'Full name is required' }),
    emergencyRelationship: z
      .string()
      .min(1, { message: 'Relationship is required' }),
    emergencyAddress: z.string().min(1, { message: 'Address is required' })
  })
  

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export function NextToKinStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      ...defaultValues,

     
      emergencyContactNumber: '',
      emergencyEmail: '',
      emergencyFullName: '',
      emergencyRelationship: '',
      emergencyAddress: ''
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      
        emergencyContactNumber: defaultValues?.emergencyContactNumber || '',
        emergencyEmail: defaultValues?.emergencyEmail || '',
        emergencyFullName: defaultValues?.emergencyFullName || '',
        emergencyRelationship: defaultValues?.emergencyRelationship || '',
        emergencyAddress: defaultValues?.emergencyAddress || ''
      });
    }
  }, [defaultValues, form]);

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onSaveAndContinue(data);
  };

  const handleBack = () => {
    setCurrentStep(3);
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

  const relationshipOptions = emergencyContactRelationships.map((relation) => ({
    value: relation,
    label: relation
  }));

 return (
  <Card className="border-none shadow-none">
    <CardHeader>
      <CardTitle className="text-2xl">Next of Kin Details</CardTitle>
      <CardDescription>
        Please provide the contact information for your next of kin or emergency contact. This ensures we can reach someone on your behalf if needed during the application or onboarding process.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">Emergency Contact Information</h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="emergencyFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter the full name of your emergency contact"
                        className="h-12 rounded-full text-lg placeholder:text-gray-500"
                      />
                    </FormControl>
                    <p className="text-md text-gray-500">
                      Example: Jane Doe
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter a phone number where this person can be reached in an emergency"
                        className="h-12 rounded-full text-lg placeholder:text-gray-500"
                      />
                    </FormControl>
                    <p className="text-md text-gray-500">
                      Example: +44 7700 900123
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="Provide an email address for non-urgent communication"
                        className="h-12 rounded-full text-lg placeholder:text-gray-500"
                      />
                    </FormControl>
                    <p className="text-md text-gray-500">
                      Example: jane.doe@example.com
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Relationship <span className="text-red-500">*</span>
                    </FormLabel>
                    <Controller
                      name="emergencyRelationship"
                      control={form.control}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          options={relationshipOptions}
                          value={relationshipOptions.find((opt) => opt.value === value) || null}
                          onChange={(option) => onChange(option?.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Select your relationship with this person"
                          isClearable
                          styles={{
                            container: (base) => ({ ...base, width: '100%' }),
                            control: (base) => ({
                              ...base,
                              width: '100%',
                              borderRadius: '9999px',
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
                      Example: Parent
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyAddress"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>
                      Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        placeholder="Enter the full address of your emergency contact"
                        className="h-12 rounded-full text-lg placeholder:text-gray-500"
                      />
                    </FormControl>
                    <p className="text-md text-gray-500">
                      Example: 12 High Street, Bristol, BS1 4ST, United Kingdom
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
              className="h-12 rounded-full bg-watney px-6 text-lg text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="h-12 rounded-full bg-watney px-6 text-lg text-white hover:bg-watney/90"
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
