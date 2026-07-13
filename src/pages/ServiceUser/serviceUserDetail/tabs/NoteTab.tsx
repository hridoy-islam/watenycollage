import React, { useState } from 'react';
import { EditableField } from '../components/EditableField';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface NoteItem {
  date: string;
  type: string;
  note: string;
}

interface NoteTabProps {
  formData: {
    notes: NoteItem[];
  };
  onUpdate: (field: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
  getMissingFields: (tab: string, formData: Record<string, any>) => string[];
}

const typeOptions = [
  { value: 'general', label: 'General' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' }
];

const NoteTab: React.FC<NoteTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving,
  getMissingFields
}) => {
  const notes = formData.notes || [];
  const [isAdding, setIsAdding] = useState(false);

  const updateField = <K extends keyof NoteItem>(
    index: number,
    field: K,
    value: NoteItem[K]
  ) => {
    const updated = [...notes];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate('notes', updated);
  };

  const addNewNote = () => {
    const updated = [
      ...notes,
      {
        date: '',
        type: '',
        note: ''
      }
    ];
    onUpdate('notes', updated);
  };

  const removeNote = (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    onUpdate('notes', updated);
  };

  const missingFields = getMissingFields('notes', formData);

  const isFieldMissing = (index: number, field: keyof NoteItem) => {
    return missingFields.includes(`${field}[${index}]`);
  };

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-gray-900">Notes</h1>

      {notes.map((note, index) => (
        <div
          key={`note-${index}-${note.date || 'new'}`} // Better key to prevent re-rendering issues
          className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Note #{index + 1}
            </h3>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeNote(index)}
            >
              <Trash className="h-4 w-4  " />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <EditableField
              id={`date-${index}`}
              label="Date"
              value={note.date}
              type="date"
              onUpdate={(val) => updateField(index, 'date', val)}
              isSaving={isFieldSaving[`notes.${index}.date`]}
              isMissing={isFieldMissing(index, 'date')}
              required
            />

            <EditableField
              id={`type-${index}`}
              label="Type"
              value={note.type}
              type="select"
              options={typeOptions}
              onUpdate={(val) => updateField(index, 'type', val)}
              isSaving={isFieldSaving[`notes.${index}.type`]}
              isMissing={isFieldMissing(index, 'type')}
              required
            />

            <EditableField
              id={`note-${index}`}
              label="Note"
              value={note.note}
              type="textarea"
              onUpdate={(val) => updateField(index, 'note', val)}
              isSaving={isFieldSaving[`notes.${index}.note`]}
              isMissing={isFieldMissing(index, 'note')}
              required
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addNewNote}
          disabled={isAdding}
          className="rounded bg-watney px-4 py-2 text-white hover:bg-watney/90 disabled:opacity-50 "
        >
          Add Note
        </Button>
      </div>
    </div>
  );
};

export default NoteTab;
