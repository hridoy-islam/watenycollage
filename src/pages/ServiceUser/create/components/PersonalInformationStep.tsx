import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '@/components/ui/input';
import { ServiceUserFormData } from './validation';
import { FormField } from './FromField';
import { countries } from '@/types';

const typeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'organization', label: 'Organization' },
  { value: 'individual-with-medication', label: 'Individual With Medication' }
];

const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' }
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' }
];

const servicePriorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const PersonalInformationStep: React.FC = () => {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<ServiceUserFormData>();

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Type */}
        <FormField
          label="Service User Type"
          required
          error={errors.serviceUserType?.message}
        >
          <Controller
            name="serviceUserType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={typeOptions}
                placeholder="Select Type"
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  typeOptions.find((option) => option.value === field.value) ||
                  null
                }
                onChange={(selected) => field.onChange(selected?.value || '')}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderRadius: '0.5rem',
                    borderColor: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '2px 12px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  })
                }}
              />
            )}
          />
        </FormField>

        {/* Title */}
        <FormField label="Title" required error={errors.title?.message}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={titleOptions}
                placeholder="Select title"
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  titleOptions.find((option) => option.value === field.value) ||
                  null
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderRadius: '0.5rem',
                    borderColor: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '2px 12px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  })
                }}
                onChange={(selected) => field.onChange(selected?.value || '')}
              />
            )}
          />
        </FormField>

        <FormField
          label="First Name"
          required
          error={errors.firstName?.message}
        >
          <Input {...register('firstName')} placeholder="Enter first name" />
        </FormField>

        <FormField label="Middle Initial" error={errors.middleInitial?.message}>
          <Input {...register('middleInitial')} placeholder="M" />
        </FormField>

        <FormField label="Last Name" required error={errors.lastName?.message}>
          <Input {...register('lastName')} placeholder="Enter last name" />
        </FormField>

        <FormField label="Preferred Name" error={errors.preferredName?.message}>
          <Input
            {...register('preferredName')}
            placeholder="Enter preferred name"
          />
        </FormField>

        {/* Date of Birth */}
        <FormField
          label="Date of Birth"
          required
          error={errors.dateOfBirth?.message}
        >
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  const dateValue = date
                    ? date.toISOString().split('T')[0]
                    : '';
                  field.onChange(dateValue);
                }}
                placeholderText="Select date of birth"
                className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                wrapperClassName="w-full"
                maxDate={new Date()}
              />
            )}
          />
        </FormField>

        <FormField label="Address" required error={errors.address?.message}>
          <Input {...register('address')} placeholder="Enter full address" />
        </FormField>

        <FormField label="City / Town" required error={errors.city?.message}>
          <Input {...register('city')} placeholder="Enter city or town" />
        </FormField>

        {/* Country */}
        <FormField label="Country" required error={errors.country?.message}>
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={countryOptions}
                placeholder="Select Country"
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  countryOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(selected) => field.onChange(selected?.value || '')}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderRadius: '0.5rem',
                    borderColor: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '2px 12px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  })
                }}
              />
            )}
          />
        </FormField>

        <FormField label="Post Code" required error={errors.postCode?.message}>
          <Input
            {...register('postCode')}
            placeholder="Enter post code"
            className="uppercase"
          />
        </FormField>

        {/* Service Priority */}
        <FormField
          label="Service Priority"
          required
          error={errors.servicePriority?.message}
        >
          <Controller
            name="servicePriority"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={servicePriorityOptions}
                placeholder="Select service priority"
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  servicePriorityOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(selected) => field.onChange(selected?.value || '')}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderRadius: '0.5rem',
                    borderColor: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#cbd5e1'
                    }
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: '2px 12px'
                  }),
                  input: (base) => ({
                    ...base,
                    margin: '0px'
                  })
                }}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Start Date */}
        <FormField
          label="Start Date"
          required
          error={errors.startDate?.message}
        >
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date ?? undefined)}
                placeholderText="Select start date"
                className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                wrapperClassName="w-full"
              />
            )}
          />
        </FormField>

        {/* Last Duty Date */}
        <FormField label="Last Duty Date" error={errors.lastDutyDate?.message}>
          <Controller
            control={control}
            name="lastDutyDate"
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date ?? undefined)}
                placeholderText="Select last duty date"
                className="w-full rounded-xl h-12 border border-gray-300 px-3 py-2 text-sm"
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                wrapperClassName="w-full"
              />
            )}
          />
        </FormField>
      </div>
    </div>
  );
};
