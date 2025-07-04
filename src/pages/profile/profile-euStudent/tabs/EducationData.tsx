import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { ImageUploader } from '../components/document-uploader';
import { useSelector } from 'react-redux';

const EducationData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);
  const [uploadState, setUploadState] = useState({
    isOpen: false,
    field: ''
  });

  const { user } = useSelector((state: any) => state.auth);

  // Sync localData when userData changes
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleNestedChange = (
    section: keyof User,
    index: number,
    field: string,
    value: any
  ) => {
    const updatedArray = [...(localData[section] || [])];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    setLocalData((prevData) => ({
      ...prevData,
      [section]: updatedArray
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  const handleAddEducation = () => {
    const newEntry = {
      institution: '',
      qualification: '',
      awardDate: null,
      grade: '',
      certificate: '' // Ensure certificate field exists
    };
    setLocalData((prevData) => ({
      ...prevData,
      educationData: [...(prevData.educationData || []), newEntry]
    }));
  };

  const handleUploadComplete = (uploadResponse) => {
    const { field } = uploadState;

    if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
      setUploadState({ isOpen: false, field: '' });
      return;
    }

    const uploadedFileUrl = uploadResponse.data.fileUrl;

    if (field.startsWith('educationData.')) {
      const parts = field.split('.');
      const index = parseInt(parts[1], 10);
      const nestedField = parts[2];

      if (!isNaN(index) && nestedField) {
        handleNestedChange(
          'educationData',
          index,
          nestedField,
          uploadedFileUrl
        );
      }
    }

    setUploadState({ isOpen: false, field: '' });
  };

 return (
  <TabSection
    title="Education"
    description="Your educational background and qualifications"
    userData={userData}
    isEditing={isEditing}
    onSave={handleSave}
    onCancel={onCancel}
    onEdit={onEdit}
  >
    <div className="space-y-8">
      {/* Education Data */}
      <div>
        {localData.educationData && localData.educationData.length > 0 ? (
          localData.educationData.map((entry, index) => (
            <div key={index} className="mb-6 rounded-md border p-4">
              <h4 className="text-md mb-2 font-semibold text-gray-800">
                Education {index + 1}
              </h4>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Institution
                  </label>
                  {isEditing ? (
                    <Input
                      value={entry.institution || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'educationData',
                          index,
                          'institution',
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.institution || '-'}
                    </div>
                  )}
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Qualification
                  </label>
                  {isEditing ? (
                    <Input
                      value={entry.qualification || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'educationData',
                          index,
                          'qualification',
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.qualification || '-'}
                    </div>
                  )}
                </div>

                {/* Award Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Award Date
                  </label>
                  {isEditing ? (
                    <CustomDatePicker
                      selected={
                        entry.awardDate ? new Date(entry.awardDate) : null
                      }
                      onChange={(date) =>
                        handleNestedChange(
                          'educationData',
                          index,
                          'awardDate',
                          date
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.awardDate
                        ? new Date(entry.awardDate).toLocaleDateString()
                        : '-'}
                    </div>
                  )}
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Grade
                  </label>
                  {isEditing ? (
                    <Input
                      value={entry.grade || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'educationData',
                          index,
                          'grade',
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.grade || '-'}
                    </div>
                  )}
                </div>

                {/* Certificate Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Certificate
                  </label>
                  {isEditing ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setUploadState({
                            isOpen: true,
                            field: `educationData.${index}.certificate`
                          })
                        }
                        className="mt-1 rounded-md bg-watney px-4 py-2 text-sm font-medium text-white hover:bg-watney/90 focus:outline-none"
                      >
                        Upload Certificate
                      </button>
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: PDF, JPG, PNG. Max size 5MB.
                      </p>

                      {entry.certificate && (
                        <>
                          <p className="mt-2 text-sm text-gray-900">
                            {decodeURIComponent(
                              entry.certificate.split('/').pop() ||
                                'Uploaded File'
                            )}
                          </p>
                          <a
                            href={entry.certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-blue-600 underline"
                          >
                            View File
                          </a>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.certificate ? (
                        <a
                          href={entry.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Certificate
                        </a>
                      ) : (
                        '-'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 italic">
            No education data available.
          </p>
        )}

        {isEditing && (
          <button
            type="button"
            onClick={handleAddEducation}
            className="mt-4 rounded-md bg-watney px-4 py-2 text-sm font-medium text-white hover:bg-watney/90 focus:outline-none focus:ring-2"
          >
            + Add Education
          </button>
        )}
      </div>
    </div>

    {/* Document Uploader Modal */}
    <ImageUploader
      open={uploadState.isOpen}
      onOpenChange={(isOpen) =>
        setUploadState({ isOpen, field: uploadState.field })
      }
      onUploadComplete={handleUploadComplete}
      entityId={user?._id}
    />
  </TabSection>
);

};

export default EducationData;
