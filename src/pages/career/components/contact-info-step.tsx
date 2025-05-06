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
import type { TCareer } from '@/types/career';
import { useState } from 'react';
import {
  Select,

  SelectContent,

  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { countries } from '@/types';

const contactInfoSchema = z.object({
  mobilePhone: z.string().min(1, { message: 'Mobile phone is required' }),
  homePhone: z.string().optional(),
  otherPhone: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  address: z.string().min(1, { message: 'Address is required' }),
  cityOrTown: z.string().min(1, { message: 'City/Town is required' }),
  stateOrProvince: z.string().min(1, { message: 'State/Province is required' }),
  postCode: z.string().min(1, { message: 'Post code is required' }),
  country: z.string().min(1, { message: 'Country is required' })
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

interface ContactInfoStepProps {
  value: Partial<TCareer>;
  onNext: (data: Partial<TCareer>) => void;
  onBack: () => void;
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export function ContactInfoStep({
  value,
  onNext,
  onBack,
  initialStep = 1,
  onStepChange
}: ContactInfoStepProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      homePhone: value.homePhone || '',
      mobilePhone: value.mobilePhone || '',
      otherPhone: value.otherPhone || '',
      email: value.email || '',
      address: value.address || '',
      cityOrTown: value.cityOrTown || '',
      stateOrProvince: value.stateOrProvince || '',
      postCode: value.postCode || '',
      country: value.country || ''
    }
  });

  function onSubmit(data: ContactInfoFormValues) {
    onNext(data);
  }

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const { mobilePhone } = form.getValues();
      if (!mobilePhone) {
        form.trigger('mobilePhone');
        return;
      }
    } else if (currentStep === 2) {
      const { email } = form.getValues();
      if (!email) {
        form.trigger('email');
        return;
      }
    } else if (currentStep === 3) {
      const { address } = form.getValues();
      if (!address) {
        form.trigger('address');
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Phone Numbers */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">Phone Numbers</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mobilePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Phone*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your mobile number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="homePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your home number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Phone (Optional)</FormLabel>
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

            {/* Step 2: Email */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">Email Address</h3>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-[350px]">
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
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">Address Information</h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your street address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cityOrTown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your city/town"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stateOrProvince"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your state/province"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Postal and Country */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium">Postal and Country Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} {...field}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country, index) => (
                              <SelectItem key={index} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code*</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your post code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-watney text-white hover:bg-watney/90"
                >
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
