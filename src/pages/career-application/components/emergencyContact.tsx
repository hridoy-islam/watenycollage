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
import { HelperTooltip } from '@/helper/HelperTooltip';

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

  setCurrentStep,
  saveAndLogout
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

  function onSubmit(data: ContactData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(9);
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
  <div className="grid grid-cols-1">
    {/* Emergency Contact Section */}
    <div className="space-y-4">
      <div className="flex flex-col items-start">
        <h2 className="text-xl font-semibold">Next of Kin</h2>
        <p className="text-lg text-gray-700">
          Please provide the details of someone we can contact in case of an
          emergency. This is typically a close relative or someone you trust.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="emergencyFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div>
                  Full Name <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Enter the full name of your emergency contact. e.g., Jane Doe" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter full name of your emergency contact"
                  className="placeholder:text-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contact Number */}
        <FormField
          control={form.control}
          name="emergencyContactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div>
                  Contact Number <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Provide a phone number where this person can be reached in an emergency. e.g., +44 7700 900123" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter emergency contact number"
                  className="placeholder:text-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="emergencyEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div>
                  Email <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Enter an email address for non-urgent communication. e.g., jane.doe@example.com" />
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  placeholder="Enter contact's email address"
                  className="placeholder:text-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Relationship */}
        <FormField
          control={form.control}
          name="emergencyRelationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div>
                  Relationship <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Select your relationship with this person. e.g., Parent" />
              </FormLabel>
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
                  onChange={(selected) => field.onChange(selected?.value)}
                  placeholder="Select your relationship"
                  isClearable
                  styles={{
                    placeholder: (provided) => ({
                      ...provided,
                      fontSize: "0.875rem",
                      color: "#9CA3AF",
                    }),
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="emergencyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div>
                  Address <span className="text-red-500">*</span>
                </div>
                <HelperTooltip text="Enter the complete address of your emergency contact. e.g., 12 High Street, Bristol, BS1 4ST, United Kingdom" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter contact's full address"
                  className="placeholder:text-gray-500"
                />
              </FormControl>
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
              onClick={() => saveAndLogout()}
              className="bg-watney  text-white hover:bg-watney/90"
            >
              Save And Exit
            </Button>
          <Button
            type="submit"
            className="bg-watney text-white hover:bg-watney/90"
          >
           Save And Next
          </Button>
        </div>
      </form>
    </Form>
     </div>
  );
}
