'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useState } from 'react';
import type { TCareer } from '@/types/career';

const personalDetailsSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  initial: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required'
  }),
  email: z.string().email({ message: 'Please enter a valid email address' }),

  hasNationalInsuranceNumber: z.boolean().optional(),
  nationalInsuranceNumber: z.string().optional(),
  hasNhsNumber: z.boolean().optional(),
  nhsNumber: z.string().optional()
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
      dateOfBirth: value.dateOfBirth ? new Date(value.dateOfBirth) : undefined,
      nationalInsuranceNumber: value.nationalInsuranceNumber || '',
      nhsNumber: value.nhsNumber || '',
      hasNationalInsuranceNumber: !!value.nationalInsuranceNumber,
      hasNhsNumber: !!value.nhsNumber
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
        'dateOfBirth'
      ]);
      if (!isValid) return;
    } else if (currentStep === 2) {
      const niRequired = form.watch('hasNationalInsuranceNumber');
      const nhsRequired = form.watch('hasNhsNumber');

      const fieldsToValidate = [];
      if (niRequired) fieldsToValidate.push('nationalInsuranceNumber');
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

  const handleSkip = () => {
    if (currentStep === 2) {
      if (form.watch('hasNationalInsuranceNumber')) {
        form.setValue('hasNationalInsuranceNumber', false);
        form.setValue('nationalInsuranceNumber', '');
      }
      if (form.watch('hasNhsNumber')) {
        form.setValue('hasNhsNumber', false);
        form.setValue('nhsNumber', '');
      }
    }
    handleNext();
  };

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Personal Details</CardTitle>
        <CardDescription>Step {currentStep} of 2</CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Name and DOB */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mr">Mr</SelectItem>
                            <SelectItem value="Mrs">Mrs</SelectItem>
                            <SelectItem value="Miss">Miss</SelectItem>
                            <SelectItem value="Ms">Ms</SelectItem>
                            <SelectItem value="Dr">Dr</SelectItem>
                            <SelectItem value="Prof">Prof</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(e.target.valueAsDate)
                            }
                          />
                        </FormControl>
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
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Optional NI and NHS Numbers */}
            {currentStep === 2 && (
              <div className="space-y-8 rounded-lg bg-white">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* National Insurance Number Section */}
                  <div className="space-y-5">
                    <p className="text-sm font-medium text-gray-600">
                      Do you have a National Insurance Number?
                    </p>
                    <FormField
                      control={form.control}
                      name="hasNationalInsuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value?.toString() ?? ''}
                            onValueChange={(val) => {
                              const hasNI = val === 'true';
                              form.setValue(
                                'hasNationalInsuranceNumber',
                                hasNI
                              );
                              if (!hasNI)
                                form.setValue('nationalInsuranceNumber', '');
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('hasNationalInsuranceNumber') && (
                      <FormField
                        control={form.control}
                        name="nationalInsuranceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>National Insurance Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter NI number..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* NHS Number Section */}
                  <div className="space-y-5">
                    <p className="text-sm font-medium text-gray-600">
                      Do you have an NHS Number?
                    </p>
                    <FormField
                      control={form.control}
                      name="hasNhsNumber"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value?.toString() ?? ''}
                            onValueChange={(val) => {
                              const hasNHS = val === 'true';
                              form.setValue('hasNhsNumber', hasNHS);
                              if (!hasNHS) form.setValue('nhsNumber', '');
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('hasNhsNumber') && (
                      <FormField
                        control={form.control}
                        name="nhsNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NHS Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter NHS number..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
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
                {currentStep === 2 && (
                  <Button type="button" variant="outline" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {currentStep < 2 ? 'Next' : 'Next'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
