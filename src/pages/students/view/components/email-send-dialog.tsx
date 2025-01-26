import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const formSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required')
});

export function EmailSendDialog({ open, onOpenChange, onSend }) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [emailConfigs, setEmailConfigs] = useState<any[]>([]); // For "To" options
  const [emailDrafts, setEmailDrafts] = useState<any[]>([]); // For draft options

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      body: ''
    }
  });

  // Handle draft selection and update form values
  const handleDraftChange = (draftId: string) => {
    const selectedDraft = emailDrafts.find((draft) => draft.id === draftId);

    if (selectedDraft) {
      form.setValue('subject', selectedDraft.subject || '');
      form.setValue('body', selectedDraft.body || '');
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSend(values.to, values.subject, values.body, attachments);
    form.reset();
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch email configs (for "To" options)
        const emailConfigResponse = await axiosInstance.get(
          '/email-configs?limit=all'
        );
        setEmailConfigs(emailConfigResponse.data.data.result);

        // Fetch email drafts
        const emailDraftResponse = await axiosInstance.get(
          '/email-drafts?limit=all'
        );
        setEmailDrafts(emailDraftResponse.data.data.result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Fill in the details below to send your email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormItem>
              <FormLabel>From</FormLabel>
              <Select onValueChange={(value) => form.setValue('to', value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {emailConfigs.map((config) => (
                    <SelectItem key={config.id} value={config.email}>
                      {config.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel>Draft</FormLabel>
              <Select onValueChange={handleDraftChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a draft" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {emailDrafts.map((draft) => (
                    <SelectItem key={draft.id} value={draft.id}>
                      {draft.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
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
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter email body"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <Input type="file" multiple onChange={handleFileChange} />
              </FormControl>
            </FormItem>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-supperagent text-white hover:bg-supperagent/90"
              >
                Send Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
