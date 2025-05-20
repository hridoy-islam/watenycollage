'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const relationshipOptions = [
  'Line Manager',
  'Colleague',
  'Friend',
  'Other'
] as const;

const refereeSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    organisation: z.string().min(1, 'Organisation is required'),
    address: z.string().min(1, 'Address is required'),
    relationship: z.string( {
      required_error: 'Relationship is required'
    }),
    otherRelationship: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required')
  })
  .refine(
    (data) => {
      if (data.relationship === 'Other') {
        return data.otherRelationship && data.otherRelationship.trim() !== '';
      }
      return true;
    },
    {
      message: 'Please specify the relationship',
      path: ['otherRelationship']
    }
  );

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
        relationship: (value.referees?.[0]?.relationship as any) || '',
        otherRelationship: value.referees?.[0]?.otherRelationship || '',
        email: value.referees?.[0]?.email || '',
        phone: value.referees?.[0]?.phone || ''
      },
      referee2: {
        name: value.referees?.[1]?.name || '',
        organisation: value.referees?.[1]?.organisation || '',
        address: value.referees?.[1]?.address || '',
        relationship: (value.referees?.[1]?.relationship as any) || '',
        otherRelationship: value.referees?.[1]?.otherRelationship || '',
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

  const renderRefereeFields = (
    refKey: 'referee1' | 'referee2',
    title: string
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
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
          name={`${refKey}.relationship`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Kindly indicate your relationship with the person mentioned." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch(`${refKey}.relationship`) === 'Other' && (
          <FormField
            control={form.control}
            name={`${refKey}.otherRelationship`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specify Relationship</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="e.g. Team Lead" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name={`${refKey}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="example@domain.com"
                />
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
        <p className="text-sm text-muted-foreground">
          Please provide two referees from your previous employment.
        </p>
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
