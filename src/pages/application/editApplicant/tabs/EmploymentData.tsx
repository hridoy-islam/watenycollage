import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TabSection from '../TabSection';
import { User, PreviousEmployment, CurrentEmployment } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const EmploymentData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit,
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrentEmploymentChange = (field: keyof CurrentEmployment, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      currentEmployment: {
        ...prev.currentEmployment,
        [field]: value,
      },
    }));
  };

  const handlePreviousEmploymentChange = (index: number, field: keyof PreviousEmployment, value: any) => {
    setLocalData((prev) => {
      const updated = [...(prev.previousEmployments || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, previousEmployments: updated };
    });
  };

  const handleAddPreviousJob = () => {
    const newJob: PreviousEmployment = {
      employer: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: '',
      responsibilities: '',
      hasEmploymentGaps: '', // will be "yes"/"no"
      employmentGapsExplanation: '',
    };
    handleInputChange('previousEmployments', [
      ...(localData.previousEmployments || []),
      newJob,
    ]);
  };

  const handleRemovePreviousJob = (index: number) => {
    handleInputChange(
      'previousEmployments',
      localData.previousEmployments?.filter((_, i) => i !== index)
    );
  };

  const handleSave = () => onSave?.(localData);

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ];

  const employmentOptions = [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Self-Employed', label: 'Self-Employed' },
    { value: 'Casual', label: 'Casual' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Freelance', label: 'Freelance' },
  ];

  return (
    <TabSection
      title="Employment"
      description="Your employment history and current status"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Currently Employed */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Currently employed?
          </label>
          {isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find((opt) => opt.value === localData.isEmployed)}
              onChange={(opt) => handleInputChange('isEmployed', opt?.value || '')}
              placeholder="Select"
              styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
            />
          ) : (
            <div className="text-gray-900">{localData.isEmployed || '-'}</div>
          )}
        </div>

        {/* Current Employment */}
        {localData.isEmployed === 'yes' && (
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-900">Current Employment</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employer Name</label>
                  {isEditing ? (
                    <Input
                      value={localData.currentEmployment?.employer || ''}
                      onChange={(e) => handleCurrentEmploymentChange('employer', e.target.value)}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.employer || '-'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  {isEditing ? (
                    <Input
                      value={localData.currentEmployment?.jobTitle || ''}
                      onChange={(e) => handleCurrentEmploymentChange('jobTitle', e.target.value)}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.jobTitle || '-'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  {isEditing ? (
                    <CustomDatePicker
                      selected={localData.currentEmployment?.startDate ? new Date(localData.currentEmployment.startDate) : null}
                      onChange={(date) => handleCurrentEmploymentChange('startDate', date ? date.toISOString() : '')}
                      placeholder="Start date"
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.startDate
                        ? new Date(localData.currentEmployment.startDate).toLocaleDateString()
                        : '-'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  {isEditing ? (
                    <Select
                      options={employmentOptions}
                      value={employmentOptions.find(opt => opt.value === localData.currentEmployment?.employmentType)}
                      onChange={(opt) => handleCurrentEmploymentChange('employmentType', opt?.value || '')}
                      placeholder="Select type"
                      styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.employmentType || '-'}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Main Responsibilities</label>
                  {isEditing ? (
                    <Textarea
                      value={localData.currentEmployment?.responsibilities || ''}
                      onChange={(e) => handleCurrentEmploymentChange('responsibilities', e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {localData.currentEmployment?.responsibilities || '-'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Has Previous Employment */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Previous employment?
          </label>
          {isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find((opt) => opt.value === localData.hasPreviousEmployment)}
              onChange={(opt) => handleInputChange('hasPreviousEmployment', opt?.value || '')}
              placeholder="Select"
               classNamePrefix="react-select"
                   styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                  menuPortalTarget={document.body}
            />
          ) : (
            <div className="text-gray-900">{localData.hasPreviousEmployment || '-'}</div>
          )}
        </div>

        {/* Previous Employment List */}
        {localData.hasPreviousEmployment === 'yes' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Previous Employment</h3>
              {isEditing && (
                <Button type="button" onClick={handleAddPreviousJob}>
                  <Plus size={16} className="mr-2" />
                  Add Previous Job
                </Button>
              )}
            </div>

            {localData.previousEmployments?.length ? (
              <div className="space-y-4">
                {localData.previousEmployments.map((job, index) => (
                  <div key={index} className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {isEditing && (
                      <button
                        className="absolute right-2 top-0 rounded-md bg-white p-2 text-red-600 shadow-md hover:bg-red-600 hover:text-white"
                        onClick={() => handleRemovePreviousJob(index)}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employer Name</label>
                        {isEditing ? (
                          <Input
                            value={job.employer || ''}
                            onChange={(e) => handlePreviousEmploymentChange(index, 'employer', e.target.value)}
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.employer || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        {isEditing ? (
                          <Input
                            value={job.jobTitle || ''}
                            onChange={(e) => handlePreviousEmploymentChange(index, 'jobTitle', e.target.value)}
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.jobTitle || '-'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        {isEditing ? (
                          <CustomDatePicker
                            selected={job.startDate ? new Date(job.startDate) : null}
                            onChange={(date) => handlePreviousEmploymentChange(index, 'startDate', date ? date.toISOString() : '')}
                            placeholder="Start date"
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">
                            {job.startDate ? new Date(job.startDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        {isEditing ? (
                          <CustomDatePicker
                            selected={job.endDate ? new Date(job.endDate) : null}
                            onChange={(date) => handlePreviousEmploymentChange(index, 'endDate', date ? date.toISOString() : '')}
                            placeholder="End date"
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">
                            {job.endDate ? new Date(job.endDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reason for Leaving</label>
                        {isEditing ? (
                          <Input
                            value={job.reasonForLeaving || ''}
                            onChange={(e) => handlePreviousEmploymentChange(index, 'reasonForLeaving', e.target.value)}
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.reasonForLeaving || '-'}</div>
                        )}
                      </div>

                      {/* Employment Gaps - Per Job */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gaps in employment history?
                        </label>
                        {isEditing ? (
                          <Select
                            options={yesNoOptions}
                            value={yesNoOptions.find(opt => opt.value === job.hasEmploymentGaps)}
                            onChange={(opt) => handlePreviousEmploymentChange(index, 'hasEmploymentGaps', opt?.value || '')}
                            placeholder="Select"
                            styles={{
                            placeholder: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem',
                              color: '#9CA3AF'
                            }),
                            control: (provided) => ({
                              ...provided,
                              borderRadius: '16px',
                              fontSize: '1.125rem',
                              minHeight: '3rem', // h-12 = 48px
                              height: '3rem'
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            input: (provided) => ({
                              ...provided,
                              fontSize: '1.125rem'
                            }),
                            valueContainer: (provided) => ({
                              ...provided,
                              padding: '0 0.75rem' // px-3 for better spacing
                            })
                          }}
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.hasEmploymentGaps || '-'}</div>
                        )}
                      </div>

                      {/* Gap Explanation (conditional) */}
                      {job.hasEmploymentGaps === 'yes' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Explanation for employment gaps
                          </label>
                          {isEditing ? (
                            <Textarea
                              value={job.employmentGapsExplanation || ''}
                              onChange={(e) => handlePreviousEmploymentChange(index, 'employmentGapsExplanation', e.target.value)}
                              rows={2}
                            />
                          ) : (
                            <div className="mt-1 text-gray-900">
                              {job.employmentGapsExplanation || '-'}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Main Responsibilities</label>
                        {isEditing ? (
                          <Textarea
                            value={job.responsibilities || ''}
                            onChange={(e) => handlePreviousEmploymentChange(index, 'responsibilities', e.target.value)}
                            rows={2}
                          />
                        ) : (
                          <div className="mt-1 text-gray-900">{job.responsibilities || '-'}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center">
                <p className="text-gray-500">No previous employment records</p>
              </div>
            )}
          </div>
        )}
      </div>
    </TabSection>
  );
};

export default EmploymentData;