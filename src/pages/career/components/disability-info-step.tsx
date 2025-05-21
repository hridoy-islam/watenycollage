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
import { Textarea } from '@/components/ui/textarea';
import type { TCareer } from '@/types/career';
import { Checkbox } from '@/components/ui/checkbox';

const disabilityInfoSchema = z.object({
  hasDisability: z.boolean(),
  disabilityDetails: z.string().optional(),
  needsReasonableAdjustment: z.boolean(),
  reasonableAdjustmentDetails: z.string().optional()
});

type DisabilityInfoFormValues = z.infer<typeof disabilityInfoSchema>;

interface DisabilityInfoStepProps {
  value: Partial<TCareer>;
  onNext: (data: Partial<TCareer>) => void;
  onBack: () => void;
}

export function DisabilityInfoStep({
  value,
  onNext,
  onBack
}: DisabilityInfoStepProps) {
  const form = useForm<DisabilityInfoFormValues>({
    resolver: zodResolver(disabilityInfoSchema),
    defaultValues: {
      hasDisability:
        typeof value.hasDisability === 'boolean'
          ? value.hasDisability
          : undefined,
      disabilityDetails: value.disabilityDetails || '',
      needsReasonableAdjustment:
        typeof value.needsReasonableAdjustment === 'boolean'
          ? value.needsReasonableAdjustment
          : undefined,
      reasonableAdjustmentDetails: value.reasonableAdjustmentDetails || ''
    }
  });

  function onSubmit(data: DisabilityInfoFormValues) {
    onNext(data);
  }

  return (
    <Card className='border-none shadow-none '>
      <CardHeader>
        <CardTitle>Disability Information</CardTitle>
        <CardDescription>
          We are committed to creating an inclusive and supportive environment.
          The information you provide below helps us offer the appropriate
          support and make reasonable adjustments where necessary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem className="py-2">
                  <div className="flex flex-row items-center space-x-3 space-y-0">
                    <FormLabel>Do you have a disability?</FormLabel>

                    <div className="flex space-x-6">
                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                        />
                        <FormLabel className="ml-2">Yes</FormLabel>
                      </div>

                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                        />
                        <FormLabel className="ml-2">No</FormLabel>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Let us know if you consider yourself to have a disability
                    under the Equality Act 2010.{' '}
                  </p>
                </FormItem>
              )}
            />

            {form.watch('hasDisability') && (
              <FormField
                control={form.control}
                name="disabilityDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please provide details about your disability
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Briefly describe your disability and how it may affect your ability to work or participate."
                        className="min-h-[100px] !placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400 "
                      />
                    </FormControl>
                    <p className="mt-2 text-xs text-gray-400">
                      Example: I have dyslexia, which affects my reading speed
                      and short-term memory.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="needsReasonableAdjustment"
              render={({ field }) => (
                <FormItem className="py-2">
                  <div className="flex flex-row items-center space-x-3">
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Do you require any reasonable adjustments?
                      </FormLabel>
                    </div>
                    <div className="flex space-x-6">
                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                        />
                        <FormLabel className="ml-2">Yes</FormLabel>
                      </div>

                      <div className="flex items-center">
                        <Checkbox
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                        />
                        <FormLabel className="ml-2">No</FormLabel>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Indicate whether you need any changes or accommodations
                    during the application or employment process.
                  </p>
                </FormItem>
              )}
            />

            {form.watch('needsReasonableAdjustment') && (
              <FormField
                control={form.control}
                name="reasonableAdjustmentDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please provide details about the adjustments needed
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Specify what support or adjustments would help you perform at your best"
                        className="min-h-[100px] !placeholder:text-gray-400   placeholder:text-xs  placeholder:text-gray-400"
                      />
                    </FormControl>
                    <p className="mt-2 text-xs text-gray-400">
                    Example: I require additional time during written assessments and access to screen-reading software.
                  </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
