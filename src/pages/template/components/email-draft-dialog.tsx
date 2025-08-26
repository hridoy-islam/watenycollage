import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  'name',
  'dob',
  'email',
  'countryOfBirth',
  'countryOfDomicile',
  'nationality',
  'dateOfBirth',
  'niNumber',
  'admin',
  'adminEmail'
];





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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-h-max sm:max-w-max overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Edit Email Template' : 'Create New Email Template'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Edit your email Template below.'
              : 'Create a new email Template. You can send it later.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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

            {/* Variable Reference */}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Available Variables:
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {AVAILABLE_VARIABLES.map((v) => (
                  <span key={v} className="rounded bg-gray-100 px-2 py-1">
                    {`[${v}]`}
                  </span>
                ))}
              </div>
            </div>

            {/* Body with React Quill */}
            <FormField
              control={form.control}
              name="body"
          
              render={({ field }) => (
                <FormItem     className="pb-12">
                  <FormLabel>Email Body</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-[250px]"
                      placeholder="Write your email body here..."
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
