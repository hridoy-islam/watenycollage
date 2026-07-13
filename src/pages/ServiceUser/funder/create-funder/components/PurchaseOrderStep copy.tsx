import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Select from 'react-select';
import { ServiceFunderFormData } from './validation';
import { FormField } from './FromField';

const purchaseOrderOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const PurchaseOrderStep: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<ServiceFunderFormData>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Requires Purchase Order?"
          required
          error={errors.purchaseOrder?.message}
        >
          <Controller
            name="purchaseOrder"
            control={control}
            render={({ field }) => (
              <Select
                options={purchaseOrderOptions}
                placeholder="Select Yes or No"
                isClearable
                value={purchaseOrderOptions.find(option => option.value === field.value)}
                onChange={(selected) => field.onChange(selected ? selected.value : null)}
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
