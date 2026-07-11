import React, { useState } from 'react';
import { EditableField } from '../EditableField';
import moment from '@/lib/moment-setup';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader, FormRow } from './layout';

interface ExperienceTabProps {
  formData: any;
  onUpdate: (fieldName: string, value: any) => void;
  onNestedUpdate: (parentField: string, fieldName: string, value: any) => void;
  onDateChange: (fieldName: string, dateStr: string) => void;
  isFieldSaving: Record<string, boolean>;
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({
  formData,
  onUpdate,
  onNestedUpdate,
  onDateChange,
  isFieldSaving
}) => {
  const currentEmployment = formData.currentEmployment || {};
  const previousEmployments: any[] = Array.isArray(formData.previousEmployments)
    ? formData.previousEmployments
    : [];

  const [prev, setPrev] = useState<any[]>(
    previousEmployments.length
      ? previousEmployments
      : [
          {
            employer: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            reasonForLeaving: '',
            responsibilities: '',
            contactPermission: ''
          }
        ]
  );

  const commitPrev = (next: any[]) => {
    setPrev(next);
    onUpdate('previousEmployments', next);
  };

  const updatePrev = (index: number, field: string, value: any) => {
    commitPrev(prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addPrev = () => {
    commitPrev([
      ...prev,
      {
        employer: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        reasonForLeaving: '',
        responsibilities: '',
        contactPermission: ''
      }
    ]);
  };

  const removePrev = (index: number) => {
    commitPrev(prev.filter((_, i) => i !== index));
  };

  const fmtDate = (val: any) =>
    val ? moment(val).format('YYYY-MM-DD') : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <SectionHeader icon={Briefcase} title="Current Employment" />
        <div className="flex flex-col">
          <FormRow label="Employer" isSaving={isFieldSaving['currentEmployment.employer']}>
            <EditableField
              id="ce-employer"
              label=""
              value={currentEmployment.employer || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'employer', value)}
              isSaving={isFieldSaving['currentEmployment.employer']}
            />
          </FormRow>
          <FormRow label="Job Title" isSaving={isFieldSaving['currentEmployment.jobTitle']}>
            <EditableField
              id="ce-jobTitle"
              label=""
              value={currentEmployment.jobTitle || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'jobTitle', value)}
              isSaving={isFieldSaving['currentEmployment.jobTitle']}
            />
          </FormRow>
          <FormRow label="Start Date" isSaving={isFieldSaving['currentEmployment.startDate']}>
            <EditableField
              id="ce-startDate"
              label=""
              type="date"
              value={fmtDate(currentEmployment.startDate)}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'startDate', value)}
              isSaving={isFieldSaving['currentEmployment.startDate']}
            />
          </FormRow>
          <FormRow label="Employment Type" isSaving={isFieldSaving['currentEmployment.employmentType']}>
            <EditableField
              id="ce-employmentType"
              label=""
              value={currentEmployment.employmentType || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'employmentType', value)}
              isSaving={isFieldSaving['currentEmployment.employmentType']}
            />
          </FormRow>
          <FormRow label="Supervisor" isSaving={isFieldSaving['currentEmployment.supervisor']}>
            <EditableField
              id="ce-supervisor"
              label=""
              value={currentEmployment.supervisor || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'supervisor', value)}
              isSaving={isFieldSaving['currentEmployment.supervisor']}
            />
          </FormRow>
          <FormRow label="Responsibilities" isSaving={isFieldSaving['currentEmployment.responsibilities']}>
            <EditableField
              id="ce-responsibilities"
              label=""
              type="textarea"
              value={currentEmployment.responsibilities || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'responsibilities', value)}
              isSaving={isFieldSaving['currentEmployment.responsibilities']}
            />
          </FormRow>
          <FormRow label="Contact Permission" isSaving={isFieldSaving['currentEmployment.contactPermission']}>
            <EditableField
              id="ce-contactPermission"
              label=""
              value={currentEmployment.contactPermission || ''}
              onUpdate={(value) => onNestedUpdate('currentEmployment', 'contactPermission', value)}
              isSaving={isFieldSaving['currentEmployment.contactPermission']}
            />
          </FormRow>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <SectionHeader icon={Briefcase} title="Previous Employment" />
        <div className="divide-y divide-gray-100">
          {prev.map((item, index) => (
            <div key={index} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Previous #{index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => removePrev(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <EditableField
                  id={`pe-emp-${index}`}
                  label="Employer"
                  value={item.employer || ''}
                  onUpdate={(value) => updatePrev(index, 'employer', value)}
                />
                <EditableField
                  id={`pe-title-${index}`}
                  label="Job Title"
                  value={item.jobTitle || ''}
                  onUpdate={(value) => updatePrev(index, 'jobTitle', value)}
                />
                <EditableField
                  id={`pe-sd-${index}`}
                  label="Start Date"
                  type="date"
                  value={fmtDate(item.startDate)}
                  onUpdate={(value) => updatePrev(index, 'startDate', value)}
                />
                <EditableField
                  id={`pe-ed-${index}`}
                  label="End Date"
                  type="date"
                  value={fmtDate(item.endDate)}
                  onUpdate={(value) => updatePrev(index, 'endDate', value)}
                />
                <div className="md:col-span-2">
                  <EditableField
                    id={`pe-res-${index}`}
                    label="Responsibilities"
                    type="textarea"
                    value={item.responsibilities || ''}
                    onUpdate={(value) => updatePrev(index, 'responsibilities', value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <EditableField
                    id={`pe-reason-${index}`}
                    label="Reason For Leaving"
                    value={item.reasonForLeaving || ''}
                    onUpdate={(value) => updatePrev(index, 'reasonForLeaving', value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 p-4">
          <Button variant="outline" className="text-theme" onClick={addPrev}>
            <Plus className="mr-2 h-4 w-4" /> Add Previous Employment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceTab;
