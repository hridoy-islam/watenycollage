// src/pages/courseUnit/courseResource/components/ResourceForm.tsx

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Pencil } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FileUploadArea from './FileUploadArea';
import {
  FormData,
  ResourceType,
  ContentType,
  UploadState,
  Resource
} from './types';
import moment from 'moment';

interface ResourceFormProps {
  selectedResourceType: ResourceType;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  uploadState: UploadState;
  uploadingFile: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  editingResource: boolean;
  allResources: Resource[];
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
  selectedResourceType,
  formData,
  setFormData,
  contentType,
  setContentType,
  uploadState,
  uploadingFile,
  uploadProgress,
  uploadError,
  onFileChange,
  onSave,
  onCancel,
  editingResource,
  allResources,
  selectedParentId,
  setSelectedParentId
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  useEffect(() => {
    if (selectedResourceType === 'learning-outcome') {
      setCurrentStep(1);
    }
  }, [selectedResourceType]);

   const handleCheckboxChange = (field: 'finalFeedback' | 'observation') => {
    setFormData((prev) => {
      const currentFinalFeedback = prev.finalFeedback || false;
      const currentObservation = prev.observation || false;

      // If trying to uncheck the only checked box, prevent it
      if (field === 'finalFeedback' && currentFinalFeedback && !currentObservation) {
        return prev; 
      }
      if (field === 'observation' && currentObservation && !currentFinalFeedback) {
        return prev; 
      }

      // Toggle the field
      return {
        ...prev,
        [field]: !prev[field]
      };
    });
  };

  // ===== FORM RENDERERS =====

  useEffect(() => {
    if (
      (selectedResourceType === 'study-guide' ||
        selectedResourceType === 'lecture') &&
      uploadState.fileName &&
      uploadState.fileUrl
    ) {
      setFormData((prev) => ({
        ...prev,
        fileName: uploadState.fileName,
        fileUrl: uploadState.fileUrl
      }));
    }
  }, [uploadState, selectedResourceType, setFormData]);

