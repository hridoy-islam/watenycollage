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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Zod Schema for Employment Form
const employmentSchema = z.object({
  isEmployed: z.string(),
  currentEmployment: z
    .object({
      employer: z.string().optional(),
      jobTitle: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      currentlyEmployed: z.boolean().default(true),
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

export function EmploymentStep({ defaultValues, onBack, onNext, value }: any) {
  const form = useForm<EmploymentData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaultValues ||
      value || {
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
    onNext(data);
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 ">
            <div>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Employment History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Are You Currently Employed? */}
                <FormField
                  control={form.control}
                  name="isEmployed"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>Are you currently employed?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                {/* Current Employment Section */}
                {watchIsEmployed === 'yes' && (
                  <div className="rounded-lg border border-gray-200  p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-medium">
                      Current Employment
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Employer Name */}
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

                      {/* Job Position */}
                      <FormField
                        name="currentEmployment.jobTitle"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Position</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Start Date */}
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

                      {/* End Date + Currently Employed Checkbox */}
                      <FormField
                        name="currentEmployment.currentlyEmployed"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 sm:col-span-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value ?? true} // Default to true
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  field.onChange(isChecked);
                                  if (isChecked) {
                                    form.setValue(
                                      'currentEmployment.endDate',
                                      undefined
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>Currently Employed</FormLabel>
                          </FormItem>
                        )}
                      />

                      {/* End Date */}
                      <FormField
                        name="currentEmployment.endDate"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={
                                  form.watch(
                                    'currentEmployment.currentlyEmployed'
                                  ) || false
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Employment Type */}
                      <FormField
                        name="currentEmployment.employmentType"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Full-Time">
                                  Full-Time
                                </SelectItem>
                                <SelectItem value="Part-Time">
                                  Part-Time
                                </SelectItem>
                                <SelectItem value="Self-Employed">
                                  Self-Employed
                                </SelectItem>
                                <SelectItem value="Casual">Casual</SelectItem>
                                <SelectItem value="Internship">
                                  Internship
                                </SelectItem>
                                <SelectItem value="Freelance">
                                  Freelance
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Main Responsibilities */}
                      <FormField
                        name="currentEmployment.responsibilities"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 lg:col-span-3">
                            <FormLabel>Main Responsibilities</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="min-h-[80px] border border-gray-200"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Supervisor */}
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

                      {/* May we contact this employer? */}
                      <FormField
                        name="currentEmployment.contactPermission"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>May we contact this employer?</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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

                {/* Previous Employment Entries */}
                <div>
                  <h3 className="mb-4 text-xl font-medium">
                    Previous Employment
                  </h3>

                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="mb-6 rounded-md border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Employer */}
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

                        {/* Job Title */}
                        <FormField
                          name={`previousEmployments.${index}.jobTitle`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job position</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Start Date */}
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

                        {/* End Date */}
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

                        {/* Reason for Leaving */}
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

                        {/* Can We Contact? */}
                        <FormField
                          name={`previousEmployments.${index}.contactPermission`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Can we contact this employer?
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
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

                        {/* Responsibilities */}
                        <FormField
                          name={`previousEmployments.${index}.responsibilities`}
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2 lg:col-span-3 ">
                              <FormLabel>Main Responsibilities</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="min-h-[80px] border border-gray-200"
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
                    variant="outline"
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
                    className="bg-watney text-white hover:bg-watney/90"
                  >
                    Add Another Employment
                  </Button>
                </div>

                {/* Employment Gaps */}
                <FormField
                  name="hasEmploymentGaps"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>
                        Any gaps of more than 1 month in the last 5 years?
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchHasGaps === 'yes' && (
                  <FormField
                    name="employmentGapsExplanation"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="max-w-2xl">
                        <FormLabel>Please explain</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Declaration */}
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
                    </FormItem>
                  )}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-watney text-white hover:bg-watney/90"
                    onClick={() => onBack()}
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
              </CardContent>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}
