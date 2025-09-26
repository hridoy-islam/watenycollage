import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, GraduationCap, MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Resource,
  FormData,
  UploadState,
  ResourceType,
  ContentType
} from './types';
import { useToast } from '@/components/ui/use-toast';
import { mockResources } from './components/mockData';
import { allowedFileTypes, MAX_FILE_SIZE } from './components/utils';
import ResourceTypeSelector from './components/ResourceTypeSelector';
import ResourceForm from './components/ResourceForm';
import ResourceList from './components/ResourceList';
import axiosInstance from '@/lib/axios';

function CourseModule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] =
    useState<ResourceType | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    deadline: new Date()
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    selectedDocument: null,
    fileName: null
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>('text');

  const [courseName, setCourseName] = useState<string>('');
  const [unitTitle, setUnitTitle] = useState<string>('');

  const fetchCourseAndUnit = async () => {
    try {
      // Fetch unit info
      const unitRes = await axiosInstance.get(`/course-unit/${unitId}`);
      setUnitTitle(unitRes.data.data.title);

      // Fetch course info
      setCourseName(unitRes?.data?.data.courseId?.name);
    } catch (error) {
      console.error('Error fetching course/unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course or unit information.',
        variant: 'destructive'
      });
    }
  };

  // Initialize form when editing
  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title || '',
        content: editingResource.content || '',
        deadline: editingResource.deadline
          ? new Date(editingResource.deadline)
          : new Date()
      });
      setUploadState({
        selectedDocument: editingResource.fileUrl || null,
        fileName: editingResource.fileName || null
      });
      setContentType(editingResource.content ? 'text' : 'upload');
      setSelectedResourceType(editingResource.type);
    }

    fetchCourseAndUnit();
  }, [editingResource]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingFile(true);
    setUploadProgress(0);

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File must be less than 5MB.',
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    const isValidType = allowedFileTypes.some((type) =>
      file.type.startsWith(type)
    );
    if (!isValidType) {
      toast({
        title: 'Invalid file type',
        description:
          'Please upload an image, PDF, Word document, or video file.',
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockFileUrl = `/documents/${file.name}`;
      setUploadState({
        selectedDocument: mockFileUrl,
        fileName: file.name
      });

      toast({
        title: 'Success',
        description: 'Document uploaded successfully!'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload document. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'Could not upload your document.',
        variant: 'destructive'
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleResourceTypeSelect = (type: ResourceType) => {
    setEditingResource(null);
    setSelectedResourceType(type);
    setFormData({ title: '', content: '', deadline: new Date() });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  const validateAndSaveResource = () => {
    if (selectedResourceType === 'introduction') {
      if (!formData.content) {
        toast({
          title: 'Content required',
          description: 'Please enter some content for the introduction.',
          variant: 'destructive'
        });
        return;
      }

      if (
        !editingResource &&
        resources.some((r) => r.type === 'introduction')
      ) {
        toast({
          title: 'Introduction exists',
          description: 'Only one introduction is allowed per course.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (selectedResourceType !== 'introduction' && !formData.title) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for this resource.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedResourceType === 'assignment') {
      if (!formData.deadline) {
        toast({
          title: 'Deadline required',
          description: 'Please set a deadline for the assignment.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (selectedResourceType !== 'assignment') {
      if (contentType === 'text' && !formData.content) {
        toast({
          title: 'Content required',
          description: 'Please enter some content.',
          variant: 'destructive'
        });
        return;
      }

      if (contentType === 'upload' && !uploadState.selectedDocument) {
        toast({
          title: 'File required',
          description: 'Please upload a file.',
          variant: 'destructive'
        });
        return;
      }
    }

    const newResource: Resource = {
      id: editingResource?.id || Date.now().toString(),
      type: selectedResourceType!,
      title:
        selectedResourceType === 'introduction' ? undefined : formData.title,
      content: contentType === 'text' ? formData.content : undefined,
      fileUrl:
        contentType === 'upload' ? uploadState.selectedDocument : undefined,
      fileName: contentType === 'upload' ? uploadState.fileName : undefined,
      deadline:
        selectedResourceType === 'assignment'
          ? formData.deadline.toISOString()
          : undefined,
      createdAt: editingResource?.createdAt || new Date().toISOString()
    };

    if (editingResource) {
      setResources((prev) =>
        prev.map((r) => (r.id === editingResource.id ? newResource : r))
      );
      toast({
        title: 'Success',
        description: 'Resource updated successfully!'
      });
    } else {
      setResources((prev) => [...prev, newResource]);
      toast({
        title: 'Success',
        description: 'Resource created successfully!'
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsCreateDialogOpen(false);
    setSelectedResourceType(null);
    setEditingResource(null);
    setFormData({ title: '', content: '', deadline: new Date() });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((resource) => resource.id !== id));
    toast({
      title: 'Resource deleted',
      description: 'The resource has been removed successfully.'
    });
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setIsCreateDialogOpen(true);
  };

  const introductionExists = resources.some((r) => r.type === 'introduction');

  return (
    <div className="min-h-screen">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-900">
              <span className="text-blue-600">{courseName}</span>
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-700">{unitTitle}</span>
            </h1>
          </div>
          <div className="flex flex-row items-center justify-end gap-4">
            <Button
              className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
              onClick={() => navigate(-1)}
              size="sm"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-watney text-white shadow-lg hover:bg-watney/90"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Resource
                </Button>
              </DialogTrigger>

              <DialogContent className="z-[9999] max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {editingResource ? 'Edit Resource' : 'Create New Resource'}
                  </DialogTitle>
                </DialogHeader>

                {!selectedResourceType ? (
                  <ResourceTypeSelector
                    onSelect={handleResourceTypeSelect}
                    hasIntroduction={introductionExists}
                    editingResource={!!editingResource}
                  />
                ) : (
                  <ResourceForm
                    selectedResourceType={selectedResourceType}
                    formData={formData}
                    setFormData={setFormData}
                    contentType={contentType}
                    setContentType={setContentType}
                    uploadState={uploadState}
                    uploadingFile={uploadingFile}
                    uploadProgress={uploadProgress}
                    uploadError={uploadError}
                    onFileChange={handleFileChange}
                    onSave={validateAndSaveResource}
                    onCancel={resetForm}
                    editingResource={!!editingResource}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Sections */}
        {resources.length > 0 ? (
          <ResourceList
            resources={resources}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
          />
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <GraduationCap className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                No Resources Yet
              </h3>
              <p className="mb-6 text-slate-600">
                Get started by creating your first course resource.
              </p>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Resource
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CourseModule;
