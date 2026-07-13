import React from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';

interface NoteItem {
  date: string;
  type: string;
  note: string;
}

// 1. Define Validation Interface
interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

interface NoteTabProps {
  formData: {
    notes: NoteItem[];
  };
  onUpdate: (field: string, value: any) => void;
  onDateChange: () => void;
  onSelectChange: (field: string, value: string) => void;
  isFieldSaving: Record<string, boolean>;
  // 2. Add validateTab for consistency
  validateTab: (tabId: string) => ValidationResult;
}

const NoteTab: React.FC<NoteTabProps> = ({
  formData,
  onUpdate,
  onSelectChange,
  onDateChange,
  isFieldSaving,
  validateTab
}) => {
  const notes = formData.notes || [];

  // 3. Validation Logic
  const validationResult = validateTab('note');
  const missingFields = validationResult.missingFields;

  const isFieldMissing = (index: number, fieldName: string) => {
    return missingFields.includes(`${fieldName}[${index}]`);
  };

  const handleNoteChange = (
    index: number,
    field: keyof NoteItem,
    value: string
  ) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      [field]: value
    };
    onUpdate('notes', updatedNotes);
  };

  const addNote = () => {
    const updatedNotes = [
      ...notes,
      { date: '', type: '', note: '' } // Initialize with empty values
    ];
    onUpdate('notes', updatedNotes);
  };

  // 4. Remove Logic
  const removeNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    onUpdate('notes', updatedNotes);
  };

  return (
    <div className="space-y-4">
      {notes.map((note, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          {/* Header Row with Remove Button */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Note #{index + 1}
            </h3>
            <button
              onClick={() => removeNote(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <EditableField
              id={`note-text-${index}`}
              label="Note Details"
              value={note.note}
              type="textarea"
              onUpdate={(val) => handleNoteChange(index, 'note', val)}
              isSaving={isFieldSaving[`notes.${index}.note`]}
              // Pass validation status if note is required
              isMissing={isFieldMissing(index, 'note')} 
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={addNote}
          className="bg-watney text-white hover:bg-watney/90"
        >
          Add Note
        </Button>
      </div>
    </div>
  );
};

export default NoteTab;