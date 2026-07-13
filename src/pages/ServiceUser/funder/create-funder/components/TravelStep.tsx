import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { ServiceFunderFormData } from './validation';
import { FormField } from './FromField';

const travelTypeOptions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Actual', value: 'actual' },
];

export const TravelStep: React.FC = () => {
  const { control, watch, setValue, formState: { errors } } = useFormContext<ServiceFunderFormData>();

  const watchedTravelType = watch('travelType');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Travel Type"
          required
          error={errors.travelType?.message}
        >
          <Controller
            name="travelType"
            control={control}
            render={({ field }) => (
              <Select
                value={travelTypeOptions.find(option => option.value === watchedTravelType) || null}
                onChange={(selected) => setValue('travelType', selected?.value || '')}
                options={travelTypeOptions}
                placeholder="Select travel type"
                isClearable
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
    </div>
  );
};
