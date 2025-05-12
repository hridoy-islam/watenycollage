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

export function ComplianceStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}) {
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

  // function handleSave() {
  //   const data = form.getValues();
  //   onSave(data);
  // }

  function handleBack() {
    setCurrentStep(7);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent>
            <h2 className="mb-6 text-2xl font-semibold">Miscellienious</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateInUK"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>When did you first enter into UK</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="niNumber"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
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
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} {...field}>
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
                  <FormItem className="flex w-full flex-col">
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
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Do you have disability?</FormLabel>
                    <Select onValueChange={field.onChange} {...field}>
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
                    <FormItem className="flex w-full flex-col">
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
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Are you in receipt of any benefits</FormLabel>
                    <Select onValueChange={field.onChange} {...field}>
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
                name="studentFinance"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>
                      Have you applied for Student Finance before?
                    </FormLabel>
                    <Select onValueChange={field.onChange} {...field}>
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
              <FormField
                control={form.control}
                name="criminalConviction"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Criminal Conviction</FormLabel>
                    <Select onValueChange={field.onChange} {...field}>
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
                    <FormItem className="flex w-full flex-col">
                      <FormLabel>If yes, details</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button type="button" variant="outline" onClick={handleBack}  className='bg-watney text-white hover:bg-watney/90'>
            Back
          </Button>
          <Button type="submit" className='bg-watney text-white hover:bg-watney/90'>Next</Button>
        </div>
      </form>
    </Form>
  );
}
