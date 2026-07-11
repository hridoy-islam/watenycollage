import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Copy, Search, Bold, Italic, WrapText, AlignCenter, Heading, Subscript } from 'lucide-react';

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
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required')
});

const AVAILABLE_VARIABLES = [
  'todayDate',
  'name',
  'jobTitle',
  'applicationDate',
  'title',
  'firstName',
  'lastName',
  'dateOfBirth',
  'email',
  'phone',
  'nationality',
  'countryOfResidence',
  'postalAddressLine1',
  'postalCity',
  'postalPostCode',
  'postalCountry',
  'availableFromDate',
  'admin',
  'adminEmail',
  'userSignature'
];

const EXAMPLE_VALUES: Record<string, string> = {
  name:'Mr John Doe',
  title: 'Mr',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1992-08-21',
  email: 'john.doe@example.com',
  phone: '+44 7700 900123',
  nationality: 'British',
  countryOfResidence: 'UK',
  postalAddressLine1: '221B Baker Street',
  postalCity: 'London',
  postalPostCode: 'NW1 6XE',
  postalCountry: 'UK',
  availableFromDate: '2025-09-15',
  applicationDate: '2025-09-01',
  jobTitle: 'Senior Care Assistant',
  admin: 'Watney College',
  adminEmail: 'info@watneycollege.co.uk',
  userSignature: '[userSignature] Represents the applicant signature',
  todayDate: '2025-06-01 Represents the current date'
};

const DYNAMIC_VARIABLES: string[] = [];

export function ContractTypeDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', body: '' }
  });

  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialData) {
      form.reset({ title: initialData.title, body: initialData.body });
    } else {
      form.reset({ title: '', body: '' });
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

  const filteredVariables = [
    ...AVAILABLE_VARIABLES,
    ...DYNAMIC_VARIABLES
  ].filter((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto sm:min-h-[65vh] sm:min-w-[96vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Edit Contract Type' : 'Create New Contract Type'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Edit your contract type template below.'
              : 'Create a new contract type template. Use the variables on the left to personalize content.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-6 md:grid-cols-5"
          >
            <div className="md:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Available Variables
              </h3>

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
                          className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600 bg-white hover:bg-white"
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

            <div className="space-y-4 md:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contract type title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => {
                  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
                  const insertFormat = (before: string, after: string) => {
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selected = field.value.substring(start, end);
                    const formatted = selected ? `${before}${selected}${after}` : before;
                    const newValue = field.value.substring(0, start) + formatted + field.value.substring(end);
                    field.onChange(newValue);
                    setTimeout(() => {
                      textarea.focus();
                      const cursorPos = start + (selected ? before.length + selected.length + after.length : before.length);
                      textarea.setSelectionRange(cursorPos, cursorPos);
                    }, 0);
                  };
                  return (
                    <FormItem>
                      <FormLabel>Contract Body</FormLabel>
                      <div className="flex gap-1 mb-1">
                        <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<b>', '</b>')} title="Bold">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<i>', '</i>')} title="Italic">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<br>', '')} title="Line Break">
                          <WrapText className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<center>', '</center>')} title="Center Align">
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<header>', '</header>')} title="Header">
                          <Heading className="h-4 w-4" />
                        </Button>
                        {/* <Button type="button" variant="outline" size="sm" onClick={() => insertFormat('<subtitle>', '</subtitle>')} title="Subtitle">
                          <Subscript className="h-4 w-4" />
                        </Button> */}
                      </div>
                      <FormControl>
                        <textarea
                          ref={textareaRef}
                          value={field.value}
                          onChange={field.onChange}
                          className="min-h-[50vh] w-full resize-none rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                          placeholder="Write your contract content. Paste variables like [firstName] or [userSignature]."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                  {initialData ? 'Update Contract Type' : 'Save Contract Type'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
