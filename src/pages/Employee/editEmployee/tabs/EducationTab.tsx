import React, { useState } from 'react';
import { EditableField } from '../EditableField';
import moment from '@/lib/moment-setup';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './layout';

interface EducationTabProps {
  formData: any;
  onUpdate: (fieldName: string, value: any) => void;
  isFieldSaving: Record<string, boolean>;
}

const EducationTab: React.FC<EducationTabProps> = ({ formData, onUpdate }) => {
  const educationData: any[] = Array.isArray(formData.educationData)
    ? formData.educationData
    : [];

  const [items, setItems] = useState<any[]>(
    educationData.length
      ? educationData
      : [
          {
            institution: '',
            qualification: '',
            awardDate: '',
            grade: '',
            certificate: ''
          }
        ]
  );

  const commit = (next: any[]) => {
    setItems(next);
    onUpdate('educationData', next);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const next = items.map((it, i) =>
      i === index ? { ...it, [field]: value } : it
    );
    commit(next);
  };

  const addItem = () => {
    commit([
      ...items,
      {
        institution: '',
        qualification: '',
        awardDate: '',
        grade: '',
        certificate: ''
      }
    ]);
  };

  const removeItem = (index: number) => {
    commit(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <SectionHeader icon={GraduationCap} title="Education" />
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Education #{index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <EditableField
                  id={`edu-inst-${index}`}
                  label="Institution"
                  value={item.institution || ''}
                  onUpdate={(value) => updateItem(index, 'institution', value)}
                />
                <EditableField
                  id={`edu-qual-${index}`}
                  label="Qualification"
                  value={item.qualification || ''}
                  onUpdate={(value) => updateItem(index, 'qualification', value)}
                />
                <EditableField
                  id={`edu-date-${index}`}
                  label="Award Date"
                  type="date"
                  value={
                    item.awardDate
                      ? moment(item.awardDate).format('YYYY-MM-DD')
                      : ''
                  }
                  onUpdate={(value) => updateItem(index, 'awardDate', value)}
                />
                <EditableField
                  id={`edu-grade-${index}`}
                  label="Grade"
                  value={item.grade || ''}
                  onUpdate={(value) => updateItem(index, 'grade', value)}
                />
                <div className="md:col-span-2">
                  <EditableField
                    id={`edu-cert-${index}`}
                    label="Certificate URL"
                    value={item.certificate || ''}
                    onUpdate={(value) => updateItem(index, 'certificate', value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 p-4">
          <Button
            variant="outline"
            className="text-theme"
            onClick={addItem}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Education
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EducationTab;
