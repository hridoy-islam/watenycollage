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

const addressSchema = z.object({
  // Residential address
  residentialAddressLine1: z
    .string()
    .min(1, { message: 'Address line 1 is required' }),
  residentialAddressLine2: z.string().optional(),
  residentialCity: z.string().min(1, { message: 'City is required' }),
  residentialPostCode: z.string().min(1, { message: 'Post code is required' }),
  residentialCountry: z.string().min(1, { message: 'Country is required' }),

  // Postal address
  sameAsResidential: z.boolean().default(false),
  postalAddressLine1: z
    .string()
    .min(1, { message: 'Address line 1 is required' }),
  postalAddressLine2: z.string().optional(),
  postalCity: z.string().min(1, { message: 'City is required' }),
  postalPostCode: z.string().min(1, { message: 'Post code is required' }),
  postalCountry: z.string().min(1, { message: 'Country is required' })
});

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
    setCurrentStep(1);
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
              <div className="mt-10 space-y-4">
                <h2 className="text-xl font-semibold">Residential Address</h2>

                <FormField
                  control={form.control}
                  name="residentialAddressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address Line 1 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the primary address (e.g., flat number, street name)"
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: 123 Baker Street
                      </p>

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
                        <Input
                          {...field}
                          placeholder="Additional address information (e.g., apartment, building name)"
                          className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: 23 Walton Street
                      </p>
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
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your city"
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
                          Example: London
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residentialPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Post Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the Postcode or ZIP Code"
                            className="!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500"
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
                          Example: W1U 6RS
                        </p>
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
                      <FormLabel>
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
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
                          placeholder="Select your country of residence from the dropdown"
                          isClearable
                          styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '0.75rem',
                              color: '#9CA3AF'
                            })
                          }}
                        />
                      </FormControl>

                      <p className="mt-1 text-xs text-gray-400">
                        Example: England
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Postal Address Section */}
              <div className="space-y-4">
                <div className="mt-1 flex flex-col items-start justify-between">
                  <h2 className="text-xl font-semibold">
                    Correspondence Address
                  </h2>
                </div>
                <FormField
                  control={form.control}
                  name="sameAsResidential"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormLabel></FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={handleSameAddressChange}
                          className="h-6 w-6"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        Check this box if your mailing address is the same as
                        the residential address.
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalAddressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address Line 1 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={sameAsResidential}
                          className={
                            sameAsResidential
                              ? 'bg-gray-100'
                              : '!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500'
                          }
                          placeholder="Enter the address (e.g., flat number, street name)"
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: 123 Baker Street
                      </p>
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
                          className={
                            sameAsResidential
                              ? 'bg-gray-100'
                              : '!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500'
                          }
                          placeholder="Enter the address (e.g., flat number, street name)"
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: 13 Walton Street
                      </p>
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
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={sameAsResidential}
                            className={
                              sameAsResidential
                                ? 'bg-gray-100'
                                : '!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500'
                            }
                            placeholder="Enter the address (e.g., flat number, street name)"
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
                          Example: London
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalPostCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Post Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={sameAsResidential}
                            className={
                              sameAsResidential
                                ? 'bg-gray-100'
                                : '!placeholder:text-gray-500  placeholder:text-xs placeholder:text-gray-500'
                            }
                            placeholder="Enter the Postcode or ZIP Code"
                          />
                        </FormControl>
                        <p className="mt-1 text-xs text-gray-400">
                          Example: M13 9PL
                        </p>
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
                      <FormLabel>
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
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
                          isDisabled={sameAsResidential}
                          classNames={{
                            control: () =>
                              sameAsResidential
                                ? 'bg-gray-100 cursor-not-allowed'
                                : ''
                          }}
                          styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '0.75rem',
                              color: '#9CA3AF'
                            })
                          }}
                          placeholder="Select the country where you were born."
                        />
                      </FormControl>
                      <p className="mt-1 text-xs text-gray-400">
                        Example: Canada
                      </p>
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
