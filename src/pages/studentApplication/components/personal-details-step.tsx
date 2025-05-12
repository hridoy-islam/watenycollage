import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { countries, nationalities } from '@/types';

// Schema
const personalDetailsSchema = z.object({
  gender: z.string().min(1, { message: 'Please select a gender' }),
  nationality: z.string().min(1, { message: 'Please select a nationality' }),
  ethnicity: z.string().min(1, { message: 'Please select an ethnicity' }),
  customEthnicity: z.string().optional(),
  countryOfBirth: z.string().min(1, { message: 'Please select country of birth' }),
  maritalStatus: z.string().min(1, { message: 'Please select marital status' }),
  studentType: z.string().optional(),
  requireVisa: z.string().optional(),
  applicationLocation: z.string().optional()
});

type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;

interface Props {
  defaultValues?: Partial<PersonalDetailsData>;
  onSaveAndContinue: (data: PersonalDetailsData) => void;
  onSave?: (data: PersonalDetailsData) => void;
  setCurrentStep: (step: number) => void;
}

export function PersonalDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}: Props) {
  const form = useForm<PersonalDetailsData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      gender: '',
      nationality: '',
      ethnicity: '',
      countryOfBirth: '',
      maritalStatus: '',
      requireVisa: '',
      applicationLocation: '',
      ...defaultValues
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const studentType = defaultValues?.studentType;
  const ethnicity = useWatch({ control: form.control, name: 'ethnicity' });

  function handleBack() {
    setCurrentStep(1);
  }

  function onSubmit(data: PersonalDetailsData) {
    onSaveAndContinue(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nationality */}
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Of Domicile</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nationalities.map((nation, index) => (
                        <SelectItem key={index} value={nation}>
                          {nation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ethnicity */}
            <FormField
              control={form.control}
              name="ethnicity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ethnicity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Ethnicity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="white">White</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Ethnicity */}
            {ethnicity === 'other' && (
              <FormField
                control={form.control}
                name="customEthnicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Ethnicity</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your ethnicity"
                        {...field}
                        className="p-1 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Country of Birth */}
            <FormField
              control={form.control}
              name="countryOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Birth</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country, index) => (
                        <SelectItem key={index} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marital Status */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married or in civil partnership</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional International Fields */}
            {studentType === 'international' && (
              <>
                <FormField
                  control={form.control}
                  name="requireVisa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you require a visa to come to the UK?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                <FormField
                  control={form.control}
                  name="applicationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From where are you making your application?</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </CardContent>

        <div className="flex justify-between px-5">
          <Button type="button" variant="outline" className="bg-watney text-white hover:bg-watney/90" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" className="bg-watney text-white hover:bg-watney/90">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
