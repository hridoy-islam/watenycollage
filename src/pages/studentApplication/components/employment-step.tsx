import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const employmentSchema = z.object({
  isEmployed: z.string(),
  currentEmployment: z
    .object({
      employer: z.string().optional(),
      jobTitle: z.string().optional(),
      startDate: z.string().optional(),
      employmentType: z.string().optional(),
      responsibilities: z.string().optional(),
      supervisor: z.string().optional(),
      contactPermission: z.string().optional()
    })
    .optional(),
  previousEmployments: z
    .array(
      z.object({
        employer: z.string(),
        jobTitle: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        reasonForLeaving: z.string(),
        responsibilities: z.string(),
        contactPermission: z.string()
      })
    )
    .optional(),
  hasEmploymentGaps: z.string(),
  employmentGapsExplanation: z.string().optional(),
  declaration: z.literal(true)
});

type EmploymentData = z.infer<typeof employmentSchema>;

export function EmploymentStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}: any) {


  const form = useForm<EmploymentData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultValues || {
      isEmployed: '',
      previousEmployments: [],
      hasEmploymentGaps: '',
      declaration: false
    }
  });

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'previousEmployments'
  });

  const watchIsEmployed = form.watch('isEmployed');
  const watchHasGaps = form.watch('hasEmploymentGaps');

  const onSubmit = (data: EmploymentData) => {
 
    onSaveAndContinue(data);
  };

  // const handleSave = () => {
  //   const data = form.getValues();
  //   onSave(data);
  // };


  function handleBack() {
    setCurrentStep(6);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-semibold">Employment</h2>

          <FormField
            control={form.control}
            name="isEmployed"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel>Are you currently employed?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  {...field}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchIsEmployed === 'yes' && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">Current Employment</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  name="currentEmployment.employer"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.jobTitle"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.startDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.employmentType"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-Time">Full-Time</SelectItem>
                          <SelectItem value="Part-Time">Part-Time</SelectItem>
                          <SelectItem value="Self-Employed">
                            Self-Employed
                          </SelectItem>
                          <SelectItem value="Casual">Casual</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.responsibilities"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-3">
                      <FormLabel>Main Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="border-gray-200"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.supervisor"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Name & Contact</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="currentEmployment.contactPermission"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>May we contact this employer?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <h3 className="text-xl font-medium">Previous Employment</h3>
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="space-y-6 rounded-md border border-gray-200 p-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  name={`previousEmployments.${index}.employer`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.jobTitle`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.startDate`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.endDate`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.reasonForLeaving`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Leaving</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.contactPermission`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Can we contact this employer?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`previousEmployments.${index}.responsibilities`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-3">
                      <FormLabel>Main Responsibilities</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="border-gray-200"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              append({
                employer: '',
                jobTitle: '',
                startDate: '',
                endDate: '',
                reasonForLeaving: '',
                responsibilities: '',
                contactPermission: ''
              })
            }
          >
            Add Another Employment
          </Button>

          <FormField
            name="hasEmploymentGaps"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Any gaps of more than 1 month in the last 5 years?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  {...field}
                
                >
                  <FormControl className='w-[400px]'>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='w-[400px]'>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {watchHasGaps === 'yes' && (
            <FormField
              name="employmentGapsExplanation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please explain</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            name="declaration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span>
                      I confirm that the information provided is accurate.
                    </span>
                  </label>
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" className='bg-watney text-white hover:bg-watney/90' onClick={handleBack}>
              back
            </Button>
            <Button type="submit" className='bg-watney text-white hover:bg-watney/90'>Next</Button>
          </div>
        </CardContent>
      </form>
    </Form>
  );
}
