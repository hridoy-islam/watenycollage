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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const contactSchema = z
  .object({
    // Contact details
    contactNumber: z.string().min(1, { message: 'Contact number is required' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    confirmEmail: z
      .string()
      .email({ message: 'Please enter a valid email address' }),
    preferredContactMethod: z
      .string()
      .min(1, { message: 'Please select a preferred contact method' }),

    // Emergency contact
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
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail']
  });

type ContactData = z.infer<typeof contactSchema>;

interface ContactStepProps {
  defaultValues?: Partial<ContactData>;
  onSaveAndContinue: (data: ContactData) => void;
  onSave: (data: ContactData) => void;
}

export function ContactStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: ContactStepProps) {
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactNumber: defaultValues?.contactNumber || '',
      email: defaultValues?.email || '',
      confirmEmail: defaultValues?.confirmEmail || '',
      preferredContactMethod: defaultValues?.preferredContactMethod || '',
      emergencyContactNumber: defaultValues?.emergencyContactNumber || '',
      emergencyEmail: defaultValues?.emergencyEmail || '',
      emergencyFullName: defaultValues?.emergencyFullName || '',
      emergencyRelationship: defaultValues?.emergencyRelationship || ''
    }
  });

  function onSubmit(data: ContactData) {
    onSaveAndContinue(data);
  }

  function handleSave() {
    const data = form.getValues();
    onSave(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Contact Details Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Details</h2>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Will be used for Login)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredContactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method</FormLabel>
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
                            <SelectItem value="telephone">Telephone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Emergency Contact / Next of Kin
                </h2>

                <div className="grid grid-cols-1 gap-4">
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
                    name="emergencyRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
}
