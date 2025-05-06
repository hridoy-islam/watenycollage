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
import type { TCareer } from '@/types/career';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const applicationDetailsSchema = z.object({
  applicationDate: z.date({ required_error: 'Application date is required' }),
  availableFromDate: z.date({ required_error: 'Available from date is required' }),
  position: z.string().min(1, { message: 'Position is required' }),
  source: z.string().min(1, { message: 'Source is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  area: z.string().min(1, { message: 'Area is required' }),
  carTravelAllowance: z.boolean(),
  wtrDocumentUrl: z
    .any()
    .refine((file) => !file || (file instanceof File && file.size > 0), {
      message: 'Please upload a valid file'
    })
    .optional()
});

type ApplicationDetailsFormValues = z.infer<typeof applicationDetailsSchema>;

interface ApplicationDetailsStepProps {
  value: Partial<TCareer>;
  onNext: (data: Partial<TCareer>) => void;
  onBack: () => void;
}

export function ApplicationDetailsStep({
  value,
  onNext,
  onBack
}: ApplicationDetailsStepProps) {
  const [fileName, setFileName] = useState<string>('');
  
  const form = useForm<ApplicationDetailsFormValues>({
    resolver: zodResolver(applicationDetailsSchema),
    defaultValues: {
      applicationDate: value.applicationDate
        ? new Date(value.applicationDate)
        : new Date(),
      availableFromDate: value.availableFromDate
        ? new Date(value.availableFromDate)
        : undefined,
      position: value.position || '',
      source: value.source || '',
      branch: value.branch || '',
      area: value.area || '',
      carTravelAllowance: value.carTravelAllowance || false,
      wtrDocumentUrl: value.wtrDocumentUrl || undefined
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      form.setValue('wtrDocumentUrl', file);
    }
  };

  function onSubmit(data: ApplicationDetailsFormValues) {
    const result: Partial<TCareer> = {
      ...data,
      applicationDate: data.applicationDate.toISOString(),
      availableFromDate: data.availableFromDate.toISOString(),
      wtrDocumentUrl: data.wtrDocumentUrl instanceof File 
        ? data.wtrDocumentUrl.name 
        : data.wtrDocumentUrl || ''
    };
    onNext(result);
  }

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Please provide details about the position you're applying for.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableFromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available From Date</FormLabel>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Job position" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How did you hear about us?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">Company Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="indeed">Indeed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Office location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Work area" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="carTravelAllowance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Car Travel Allowance</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if you require car travel allowance
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wtrDocumentUrl"
              render={() => (
                <FormItem className='w-1/2'>
                  <FormLabel>Upload Working Time Regulation (WTR) Document</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-start space-x-2 gap-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                      
                      />
                      {fileName && <span className="text-sm text-gray-500">{fileName}</span>}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between ">
              <Button type="button" variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
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