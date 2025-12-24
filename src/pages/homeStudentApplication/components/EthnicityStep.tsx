import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useEffect } from 'react';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';

// --- Options Data ---

// 1. Ethnicity Options
const ethnicityOptions = [
  { group: 'White or White British', value: 'english', label: 'English' },
  { group: 'White or White British', value: 'scottish', label: 'Scottish' },
  { group: 'White or White British', value: 'welsh', label: 'Welsh' },
  { group: 'White or White British', value: 'irish', label: 'Irish' },
  { group: 'White or White British', value: 'gypsy_traveller', label: 'Gypsy or Traveller' },
  { group: 'White or White British', value: 'other_white', label: 'Other White Background' },

  { group: 'Mixed', value: 'white_black_caribbean', label: 'White & Black Caribbean' },
  { group: 'Mixed', value: 'white_black_african', label: 'White & Black African' },
  { group: 'Mixed', value: 'white_asian', label: 'White & Asian' },
  { group: 'Mixed', value: 'other_mixed', label: 'Other mixed background' },

  { group: 'Asian or Asian British', value: 'indian', label: 'Indian' },
  { group: 'Asian or Asian British', value: 'pakistani', label: 'Pakistani' },
  { group: 'Asian or Asian British', value: 'bangladeshi', label: 'Bangladeshi' },
  { group: 'Asian or Asian British', value: 'sri_lankan', label: 'Sri Lankan' },
  { group: 'Asian or Asian British', value: 'nepali', label: 'Nepali' },
  { group: 'Asian or Asian British', value: 'other_asian', label: 'Other Asian Background' },

  { group: 'Black or Black British', value: 'caribbean', label: 'Caribbean' },
  { group: 'Black or Black British', value: 'african', label: 'African' },
  { group: 'Black or Black British', value: 'other_black', label: 'Other Black Background' },

  { group: 'Chinese or Chinese British', value: 'chinese', label: 'Chinese' },

  { group: 'Other Ethnic Background', value: 'arab', label: 'Arab' },
  { group: 'Other Ethnic Background', value: 'other_ethnic', label: 'Other Ethnic Background' },
  { group: 'Prefer Not to Say', value: 'prefer_not_to_say', label: 'Prefer Not to Say' }
];

const ethnicGroups = [
  { value: 'White or White British', label: 'White or White British' },
  { value: 'Mixed', label: 'Mixed' },
  { value: 'Asian or Asian British', label: 'Asian or Asian British' },
  { value: 'Black or Black British', label: 'Black or Black British' },
  { value: 'Chinese or Chinese British', label: 'Chinese or Chinese British' },
  { value: 'Other Ethnic Background', label: 'Other Ethnic Background' },
  { value: 'Prefer Not to Say', label: 'Prefer Not to Say' }
];

