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

export const personalDetailsSchema = z.object({
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
});

type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export function NextToKinStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  saveAndLogout
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
        <CardDescription className="text-lg">
          Please provide the contact information for your next of kin or
          emergency contact. This ensures we can reach someone on your behalf if
          needed during the application or onboarding process.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-xl font-semibold">
                Emergency Contact Information
              </h1>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="emergencyFullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div>
                          Full Name <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the full name of your emergency contact. e.g., Jane Doe" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter full name of your emergency contact"
                          className="placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Number */}
                <FormField
                  control={form.control}
                  name="emergencyContactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div>
                          Contact Number <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Provide a phone number where this person can be reached in an emergency. e.g., +44 7700 900123" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter emergency contact number"
                          className="placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="emergencyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div>
                          Email <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Provide an email address for non-urgent communication. e.g., jane.doe@example.com" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Enter contact's email address"
                          className="placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Relationship */}
                <FormField
                  control={form.control}
                  name="emergencyRelationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div>
                          Relationship <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Select your relationship with this person. e.g., Parent" />
                      </FormLabel>
                      <Controller
                        name="emergencyRelationship"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                          <Select
                            options={relationshipOptions}
                            value={
                              relationshipOptions.find(
                                (opt) => opt.value === value
                              ) || null
                            }
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
                              singleValue: (base) => ({
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

                {/* Address */}
                <FormField
                  control={form.control}
                  name="emergencyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div>
                          Address <span className="text-red-500">*</span>
                        </div>
                        <HelperTooltip text="Enter the full address of your emergency contact. e.g., 12 High Street, Bristol, BS1 4ST, United Kingdom" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter full address of your emergency contact"
                          className="placeholder:text-gray-500"
                        />
                      </FormControl>
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
