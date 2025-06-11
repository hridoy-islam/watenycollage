import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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

import Select from 'react-select';

import moment from 'moment';

const FormSchema = z.object({
  studentType: z.string().min(1, { message: 'Please select a type' })
});

type FormType = z.infer<typeof FormSchema>;

export function FormType({ defaultValues, onSaveAndContinue, onSave }) {
  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      studentType: defaultValues?.studentType || ''
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  function onSubmit(data) {
    onSaveAndContinue(data);
  }

  const studentTypeOptions = [
    { value: 'international', label: 'International Student' },
    { value: 'eu', label: 'EU Student' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent className="space-y-6 ">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="studentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residency Status</FormLabel>
                    <FormControl>
                      <Select
                        options={studentTypeOptions}
                        value={
                          field.value
                            ? studentTypeOptions.find(
                                (option) => option.value === field.value
                              )
                            : null
                        }
                        onChange={(selected) => field.onChange(selected?.value)}
                        placeholder="Select Status"
                        isClearable
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </div>

        <div className="flex justify-end px-5">
          <Button
            type="submit"
            className="bg-watney text-white hover:bg-watney/90"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
