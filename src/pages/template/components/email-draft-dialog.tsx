import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required')
});

const AVAILABLE_VARIABLES = [
  'courseName',
  'intake',
  'applicationStatus',
  'applicationDate',
  'name',
  'title',
  'firstName',
  'lastName',
  'phone',
  'email',
  'countryOfBirth',
  'nationality',
  'countryOfResidence',
  'dateOfBirth',
  'ethnicity',
  'gender',
  'postalAddressLine1',
  'postalAddressLine2',
  'postalCity',
  'postalCountry',
  'postalPostCode',
  'residentialAddressLine1',
  'residentialAddressLine2',
  'residentialCity',
  'residentialCountry',
  'residentialPostCode',
  'emergencyAddress',
  'emergencyContactNumber',
  'emergencyEmail',
  'emergencyFullName',
  'emergencyRelationship',
  'admin',
  'adminEmail',
  'applicationLocation'
];

// Example values for each variable (for demonstration)
const EXAMPLE_VALUES = {
  name: 'Jane Doe',
  title: 'Ms',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  email: 'jane.doe@example.com',
  countryOfBirth: 'United States',
  nationality: 'American',
  countryOfResidence: 'Canada',
  dateOfBirth: '1990-05-15',
  ethnicity: 'Hispanic',
  gender: 'Female',
  postalAddressLine1: '123 Main St',
  postalAddressLine2: 'Apt 4B',
  postalCity: 'New York',
  postalCountry: 'USA',
  postalPostCode: '10001',
  residentialAddressLine1: '456 Oak Ave',
  residentialAddressLine2: '',
  residentialCity: 'Toronto',
  residentialCountry: 'Canada',
  residentialPostCode: 'M5V 3L9',
  emergencyAddress: '789 Pine Rd, Vancouver, CA',
  emergencyContactNumber: '+1 (555) 987-6543',
  emergencyEmail: 'emergency.contact@example.com',
  emergencyFullName: 'John Smith',
  emergencyRelationship: 'Brother',
  admin: 'Watney College',
  adminEmail: 'info@watneycollege.co.uk',
  applicationLocation: 'Online Portal',
  courseName: 'Exam Preparation Courses',
  intake: 'September 2025',
  applicationStatus: 'applied',
  applicationDate: '2025-05-15'
};

export function EmailDraftDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      body: ''
    }
  });

  const [copiedVar, setCopiedVar] = useState(null); // Track which variable was copied

  useEffect(() => {
    if (initialData) {
      form.reset({
        subject: initialData.subject,
        body: initialData.body
      });
    } else {
      form.reset({
        subject: '',
        body: ''
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleCopy = (variable) => {
    const varWithBrackets = `[${variable}]`;
    navigator.clipboard
      .writeText(varWithBrackets)
      .then(() => {
        setCopiedVar(variable);
        setTimeout(() => setCopiedVar(null), 1500); // Reset after 1.5s
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto sm:max-h-screen sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Edit Email Template' : 'Create New Email Template'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Edit your email template below.'
              : 'Create a new email template. Use the variables on the left to personalize content.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-6 md:grid-cols-5"
          >
            {/* Left Side - Variables with Examples */}
            <div className="md:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Available Variables
              </h3>
              <div className="max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3">
                <ul className="space-y-2">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <li
                      key={v}
                      className="flex flex-col rounded bg-white p-3 shadow-sm "
                    >
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-xs text-blue-700">{`[${v}]`}</code>
                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => handleCopy(v)}
                          aria-label={`Copy [${v}]`}
                        >
                          {copiedVar === v ? (
                            <span
                              className="text-xs text-green-600"
                              aria-label="Copied!"
                            >
                              ✓
                            </span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Example Value */}
                      <span className="mt-1 text-xs text-gray-600">
                        Example:{' '}
                        <span className="font-mono text-gray-800">
                          {EXAMPLE_VALUES[v]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Click <Copy className="inline h-3 w-3 align-text-top" /> to copy
                a variable like{' '}
                <code className="rounded bg-gray-200 px-1 text-xs">
                  [firstName]
                </code>
                . Paste it into body.
              </p>
            </div>

            {/* Right Side - Form */}
            <div className="space-y-4 md:col-span-3">
              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Body */}
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Body</FormLabel>
                    <FormControl>
                      <textarea
                        value={field.value}
                        onChange={field.onChange}
                        className="h-60 w-full resize-none rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                        placeholder="Write your email content. You can paste variables like [firstName] here."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {initialData ? 'Update Template' : 'Save Template'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
