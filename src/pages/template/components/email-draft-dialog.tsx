import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Copy, Search } from 'lucide-react';

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
  'todayDate',
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
const EXAMPLE_VALUES = {
  name: 'John Doe',
  title: 'Mr',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+44 7700 900123',
  email: 'john.doe@example.com',
  countryOfBirth: 'UK',
  nationality: 'British',
  countryOfResidence: 'UK',
  dateOfBirth: '1992-08-21',
  ethnicity: 'Caucasian',
  gender: 'Male',
  postalAddressLine1: '221B Baker Street',
  postalAddressLine2: '',
  postalCity: 'London',
  postalCountry: 'UK',
  postalPostCode: 'NW1 6XE',
  residentialAddressLine1: '10 Downing St',
  residentialAddressLine2: '',
  residentialCity: 'London',
  residentialCountry: 'UK',
  residentialPostCode: 'SW1A 2AA',
  emergencyAddress: '5 Fleet Street, London, UK',
  emergencyContactNumber: '+44 7700 900456',
  emergencyEmail: 'emergency.contact@example.com',
  emergencyFullName: 'Jane Doe',
  emergencyRelationship: 'Sister',
  admin: 'Example College',
  adminEmail: 'info@examplecollege.ac.uk',
  applicationLocation: 'Online Portal',
  courseName: 'Computer Science Masters',
  intake: 'January 2026',
  applicationStatus: 'pending',
  applicationDate: '2025-09-01',
  'courseCode="ENG23"': '[courseCode="ENG231"] Represents the course with code ENG23',
  'signature id="1"': '[signature id="1"] Represents the signature with ID 1',
  todayDate: '2025-06-01 Represents the current date'
};

const DYNAMIC_VARIABLES = ['signature id="1"', 'courseCode="ENG23"'];

export function EmailDraftDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', body: '' }
  });

  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // <-- Search state

  useEffect(() => {
    if (initialData) {
      form.reset({ subject: initialData.subject, body: initialData.body });
    } else {
      form.reset({ subject: '', body: '' });
    }
  }, [initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const handleCopy = (variable: string) => {
    const varText = `[${variable}]`;
    navigator.clipboard
      .writeText(varText)
      .then(() => {
        setCopiedVar(variable);
        setTimeout(() => setCopiedVar(null), 1500);
      })
      .catch(console.error);
  };

  // Filter variables based on search query (case-insensitive)
  const filteredVariables = [
    ...AVAILABLE_VARIABLES,
    ...DYNAMIC_VARIABLES
  ].filter((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto sm:min-h-[96vh] sm:min-w-[96vw]">
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
            {/* Left Panel: Variables */}
            <div className="md:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Available Variables
              </h3>

              {/* Search Input */}
              <div className="mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search variables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="max-h-[70vh] overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3">
                <ul className="space-y-2">
                  {filteredVariables.map((v, idx) => (
                    <li
                      key={`${v}-${idx}`}
                      className="flex flex-col rounded bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-xs text-blue-700">{`[${v}]`}</code>
                        <Button
                          type="button"
                          variant="default"
                          size="icon"
                          className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600"
                          onClick={() => handleCopy(v)}
                        >
                          {copiedVar === v ? (
                            <span className="text-xs text-green-600">✓</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {EXAMPLE_VALUES[v] && (
                        <span className="mt-1 text-xs text-gray-600">
                          Example:{' '}
                          <span className="font-mono text-gray-800">
                            {EXAMPLE_VALUES[v]}
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="space-y-4 md:col-span-3">
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
                        className="min-h-[60vh] w-full resize-none rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                        placeholder="Write your email content. Paste variables like [firstName] or [signature id='1']."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
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
