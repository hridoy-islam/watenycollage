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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import moment from 'moment';

const FormSchema = z.object({
  

  studentType:z.string().min(1, { message: 'Please select a type' }),
});

type FormType = z.infer<typeof FormSchema>;


export function FormType({
  defaultValues,
  onSaveAndContinue,
  onSave
}) {




  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
     
      studentType: defaultValues?.studentType || '',
     
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        
      });
    }
  }, [defaultValues, form]);


  function onSubmit(data) {
    onSaveAndContinue(data);
  }



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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="international">International Student</SelectItem>
                        <SelectItem value="eu">EU Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
        

            
            
            </div>
          </CardContent>
        </div>

        <div className="flex justify-end px-5">
          
          <Button type="submit"  className='bg-watney text-white hover:bg-watney/90'>Next</Button>
        </div>
      </form>
    </Form>
  );
}
