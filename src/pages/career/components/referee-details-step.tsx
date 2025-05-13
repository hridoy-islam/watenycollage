'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader
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

const refereeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organisation: z.string().min(1, 'Organisation is required'),
  address: z.string().min(1, 'Address is required'),
  designation: z.string().min(1, 'Designation is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

const refereeDetailsSchema = z.object({
  referee1: refereeSchema,
  referee2: refereeSchema
});

type RefereeFormValues = z.infer<typeof refereeDetailsSchema>;

interface RefereeDetailsStepProps {
  value: Partial<TCareer>;
  onNext: (data: Partial<TCareer>) => void;
  onBack: () => void;
}

export function RefereeDetailsStep({
  value,
  onNext,
  onBack
}: RefereeDetailsStepProps) {
  const form = useForm<RefereeFormValues>({
    resolver: zodResolver(refereeDetailsSchema),
     defaultValues: {
      referee1: {
        name: value.referees?.[0]?.name || '',
        organisation: value.referees?.[0]?.organisation || '',
        address: value.referees?.[0]?.address || '',
        designation: value.referees?.[0]?.designation || '',
        email: value.referees?.[0]?.email || '',
        phone: value.referees?.[0]?.phone || ''
      },
      referee2: {
        name: value.referees?.[1]?.name || '',
        organisation: value.referees?.[1]?.organisation || '',
        address: value.referees?.[1]?.address || '',
        designation: value.referees?.[1]?.designation || '',
        email: value.referees?.[1]?.email || '',
        phone: value.referees?.[1]?.phone || ''
      }
    }
  });

   const onSubmit = (data: RefereeFormValues) => {
  onNext({
    referees: [data.referee1, data.referee2] // Convert to an array
  });
};

  const renderRefereeFields = (refKey: 'referee1' | 'referee2', title: string) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`${refKey}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Full name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${refKey}.organisation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Company name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${refKey}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Street address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${refKey}.designation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Job title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${refKey}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="example@domain.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${refKey}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+1234567890" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Referee Details</h2>
        <p className="text-muted-foreground text-sm">Please provide two referees from your previous employment.</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderRefereeFields('referee1', 'Referee 1')}
            {renderRefereeFields('referee2', 'Referee 2')}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="bg-watney text-white hover:bg-watney/90"
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
      </CardContent>
    </Card>
  );
}
