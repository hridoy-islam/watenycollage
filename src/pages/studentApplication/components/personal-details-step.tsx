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
// Schema
const personalDetailsSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  initial: z.string().optional(),
  dateOfBirth: z.any().optional(), // use `z.string()` if date is string
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.string().min(1, { message: 'Please select a gender' }),
  nationality: z.string().min(1, { message: 'Please select a nationality' }),
  ethnicity: z.string().min(1, { message: 'Please select an ethnicity' }),
  customEthnicity: z.string().optional(),
  countryOfBirth: z
    .string()
    .min(1, { message: 'Please select country of birth' }),
  maritalStatus: z.string().min(1, { message: 'Please select marital status' }),
  studentType: z.string().optional(),
  requireVisa: z.string().optional(),
  applicationLocation: z.string().optional()
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

interface Props {
  defaultValues?: Partial<PersonalDetailsData>;
  onSaveAndContinue: (data: PersonalDetailsData) => void;
  onSave?: (data: PersonalDetailsData) => void;
  setCurrentStep: (step: number) => void;
}

export function PersonalDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
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
      nationality: '',
      ethnicity: '',
      countryOfBirth: '',
      maritalStatus: '',
      requireVisa: '',
      applicationLocation: '',
      ...defaultValues
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  console.log(defaultValues)
  const studentType = defaultValues?.studentType;
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                        value={titleOptions.find((opt) => opt.value === value)}
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
                    <Input {...field} />
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
    <FormItem className="mt-2 flex flex-col">
      <FormLabel>Date of Birth</FormLabel>
      <Input
        type="date"
        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
        onChange={(e) => field.onChange(new Date(e.target.value))}
        className="mt-0.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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

            
            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
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
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select Gender"
                      isClearable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nationality */}
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Of Domicile</FormLabel>
                  <FormControl>
                    <Select
                      options={nationalities.map((nation) => ({
                        value: nation,
                        label: nation
                      }))}
                      value={
                        field.value
                          ? { value: field.value, label: field.value }
                          : null
                      }
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value)
                      }
                      placeholder="Select"
                      isClearable
                    />
                  </FormControl>
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
                  <FormLabel>Ethnicity</FormLabel>
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
                      onChange={(selected) => field.onChange(selected?.value)}
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
                    <FormLabel>Specify Ethnicity</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your ethnicity"
                        {...field}
                        className="p-1 text-sm"
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
                  <FormLabel>Country of Birth</FormLabel>
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
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select Country"
                      isClearable
                    />
                  </FormControl>
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
                  <FormLabel>Marital Status</FormLabel>
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
                      onChange={(selected) => field.onChange(selected?.value)}
                      placeholder="Select"
                      isClearable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional International Fields */}
            {studentType === 'international' && (
              <>
                <FormField
                  control={form.control}
                  name="requireVisa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Do you require a visa to come to the UK?
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={visaOptions}
                          value={
                            field.value
                              ? visaOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select"
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        From where are you making your application?
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
                          placeholder="Select Country"
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </CardContent>

        <div className="flex justify-between px-5">
          <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button>
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
