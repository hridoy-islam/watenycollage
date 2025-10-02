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
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';

// Define ethnicity options
const ethnicityOptions = [
  { group: 'White or White British', value: 'english', label: 'English' },
  { group: 'White or White British', value: 'scottish', label: 'Scottish' },
  { group: 'White or White British', value: 'welsh', label: 'Welsh' },
  { group: 'White or White British', value: 'irish', label: 'Irish' },
  {
    group: 'White or White British',
    value: 'irish_traveller',
    label: 'Irish Traveller'
  },
  {
    group: 'White or White British',
    value: 'other_white',
    label: 'Other White Background'
  },

  {
    group: 'Mixed',
    value: 'white_black_caribbean',
    label: 'White & Black Caribbean'
  },
  {
    group: 'Mixed',
    value: 'white_black_african',
    label: 'White & Black African'
  },
  { group: 'Mixed', value: 'white_asian', label: 'White & Asian' },
  {
    group: 'Mixed',
    value: 'other_mixed',
    label: 'Other mixed background'
  },

  {
    group: 'Asian or Asian British',
    value: 'indian',
    label: 'Indian'
  },
  {
    group: 'Asian or Asian British',
    value: 'pakistani',
    label: 'Pakistani'
  },
  {
    group: 'Asian or Asian British',
    value: 'bangladeshi',
    label: 'Bangladeshi'
  },
  {
    group: 'Asian or Asian British',
    value: 'other_asian',
    label: 'Other Asian Background'
  },

  {
    group: 'Black or Black British',
    value: 'caribbean',
    label: 'Caribbean'
  },
  { group: 'Black or Black British', value: 'african', label: 'African' },
  {
    group: 'Black or Black British',
    value: 'other_black',
    label: 'Other Black Background'
  },

  {
    group: 'Chinese or Chinese British',
    value: 'chinese',
    label: 'Chinese or Chinese British'
  },

  {
    group: 'Other Ethnic Background',
    value: 'other_ethnic',
    label: 'Other Ethnic Background'
  }
];

// Schema
const ethnicitySchema = z
  .object({
    ethnicityGroup: z.string().min(1, 'Ethnic group is required'),
    ethnicityValue: z.string().min(1, 'Ethnicity is required'),
    ethnicityOther: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const isOtherSelected = [
      'other_white',
      'other_mixed',
      'other_asian',
      'other_black',
      'other_ethnic'
    ].includes(data.ethnicityValue || '');

    if (isOtherSelected && !data.ethnicityOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please specify your ethnic background',
        path: ['ethnicityOther']
      });
    }
  });

type EthnicityFormValues = z.infer<typeof ethnicitySchema>;

// Group names for first dropdown
const ethnicGroups = [
  { value: 'White or White British', label: 'White or White British' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Asian or Asian British', label: 'Asian or Asian British' },
  { value: 'Black or Black British', label: 'Black or Black British' },
  { value: 'Chinese or Chinese British', label: 'Chinese or Chinese British' },
  { value: 'Other Ethnic Background', label: 'Other Ethnic Background' }
];

export function EthnicityStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<EthnicityFormValues>({
    resolver: zodResolver(ethnicitySchema),
    defaultValues: {
      ethnicityGroup: defaultValues?.ethnicityGroup || '',
      ethnicityValue: defaultValues?.ethnicityValue || '',
      ethnicityOther: defaultValues?.ethnicityOther || '',
      ...defaultValues
    },
    mode: 'onSubmit'
  });

  const selectedGroup = form.watch('ethnicityGroup');
  const selectedValue = form.watch('ethnicityValue');

  // Filter options based on selected group
  const filteredOptions = ethnicityOptions
    .filter((option) => option.group === selectedGroup)
    .map((option) => ({ value: option.value, label: option.label }));

  const requiresOther = [
    'other_white',
    'other_mixed',
    'other_asian',
    'other_black',
    'other_ethnic'
  ].includes(selectedValue);

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ethnicityGroup: defaultValues.ethnicityGroup || '',
        ethnicityValue: defaultValues.ethnicityValue || '',
        ethnicityOther: defaultValues.ethnicityOther || ''
      });
    }
  }, [defaultValues, form]);

  function onSubmit(data: EthnicityFormValues) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(10);
  }

return (
  <div className="rounded-lg bg-white py-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-start">
              <h2 className="text-2xl font-semibold">Ethnic Background</h2>
              <p className="text-lg">
                This information helps us ensure our recruitment practices are
                fair and inclusive. Your response is optional and will not affect
                your application.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Select Ethnic Group */}
              <FormField
                control={form.control}
                name="ethnicityGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">
                      Select Your Ethnic Group{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        options={ethnicGroups}
                        placeholder="Choose an ethnic group..."
                        isClearable
                        value={
                          ethnicGroups.find((g) => g.value === field.value) || null
                        }
                        onChange={(option) => {
                          field.onChange(option ? option.value : '');
                          form.setValue('ethnicityValue', '');
                          form.setValue('ethnicityOther', '');
                        }}
                        className="text-lg"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({
                            ...base,
                            height: '3rem',
                            borderRadius: '16px',
                            fontSize: '1.125rem',
                          }),
                          placeholder: (base) => ({ ...base, fontSize: '1.125rem' }),
                          singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                          input: (base) => ({ ...base, fontSize: '1.125rem' }),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Step 2: Select Specific Ethnicity (if group selected) */}
              {selectedGroup && (
                <FormField
                  control={form.control}
                  name="ethnicityValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">
                        Select Your Specific Ethnicity{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={filteredOptions}
                          placeholder="Choose your specific ethnicity..."
                          isClearable
                          value={
                            filteredOptions.find((opt) => opt.value === field.value) || null
                          }
                          onChange={(option) => {
                            field.onChange(option ? option.value : '');
                            form.setValue('ethnicityOther', '');
                          }}
                          className="text-lg"
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({
                              ...base,
                              height: '3rem',
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                            }),
                            placeholder: (base) => ({ ...base, fontSize: '1.125rem' }),
                            singleValue: (base) => ({ ...base, fontSize: '1.125rem' }),
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Step 3: Show "Please Specify" if "Other" is selected */}
              {requiresOther && (
                <FormField
                  control={form.control}
                  name="ethnicityOther"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-lg font-medium">Please Specify</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., Polish, Nigerian, Filipino, etc."
                          className="min-h-[100px] border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
                        />
                      </FormControl>
                      <p className="mt-1 text-md text-gray-400">
                        Example: Brazilian, Somali, Malaysian
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </CardContent>

        <div className="flex justify-between px-6 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className=" bg-watney text-lg text-white hover:bg-watney/90"
          >
            Back
          </Button>
          <Button
            type="submit"
            className=" bg-watney text-lg text-white hover:bg-watney/90"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  </div>
);
}
