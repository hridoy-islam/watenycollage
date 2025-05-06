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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { countries, emergencyContactRelationships } from '@/types';

const beneficiarySchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  relationship: z.string().min(1, { message: 'Relationship is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  mobile: z.string().min(1, { message: 'Mobile number is required' }),
  sameAddress: z.boolean(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().optional(),
    postCode: z.string().optional(),
    country: z.string().optional()
  })
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

interface BeneficiaryStepProps {
  value?: {
    fullName: string;
    relationship: string;
    email: string;
    mobile: string;
    sameAddress: boolean;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postCode: string;
      country: string;
    };
  };
  onNext: (data: {
    fullName: string;
    relationship: string;
    email: string;
    mobile: string;
    sameAddress: boolean;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postCode: string;
      country: string;
    };
  }) => void;
  onBack: () => void;
}

export function BeneficiaryStep({
  value,
  onNext,
  onBack
}: BeneficiaryStepProps) {
  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: value?.fullName || '',
      relationship: value?.relationship || '',
      email: value?.email || '',
      mobile: value?.mobile || '',
      sameAddress: value?.sameAddress || false,
      address: {
        line1: value?.address?.line1 || '',
        line2: value?.address?.line2 || '',
        city: value?.address?.city || '',
        state: value?.address?.state || '',
        postCode: value?.address?.postCode || '',
        country: value?.address?.country || ''
      }
    }
  });

  function onSubmit(data: BeneficiaryFormValues) {
    onNext(data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beneficiary Information</CardTitle>
        <CardDescription>
          Please provide information about your beneficiary or emergency
          contact.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} {...field}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Relation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emergencyContactRelationships.map(
                            (relation, index) => (
                              <SelectItem key={index} value={relation}>
                                {relation}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          placeholder="Enter email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter mobile number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="sameAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Same address as applicant</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if the beneficiary lives at the same address as
                      you.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch('sameAddress') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <FormField
                  control={form.control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address line 1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.line2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter address line 2" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter state/province"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.postCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter post code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.country"
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
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
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
      </CardContent>
    </Card>
  );
}
