// src/pages/courseUnit/courseResource/components/ResourceForm.tsx

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Trash2, Pencil } from 'lucide-react';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';
import FileUploadArea from './FileUploadArea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormData,
  ResourceType,
  ContentType,
  UploadState,
  Resource,
  LearningOutcomeItem
} from './types';
import { mockResources } from './mockData';

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
  allResources = mockResources,
  selectedParentId,
  setSelectedParentId
}) => {
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [newCriterion, setNewCriterion] = useState<LearningOutcomeItem>({
    id: '',
    parentId: '',
    description: ''
  });
  const [showAssessmentCriteriaForm, setShowAssessmentCriteriaForm] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const DatepickerPopperContainer = ({
    children
  }: {
    children: React.ReactNode;
  }) => <div style={{ position: 'absolute', zIndex: 9999 }}>{children}</div>;

  // ===== FORM RENDERERS =====

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
            className="[&_.ql-editor]:min-h-[200px]"
          />
        </div>
      </div>
    </div>
  );

  const renderContentForm = () => (
    <div className="space-y-6">
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

      <Tabs
        value={contentType}
        onValueChange={(value) => setContentType(value as ContentType)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text Content</TabsTrigger>
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div>
            <Label htmlFor="resource-content">Content</Label>
            <div className="mt-2">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, content: value }))
                }
                modules={quillModules}
                className="[&_.ql-editor]:min-h-[200px]"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadArea
            uploadState={uploadState}
            uploadingFile={uploadingFile}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            onFileChange={onFileChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderAssignmentForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="assignment-title">Assignment Title</Label>
        <Input
          id="assignment-title"
          placeholder="Enter assignment title..."
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="assignment-deadline">Deadline</Label>
        <div className="relative mt-2 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-slate-500" />
          <DatePicker
            selected={formData.deadline}
            onChange={(date) =>
              setFormData((prev) => ({ ...prev, deadline: date }))
            }
            dateFormat="dd-MM-yyyy"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-watney"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
            popperModifiers={[{ name: 'offset', options: { offset: [0, 10] } }]}
            popperContainer={DatepickerPopperContainer}
          />
        </div>
      </div>
    </div>
  );

  const renderCreateLearningOutcomeForm = () => {
    if (!Array.isArray(allResources)) {
      return (
        <div className="rounded-md bg-red-50 p-3 text-red-700">
          Error: Resources could not be loaded.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Learning Outcome Title */}
        <div>
          <Label htmlFor="learning-outcomes">Learning Outcome Title *</Label>
          <Input
            id="learning-outcomes"
            placeholder="Enter learning outcome title..."
            value={formData.learningOutcomes || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, learningOutcomes: e.target.value }))
            }
            className="mt-2"
          />
        </div>

        {/* Assessment Criteria Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Assessment Criteria ({formData.assessmentCriteria?.length || 0})</Label>
            {!showAssessmentCriteriaForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAssessmentCriteriaForm(true);
                  setEditingCriterionId(null);
                  setNewCriterion({ id: '', parentId: '', description: '' });
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Assessment Criteria
              </Button>
            )}
          </div>

          {/* Assessment Criteria Form */}
          {showAssessmentCriteriaForm && (
            <div className="space-y-4">
              <div>
                <Label>Assessment Criteria Description *</Label>
                <div className="mt-2">
                  <ReactQuill
                    theme="snow"
                    value={newCriterion.description}
                    onChange={(val) =>
                      setNewCriterion((prev) => ({ ...prev, description: val }))
                    }
                    modules={quillModules}
                    className="[&_.ql-editor]:min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAssessmentCriteriaForm(false);
                    setEditingCriterionId(null);
                    setNewCriterion({ id: '', parentId: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAssessmentCriteria}
                  disabled={!newCriterion.description.trim()}
                  className="bg-watney text-white hover:bg-watney/90"
                >
                  {editingCriterionId ? 'Update Criterion' : 'Add Criterion'}
                </Button>
              </div>
            </div>
          )}

          {/* Existing Criteria List */}
          {formData.assessmentCriteria?.length > 0 && (
            <div className="space-y-3">
              {formData.assessmentCriteria.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-700">{index + 1}.</span>
                    </div>
                    <div
                      className="ql-snow text-slate-800"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCriterion(item)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCriterion(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLearningOutcomeForm = () => {
    return renderCreateLearningOutcomeForm();
  };

  // Helper functions
  const handleEditCriterion = (item: LearningOutcomeItem) => {
    setEditingCriterionId(item.id);
    setNewCriterion({ ...item });
    setShowAssessmentCriteriaForm(true);
  };

  const handleRemoveCriterion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assessmentCriteria: prev.assessmentCriteria?.filter((item) => item.id !== id) || [],
    }));
  };

  const handleSaveAssessmentCriteria = () => {
    if (!newCriterion.description.trim()) return;

    const criterionToAdd = {
      ...newCriterion,
      id: editingCriterionId || `criterion-${Date.now()}`
    };

    if (editingCriterionId) {
      setFormData((prev) => ({
        ...prev,
        assessmentCriteria: prev.assessmentCriteria?.map((item) =>
          item.id === editingCriterionId ? criterionToAdd : item
        ) || [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        assessmentCriteria: [...(prev.assessmentCriteria || []), criterionToAdd],
      }));
    }

    setNewCriterion({ id: '', parentId: '', description: '' });
    setEditingCriterionId(null);
    setShowAssessmentCriteriaForm(false);
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
        return renderLearningOutcomeForm();
      default:
        return null;
    }
  };

  // Always show action buttons for learning-outcome (since we removed the selector)
  const shouldShowActionButtons = true;

  return (
    <div className="space-y-6 py-4">
      {renderFormContent()}

      {/* Action Buttons */}
      {shouldShowActionButtons && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
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