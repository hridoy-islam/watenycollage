import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';

const complianceSchema = z
  .object({
    disability: z.string().min(1, { message: 'Please select an option' }),
    disabilityDetails: z.string().optional(),
    hearAboutUs: z.string().optional(),

    visaRefusalDetail: z.string().optional(),
    visaRequired: z.string().min(1, { message: 'Please select an option' }),
    enteredUKBefore: z.string().min(1, { message: 'Please select an option' }),
    completedUKCourse: z
      .string()
      .min(1, { message: 'Please select an option' }),
    visaRefusal: z.string().min(1, { message: 'Please select an option' })
  })
  .superRefine((data, ctx) => {
    // Check if disability is "yes" and if disabilityDetails is provided
    if (data.visaRefusal === 'yes' && !data.visaRefusalDetail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Visa Refusal details are required".',
        path: ['visaRefusalDetail']
      });
    }
    if (data.disability === 'yes' && !data.disabilityDetails?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Disability details are required when disability is "yes".',
        path: ['disabilityDetails']
      });
    }
  });

type ComplianceData = z.infer<typeof complianceSchema>;

export function ComplianceStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<ComplianceData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
    
      disability: defaultValues?.disability || '',
      disabilityDetails: defaultValues?.disabilityDetails || '',
      hearAboutUs:defaultValues?.hearAboutUs || "",
      visaRequired: defaultValues?.visaRequired || '',
      enteredUKBefore: defaultValues?.enteredUKBefore || '',
      completedUKCourse: defaultValues?.completedUKCourse || '',
      visaRefusal: defaultValues?.visaRefusal || '',
      visaRefusalDetail: defaultValues?.visaRefusalDetail || ''
    }
  });

  const watchVisaRefusal = form.watch('visaRefusal');
  const watchDisability = form.watch('disability');

  function onSubmit(data: ComplianceData) {
    onSaveAndContinue(data);
  }

  // function handleSave() {
  //   const data = form.getValues();
  //   onSave(data);
  // }

  function handleBack() {
    setCurrentStep(5);
  }

  const visaOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const enteredUKOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const completedUKCourseOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const visaRefusalOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const hearAboutUsOptions = [
    { label: 'Google Search', value: 'google' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Word of Mouth', value: 'word_of_mouth' },
    { label: 'Friend or Family', value: 'friend_family' },
    { label: 'University Fair', value: 'university' },
    { label: 'Online Advertisement', value: 'online' },
    { label: 'Education Agent', value: 'agent' },
    { label: 'School/College', value: 'school/college' },
    { label: 'Other', value: 'other' }
  ];


  const statusOptions = [
    { value: 'uk-citizen', label: 'UK Citizen' },
    { value: 'eu-settled', label: 'EU Settled Status' },
    { value: 'eu-pre-settled', label: 'EU Pre-Settled Status' },
    { value: 'tier4', label: 'Tier 4 Student Visa' },
    { value: 'tier2', label: 'Tier 2 Work Visa' },
    { value: 'other', label: 'Other' }
  ];

  const disabilityOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const benefitsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const studentFinanceOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <h2 className="mb-6 text-2xl font-semibold">Miscellienious</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="visaRequired"
                render={({ field }) => (
                  <FormItem className="mt-2 flex w-full flex-col">
                    <FormLabel>
                      Do you require visa to come or stay to the UK?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={visaOptions}
                        placeholder="Select Yes if you need a visa to study or stay in the UK."
                        value={visaOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes or No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enteredUKBefore"
                render={({ field }) => (
                  <FormItem className="mt-2 flex w-full flex-col">
                    <FormLabel>
                      Have you entered into the UK before?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={enteredUKOptions}
                        placeholder="Indicate whether you have previously been in the UK."
                        value={enteredUKOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes or No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completedUKCourse"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel>
                      Have you completed any course from the UK before?
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={completedUKCourseOptions}
                        placeholder="Select Yes if you have studied in the UK prior to this application."
                        value={completedUKCourseOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes or No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hearAboutUs"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col ">
                    <FormLabel>Where did you hear about us?</FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={hearAboutUsOptions}
                        placeholder="Select Yes if you have studied in the UK prior to this application."
                        value={hearAboutUsOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Website
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visaRefusal"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Do you have any visa refusal?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={visaRefusalOptions}
                        placeholder="Indicate if any UK visa applications have been refused."
                        value={visaRefusalOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes or No
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchVisaRefusal === 'yes' && (
                <FormField
                  control={form.control}
                  name="visaRefusalDetail"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>
                        Visa Refusal Details{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide your visa refusal details"
                          className="!placeholder:text-gray-500  border-gray-200 placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>

                      <p className="mt-1 text-xs text-gray-400">
                        Example: I was refused a UK student visa due to a
                        documentation issue.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="disability"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                     Do you have any known disability?{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={disabilityOptions}
                        placeholder="Select Yes if you have a disability or require support."
                        value={disabilityOptions.find(
                          (opt) => opt.value === field.value
                        )}
                        onChange={(option) => field.onChange(option?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          placeholder: (provided) => ({
                            ...provided,
                            fontSize: '0.75rem',
                            color: '#9CA3AF'
                          })
                        }}
                      />
                    </FormControl>
                    <p className="mt-1 text-xs text-gray-400">
                      Example: Yes, No, Prefer not to say
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDisability === 'yes' && (
                <FormField
                  control={form.control}
                  name="disabilityDetails"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>
                        Disability Details{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide your disabiility details"
                          className="!placeholder:text-gray-500  border-gray-200 placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>

                      <p className="mt-1 text-xs text-gray-400">
                        Example: I have a visual impairment that affects my
                        ability to read small text.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
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
  );
}
