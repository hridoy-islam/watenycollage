import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Select from 'react-select';

import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { countries } from '@/types';

const addressSchema = z
  .object({
    // Residential address
    residentialAddressLine1: z
      .string()
      .min(1, { message: 'Address line 1 is required' }),
    residentialAddressLine2: z.string().optional(),
    residentialCity: z.string().min(1, { message: 'City is required' }),
    residentialPostCode: z
      .string()
      .min(1, { message: 'Post code is required' }),
    residentialCountry: z.string().min(1, { message: 'Country is required' }),

    // Postal address
    sameAsResidential: z.boolean().default(false),
    postalAddressLine1: z
      .string()
      .min(1, { message: 'Address line 1 is required' })
      .optional()
      .or(z.literal('')),
    postalAddressLine2: z.string().optional(),
    postalCity: z
      .string()
      .min(1, { message: 'City is required' })
      .optional()
      .or(z.literal('')),
    postalPostCode: z
      .string()
      .min(1, { message: 'Post code is required' })
      .optional()
      .or(z.literal('')),
    postalCountry: z
      .string()
      .min(1, { message: 'Country is required' })
      .optional()
      .or(z.literal(''))
  })
  .refine(
    (data) => {
      // If sameAsResidential is true, we don't need to validate postal address fields
      if (data.sameAsResidential) return true;

      // Otherwise, validate that postal address fields are filled
      return (
        !!data.postalAddressLine1 &&
        !!data.postalCity &&
        !!data.postalPostCode &&
        !!data.postalCountry
      );
    },
    {
      message: 'Postal address is required',
      path: ['postalAddressLine1']
    }
  );

type AddressData = z.infer<typeof addressSchema>;

export function AddressStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}) {
  const form = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      residentialAddressLine1: defaultValues?.residentialAddressLine1 || '',
      residentialAddressLine2: defaultValues?.residentialAddressLine2 || '',
      residentialCity: defaultValues?.residentialCity || '',
      residentialPostCode: defaultValues?.residentialPostCode || '',
      residentialCountry: defaultValues?.residentialCountry || '',
      sameAsResidential: defaultValues?.sameAsResidential || false,
      postalAddressLine1: defaultValues?.postalAddressLine1 || '',
      postalAddressLine2: defaultValues?.postalAddressLine2 || '',
      postalCity: defaultValues?.postalCity || '',
      postalPostCode: defaultValues?.postalPostCode || '',
      postalCountry: defaultValues?.postalCountry || ''
    }
  });

  const sameAsResidential = form.watch('sameAsResidential');

  // Update postal address fields when sameAsResidential changes
  const handleSameAddressChange = (checked: boolean) => {
    form.setValue('sameAsResidential', checked);

    if (checked) {
      // Copy residential address to postal address
      form.setValue(
        'postalAddressLine1',
        form.getValues('residentialAddressLine1')
      );
      form.setValue(
        'postalAddressLine2',
        form.getValues('residentialAddressLine2')
      );
      form.setValue('postalCity', form.getValues('residentialCity'));
      form.setValue('postalPostCode', form.getValues('residentialPostCode'));
      form.setValue('postalCountry', form.getValues('residentialCountry'));
    }
  };

  function onSubmit(data: AddressData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(2);
  }

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <CardContent className="">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 ">
              {/* Residential Address Section */}
              <div className="mt-9 space-y-4">
                <h2 className="text-xl font-semibold">Residential Address</h2>

                <FormField
                  control={form.control}
                  name="residentialAddressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residentialAddressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="residentialCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residentialPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="residentialCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={
                            field.value
                              ? countryOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select Country"
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Postal Address Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Correspondence Address
                  </h2>
                </div>
                <FormField
                  control={form.control}
                  name="sameAsResidential"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={handleSameAddressChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        Same as residential address
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalAddressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={sameAsResidential}
                          className={sameAsResidential ? 'bg-gray-100' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalAddressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={sameAsResidential}
                          className={sameAsResidential ? 'bg-gray-100' : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={sameAsResidential}
                            className={sameAsResidential ? 'bg-gray-100' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={sameAsResidential}
                            className={sameAsResidential ? 'bg-gray-100' : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="postalCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Select
                          options={countryOptions}
                          value={
                            field.value
                              ? countryOptions.find(
                                  (option) => option.value === field.value
                                )
                              : null
                          }
                          onChange={(selected) =>
                            field.onChange(selected?.value)
                          }
                          placeholder="Select Country"
                          isDisabled={sameAsResidential}
                          classNames={{
                            control: () =>
                              sameAsResidential
                                ? 'bg-gray-100 cursor-not-allowed'
                                : ''
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </div>

        <div className=" flex justify-between px-6">
          <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button>
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
