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
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const applicationDetailsSchema = z.object({
  applicationDate: z.date({ required_error: 'Application date is required' }),
  availableFromDate: z.date({ required_error: 'Application date is required' }),
  position: z.string().min(1, { message: 'Position is required' }),
  source: z.string().min(1, { message: 'Source is required' }),
  carTravelAllowance: z.boolean(),
  // salaryExpectation: z
  //   .string()
  //   .min(1, { message: 'Salary expectation is required' }),
  // maxHoursPerWeek: z.string().min(1, { message: 'Maximum hours is required' }),
  availability: z
    .object(
      Object.fromEntries(daysOfWeek.map((day) => [day, z.boolean().optional()]))
    )
    .refine((data) => Object.values(data).some((val) => val), {
      message: 'Please select at least one day of availability'
    }),
  isStudent: z.boolean(),
  // isBritishCitizen: z.boolean(),
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
        : undefined,
      availableFromDate: value.availableFromDate
        ? new Date(value.availableFromDate)
        : undefined,
      position: value.position || '',
      source: value.source || '',
      carTravelAllowance: value.carTravelAllowance || false,
      // salaryExpectation: value.salaryExpectation || '',
      // maxHoursPerWeek: value.maxHoursPerWeek || '',
      availability: value.availability || {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      isStudent: value.isStudent || '',
      // isBritishCitizen: value.isBritishCitizen || false,
      referralEmployee: value.referralEmployee || '',
      isUnderStatePensionAge: value.isUnderStatePensionAge || '',
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

  function onSubmit(data: ApplicationDetailsFormValues) {
    const result: Partial<TCareer> = {
      ...data,
      wtrDocumentUrl:
        data.wtrDocumentUrl instanceof File
          ? data.wtrDocumentUrl.name
          : data.wtrDocumentUrl || ''
    };
    onNext(result);
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Please provide specific details about the position you're applying
          for. This information helps us better understand your suitability and
          availability.
        </CardDescription>
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
                      <Input
                        {...field}
                        className="placeholder:text-xs"
                        placeholder="Enter the job title or role you're applying for"
                      />
                    </FormControl>
                    <p className="text-xs  text-gray-400">
                      Example: Support Worker, Front-End Developer, Care
                      Assistant
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicationDate"
                render={({ field }) => {
                  const selectedDate = field.value
                    ? new Date(field.value)
                    : null;

                  return (
                    <FormItem className="mt-2 flex flex-col">
                      <FormLabel>Application Date:</FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={selectedDate}
                          onChange={(date) => field.onChange(date)}
                          placeholder="The date you’re submitting this application."
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">
                        Example: 21/05/2025
                      </p>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="availableFromDate"
                render={({ field }) => {
                  const selectedDate = field.value
                    ? new Date(field.value)
                    : null;

                  return (
                    <FormItem className="mt-2 flex w-full flex-col">
                      <FormLabel>Available From Date</FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          selected={selectedDate}
                          onChange={(date) => field.onChange(date)}
                          placeholder="When would you be available to start this role?"
                        />
                      </FormControl>
                      <p className="text-xs  text-gray-400">
                        Example: 01/06/2025
                      </p>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you hear about us?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Let us know how you found out about this opportunity." />
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

                    <p className="text-xs  text-gray-400">
                      Example: Job board, referral, social media, company
                      website, other
                    </p>

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
                      <Input {...field} placeholder="Enter the employee name" />
                    </FormControl>
                    <p className="text-xs  text-gray-400">
                      Example: Emma Watson
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div> */}

            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem className="">
                  <div className="flex items-center justify-start gap-2">
                    <FormLabel>Availability (Select all that apply)</FormLabel>

                    {/* Select All Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-watney hover:bg-watney/90"
                      onClick={() => {
                        const days = [
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                          'sunday'
                        ];

                        days.forEach((day) => {
                          form.setValue(`availability.${day}`, true);
                        });
                      }}
                    >
                      Select All
                    </Button>
                  </div>
                  <p className="pb-2 text-xs text-gray-400">
                    Select all the days you are available to work.
                  </p>

                  {/* Days Checkboxes */}
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
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Student Status */}
              <FormField
                control={form.control}
                name="isStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you currently a student?</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'yes')}
                      value={
                        field.value === true
                          ? 'yes'
                          : field.value === false
                            ? 'no'
                            : ''
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder=" Select Yes if you are currently enrolled in any educational institution." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs  text-gray-400">Example: Yes / No</p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Under State Pension Age */}
              <FormField
                control={form.control}
                name="isUnderStatePensionAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you under state pension age?</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'yes')}
                      value={
                        field.value === true
                          ? 'yes'
                          : field.value === false
                            ? 'no'
                            : ''
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Indicate whether you are below the UK state pension age." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs  text-gray-400">Example: Yes / No</p>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* 
            <FormField
              control={form.control}
              name="isBritishCitizen"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Citizenship Status</FormLabel>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={() => field.onChange(true)}
                      />
                      <FormLabel className="font-normal">
                        I am a British citizen
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value === false}
                        onCheckedChange={() => field.onChange(false)}
                      />
                      <FormLabel className="font-normal">
                        I am not a British citizen
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
                      Tick this box if you require a car travel allowance for
                      the role{' '}
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
                <p className='text-xs text-gray-400'>If you have a WTR agreement or related document, upload it here.</p>
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
                  <p className="text-xs  text-gray-400">Accepted Formats: PDF, DOC, DOCX (Max size: 5MB)</p>

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
