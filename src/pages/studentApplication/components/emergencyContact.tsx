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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { emergencyContactRelationships } from '@/types';

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
    .min(1, { message: 'Relationship is required' })
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
      emergencyRelationship: defaultValues?.emergencyRelationship || ''
    }
  });

  function onSubmit(data: ContactData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(4);
  }

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <div className="grid grid-cols-1">
              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Emergency Contact / Next of Kin
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} {...field}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Relation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emergencyContactRelationships.map(
                              (relation, index) => (
                                <SelectItem key={index} value={relation}>
                                  {relation}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
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
          <Button type="button" variant="outline" className='bg-watney text-white hover:bg-watney/90' onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" className='bg-watney text-white hover:bg-watney/90'>Next</Button>
        </div>
      </form>
    </Form>
  );
}
