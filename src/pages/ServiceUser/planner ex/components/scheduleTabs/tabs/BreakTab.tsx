import React from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';

interface Break {
  startDate: string; 
  startTime: string; 
  endTime: string; 
  type: string; 
}

// Define the validation result structure
interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface BreakTabProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  // 1. Add validateTab to props
  validateTab: (tabId: string) => ValidationResult;
}

const BreakTab: React.FC<BreakTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  validateTab // 2. Destructure here
}) => {
  const breaks: Break[] = formData.breaks || [];

  // 3. Get current validation errors for the 'break' tab
  // This returns arrays like ['startDate[0]', 'type[1]']
  const validationResult = validateTab('break');
  const missingFields = validationResult.missingFields;

  // 4. Helper to check if a specific field at a specific index is missing
  const isFieldMissing = (index: number, fieldName: string) => {
    return missingFields.includes(`${fieldName}[${index}]`);
  };

  // Define options
  const typeOptions = [
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Training', label: 'Training' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Other', label: 'Other' }
  ];

  const updateBreakField = <K extends keyof Break>(
    index: number,
    field: K,
    value: Break[K]
  ) => {
    const updated = [...breaks];
    updated[index][field] = value;
    onUpdate('breaks', updated);
  };

  const addNewBreak = () => {
    const updated = [
      ...breaks,
       {
        startDate: '',
        startTime: '',
        endTime: '',
        type: ''
      }
    ];
    onUpdate('breaks', updated);
  };

  const removeBreak = (index: number) => {
    const updated = [...breaks];
    updated.splice(index, 1);
    onUpdate('breaks', updated);
  };

  return (
    <div className="space-y-2">
      {breaks.map((breakItem, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Break #{index + 1}
            </h3>
            <button
              onClick={() => removeBreak(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <EditableField
              id={`startDate-${index}`}
              label="Start Date"
              value={breakItem.startDate}
              type="date"
              onUpdate={(val) => updateBreakField(index, 'startDate', val)}
              isSaving={isFieldSaving[`startDate-${index}`]}
              required
              // 5. Pass validation status
              isMissing={isFieldMissing(index, 'startDate')}
            />
            
            <EditableField
              id={`startTime-${index}`}
              label="Start Time"
              value={breakItem.startTime}
              type="time"
              onUpdate={(val) => updateBreakField(index, 'startTime', val)}
              isSaving={isFieldSaving[`startTime-${index}`]}
              required
              // 5. Pass validation status
              isMissing={isFieldMissing(index, 'startTime')}
            />

            <EditableField
              id={`endTime-${index}`}
              label="End Time"
              value={breakItem.endTime}
              type="time"
              onUpdate={(val) => updateBreakField(index, 'endTime', val)}
              isSaving={isFieldSaving[`endTime-${index}`]}
              required
              // 5. Pass validation status
              isMissing={isFieldMissing(index, 'endTime')}
            />

            <EditableField
              id={`type-${index}`}
              label="Type"
              value={breakItem.type}
              type="select"
              options={typeOptions}
              onUpdate={(val) => updateBreakField(index, 'type', val)}
              isSaving={isFieldSaving[`type-${index}`]}
              required
              // 5. Pass validation status
              isMissing={isFieldMissing(index, 'type')}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={addNewBreak}
          className=" rounded bg-watney text-white hover:bg-watney/90"
        >
          Add Break
        </Button>
      </div>
    </div>
  );
};

export default BreakTab;