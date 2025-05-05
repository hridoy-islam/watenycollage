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
import { useEffect } from 'react';

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

    
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail']
  });

type ContactData = z.infer<typeof contactSchema>;



export function ContactStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}) {
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactNumber: defaultValues?.contactNumber || '',
      email: defaultValues?.email || '',
      confirmEmail: defaultValues?.confirmEmail || '',
      preferredContactMethod: defaultValues?.preferredContactMethod || '',
      
    }
  });

  function onSubmit(data: ContactData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(3);
  }


   useEffect(() => {
        if (defaultValues) {
          form.reset({
            ...defaultValues,
            
          });
        }
      }, [defaultValues, form]);
      
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent >
            <div className="grid grid-cols-1 gap-8 ">
              {/* Contact Details Section */}
              <div className="space-y-4 ">
                <h2 className="text-xl font-semibold">Contact Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input   {...field} />
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
                          <Input type="email"   {...field} />
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
                          <Input type="email"    {...field} />
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
                           {...field}
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

          
            </div>
          </CardContent>
        </div>

        <div className="px-6 flex justify-between">
          <Button type="button" variant="outline"  className='bg-watney text-white hover:bg-watney/90' onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" className='bg-watney text-white hover:bg-watney/90'>Next</Button>
        </div>
      </form>
    </Form>
  );
}