  const renderIntroductionForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="intro-content">Introduction Content</Label>
        <div className="mt-2">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            modules={quillModules}
            className="[&_.ql-editor]:max-h-[200px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:overflow-y-auto"
          />
        </div>
      </div>
    </div>
  );

  const renderContentForm = () => (
    <div className="-mt-4 space-y-4">
      <div>
        <Label htmlFor="resource-title">Title</Label>
        <Input
          id="resource-title"
          placeholder={`Enter ${selectedResourceType === 'study-guide' ? 'study guide' : 'lecture'} title...`}
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="mt-2"
        />
      </div>

      {/* === Text Content === */}
      <div>
        <Label htmlFor="resource-content">Text Content</Label>
        <div className="mt-2">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            modules={quillModules}
            className="[&_.ql-editor]:max-h-[200px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:overflow-y-auto"
          />
        </div>
      </div>

      {/* === File Upload === */}
      <div>
        <Label>Upload Document</Label>
        <FileUploadArea
          uploadState={uploadState}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
          uploadError={uploadError}
          onFileChange={onFileChange}
        />
      </div>
    </div>
  );

  const renderAssignmentForm = () => (
    <div className="h-[60vh] space-y-4">
      <div>
        <Label htmlFor="assignment-title">Assignment Title</Label>
        <Input
          id="assignment-title"
          placeholder="Enter assignment title..."
          value={formData.title || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="resource-content">Assignment Details (Optional)</Label>
        <div className="mt-2">
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            modules={quillModules}
            className="[&_.ql-editor]:max-h-[200px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:overflow-y-auto"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="assignment-deadline">Deadline</Label>
        <Input
          type="date"
          id="assignment-deadline"
          value={
            formData.deadline
              ? moment(formData.deadline).format('YYYY-MM-DD')
              : ''
          }
          onChange={(e) => {
            const selectedDate = e.target.value
              ? moment(e.target.value, 'YYYY-MM-DD').toDate()
              : null;
            setFormData((prev) => ({ ...prev, deadline: selectedDate }));
          }}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-watney"
        />
      </div>
    </div>
  );

  const renderCreateLearningOutcomeForm = () => {
    const [isAddingNew, setIsAddingNew] = useState(false);

    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="learning-outcomes">Learning Outcome Title *</Label>
            <Input
              id="learning-outcomes"
              placeholder="Enter learning outcome title..."
              value={formData.learningOutcomes || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  learningOutcomes: e.target.value
                }))
              }
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              disabled={!formData.learningOutcomes?.trim()}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Next
            </Button>
          </div>
        </div>
      );
    }

    // Step 2: Assessment Criteria with checkboxes
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="default"
            size={'sm'}
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 bg-watney text-sm text-white hover:bg-watney/90"
          >
            ← Back
          </Button>
        </div>

       

        {/* Assessment Criteria Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-700">Assessment Criteria</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingNew(true);
                setEditContent('');
                setEditingIndex(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Assessment Criteria
            </Button>
          </div>

          {/* Render existing criteria */}
          <div className="space-y-3">
            {(formData.assessmentCriteria || []).map((item, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg border bg-white p-3"
              >
                {editingIndex === index ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <Label>Assessment Criteria Description *</Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={editContent}
                          onChange={setEditContent}
                          modules={quillModules}
                          className="[&_.ql-editor]:min-h-[100px]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingIndex(null);
                          setEditContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!editContent.trim()) return;
                          setFormData((prev) => {
                            const updated = [...(prev.assessmentCriteria || [])];
                            updated[index] = {
                              ...updated[index],
                              description: editContent
                            };
                            return { ...prev, assessmentCriteria: updated };
                          });
                          setEditingIndex(null);
                          setEditContent('');
                        }}
                        className="bg-watney text-white hover:bg-watney/90"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-start justify-between">
                    <div className="flex flex-row gap-4">
                      <span className="font-medium text-slate-700">
                        {index + 1}.
                      </span>
                      <div
                        className="ql-snow text-slate-800"
                        dangerouslySetInnerHTML={{
                          __html: item.description || ''
                        }}
                      />
                    </div>
                    <div className="ml-4 flex gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="hover:bg-blue-50"
                        onClick={() => {
                          setEditingIndex(index);
                          setEditContent(item.description || '');
                        }}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="hover:bg-red-50"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            assessmentCriteria: (
                              prev.assessmentCriteria || []
                            ).filter((_, i) => i !== index)
                          }));
                          if (editingIndex === index) {
                            setEditingIndex(null);
                            setEditContent('');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* New Criterion Editor */}
            {isAddingNew && (
              <div className="space-y-3 rounded-lg border bg-white p-3">
                <div>
                  <Label>Assessment Criteria Description *</Label>
                  <div className="mt-2">
                    <ReactQuill
                      theme="snow"
                      value={editContent}
                      onChange={setEditContent}
                      modules={quillModules}
                      className="[&_.ql-editor]:min-h-[100px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!editContent.trim()) return;
                      setFormData((prev) => ({
                        ...prev,
                        assessmentCriteria: [
                          ...(prev.assessmentCriteria || []),
                          { description: editContent }
                        ]
                      }));
                      setIsAddingNew(false);
                      setEditContent('');
                    }}
                    className="bg-watney text-white hover:bg-watney/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

         {/* Checkboxes Section */}
        <div className="space-y-2 ">
          <h3 className="font-semibold text-lg  text-slate-700">Assessment Options ( Select at least one assessment method)</h3>
         
          
          <div className="flex gap-6">
            {/* Final Feedback Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="finalFeedback"
                checked={formData.finalFeedback || false}
                onChange={() => handleCheckboxChange('finalFeedback')}
                className="h-5 w-5 rounded border-slate-300 text-watney focus:ring-watney"
              />
              <Label
                htmlFor="finalFeedback"
                className="text-md font-medium text-slate-700"
              >
                Final Feedback
              </Label>
            </div>

            {/* Observation Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="observation"
                checked={formData.observation || false}
                onChange={() => handleCheckboxChange('observation')}
                className="h-5 w-5 rounded border-slate-300 text-watney focus:ring-watney"
              />
              <Label
                htmlFor="observation"
                className="text-md font-medium text-slate-700"
              >
                Observation
              </Label>
            </div>
          </div>

         
        </div>
      </div>
    );
  };

  const renderFormContent = () => {
    switch (selectedResourceType) {
      case 'introduction':
        return renderIntroductionForm();
      case 'study-guide':
      case 'lecture':
        return renderContentForm();
      case 'assignment':
        return renderAssignmentForm();
      case 'learning-outcome':
        return renderCreateLearningOutcomeForm();
      default:
        return null;
    }
  };

  const shouldShowFinalActionButtons =
    selectedResourceType !== 'learning-outcome' || currentStep === 2;

  const isFormValid = (() => {
    switch (selectedResourceType) {
      case 'study-guide':
      case 'lecture':
        return (
          formData.title?.trim() &&
          (formData.content?.trim() || uploadState.selectedDocument)
        );

      case 'assignment':
        return formData.title?.trim() && !!formData.deadline;
      case 'learning-outcome':
        if (currentStep === 1) {
          return formData.learningOutcomes?.trim();
        } else {
          return (
            formData.learningOutcomes?.trim() &&
            (formData.assessmentCriteria?.length || 0) > 0 &&
            (formData.finalFeedback || formData.observation) 
          );
        }
      case 'introduction':
        return formData.content?.trim();
      default:
        return false;
    }
  })();

  return (
    <div className="space-y-6 py-4">
      {renderFormContent()}

      {shouldShowFinalActionButtons && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!isFormValid}
            className="bg-watney text-white hover:bg-watney/90"
          >
            {editingResource ? 'Update Resource' : 'Create Resource'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourceForm;
