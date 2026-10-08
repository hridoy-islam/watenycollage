import React, { useState } from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface TravelDetail {
  fromDate: string;
  distance: string;
  type: string;
  reason: string;
  linkedInvoiceRateSheet: string;
}

interface TravelRateDetailTabProps {
  formData: {
    travelDetails: TravelDetail[];
  };
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
}

const travelTypeOptions = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Actual', value: 'actual' },
];

const linkedInvoiceRateSheetOptions = [
  { label: 'Standard Rate Sheet', value: 'standard' },
  { label: 'Custom Rate Sheet A', value: 'customA' },
  { label: 'Custom Rate Sheet B', value: 'customB' },
];

// Required fields check
const getMissingTravelFields = (travelDetail: TravelDetail) => {
  const requiredFields = ['fromDate', 'type', 'linkedInvoiceRateSheet'];
  return requiredFields.filter(
    (field) =>
      travelDetail[field as keyof TravelDetail] === '' ||
      travelDetail[field as keyof TravelDetail] === undefined
  );
};

const TravelRateDetailTab: React.FC<TravelRateDetailTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
}) => {
  const travelDetails = formData.travelDetails || [];
  const [isAdding, setIsAdding] = useState(false);

  const handleFieldChange = (
    index: number,
    field: keyof TravelDetail,
    value: any
  ) => {
    const updated = [...travelDetails];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('travelDetails', updated);
  };

  const addNewTravelDetail = () => {
    const updated = [
      ...travelDetails,
      {
        fromDate: '',
        distance: '',
        type: '',
        reason: '',
        linkedInvoiceRateSheet: '',
      },
    ];
    onUpdate('travelDetails', updated);
  };

  const removeTravelDetail = (index: number) => {
    const updated = travelDetails.filter((_, i) => i !== index);
    onUpdate('travelDetails', updated);
  };

  const isFieldMissing = (index: number, field: keyof TravelDetail) => {
    const travelDetail = travelDetails[index];
    const missing = getMissingTravelFields(travelDetail);
    return missing.includes(field);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">Travel Details</h1>

      {travelDetails.map((entry, index) => (
        <div
          key={`travel-${index}-${entry.fromDate || 'new'}`}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Travel Detail #{index + 1}
            </h3>

            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={() => removeTravelDetail(index)}
              className="hover:bg-red-500 text-red-500 hover:text-white"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <EditableField
              id={`fromDate-${index}`}
              label="From Date"
              type="date"
              value={entry.fromDate}
              onUpdate={(value) => handleFieldChange(index, 'fromDate', value)}
              isSaving={isFieldSaving[`travelDetails.${index}.fromDate`]}
              required
              isMissing={isFieldMissing(index, 'fromDate')}
            />

            <EditableField
              id={`distance-${index}`}
              label="Distance"
              type="text"
              value={entry.distance}
              onUpdate={(value) => handleFieldChange(index, 'distance', value)}
              isSaving={isFieldSaving[`travelDetails.${index}.distance`]}
            />

            <EditableField
              id={`type-${index}`}
              label="Travel Type"
              type="select"
              options={travelTypeOptions}
              value={entry.type}
              onUpdate={(value) => handleFieldChange(index, 'type', value)}
              isSaving={isFieldSaving[`travelDetails.${index}.type`]}
              required
              isMissing={isFieldMissing(index, 'type')}
            />

            <EditableField
              id={`reason-${index}`}
              label="Reason"
              type="textarea"
              value={entry.reason}
              onUpdate={(value) => handleFieldChange(index, 'reason', value)}
              isSaving={isFieldSaving[`travelDetails.${index}.reason`]}
            />

            <EditableField
              id={`linkedInvoiceRateSheet-${index}`}
              label="Linked Invoice Rate Sheet"
              type="select"
              options={linkedInvoiceRateSheetOptions}
              value={entry.linkedInvoiceRateSheet}
              onUpdate={(value) =>
                handleFieldChange(index, 'linkedInvoiceRateSheet', value)
              }
              isSaving={
                isFieldSaving[`travelDetails.${index}.linkedInvoiceRateSheet`]
              }
              required
              isMissing={isFieldMissing(index, 'linkedInvoiceRateSheet')}
            />
          </div>
        </div>
      ))}

      {/* Add button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addNewTravelDetail}
          disabled={isAdding}
          className="rounded bg-theme px-4 py-2 text-white hover:bg-theme/90 disabled:opacity-50"
        >
          Add Travel Detail
        </Button>
      </div>
    </div>
  );
};

export default TravelRateDetailTab;
