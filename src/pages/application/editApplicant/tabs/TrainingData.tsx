import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { ImageUploader } from '../components/document-uploader';
import { useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react'; // 1. Import Icon

const TrainingData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}: {
  userData: any;
  isEditing?: boolean;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  onEdit?: () => void;
}) => {
  const [localData, setLocalData] = useState<any>(userData);
  const [uploadState, setUploadState] = useState({
    isOpen: false,
    field: ''
  });

  const { user } = useSelector((state: any) => state.auth);

  // Sync localData when userData changes
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = (field: string, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleNestedChange = (
    section: string,
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

  // 2. New Handler to remove training entry
  const handleRemoveTraining = (index: number) => {
    const updatedArray = [...(localData.trainingData || [])];
    updatedArray.splice(index, 1);

    setLocalData((prevData) => ({
      ...prevData,
      trainingData: updatedArray
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  const handleAddTraining = () => {
    const newEntry = {
      trainingName: '',
      awardingBody: '',
      completionDate: null,
      certificate: '' // Initialize as empty string for consistency
    };
    setLocalData((prevData) => ({
      ...prevData,
      trainingData: [...(prevData.trainingData || []), newEntry]
    }));
  };

  const handleUploadComplete = (uploadResponse: any) => {
    const { field } = uploadState;

    if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
      setUploadState({ isOpen: false, field: '' });
      return;
    }

    const uploadedFileUrl = uploadResponse.data.fileUrl;

    if (field.startsWith('trainingData.')) {
      const parts = field.split('.');
      const index = parseInt(parts[1], 10);
      const nestedField = parts[2];

      if (!isNaN(index) && nestedField) {
        handleNestedChange(
          'trainingData',
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
      title="Training"
      description="Your professional training and certifications"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Training Data */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900">Training Records</h3>
          {(localData.trainingData || []).map((entry, index) => (
            <div key={index} className="mb-6 rounded-md border border-gray-300 p-4">
              
              {/* 3. Updated Header with Trash Icon */}
              <div className="mb-4 flex items-center justify-between border-b pb-2">
                <h4 className="text-md font-semibold text-gray-800">
                  Training {index + 1}
                </h4>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTraining(index)}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                    title="Remove this training entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Training Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Training Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={entry.trainingName || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'trainingData',
                          index,
                          'trainingName',
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.trainingName || '-'}
                    </div>
                  )}
                </div>

                {/* Awarding Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Awarding Body
                  </label>
                  {isEditing ? (
                    <Input
                      value={entry.awardingBody || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'trainingData',
                          index,
                          'awardingBody',
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.awardingBody || '-'}
                    </div>
                  )}
                </div>

                {/* Completion Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Completion Date
                  </label>
                  {isEditing ? (
                    <CustomDatePicker
                      selected={
                        entry.completionDate ? new Date(entry.completionDate) : null
                      }
                      onChange={(date) =>
                        handleNestedChange(
                          'trainingData',
                          index,
                          'completionDate',
                          date ? date.toISOString() : null
                        )
                      }
                    />
                  ) : (
                    <div className="mt-1 text-gray-900">
                      {entry.completionDate
                        ? new Date(entry.completionDate).toLocaleDateString()
                        : '-'}
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
                            field: `trainingData.${index}.certificate`
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
                        <p className="mt-2 text-sm text-gray-900">
                          {decodeURIComponent(
                            entry.certificate.split('/').pop() ||
                              'Uploaded File'
                          )}
                        </p>
                      )}

                      {entry.certificate && (
                        <a
                          href={entry.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-blue-600 underline"
                        >
                          View File
                        </a>
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
          ))}

          {isEditing && (
            <button
              type="button"
              onClick={handleAddTraining}
              className="rounded-md bg-watney px-4 py-2 text-sm font-medium text-white hover:bg-watney/90 focus:outline-none focus:ring-2 focus:ring-watney/50"
            >
              + Add Training
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

export default TrainingData;