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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const applicationDetailsSchema = z.object({
  applicationDate: z.date({ required_error: 'Application date is required' }),
  availableFromDate: z.date({
    required_error: 'Available from date is required'
  }),
  position: z.string().min(1, { message: 'Position is required' }),
  source: z.string().min(1, { message: 'Source is required' }),
  branch: z.string().min(1, { message: 'Branch is required' }),
  area: z.string().min(1, { message: 'Area is required' }),
  carTravelAllowance: z.boolean(),
  noticePeriod: z.string().min(1, { message: 'Notice period is required' }),
  salaryExpectation: z
    .string()
    .min(1, { message: 'Salary expectation is required' }),
  maxHoursPerWeek: z.string().min(1, { message: 'Maximum hours is required' }),
  availability: z
    .record(z.boolean())
    .refine((data) => Object.values(data).some((val) => val), {
      message: 'Please select at least one day of availability'
    }),
  isStudent: z.boolean(),
  religion: z.string().optional(),
  isBritishCitizen: z.boolean(),
  shareCode: z.string().optional(),
  referralEmployee: z.string().optional(),
  isUnderStatePensionAge: z.boolean(),
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
      noticePeriod: value.noticePeriod || '',
      salaryExpectation: value.salaryExpectation || '',
      maxHoursPerWeek: value.maxHoursPerWeek || '',
      availability: value.availability || {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      isStudent: value.isStudent || false,
      religion: value.religion || '',
      isBritishCitizen: value.isBritishCitizen || false,
      shareCode: value.shareCode || '',
      referralEmployee: value.referralEmployee || '',
      isUnderStatePensionAge: value.isUnderStatePensionAge || false,
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

  // Watch source field to show referral input conditionally
  const sourceValue = form.watch('source');
  // Watch isBritishCitizen field to conditionally show share code
  const isBritishCitizen = form.watch('isBritishCitizen');

  function onSubmit(data: ApplicationDetailsFormValues) {
    const result: Partial<TCareer> = {
      ...data,
      applicationDate: data.applicationDate.toISOString(),
      availableFromDate: data.availableFromDate.toISOString(),
      wtrDocumentUrl:
        data.wtrDocumentUrl instanceof File
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
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position you applied for</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Job position" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => (
                  <FormItem className='flex flex-col border-gary-200 focus:border-gray-200 mt-2'>
                    <FormLabel>Application Date: </FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select a date"
                        className="w-full rounded-md border border-gray-300  mt-0.5 px-3 py-2 text-sm"
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
                  <FormItem className='flex flex-col border-gary-200 active:border-gray-200 focus:border-gray-200'>
                    <FormLabel>Available From Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select a date"
                        className="w-full rounded-md border border-gray-300  mt-0.5 px-3 py-2 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            


              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem className='-mt-2'>
                    <FormLabel>How did you hear about us?</FormLabel>
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

            {sourceValue === 'referral' && (
              <FormField
                control={form.control}
                name="referralEmployee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referred by (Employee Name)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Employee name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="salaryExpectation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Expectation (£)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Salary expectation"
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Notice period in days"
                        type="number"
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
                name="maxHoursPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How many hours can you work?</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Max hours" type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Religion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <FormLabel>Availability (Select all that apply)</FormLabel>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      'Monday',
                      'Tuesday',
                      'Wednesday',
                      'Thursday',
                      'Friday',
                      'Saturday',
                      'Sunday'
                    ].map((day) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name={`availability.${day.toLowerCase()}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{day}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="isStudent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Student Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Are you currently a student?
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUnderStatePensionAge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Age Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Are you under state pension age?
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isBritishCitizen"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Citizenship Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      defaultValue={field.value ? 'true' : 'false'}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I am a British citizen
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          I am not a British citizen
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isBritishCitizen && (
              <FormField
                control={form.control}
                name="shareCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your share code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                <FormItem className="w-full sm:w-1/2">
                  <FormLabel>
                    Upload Working Time Regulation (WTR) Document
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-start space-y-2">
                      <Input type="file" onChange={handleFileChange} />
                      {fileName && (
                        <span className="text-sm text-gray-500">
                          {fileName}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
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
