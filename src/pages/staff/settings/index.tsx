import { useEffect, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';

const staffPrivilegeSchema = z.object({
  management: z.object({
    course: z.boolean(),
    term: z.boolean(),
    institution: z.boolean(),
    academicYear: z.boolean(),
    courseRelation: z.boolean(),
    emails: z.boolean(),
    drafts: z.boolean(),
    invoices: z.boolean(),
    staffs: z.boolean(),
    agent: z.boolean()
  }),
  student: z.object({
    personalInformation: z.boolean(),
    education: z.boolean(),
    workExperience: z.boolean(),
    application: z.boolean(),
    search: z.object({ agent: z.boolean(), staff: z.boolean() }),
    uploadDocument: z.boolean(),
    communication: z.boolean(),
    notes: z.boolean()
  })
});

export function StaffSettings() {
  const { id } = useParams();
  const { toast } = useToast();
  const [staffDetails, setStaffDetails] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(staffPrivilegeSchema),
    defaultValues: {
      management: {
        course: false,
        term: false,
        institution: false,
        academicYear: false,
        courseRelation: false,
        emails: false,
        drafts: false,
        invoices: false,
        staffs: false,
        agent: false
      },
      student: {
        personalInformation: false,
        education: false,
        workExperience: false,
        application: false,
        search: { agent: false, staff: false },
        uploadDocument: false,
        communication: false,
        notes: false
      }
    }
  });

  // Fetch privileges and staff details
  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/staffs/${id}`);
      const response2 = await axiosInstance.get(`/privileges/${id}`);

      const privilegesData = response2.data.data.privileges || {};
      setStaffDetails(response.data.data || {});
      form.reset(privilegesData); // Load privileges into the form
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const {
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      privileges: {
        management: {
          course: false,
          term: false,
          institution: false,
          academicYear: false,
          courseRelation: false,
          emails: false,
          drafts: false,
          invoices: false,
          staffs: false,
          agent: false
        },
        student: {
          personalInformation: false,
          education: false,
          workExperience: false,
          application: false,
          search: {
            agent: false,
            staff: false
          },
          uploadDocument: false,
          communication: false,
          notes: false
        }
      }
    }
  });

  // Function to dynamically update nested privilege fields
  const handleToggle = async (fieldName: string, value: boolean) => {
    setValue(fieldName, value); // Update form state

    // Constructing dynamic payload
    const fieldParts = fieldName.split('.');
    let payload: Record<string, any> = {};

    if (fieldParts.length === 2) {
      // Example: "management.course"
      const [section, key] = fieldParts;
      payload = { privileges: { [section]: { [key]: value } } };
    } else if (fieldParts.length === 3) {
      // Example: "student.search.agent"
      const [section, subSection, key] = fieldParts;
      payload = {
        privileges: { [section]: { [subSection]: { [key]: value } } }
      };
    }

    try {
      const response = await axiosInstance.patch(`/privileges/${id}`, payload);

      // Handle success response
      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || 'Staff Access Updated successfully',
          className: 'bg-supperagent border-none text-white'
        });
        await fetchData();
      }
      // Handle failure response from API
      else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      console.error('Error updating privilege:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-8">
        {/* Staff Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              {staffDetails?.firstName} {staffDetails?.lastName}
            </p>
            <p>{staffDetails?.email}</p>
            <p>{staffDetails?.phone}</p>
          </CardContent>
        </Card>

        {/* Data Management Privileges */}
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-2 rounded-xl bg-white p-4 shadow"
        >
          <AccordionItem value="management">
            <AccordionTrigger className="my-2 rounded-lg px-4">
              Data Management Privileges
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4">
                  {Object.entries(form.getValues().management).map(
                    ([key, value]) => (
                      <FormField
                        key={key}
                        control={form.control}
                        name={`management.${key}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base capitalize">
                                {key}
                              </FormLabel>
                              <FormDescription>
                                Allow this staff member to manage {key}.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) =>
                                  handleToggle(field.name, checked)
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Student Privileges */}
          <AccordionItem value="student">
            <AccordionTrigger className="my-2 rounded-lg px-4">
              Student Privileges
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4">
                  {Object.entries(form.getValues().student).map(
                    ([key, value]) =>
                      typeof value === 'boolean' ? (
                        <FormField
                          key={key}
                          control={form.control}
                          name={`student.${key}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </FormLabel>
                                <FormDescription>
                                  Allow access to{' '}
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
                                  onCheckedChange={(checked) =>
                                    handleToggle(field.name, checked)
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div key={key} className="space-y-2">
                          <h3 className="font-semibold capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          {Object.entries(value).map(([subKey, _]) => (
                            <FormField
                              key={`${key}.${subKey}`}
                              control={form.control}
                              name={`student.${key}.${subKey}`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base capitalize">
                                      {subKey}
                                    </FormLabel>
                                    <FormDescription>
                                      Allow {subKey} for{' '}
                                      {key.replace(/([A-Z])/g, ' $1').trim()}.
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={(checked) =>
                                        handleToggle(field.name, checked)
                                      }
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
        </Accordion>
      </form>
    </Form>
  );
}
