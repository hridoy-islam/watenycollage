import React from 'react';
import { EditableField } from '../EditableField';
import { UserCircle } from 'lucide-react';
import { SectionHeader } from './layout';

interface ReferencesTabProps {
  formData: any;
  onUpdate: (parentField: string, fieldName: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
}

const refereeFields = [
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'organisation', label: 'Organisation' },
  { key: 'address', label: 'Address' },
  { key: 'tel', label: 'Telephone' },
  { key: 'fax', label: 'Fax' },
  { key: 'email', label: 'Email' }
];

const ReferencesTab: React.FC<ReferencesTabProps> = ({
  formData,
  onUpdate,
  isFieldSaving
}) => {
  const referees = [
    { id: 'professionalReferee1', title: 'Professional Referee 1' },
    { id: 'professionalReferee2', title: 'Professional Referee 2' },
    { id: 'personalReferee', title: 'Personal Referee' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {referees.map((ref) => {
        const data = formData[ref.id] || {};
        return (
          <div
            key={ref.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <SectionHeader icon={UserCircle} title={ref.title} />
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              {refereeFields.map((f) => (
                <div
                  key={f.key}
                  className="border-b border-gray-100 px-4 py-2"
                >
                  <EditableField
                    id={`${ref.id}-${f.key}`}
                    label={f.label}
                    value={data[f.key] || ''}
                    type={f.key === 'email' ? 'email' : 'text'}
                    onUpdate={(value) => onUpdate(ref.id, f.key, value)}
                    isSaving={isFieldSaving[`${ref.id}.${f.key}`]}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReferencesTab;
