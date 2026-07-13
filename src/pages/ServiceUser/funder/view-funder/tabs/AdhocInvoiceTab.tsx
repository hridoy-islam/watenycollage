import React, { useState } from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface AdhocInvoice {
  invoiceStartDate?: string;
  invoiceEndDate?: string;
  invoiceType?: string;
  invoiceValue?: number | string;
  invoiceSummary?: string;
  note?: string;
}

interface AdhocInvoiceTabProps {
  formData: {
    adhocInvoice: AdhocInvoice[];
  };
  onUpdate: (field: string, value: any, index?: number) => void;
  onSelectChange: (field: string, value: any, index: number) => void;
  onDateChange: (field: string, value: string, index: number) => void;
  isFieldSaving: Record<string, boolean>;
}

const invoiceTypeOptions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Custom', value: 'custom' },
];

const getMissingAdhocFields = (invoice: AdhocInvoice) => {
  const requiredFields: (keyof AdhocInvoice)[] = [
    'invoiceStartDate',
    'invoiceEndDate',
    'invoiceType',
    'invoiceValue',
  ];
  return requiredFields.filter(
    (field) =>
      invoice[field] === '' ||
      invoice[field] === undefined ||
      invoice[field] === null
  );
};

const AdhocInvoiceTab: React.FC<AdhocInvoiceTabProps> = ({
  formData,
  onUpdate,
  onSelectChange,
  onDateChange,
  isFieldSaving,
}) => {
  const invoices = formData.adhocInvoice || [];
  const [isAdding, setIsAdding] = useState(false);

  const isFieldMissing = (index: number, field: keyof AdhocInvoice) => {
    const invoice = invoices[index];
    const missing = getMissingAdhocFields(invoice);
    return missing.includes(field);
  };

  const handleAddMore = () => {
    const newInvoiceEntry: AdhocInvoice = {
      invoiceStartDate: '',
      invoiceEndDate: '',
      invoiceType: '',
      invoiceValue: '',
      invoiceSummary: '',
      note: '',
    };
    onUpdate('adhocInvoice', [...invoices, newInvoiceEntry]);
  };

  const handleRemove = (index: number) => {
    const updated = invoices.filter((_, i) => i !== index);
    onUpdate('adhocInvoice', updated);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">Adhoc Invoice Details</h1>

      {invoices.map((invoice, index) => (
        <div
          key={`adhoc-${index}-${invoice.invoiceStartDate || 'new'}`}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice #{index + 1}
            </h3>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EditableField
              id={`invoiceStartDate-${index}`}
              label="Invoice Start Date"
              type="date"
              value={invoice.invoiceStartDate || ''}
              onUpdate={(value) =>
                onDateChange('invoiceStartDate', value, index)
              }
              isSaving={isFieldSaving[`invoiceStartDate-${index}`]}
              required
              isMissing={isFieldMissing(index, 'invoiceStartDate')}
            />

            <EditableField
              id={`invoiceEndDate-${index}`}
              label="Invoice End Date"
              type="date"
              value={invoice.invoiceEndDate || ''}
              onUpdate={(value) =>
                onDateChange('invoiceEndDate', value, index)
              }
              isSaving={isFieldSaving[`invoiceEndDate-${index}`]}
              required
              isMissing={isFieldMissing(index, 'invoiceEndDate')}
            />

            <EditableField
              id={`invoiceType-${index}`}
              label="Invoice Type"
              type="select"
              options={invoiceTypeOptions}
              value={invoice.invoiceType || ''}
              onUpdate={(value) =>
                onSelectChange('invoiceType', value, index)
              }
              isSaving={isFieldSaving[`invoiceType-${index}`]}
              required
              isMissing={isFieldMissing(index, 'invoiceType')}
            />

            <EditableField
              id={`invoiceValue-${index}`}
              label="Invoice Value"
              type="number"
              value={invoice.invoiceValue || ''}
              onUpdate={(value) => onUpdate('invoiceValue', value, index)}
              isSaving={isFieldSaving[`invoiceValue-${index}`]}
              required
              isMissing={isFieldMissing(index, 'invoiceValue')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <EditableField
              id={`invoiceSummary-${index}`}
              label="Invoice Summary"
              type="textarea"
              value={invoice.invoiceSummary || ''}
              onUpdate={(value) => onUpdate('invoiceSummary', value, index)}
              isSaving={isFieldSaving[`invoiceSummary-${index}`]}
            />

            <EditableField
              id={`note-${index}`}
              label="Note"
              type="textarea"
              value={invoice.note || ''}
              onUpdate={(value) => onUpdate('note', value, index)}
              isSaving={isFieldSaving[`note-${index}`]}
            />
          </div>
        </div>
      ))}

      {/* Add button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleAddMore}
          disabled={isAdding}
          className="rounded bg-watney px-4 py-2 text-white hover:bg-watney/90 disabled:opacity-50"
        >
          Add Invoice
        </Button>
      </div>
    </div>
  );
};

export default AdhocInvoiceTab;