// 2. Religion Options
const religionOptions = [
  { value: 'no_religion', label: 'No Religion' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'christian', label: 'Christian' },
  { value: 'christian_church_of_scotland', label: 'Christian – Church of Scotland' },
  { value: 'christian_roman_catholic', label: 'Christian – Roman Catholic' },
  { value: 'christian_presbyterian', label: 'Christian – Presbyterian Church in Ireland' },
  { value: 'christian_church_of_ireland', label: 'Christian – Church of Ireland' },
  { value: 'christian_methodist', label: 'Christian – Methodist Church in Ireland' },
  { value: 'christian_other', label: 'Christian – Other Denomination' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'other_religion', label: 'Any other Religion or Belief' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

// 3. Sexual Orientation Options
const sexualOrientationOptions = [
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'gay_man', label: 'Gay Man' },
  { value: 'gay_woman_lesbian', label: 'Gay Woman/Lesbian' },
  { value: 'heterosexual', label: 'Heterosexual' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

// 4. Gender Identity Options
const genderIdentityOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say / Information Refused' }
];

// --- Schema Definition ---
const equalitySchema = z
  .object({
    ethnicityGroup: z.string().min(1, 'Ethnic group is required'),
    ethnicityValue: z.string().min(1, 'Ethnicity is required'),
    ethnicityOther: z.string().optional(),
    religion: z.string().min(1, 'Religion or belief is required'),
    sexualOrientation: z.string().min(1, 'Sexual orientation is required'),
    genderIdentitySameAtBirth: z.string().min(1, 'This field is required'),
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

type EqualityFormValues = z.infer<typeof equalitySchema>;

export function EthnicityStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
}) {
  const form = useForm<EqualityFormValues>({
    resolver: zodResolver(equalitySchema),
    defaultValues: {
      ethnicityGroup: defaultValues?.ethnicityGroup || '',
      ethnicityValue: defaultValues?.ethnicityValue || '',
      ethnicityOther: defaultValues?.ethnicityOther || '',
      religion: defaultValues?.religion || '',
      sexualOrientation: defaultValues?.sexualOrientation || '',
      genderIdentitySameAtBirth: defaultValues?.genderIdentitySameAtBirth || '',
      ...defaultValues
    },
    mode: 'onSubmit'
  });

  const selectedGroup = form.watch('ethnicityGroup');
  const selectedValue = form.watch('ethnicityValue');

  // Filter options based on selected group
  const filteredEthnicityOptions = ethnicityOptions
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
        ethnicityOther: defaultValues.ethnicityOther || '',
        religion: defaultValues.religion || '',
        sexualOrientation: defaultValues.sexualOrientation || '',
        genderIdentitySameAtBirth: defaultValues.genderIdentitySameAtBirth || '',
      });
    }
  }, [defaultValues, form]);

  function onSubmit(data: EqualityFormValues) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(6);
  }

  // Shared styles for all Select components
  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
     
      fontSize: '0.75rem',
    }),
    placeholder: (base) => ({ ...base, fontSize: '0.75rem' }),
    singleValue: (base) => ({ ...base, fontSize: '0.75rem' }),
    input: (base) => ({ ...base, fontSize: '0.75rem' }),
  };

 

  return (
    <div className="rounded-lg bg-white py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {/* Main Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Header Info - Full Width */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-start space-y-2 mb-4">
                <h2 className="text-2xl font-semibold">Equality & Diversity Monitoring</h2>
                <p className="text-sm text-gray-600">
                  This information helps us ensure our recruitment practices are
                  fair and inclusive. Your response is optional and will not affect
                  your application.
                </p>
              </div>

              {/* --- Section 8: Ethnicity (Spans 2 columns to allow split inside) --- */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                 <h3 className="text-xl font-semibold text-gray-900">Ethnicity</h3>
                 
                 {/* Inner Grid for Ethnicity Fields */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ethnicityGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">
                            Select Ethnic Group <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              options={ethnicGroups}
                              placeholder="Choose an ethnic group..."
                              isClearable
                              value={ethnicGroups.find((g) => g.value === field.value) || null}
                              onChange={(option) => {
                                field.onChange(option ? option.value : '');
                                form.setValue('ethnicityValue', '');
                                form.setValue('ethnicityOther', '');
                              }}
                              className="text-lg"
                              menuPortalTarget={document.body}
                              styles={selectStyles}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedGroup && (
                      <FormField
                        control={form.control}
                        name="ethnicityValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-watney'>
                               Select Specific Ethnicity <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select
                                options={filteredEthnicityOptions}
                                placeholder="Choose your specific ethnicity..."
                                isClearable
                                value={filteredEthnicityOptions.find((opt) => opt.value === field.value) || null}
                                onChange={(option) => {
                                  field.onChange(option ? option.value : '');
                                  form.setValue('ethnicityOther', '');
                                }}
                                className="text-lg"
                                menuPortalTarget={document.body}
                                styles={selectStyles}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {requiresOther && (
                      <FormField
                        control={form.control}
                        name="ethnicityOther"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className='text-watney'>Please Specify</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="e.g., Polish, Nigerian, Filipino, etc."
                                className="min-h-[100px] border border-gray-300 p-4 text-lg resize-none placeholder:text-gray-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                 </div>
              </div>

              {/* --- Section 9: Religion (1 Column) --- */}
              <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-gray-900">Religion or Belief</h3>
                 <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">
                        Select Religion <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={religionOptions}
                          placeholder="Select..."
                          isClearable
                          value={religionOptions.find((opt) => opt.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : '')}
                          className="text-lg"
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Section 10: Sexual Orientation (1 Column) --- */}
              <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-gray-900">Sexual Orientation</h3>
                 <FormField
                  control={form.control}
                  name="sexualOrientation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">
                        Select Sexual Orientation <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={sexualOrientationOptions}
                          placeholder="Select..."
                          isClearable
                          value={sexualOrientationOptions.find((opt) => opt.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : '')}
                          className="text-lg"
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* --- Section 11: Gender Identity (Full Width) --- */}
              <div className=" space-y-4">
                 <h3 className="text-xl font-semibold text-gray-900">Gender Identity</h3>
                 <FormField
                  control={form.control}
                  name="genderIdentitySameAtBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">
                        Is your gender identity the same gender as you were originally assigned at birth? <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          options={genderIdentityOptions}
                          placeholder="Select..."
                          isClearable
                          value={genderIdentityOptions.find((opt) => opt.value === field.value) || null}
                          onChange={(option) => field.onChange(option ? option.value : '')}
                          className="text-lg"
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>
          </CardContent>

          <div className="flex flex-col gap-3 pt-4 p-6 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="w-full bg-watney  text-white hover:bg-watney/90 sm:w-auto"
              >
                Back
              </Button>

              <Button
                type="submit"
                className="w-full bg-watney  text-white hover:bg-watney/90 sm:w-auto"
              >
                Next
              </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}