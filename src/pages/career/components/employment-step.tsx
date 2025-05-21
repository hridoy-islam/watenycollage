import React, { useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

// Zod Schema for Employment Form
const employmentSchema = z.object({
  isEmployed: z.string(),
  hasPreviousEmployment: z.string(),
  currentEmployment: z
    .object({
      employer: z.string().optional(),
      jobTitle: z.string().optional(),
      startDate: z.date().optional(),
      // endDate: z.date().optional(),
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
        startDate: z.date(),
        endDate: z.date(),
        reasonForLeaving: z.string(),
        responsibilities: z.string(),
        contactPermission: z.string()
      })
    )
    .optional(),
  hasEmploymentGaps: z.string().optional(),
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
        hasPreviousEmployment: '',
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
  const watchPreviousEmployments = form.watch('previousEmployments');

  const onSubmit = (data: EmploymentData) => {
    onNext(data);
  };

  // Initially show only the first question
  const [showFullForm, setShowFullForm] = React.useState(false);

  // Handle the initial employment status selection
  const handleEmploymentStatusChange = (value: string) => {
    form.setValue('isEmployed', value);
    setShowFullForm(true);
  };

  const currentlyEmployed = form.watch('isEmployed');

  useEffect(() => {
    if (form.watch('hasPreviousEmployment') === 'yes' && fields.length === 0) {
      append({
        employer: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        reasonForLeaving: '',
        responsibilities: '',
        contactPermission: ''
      });
    }
  }, [form.watch('hasPreviousEmployment')]);

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
                <CardDescription>
                  Please provide your current and previous employment details.
                  This information helps us understand your experience and
                  assess your application more accurately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isEmployed"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>Are you currently employed?</FormLabel>
                      <Select
                        onValueChange={handleEmploymentStatusChange}
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
                      <p className="text-xs  text-gray-800">
                        Select "Yes" if you are employed at the moment.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <>
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
                                <Input {...field} placeholder="Company Name"                             className="!placeholder:text-black   placeholder:text-xs  placeholder:text-black "
/>
                              </FormControl>
                              <p className="text-xs  text-gray-800">
                                Enter the name of your current employer (e.g.,
                                NHS Trust){' '}
                              </p>
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
                                <Input {...field} placeholder="Position"                             className="!placeholder:text-black   placeholder:text-xs  placeholder:text-black "
 />
                              </FormControl>
                              <p className="text-xs  text-gray-800">
                                State your current job title (e.g., Support
                                Worker)
                              </p>
                            </FormItem>
                          )}
                        />

                        {/* Start Date */}
                        <FormField
                          name="currentEmployment.startDate"
                          control={form.control}
                          render={({ field }) => {
                            const selectedDate = field.value
                              ? new Date(field.value)
                              : null;

                            return (
                              <FormItem>
                                <FormLabel>Start Date (MM/DD/YYYY)</FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Employment Start Date"
                                  />
                                </FormControl>
                                <p className="text-xs  text-gray-800">
                                  Select the date you started this position(e.g. 11/01/2000)
                                </p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                        <FormField
                          name="currentEmployment.currentlyEmployed"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-3">
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value ?? true}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      field.onChange(isChecked);
                                      // if (isChecked) {
                                      //   form.setValue(
                                      //     'currentEmployment.endDate',
                                      //     undefined
                                      //   );
                                      // }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel>Currently Employed</FormLabel>
                              </div>
                              <p className="mt-1 text-xs text-gray-800">
                                Check this box if you're still working here
                              </p>
                            </FormItem>
                          )}
                        />

                        {/* End Date */}
                        {/* <FormField
                          name="currentEmployment.endDate"
                          control={form.control}
                          render={({ field }) => {
                            const selectedDate = field.value
                              ? new Date(field.value)
                              : null;
                            const isCurrentlyEmployed = form.watch(
                              'currentEmployment.currentlyEmployed'
                            );
                            return (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <CustomDatePicker
                                    selected={selectedDate}
                                    onChange={(date) => field.onChange(date)}
                                    disabled={isCurrentlyEmployed}
                                    placeholder="Employment End Date"
                                  />
                                </FormControl>
                                <p className="mt-1 text-xs text-gray-800">
                                  Leave blank if still employed; otherwise,
                                  select the end date{' '}
                                </p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        /> */}
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
                                    <SelectValue placeholder="Select Type of Employment" />
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

                              <p className="mt-1 text-xs text-gray-800">
                                Select from options: Full-Time, Part-Time,
                                Contract, Freelance
                              </p>
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
                                  className="min-h-[80px] border border-gray-200 !placeholder:text-black   placeholder:text-xs  placeholder:text-black"
                                  placeholder="Job Duties"
                                />
                              </FormControl>
                              <p className="mt-1 text-xs text-gray-800">
                                Briefly describe your key responsibilities{' '}
                              </p>
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
                                <Textarea
                                  {...field}
                                  placeholder="Supervisor Details"
                                  className='!placeholder:text-black   placeholder:text-xs  placeholder:text-black'
                                />
                              </FormControl>
                              <p className="mt-1 text-xs text-gray-800">
                                Provide your supervisor’s name and phone/email{' '}
                              </p>
                            </FormItem>
                          )}
                        />

                        {/* May we contact this employer? */}
                        <FormField
                          name="currentEmployment.contactPermission"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permission to Contact</FormLabel>
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

                              <p className="mt-1 text-xs text-gray-800">
                                Select whether we may contact this employer for
                                reference. Options: Yes, No, Contact Me First{' '}
                              </p>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="hasPreviousEmployment"
                      render={({ field }) => (
                        <FormItem className="mt-4 ">
                          <FormLabel>
                            Do you have previous employment history?
                          </FormLabel>
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

                          <p className="mt-1 text-xs text-gray-800">
                            List any previous jobs you've held. Include job
                            title, employer, dates, and responsibilities.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('hasPreviousEmployment') === 'yes' && (
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
                                    <Input
                                      {...field}
                                      placeholder="Company Name"
                                    />
                                  </FormControl>
                                  <p className="text-xs  text-gray-800">
                                    Enter the name of your current employer
                                    (e.g., NHS Trust){' '}
                                  </p>
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
                                    <Input {...field} placeholder="Position" />
                                  </FormControl>
                                  <p className="text-xs  text-gray-800">
                                    State your current job title (e.g., Support
                                    Worker)
                                  </p>
                                </FormItem>
                              )}
                            />

                            {/* Start Date */}
                            <FormField
                              name={`previousEmployments.${index}.startDate`}
                              control={form.control}
                              render={({ field }) => {
                                const selectedDate = field.value
                                  ? new Date(field.value)
                                  : null;

                                return (
                                  <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) =>
                                          field.onChange(date)
                                        }
                                        placeholder="Employment Start Date"
                                      />
                                    </FormControl>
                                    <p className="text-xs  text-gray-800">
                                      Select the date you started this position{' '}
                                    </p>
                                  </FormItem>
                                );
                              }}
                            />

                            {/* End Date */}
                            <FormField
                              name={`previousEmployments.${index}.endDate`}
                              control={form.control}
                              render={({ field }) => {
                                const selectedDate = field.value
                                  ? new Date(field.value)
                                  : null;

                                return (
                                  <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                      <CustomDatePicker
                                        selected={selectedDate}
                                        onChange={(date) =>
                                          field.onChange(date)
                                        }
                                        placeholder="Employment End Date"
                                      />
                                    </FormControl>
                                    <p className="mt-1 text-xs text-gray-800">
                                      Select the end date{' '}
                                    </p>
                                  </FormItem>
                                );
                              }}
                            />

                            {/* Reason for Leaving */}
                            <FormField
                              name={`previousEmployments.${index}.reasonForLeaving`}
                              control={form.control}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason for Leaving</FormLabel>
                                  <FormControl>
                                    <Input {...field}  placeholder="Enter the reason"/>
                                  </FormControl>
                                   <p className="mt-1 text-xs text-gray-800">
                               Reason for Leaving the Position
                              </p>
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
                                        <SelectValue placeholder="Select an option" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="mt-1 text-xs text-gray-800">
                                Select whether we may contact this employer for
                                reference. Options: Yes, No, Contact Me First{' '}
                              </p>
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
                                      placeholder='Job Duties'
                                    />
                                  </FormControl>
                                  <p className="mt-1 text-xs text-gray-800">
                                Briefly describe your key responsibilities{' '}
                              </p>
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
                        Add More Experiance
                      </Button>
                    </div>
                  )}

                  {(fields.length > 0 || watchIsEmployed === 'yes') && (
                    <>
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
                            <p className="mt-1 text-xs text-gray-800">
                               Have you had any periods of 1 month or more without employment in the past 5 years?
                              </p>
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
                                <Textarea
                                  {...field}
                                  className="min-h-[100px]"
                                  placeholder='Explanation for Gaps
'
                                />
                              </FormControl>
                              <p className="mt-1 text-xs text-gray-800">
                               Briefly explain the reason for any gaps (e.g., study break, health reasons, relocation)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
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
                              I confirm that the information provided is
                              accurate.
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
                      onClick={() => {
                        if (showFullForm) {
                          setShowFullForm(false);
                        } else {
                          onBack();
                        }
                      }}
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
                </>
              </CardContent>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}
