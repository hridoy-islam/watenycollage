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
  initialStep = 1 ,
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
      dateOfBirth: value.dateOfBirth ? new Date(value.dateOfBirth) : undefined,
      nationalInsuranceNumber: value.nationalInsuranceNumber || '',
      nhsNumber: value.nhsNumber || '',
      hasNationalInsuranceNumber: !!value.nationalInsuranceNumber,
      hasNhsNumber: !!value.nhsNumber
    }
  });

  function onSubmit(data: PersonalDetailsFormValues) {
    onNext(data);
  }

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const { title, firstName, lastName } = form.getValues();
      if (!title || !firstName || !lastName) {
        form.trigger(['title', 'firstName', 'lastName']);
        return;
      }
    } else if (currentStep === 2) {
      const { dateOfBirth } = form.getValues();
      if (!dateOfBirth) {
        form.trigger('dateOfBirth');
        return;
      }
    } else if (currentStep === 3 && form.watch('hasNationalInsuranceNumber')) {
      const { nationalInsuranceNumber } = form.getValues();
      if (!nationalInsuranceNumber) {
        form.trigger('nationalInsuranceNumber');
        return;
      }
    } else if (currentStep === 4 && form.watch('hasNhsNumber')) {
      const { nhsNumber } = form.getValues();
      if (!nhsNumber) {
        form.trigger('nhsNumber');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (onStepChange) {
        onStepChange(newStep); // Call the renamed prop
      }
    } else {
      onBack();
    }
  };
  

  const handleSkip = () => {
    if (currentStep === 3) {
      form.setValue('hasNationalInsuranceNumber', false);
      form.setValue('nationalInsuranceNumber', '');
    } else if (currentStep === 4) {
      form.setValue('hasNhsNumber', false);
      form.setValue('nhsNumber', '');
    }
    handleNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        {/* <CardDescription>Step {currentStep} of 4</CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Name Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* <h3 className="font-medium">Submit Your Name</h3> */}
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
                </div>
              </div>
            )}

            {/* Step 2: Date of Birth */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="max-w-[300px]">
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) => field.onChange(e.target.valueAsDate)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: National Insurance Number */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* <h3 className="font-medium">National Insurance Number</h3> */}
                <div className="space-y-2">
                  <p className="text-sm">
                    Do you have a National Insurance Number?
                  </p>

                  <FormField
                    control={form.control}
                    name="hasNationalInsuranceNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-[300px]">
                        <Select
                          value={field.value?.toString() ?? ''}
                          onValueChange={(val) => {
                            const hasNI = val === 'true';
                            form.setValue('hasNationalInsuranceNumber', hasNI);
                            if (!hasNI) {
                              form.setValue('nationalInsuranceNumber', '');
                            }
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
                </div>

                {form.watch('hasNationalInsuranceNumber') && (
                  <FormField
                    control={form.control}
                    name="nationalInsuranceNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-[300px]">
                        <FormLabel>National Insurance Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Step 4: NHS Number */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium">NHS Number</h3>
                <div className="space-y-2">
                  <p className="text-sm">Do you have an NHS Number?</p>

                  <FormField
                    control={form.control}
                    name="hasNhsNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-[300px]">
                        <Select
                          value={field.value?.toString() ?? ''}
                          onValueChange={(val) => {
                            const hasNHS = val === 'true';
                            form.setValue('hasNhsNumber', hasNHS);
                            if (!hasNHS) {
                              form.setValue('nhsNumber', '');
                            }
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
                </div>

                {form.watch('hasNhsNumber') && (
                  <FormField
                    control={form.control}
                    name="nhsNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-[300px]">
                        <FormLabel>NHS Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext} className="bg-watney text-white hover:bg-watney/90">
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} className="bg-watney text-white hover:bg-watney/90">
                  Next
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
