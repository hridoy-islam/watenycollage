import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import ReactQuill from 'react-quill';
import DatePicker from 'react-datepicker';
import 'react-quill/dist/quill.snow.css';
import 'react-datepicker/dist/react-datepicker.css';
import FileUploadArea from './FileUploadArea';
import { FormData, ResourceType, ContentType, UploadState } from './types';
import { MiddlewareReturn } from '@floating-ui/core';
import { MiddlewareState } from '@floating-ui/dom';
import { createPortal } from 'react-dom';
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
  editingResource
}) => {
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
  }) => {
    return (
      <div
        style={{
          position: 'absolute',
          zIndex: 9999,
          top: -200,
          left: 300
        }}
      >
        {children}
      </div>
    );
  };

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
    <div className="space-y-6 ">
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
            wrapperClassName="w-full"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
            // popperPlacement="top-start" // <-- Open above input
            // popperContainer={({ children }) => (
            //   <DatepickerPopperContainer>{children}</DatepickerPopperContainer>
            // )}
            popperModifiers={[
              {
                name: 'offset',
                options: {
                  offset: [0, 10]
                }
              }
            ]}
            popperContainer={DatepickerPopperContainer}
          />
        </div>
      </div>
    </div>
  );

  const renderFormContent = () => {
    switch (selectedResourceType) {
      case 'introduction':
        return renderIntroductionForm();
      case 'study-guide':
      case 'lecture':
        return renderContentForm();
      case 'assignment':
        return renderAssignmentForm();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {renderFormContent()}

      <div className="flex justify-end gap-3 pt-6">
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
    </div>
  );
};

export default ResourceForm;
