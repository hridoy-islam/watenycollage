import React from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface CriticalInfoItem {
  date: string;
  type: { label: string; value: string } | null;
  details: string;
}

interface CriticalInfoTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: string, formData: Record<string, any>) => string[];
}

const typeOptions = [
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' }
];

const CriticalInfoTab: React.FC<CriticalInfoTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  getMissingFields
}) => {
  const criticalInfo: CriticalInfoItem[] = formData.criticalInfo || [];

  const updateCriticalField = <K extends keyof CriticalInfoItem>(
    index: number,
    field: K,
    value: CriticalInfoItem[K]
  ) => {
    const updated = [...criticalInfo];
    updated[index][field] = value;
    onUpdate('criticalInfo', updated);
  };

  const addNewCriticalInfo = () => {
    const updated = [...criticalInfo, { date: '', type: null, details: '' }];
    onUpdate('criticalInfo', updated);
  };

  // ✅ Updated remove function with check
  const removeCriticalInfo = (index: number) => {
    if (criticalInfo.length <= 1) return; // Prevent deletion if only 1 item exists

    const updated = criticalInfo.filter((_, i) => i !== index);
    onUpdate('criticalInfo', updated);
  };

  const missingFields = getMissingFields('criticalInfo', formData);

  const isFieldMissing = (index: number, field: keyof CriticalInfoItem) => {
    return missingFields.includes(`${field}[${index}]`);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">
        Critical Information
      </h1>

      {criticalInfo.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Critical Information #{index + 1}
            </h3>

            {/* ✅ Button is now disabled if length is 1 */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeCriticalInfo(index)}
              disabled={criticalInfo.length <= 1}
              title={criticalInfo.length <= 1 ? "At least one entry is required" : "Remove entry"}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <EditableField
              id={`date-${index}`}
              label="Date"
              value={item.date}
              type="date"
              onUpdate={(val) => updateCriticalField(index, 'date', val)}
              isSaving={isFieldSaving[`date[${index}]`]}
              isMissing={isFieldMissing(index, 'date')}
              required
            />

            <EditableField
              id={`type-${index}`}
              label="Type"
              value={item.type?.value || ''}
              type="select"
              options={typeOptions}
              onUpdate={(val) =>
                updateCriticalField(
                  index,
                  'type',
                  typeOptions.find((option) => option.value === val) || null
                )
              }
              isSaving={isFieldSaving[`type[${index}]`]}
              isMissing={isFieldMissing(index, 'type')}
              required
            />

            <EditableField
              id={`details-${index}`}
              label="Details"
              value={item.details}
              type="textarea"
              onUpdate={(val) => updateCriticalField(index, 'details', val)}
              isSaving={isFieldSaving[`details[${index}]`]}
              isMissing={isFieldMissing(index, 'details')}
              required
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addNewCriticalInfo}
          className="rounded bg-watney px-4 py-2 text-white hover:bg-watney/90"
        >
          Add More
        </Button>
      </div>
    </div>
  );
};

export default CriticalInfoTab;