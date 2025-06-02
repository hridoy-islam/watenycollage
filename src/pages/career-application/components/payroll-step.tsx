'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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

const payrollSchema = z.object({
  payrollNumber: z.string().min(1, { message: 'Payroll number is required' }),
  paymentMethod: z.enum(['bank-transfer', 'cheque', 'cash'], {
    required_error: 'Payment method is required'
  })
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

interface PayrollStepProps {
  value?: {
    payrollNumber: string;
    paymentMethod: 'bank-transfer' | 'cheque' | 'cash';
  };
  onNext: (data: {
    payrollNumber: string;
    paymentMethod: 'bank-transfer' | 'cheque' | 'cash';
  }) => void;
  onBack: () => void;
}

export function PayrollStep({ value, onNext, onBack }: PayrollStepProps) {
  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      payrollNumber: value?.payrollNumber || '',
      paymentMethod: value?.paymentMethod || 'bank-transfer'
    }
  });

  function onSubmit(data: PayrollFormValues) {
    onNext(data);
  }

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Payroll Information</CardTitle>
        <CardDescription>
          Please provide your payroll information for payment processing.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payrollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payroll Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your payroll number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank-transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
                Back
              </Button>
              <Button type="submit" className="bg-watney text-white hover:bg-watney/90">Next</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
