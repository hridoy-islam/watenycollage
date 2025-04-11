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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const employmentSchema = z.object({
  employmentStatus: z
    .string()
    .min(1, { message: 'Please select employment status' }),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  workAddress: z.string().optional(),
  workExperience: z.string().optional()
});

type EmploymentData = z.infer<typeof employmentSchema>;

interface EmploymentStepProps {
  defaultValues?: Partial<EmploymentData>;
  onSaveAndContinue: (data: EmploymentData) => void;
  onSave: (data: EmploymentData) => void;
}

export function EmploymentStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: EmploymentStepProps) {
  const form = useForm<EmploymentData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employmentStatus: defaultValues?.employmentStatus || '',
      employer: defaultValues?.employer || '',
      jobTitle: defaultValues?.jobTitle || '',
      workAddress: defaultValues?.workAddress || '',
      workExperience: defaultValues?.workExperience || ''
    }
  });

  const watchEmploymentStatus = form.watch('employmentStatus');
  const isEmployed =
    watchEmploymentStatus === 'full-time' ||
    watchEmploymentStatus === 'part-time' ||
    watchEmploymentStatus === 'self-employed';

  function onSubmit(data: EmploymentData) {
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
            <h2 className="mb-6 text-2xl font-semibold">Employment</h2>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Employment Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">
                          Full-time employed
                        </SelectItem>
                        <SelectItem value="part-time">
                          Part-time employed
                        </SelectItem>
                        <SelectItem value="self-employed">
                          Self-employed
                        </SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEmployed && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employer / Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workAddress"
                    render={({ field }) => (
                      <FormItem className="col-span-full">
                        <FormLabel>Work Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="workExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Brief description of your work experience (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
