import React from 'react';
import { useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { ServiceUserFormData } from './validation';
import { FormField } from './FromField';
import { Textarea } from '@/components/ui/textarea';

export const EmploymentServiceStep: React.FC = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ServiceUserFormData>();

  const timesheetSignature = watch('timesheetSignature');

  const booleanOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Service Location Ex ID"
          
          error={errors.serviceLocationExId?.message}
        >
          <Input
            {...register('serviceLocationExId')}
            type="text"
          />
        </FormField>

        <FormField
          label="Timesheet Signature Required"
          error={errors.timesheetSignature?.message}
          required
        >
          <Select
            value={booleanOptions.find(opt => opt.value === timesheetSignature)}
            onChange={(option) =>
              setValue('timesheetSignature', option?.value ?? false)
            }
            options={booleanOptions}
            placeholder="Select..."
            className="react-select-container"
            classNamePrefix="react-select"
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
        </FormField>
      </div>

      {timesheetSignature && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Timesheet Signature Not Required Note"
            required
            error={errors.timesheetSignatureNote?.message}
          >
            <Textarea
              {...register('timesheetSignatureNote')}
              placeholder="Enter note if signature is not required"
            />
          </FormField>
        </div>
      )}
    </div>
  );
};
