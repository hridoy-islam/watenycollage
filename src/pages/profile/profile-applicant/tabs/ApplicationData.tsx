import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { languages } from '@/types';

interface ApplicationDataProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => true;
}

const ApplicationData: React.FC<ApplicationDataProps> = ({
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

  const handleInputChange = <K extends keyof User>(field: K, value: User[K]) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(localData);
  };

  // Options
  const sourceOptions = [
    { value: 'website', label: 'Company Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'other', label: 'Other' },
  ];

  const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];



  // Helper
  const capitalizeFirstLetter = (str: string): string => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  const renderField = (
    label: string,
    isRequired = false,
    children: React.ReactNode
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500"> *</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );

  return (
    <TabSection
      title="Application Details"
      description="Your submitted application details"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Grid of Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Available From Date */}
          {renderField('Available From Date', true, isEditing ? (
            <CustomDatePicker
              selected={localData.availableFromDate ? new Date(localData.availableFromDate) : null}
              onChange={(date) => {
                handleInputChange('availableFromDate', date ? date.toISOString() : '');
              }}
              placeholder="Available From Date"
            />
          ) : (
            localData.availableFromDate
              ? new Date(localData.availableFromDate).toLocaleDateString()
              : '-'
          ))}

          {/* Competent in Another Language */}
          {renderField('Are you competent in another language?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.competentInOtherLanguage) || null}
              onChange={(opt) => handleInputChange('competentInOtherLanguage', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.competentInOtherLanguage !== null
              ? localData.competentInOtherLanguage
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Other Languages */}
          {localData.competentInOtherLanguage === true && (
            renderField('Select the languages', true, isEditing ? (
              <Select
                isMulti
                options={languages.map(lang => ({
                  value: lang,
                  label: capitalizeFirstLetter(lang),
                }))}
                value={(localData.otherLanguages || []).map(lang => ({
                  value: lang,
                  label: capitalizeFirstLetter(lang),
                }))}
                onChange={(selected) =>
                  handleInputChange(
                    'otherLanguages',
                    selected?.map((opt) => opt.value) || []
                  )
                }
                className="react-select-container"
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
              />
            ) : (
              (localData.otherLanguages || []).map(capitalizeFirstLetter).join(', ') || '-'
            ))
          )}

          {/* Driving License */}
          {renderField('Do you hold a driving license?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.drivingLicense) || null}
              onChange={(opt) => handleInputChange('drivingLicense', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.drivingLicense !== null
              ? localData.drivingLicense
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* License Number */}
          {localData.drivingLicense && (
            renderField('License Number', true, isEditing ? (
              <Input
                value={localData.licenseNumber || ''}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
              />
            ) : (
              localData.licenseNumber || '-'
            ))
          )}

          {/* Car Owner */}
          {renderField('Do you own a car?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.carOwner) || null}
              onChange={(opt) => handleInputChange('carOwner', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.carOwner !== null
              ? localData.carOwner
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Travel Areas */}
          {renderField('What areas are you prepared to travel to?', true, isEditing ? (
            <Textarea
              value={localData.travelAreas || ''}
              onChange={(e) => handleInputChange('travelAreas', e.target.value)}
              placeholder="List areas..."
              className="resize-none"
            />
          ) : (
            localData.travelAreas || '-'
          ))}

          {/* Solely for Everycare */}
          {renderField('Will you be working solely for Everycare?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.solelyForEverycare) || null}
              onChange={(opt) => handleInputChange('solelyForEverycare', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.solelyForEverycare !== null
              ? localData.solelyForEverycare
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Other Employers */}
          {localData.solelyForEverycare === false && (
            renderField('Who else do you work for?', true, isEditing ? (
              <Textarea
                value={localData.otherEmployers || ''}
                onChange={(e) => handleInputChange('otherEmployers', e.target.value)}
                placeholder="Enter employer names"
                className="resize-none"
              />
            ) : (
              localData.otherEmployers || '-'
            ))
          )}

          {/* Professional Body */}
          {renderField('Are you a member of a professional body?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.professionalBody) || null}
              onChange={(opt) => handleInputChange('professionalBody', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.professionalBody !== null
              ? localData.professionalBody
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Professional Body Details */}
          {localData.professionalBody && (
            renderField('Please provide details', true, isEditing ? (
              <Input
                value={localData.professionalBodyDetails || ''}
                onChange={(e) => handleInputChange('professionalBodyDetails', e.target.value)}
                placeholder="Enter professional body details"
              />
            ) : (
              localData.professionalBodyDetails || '-'
            ))
          )}

          {/* Age 18+ */}
          {renderField('Are you aged 18 or over?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.isOver18) || null}
              onChange={(opt) => handleInputChange('isOver18', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.isOver18 !== null
              ? localData.isOver18
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Immigration Control */}
          {renderField('Are you subject to immigration control?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.isSubjectToImmigrationControl) || null}
              onChange={(opt) => handleInputChange('isSubjectToImmigrationControl', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.isSubjectToImmigrationControl !== null
              ? localData.isSubjectToImmigrationControl
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Can Work in UK */}
          {renderField('Are you free to remain and take up employment in the UK?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.canWorkInUK) || null}
              onChange={(opt) => handleInputChange('canWorkInUK', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.canWorkInUK !== null
              ? localData.canWorkInUK
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Source */}
          {renderField('How did you hear about us?', true, isEditing ? (
            <Select
              options={sourceOptions}
              value={sourceOptions.find(opt => opt.value === localData.source) || null}
              onChange={(opt) => handleInputChange('source', opt?.value || '')}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            sourceOptions.find(opt => opt.value === localData.source)?.label || '-'
          ))}

          {/* Referral Employee */}
          {localData.source === 'referral' && (
            renderField('Referred by (Employee Name)', true, isEditing ? (
              <Input
                value={localData.referralEmployee || ''}
                onChange={(e) => handleInputChange('referralEmployee', e.target.value)}
                placeholder="Enter the employee name"
              />
            ) : (
              localData.referralEmployee || '-'
            ))
          )}

          {/* Student */}
          {renderField('Are you currently a student?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.isStudent) || null}
              onChange={(opt) => handleInputChange('isStudent', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.isStudent !== null
              ? localData.isStudent
                ? 'Yes'
                : 'No'
              : '-'
          ))}

          {/* Pension Age */}
          {renderField('Are you under state pension age?', true, isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(opt => opt.value === localData.isUnderStatePensionAge) || null}
              onChange={(opt) => handleInputChange('isUnderStatePensionAge', opt?.value ?? null)}
              isClearable
              className="react-select-container"
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
            />
          ) : (
            localData.isUnderStatePensionAge !== null
              ? localData.isUnderStatePensionAge
                ? 'Yes'
                : 'No'
              : '-'
          ))}
        </div>

        {/* Weekly Availability */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Availability (Select all that apply)
            <span className="text-red-500"> *</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayKey = day.toLowerCase();
              return (
                <div key={day} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Checkbox
                        id={dayKey}
                        checked={localData.availability?.[dayKey] || false}
                        onCheckedChange={(checked) =>
                          setLocalData((prev) => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [dayKey]: checked === true,
                            },
                          }))
                        }
                      />
                      <label htmlFor={dayKey} className="text-sm font-medium">
                        {day}
                      </label>
                    </>
                  ) : (
                    <span className="text-sm">
                      {day}: {localData.availability?.[dayKey] ? 'Yes' : 'No'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default ApplicationData;