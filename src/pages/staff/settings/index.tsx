import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import type { StaffPrivilege } from '@/lib/utils';

const staffPrivilegeSchema = z.object({
  dataManagement: z.object({
    course: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    term: z.object({ list: z.boolean(), add: z.boolean(), edit: z.boolean() }),
    institution: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    academicYear: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    courseRelation: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    emails: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    drafts: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    invoices: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    staffs: z.object({
      list: z.boolean(),
      add: z.boolean(),
      edit: z.boolean()
    }),
    agent: z.object({ list: z.boolean(), add: z.boolean(), edit: z.boolean() })
  }),
  student: z.object({
    personalInformation: z.boolean(),
    education: z.boolean(),
    workExperience: z.boolean(),
    application: z.boolean(),
    search: z.object({ view: z.boolean(), print: z.boolean() }),
    uploadDocument: z.object({ view: z.boolean(), add: z.boolean() }),
    communication: z.object({ view: z.boolean(), sendMessage: z.boolean() }),
    notes: z.object({ view: z.boolean(), add: z.boolean() })
  })
});

export function StaffSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StaffPrivilege>({
    resolver: zodResolver(staffPrivilegeSchema),
    defaultValues: {
      dataManagement: {
        course: { list: false, add: false, edit: false },
        term: { list: false, add: false, edit: false },
        institution: { list: false, add: false, edit: false },
        academicYear: { list: false, add: false, edit: false },
        courseRelation: { list: false, add: false, edit: false },
        emails: { list: false, add: false, edit: false },
        drafts: { list: false, add: false, edit: false },
        invoices: { list: false, add: false, edit: false },
        staffs: { list: false, add: false, edit: false },
        agent: { list: false, add: false, edit: false }
      },
      student: {
        personalInformation: false,
        education: false,
        workExperience: false,
        application: false,
        search: { view: false, print: false },
        uploadDocument: { view: false, add: false },
        communication: { view: false, sendMessage: false },
        notes: { view: false, add: false }
      }
    }
  });

  async function onSubmit(data: StaffPrivilege) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/staff-privileges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit staff privileges');
      }

      const result = await response.json();
      console.log('Staff privileges submitted successfully:', result);
      // You can add a success message or redirect here
    } catch (error) {
      console.error('Error submitting staff privileges:', error);
      // You can add an error message here
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
            <CardDescription>
              Enter the staff member's basic information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">Staf detaisl here</CardContent>
        </Card>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-2 rounded-xl bg-white p-4 shadow"
        >
          <AccordionItem value="dataManagement">
            <AccordionTrigger className="my-2 rounded-lg px-4 data-[state=open]:bg-supperagent data-[state=open]:text-white">
              Data Management Privileges
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4">
                  {Object.entries(form.getValues().dataManagement).map(
                    ([key, value]) => (
                      <div key={key} className="space-y-2">
                        <h3 className="font-semibold capitalize">{key}</h3>
                        {Object.entries(value).map(([action, _]) => (
                          <FormField
                            key={`${key}.${action}`}
                            control={form.control}
                            name={`dataManagement.${key}.${action}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base capitalize">
                                    {action}
                                  </FormLabel>
                                  <FormDescription>
                                    Allow this staff member to {action} {key}.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="student">
            <AccordionTrigger className="my-2 rounded-lg px-4 data-[state=open]:bg-supperagent data-[state=open]:text-white">
              Student Privileges
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4">
                  {Object.entries(form.getValues().student).map(
                    ([key, value]) => (
                      <div key={key}>
                        {typeof value === 'boolean' ? (
                          <FormField
                            control={form.control}
                            name={`student.${key}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </FormLabel>
                                  <FormDescription>
                                    Allow this staff member to access student{' '}
                                    {key
                                      .replace(/([A-Z])/g, ' $1')
                                      .trim()
                                      .toLowerCase()}
                                    .
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="space-y-2">
                            <h3 className="font-semibold capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            {Object.entries(value).map(([action, _]) => (
                              <FormField
                                key={`${key}.${action}`}
                                control={form.control}
                                name={`student.${key}.${action}`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base capitalize">
                                        {action}
                                      </FormLabel>
                                      <FormDescription>
                                        Allow this staff member to {action}{' '}
                                        student {key}.
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
