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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Types
type Relationship = 'Line Manager' | 'Colleague' | 'Friend' | 'Other';

const refereeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organisation: z.string().min(1, 'Organisation is required'),
  address: z.string().min(1, 'Address is required'),
  relationship: z.string({
  required_error: 'Relationship is required'
}),
  otherRelationship: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required')
});

const refereeDetailsSchema = z.object({
  referee1: refereeSchema,
  referee2: refereeSchema
});

export type RefereeFormValues = z.infer<typeof refereeDetailsSchema>;

interface RefereeDetailsStepProps {
  value: any;
  onNext: (data: any) => void;
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
        name: value?.referees?.[0]?.name || '',
        organisation: value?.referees?.[0]?.organisation || '',
        address: value?.referees?.[0]?.address || '',
        relationship: (value?.referees?.[0]?.relationship as any) || '',
        otherRelationship: value?.referees?.[0]?.otherRelationship || '',
        email: value?.referees?.[0]?.email || '',
        phone: value?.referees?.[0]?.phone || ''
      },
      referee2: {
        name: value?.referees?.[1]?.name || '',
        organisation: value?.referees?.[1]?.organisation || '',
        address: value?.referees?.[1]?.address || '',
        relationship: (value?.referees?.[1]?.relationship as any) || '',
        otherRelationship: value?.referees?.[1]?.otherRelationship || '',
        email: value?.referees?.[1]?.email || '',
        phone: value?.referees?.[1]?.phone || ''
      }
    }
  });

  const onSubmit = (data: RefereeFormValues) => {
    onNext({
      referees: [data.referee1, data.referee2]
    });
  };

  const renderRefereeFields = (
    refKey: 'referee1' | 'referee2',
    title: string,
    description: string
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}*</h3>
      <p className="text-sm text-gray-600">{description}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Name */}
        <FormField
          control={form.control}
          name={`${refKey}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter the full name of the referee."
                  className="placeholder:text-xs placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">Example: Sarah Johnson</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organisation */}
        <FormField
          control={form.control}
          name={`${refKey}.organisation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Institution*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter organisation name"
                  className="placeholder:text-xs placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">
                Example: ABC Health Services Ltd.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name={`${refKey}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Provide the company or business address."
                  className="placeholder:text-xs placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">
                Example: 123 High Street, London, W1A 1AA
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Relationship */}
        <FormField
          control={form.control}
          name={`${refKey}.relationship`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to Referee*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Kindly indicate your relationship with the person mentioned."
                  className="!placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">
                  Example: Line Manager at XYZ Ltd.
                </p>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Email */}
        <FormField
          control={form.control}
          name={`${refKey}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Email address"
                  className="placeholder:text-xs placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">
                Example: s.johnson@abcservices.com
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name={`${refKey}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="+Include country code"
                  className="placeholder:text-xs placeholder:text-gray-400"
                />
              </FormControl>
              <p className="mt-2 text-xs text-gray-400">
                Example: +44 7911 123456
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-semibold">Referee Details</h2>
        <p className="text-sm text-gray-400">
          Please provide two referees as part of the recruitment process. Referees must be able to speak to your skills, experience, and character, and must not be friends or relatives. 
        </p>
        <p className='text-sm text-gray-400 font-semibold'>
          We may contact your referees, so please ensure their contact details are accurate and up to date.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderRefereeFields(
              'referee1',
              'Professional Referee',
              'A former supervisor, manager, or employer who can verify your work experience, responsibilities, and conduct.'
            )}
            {renderRefereeFields(
              'referee2',
              'Academic or Personal Referee',
              'An academic mentor, lecturer, or professional who has known you in a formal, non-personal capacity.'
            )}

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