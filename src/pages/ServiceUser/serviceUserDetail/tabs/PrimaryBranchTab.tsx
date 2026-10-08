import React from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface PrimaryBranchItem {
  fromDate: string;
  branch: { label: string; value: string } | null;
  area: { label: string; value: string } | null;
  note: string;
}

interface PrimaryBranchProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: string, formData: Record<string, any>) => string[];
}

// Dummy select options
const branchOptions = [
  { value: 'branch-1', label: 'Branch 1' },
  { value: 'branch-2', label: 'Branch 2' }
];

const areaOptions = [
  { value: 'area-1', label: 'Area 1' },
  { value: 'area-2', label: 'Area 2' }
];

const PrimaryBranchTab: React.FC<PrimaryBranchProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  getMissingFields
}) => {
  const primaryBranch: PrimaryBranchItem[] = formData.primaryBranch || [];

  const updateField = <K extends keyof PrimaryBranchItem>(
    index: number,
    field: K,
    value: PrimaryBranchItem[K]
  ) => {
    const updated = [...primaryBranch];
    updated[index][field] = value;
    onUpdate('primaryBranch', updated);
  };

  const addNewBranch = () => {
    const updated = [
      ...primaryBranch,
      { fromDate: '', branch: null, area: null, note: '' }
    ];
    onUpdate('primaryBranch', updated);
  };

  // ✅ Updated remove function with check
  const removeBranch = (index: number) => {
    if (primaryBranch.length <= 1) return; // Prevent deletion if only 1 item exists

    const updated = primaryBranch.filter((_, i) => i !== index);
    onUpdate('primaryBranch', updated);
  };

  const missingFields = getMissingFields('primaryBranch', formData);

  const isFieldMissing = (index: number, field: keyof PrimaryBranchItem) => {
    return missingFields.includes(`${field}[${index}]`);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">Primary Branch</h1>

      {primaryBranch.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* ✅ Header with remove button */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Primary Branch #{index + 1}
            </h3>

            {/* ✅ Button is now disabled if length is 1 */}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeBranch(index)}
              disabled={primaryBranch.length <= 1}
              title={primaryBranch.length <= 1 ? "At least one branch is required" : "Remove branch"}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <EditableField
              id={`fromDate-${index}`}
              label="From Date"
              value={item.fromDate}
              type="date"
              onUpdate={(val) => updateField(index, 'fromDate', val)}
              isSaving={isFieldSaving[`fromDate-${index}`]}
              isMissing={isFieldMissing(index, 'fromDate')}
              required
            />

            <EditableField
              id={`branch-${index}`}
              label="Branch"
              value={item.branch?.value || ''}
              type="select"
              options={branchOptions}
              onUpdate={(val) =>
                updateField(
                  index,
                  'branch',
                  branchOptions.find((option) => option.value === val) || null
                )
              }
              isSaving={isFieldSaving[`branch-${index}`]}
              isMissing={isFieldMissing(index, 'branch')}
              required
            />

            <EditableField
              id={`area-${index}`}
              label="Area"
              value={item.area?.value || ''}
              type="select"
              options={areaOptions}
              onUpdate={(val) =>
                updateField(
                  index,
                  'area',
                  areaOptions.find((option) => option.value === val) || null
                )
              }
              isSaving={isFieldSaving[`area-${index}`]}
              isMissing={isFieldMissing(index, 'area')}
              required
            />

            <EditableField
              id={`note-${index}`}
              label="Note"
              value={item.note}
              type="textarea"
              onUpdate={(val) => updateField(index, 'note', val)}
              isSaving={isFieldSaving[`note-${index}`]}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addNewBranch}
          className="rounded bg-watney px-4 py-2 text-white hover:bg-watney/90"
        >
          Add More
        </Button>
      </div>
    </div>
  );
};

export default PrimaryBranchTab;