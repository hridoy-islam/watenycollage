import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ServiceFunderFormData } from './validation';
import { FormField } from './FromField';
import { countries } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';
const typeOptions = [
  { value: 'private', label: 'Private Client' },
  { value: 'otherOrganization', label: 'Other Organization' },
  { value: 'socialServices', label: 'Social Services' }
];


const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' }
];


const titleOptions = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Miss', label: 'Miss' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Dr', label: 'Dr' }
];

const rateSheetOptions = [
  { value: 'basic', label: 'Basic Plan' },
  { value: 'premium', label: 'Premium Plan' },
  { value: 'enterprise', label: 'Enterprise Plan' }
];

const branchOptions = [
  { value: 'everycare-romford', label: 'Everycare Romford' },
  { value: 'staff-hours', label: 'Staff Hours' }
];

// Default area options fallback
const defaultAreaOptions = [{ value: '', label: 'Select Branch First' }];

// Area options by branch
const branchToAreas: Record<string, { value: string; label: string }[]> = {
  'everycare-romford': [
    { value: 'romford-north', label: 'Romford North' },
    { value: 'romford-south', label: 'Romford South' }
  ],
  'staff-hours': [
    { value: 'day-shift', label: 'Day Shift' },
    { value: 'night-shift', label: 'Night Shift' }
  ]
};

export const PersonalInformationStep: React.FC = () => {
  const [serviceUserOptions, setServiceUserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { id } = useParams();
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext<ServiceFunderFormData>();

  const watchedBranch = watch('branch');
  const watchedArea = watch('area');
  const watchedCountry = watch('country');
  const watchedStartDate = watch('startDate');
  const watchedType = watch('type');
  const watchedTitle = watch('title');
  const watchedStatus = watch('status');
  const watchedRateSheet = watch('rateSheet');
  const watchedServiceUser = watch('serviceUser');

  useEffect(() => {
    const fetchServiceUsers = async () => {
      try {
        const res = await axiosInstance.get(
          `/users?role=serviceUser&limit=all&companyId=${id}`
        );
        const users = res.data?.data?.result || [];
        const options = users.map((user: any) => ({
          value: user._id,
          label:
            `${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));
        setServiceUserOptions(options);
      } catch (error) {
        console.error('Failed to fetch service users:', error);
      }
    };

    fetchServiceUsers();
  }, []);

  const countryOptions = countries.map((country) => ({
    value: country,
    label: country
  }));

  // Compute area options dynamically
  const areaOptions =
    watchedBranch && branchToAreas[watchedBranch]
      ? branchToAreas[watchedBranch]
      : defaultAreaOptions;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField label="Type" required error={errors.type?.message}>
          <Select
            value={
              typeOptions.find((option) => option.value === watchedType) || null
            }
            onChange={(selected) => setValue('type', selected?.value || '')}
            options={typeOptions}
            placeholder="Select Type"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>


         <FormField label="Service User" error={errors.serviceUser?.message}>
          <Select
            value={
              serviceUserOptions.find(
                (option) => option.value === watchedServiceUser
              ) || null
            }
            onChange={(selected) =>
              setValue('serviceUser', selected?.value || '')
            }
            options={serviceUserOptions}
            placeholder="Select Service User"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>

        <FormField label="Title" required error={errors.title?.message}>
          <Select
            value={
              titleOptions.find((option) => option.value === watchedTitle) ||
              null
            }
            onChange={(selected) => setValue('title', selected?.value || '')}
            options={titleOptions}
            placeholder="Select title"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
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
          <Input {...register('middleInitial')} placeholder="M"  />
        </FormField>

        <FormField label="Last Name" required error={errors.lastName?.message}>
          <Input {...register('lastName')} placeholder="Enter last name" />
        </FormField>

        <FormField label="Address" required error={errors.address?.message}>
          <Input
            {...register('address')}
            placeholder="Enter full address"
            className="flex w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
                       focus-visible:outline-none focus-visible:ring-2 
                       focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </FormField>

        <FormField label="City / Town" required error={errors.city?.message}>
          <Input {...register('city')} placeholder="Enter city or town" />
        </FormField>

        <FormField label="Country" required error={errors.country?.message}>
          <Select
            value={
              countryOptions.find(
                (option) => option.value === watchedCountry
              ) || null
            }
            onChange={(option) => setValue('country', option?.value || '')}
            options={countryOptions}
            placeholder="Select Country"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>

        <FormField label="Post Code" required error={errors.postCode?.message}>
          <Input
            {...register('postCode')}
            placeholder="Enter post code"
            className="uppercase"
          />
        </FormField>

        <FormField
          label="Description"
          required
          error={errors.description?.message}
        >
          <Textarea
            {...register('description')}
            placeholder="Enter description"
            className="h-24 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          label="Start Date"
          required
          error={errors.startDate?.message}
        >
          <DatePicker
            selected={watchedStartDate ? new Date(watchedStartDate) : null}
            onChange={(date) =>
              setValue('startDate', date ? date.toISOString() : '')
            }
            dateFormat="dd-MM-yyyy"
            placeholderText="Select start date"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
                       focus-visible:outline-none focus-visible:ring-2 
                       focus-visible:ring-ring focus-visible:ring-offset-2"
            wrapperClassName="w-full"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </FormField>

        <FormField label="Status" required error={errors.status?.message}>
          <Select
            value={
              statusOptions.find((option) => option.value === watchedStatus) ||
              null
            }
            onChange={(selected) => setValue('status', selected?.value || '')}
            options={statusOptions}
            placeholder="Select status"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>

        <FormField label="Rate Sheet" error={errors.rateSheet?.message}>
          <Select
            value={
              rateSheetOptions.find(
                (option) => option.value === watchedRateSheet
              ) || null
            }
            onChange={(selected) =>
              setValue('rateSheet', selected?.value || '')
            }
            options={rateSheetOptions}
            placeholder="Select rateSheet"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>

        <FormField label="Branch" required error={errors.branch?.message}>
          <Select
            value={
              branchOptions.find((option) => option.value === watchedBranch) ||
              null
            }
            onChange={(selected) => setValue('branch', selected?.value || '')}
            options={branchOptions}
            placeholder="Select branch"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>

        <FormField label="Area" required error={errors.area?.message}>
          <Select
            value={
              areaOptions.find((option) => option.value === watchedArea) || null
            }
            onChange={(selected) => setValue('area', selected?.value || '')}
            options={areaOptions}
            placeholder="Select area"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
        </FormField>
      </div>
   
    </div>
  );
};
