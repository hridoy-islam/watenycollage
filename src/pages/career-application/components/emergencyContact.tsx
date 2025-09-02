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

import { useEffect } from 'react';
import Select from 'react-select';

import { countries, emergencyContactRelationships } from '@/types';

const contactSchema = z.object({
  emergencyContactNumber: z
    .string()
    .min(1, { message: 'Emergency contact number is required' }),
  emergencyEmail: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  emergencyFullName: z.string().min(1, { message: 'Full name is required' }),
  emergencyRelationship: z
    .string()
    .min(1, { message: 'Relationship is required' }),
  emergencyAddress: z.string().min(1, { message: 'Address is required' })
});

type ContactData = z.infer<typeof contactSchema>;

export function EmergencyContact({
  defaultValues,
  onSaveAndContinue,

  setCurrentStep
}) {
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      emergencyContactNumber: defaultValues?.emergencyContactNumber || '',
      emergencyEmail: defaultValues?.emergencyEmail || '',
      emergencyFullName: defaultValues?.emergencyFullName || '',
      emergencyRelationship: defaultValues?.emergencyRelationship || '',
      emergencyAddress: defaultValues?.emergencyAddress || ''
    }
  });
  const capitalizeWords = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


  function onSubmit(data: ContactData) {
    const formattedData = {
      ...data,
      emergencyAddress: capitalizeWords(data.emergencyAddress),
    };
    onSaveAndContinue(formattedData);
  }

  function handleBack() {
    setCurrentStep(6);
  }

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  const relationshipOptions = emergencyContactRelationships.map((relation) => ({
    value: relation,
    label: relation
  }));

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  return (
    <div className='bg-white py-6 rounded-lg'>

   
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <div className="grid grid-cols-1 ">
              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <div className="flex flex-col items-start">
                  <h2 className="text-xl font-semibold">
                    Emergency Contact / Next of Kin
                  </h2>
                  <p className="text-md">
                    Please provide the details of someone we can contact in case
                    of an emergency. This is typically a close relative or
                    someone you trust.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the full name of your emergency contact"
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
                          Example: Jane Doe
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contact Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field}  placeholder="Enter a phone number where this person can be reached in an emergency"
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500" />
                        </FormControl>
                         <p className="mt-1 text-xs text-gray-400">
                         Example: +44 7700 900123
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" {...field} placeholder="Provide an email address for non-urgent communication"
                      className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
 />
                        </FormControl>
                         <p className="mt-1 text-xs text-gray-400">
                         Example: jane.doe@example.com
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={relationshipOptions}
                            value={
                              field.value
                                ? relationshipOptions.find(
                                    (option) => option.value === field.value
                                  )
                                : null
                            }
                            onChange={(selected) =>
                              field.onChange(selected?.value)
                            }
                            placeholder="Select your relationship with this person"
                            isClearable
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
                          Example: Parent
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address <span className="text-red-500">*</span></FormLabel>

                        <FormControl>
                          <Input type="text" {...field} placeholder="Enter the full address of your emergency contact"
                      className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
 />
                        </FormControl>
                         <p className="mt-1 text-xs text-gray-400">
                          Example: 12 High Street, Bristol, BS1 4ST, United Kingdom
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
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
     </div>
  );
}
