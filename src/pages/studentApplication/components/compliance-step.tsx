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
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const complianceSchema = z.object({
  startDateInUK: z.date().optional(),
  niNumber: z.string().optional(),
  status: z.string().min(1, { message: 'Please select status' }),
  ltrCode: z.string().optional(),
  disability: z.string().min(1, { message: 'Please select an option' }),
  disabilityDetails: z.string().optional(),
  benefits: z.string().min(1, { message: 'Please select an option' }),
  criminalConviction: z.string().min(1, { message: 'Please select an option' }),
  convictionDetails: z.string().optional(),
  studentFinance: z.string().min(1, { message: 'Please select an option' })
});

type ComplianceData = z.infer<typeof complianceSchema>;

interface ComplianceStepProps {
  defaultValues?: Partial<ComplianceData>;
  onSaveAndContinue: (data: ComplianceData) => void;
  onSave: (data: ComplianceData) => void;
}

export function ComplianceStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: ComplianceStepProps) {
  const form = useForm<ComplianceData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      startDateInUK: defaultValues?.startDateInUK,
      niNumber: defaultValues?.niNumber || '',
      status: defaultValues?.status || '',
      ltrCode: defaultValues?.ltrCode || '',
      disability: defaultValues?.disability || '',
      disabilityDetails: defaultValues?.disabilityDetails || '',
      benefits: defaultValues?.benefits || '',
      criminalConviction: defaultValues?.criminalConviction || '',
      convictionDetails: defaultValues?.convictionDetails || '',
      studentFinance: defaultValues?.studentFinance || ''
    }
  });

  const watchDisability = form.watch('disability');
  const watchCriminalConviction = form.watch('criminalConviction');

  function onSubmit(data: ComplianceData) {
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
            <h2 className="mb-6 text-2xl font-semibold">Compliance</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateInUK"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date of stay in the UK</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? format(field.value, 'MM/dd/yyyy')
                              : 'mm/dd/yyyy'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="niNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NI Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="uk-citizen">UK Citizen</SelectItem>
                        <SelectItem value="eu-settled">
                          EU Settled Status
                        </SelectItem>
                        <SelectItem value="eu-pre-settled">
                          EU Pre-Settled Status
                        </SelectItem>
                        <SelectItem value="tier4">
                          Tier 4 Student Visa
                        </SelectItem>
                        <SelectItem value="tier2">Tier 2 Work Visa</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ltrCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Please give LTR Code (In case of EU Settled status)
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have disability?</FormLabel>
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
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDisability === 'yes' && (
                <FormField
                  control={form.control}
                  name="disabilityDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you in receipt of any benefits</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Title" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="criminalConviction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criminal Conviction</FormLabel>
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
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchCriminalConviction === 'yes' && (
                <FormField
                  control={form.control}
                  name="convictionDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>If yes Details</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="studentFinance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Have you applied for Student Finance before?
                    </FormLabel>
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
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
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
