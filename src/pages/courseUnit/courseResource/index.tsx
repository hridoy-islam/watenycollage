import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, GraduationCap, MoveLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import {
  Resource,
  UploadState,
  ResourceType,
  ContentType,
} from './components/types';
import { useToast } from '@/components/ui/use-toast';
import { allowedFileTypes, MAX_FILE_SIZE } from './components/utils';
import ResourceTypeSelector from './components/ResourceTypeSelector';
import ResourceForm from './components/ResourceForm';
import ResourceList from './components/ResourceList';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';

function CourseModule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [resources, setResources] = useState<Resource[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Record<string, any>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true); 

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    deadline: undefined,
    learningOutcomes: '',
    assessmentCriteria: [],
  });

  const [uploadState, setUploadState] = useState<UploadState>({
    selectedDocument: null,
    fileName: null,
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>('text');

  const [courseName, setCourseName] = useState<string>('');
  const [unitTitle, setUnitTitle] = useState<string>('');
  const [unitMaterial, setUnitMaterial] = useState<string>({});

  // ✅ Optimized: Fetch all data in parallel
  const fetchData = async () => {
    if (!unitId) return;
    
    try {
      setLoading(true);
      
      // Parallel API calls
      const requests = [
        axiosInstance.get(`/course-unit/${unitId}`),
        axiosInstance.get(`/unit-material?unitId=${unitId}&limit=all`)
      ];
      
      // Add student submissions request if student
      if (isStudent && user?._id) {
        requests.push(
          axiosInstance.get(`/assignment?studentId=${user._id}&unitId=${unitId}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Process course/unit info
      const unitRes = responses[0];
      setUnitTitle(unitRes.data.data.title || '');
      setCourseName(unitRes.data.data.courseId?.name || '');
      
      // Process resources
      const materialRes = responses[1];
      const material = materialRes.data.data.result[0];
      const mappedResources: Resource[] = [];
setUnitMaterial(material || {});
      if (material) {
        if (material.introduction) {
          mappedResources.push({
            _id: material._id,
            type: 'introduction',
            content: material.introduction.content || '',
            title: undefined,
            unitId,
          });
        }

        const typeMap: Record<string, ResourceType> = {
          studyGuides: 'study-guide',
          lectures: 'lecture',
          learningOutcomes: 'learning-outcome',
          assignments: 'assignment',
        };

        Object.entries(typeMap).forEach(([key, resourceType]) => {
          const items = material[key] || [];
          items.forEach((item: any) => {
            mappedResources.push({
              _id: item._id,
              type: resourceType,
              title: item.title || '',
              deadline: item.deadline || undefined,
              content: item.content || '',
              fileUrl: item.fileUrl?.trim() || '',
              fileName: item.fileName?.trim() || '',
              learningOutcomes: item.learningOutcomes || '',
              assessmentCriteria:
                item.assessmentCriteria?.map((ao: any) => ({
                  _id: ao._id,
                  description: ao.description,
                })) || [],
              unitId,
            });
          });
        });
      }

      setResources(mappedResources);
      
      // Process student submissions (if applicable)
      if (isStudent && responses[2]) {
        const submissions = responses[2].data.data.result || [];
        const grouped = {};
        submissions.forEach((sub) => {
          grouped[sub.assignmentName] = sub;
        });
        setStudentSubmissions(grouped);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) {
      fetchData();
    }
  }, [unitId, isStudent, user?._id]);

  // Initialize form when editing
  useEffect(() => {
    if (editingResource) {
      setFormData({
        title: editingResource.title || '',
        content: editingResource.content || '',
        deadline: editingResource.deadline || null,
        learningOutcomes: editingResource.learningOutcomes || '',
        assessmentCriteria: editingResource.assessmentCriteria || [],
      });
      setUploadState({
        selectedDocument: editingResource.fileUrl || null,
        fileName: editingResource.fileName || null,
      });
      setContentType(editingResource.content ? 'text' : 'upload');
      setSelectedResourceType(editingResource.type);
    } else {
      setFormData({
        title: '',
        content: '',
        deadline: null,
        learningOutcomes: '',
        assessmentCriteria: [],
      });
      setUploadState({ selectedDocument: null, fileName: null });
      setContentType('text');
    }
  }, [editingResource]);

  // ✅ File upload handler (unchanged)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingFile(true);
    setUploadProgress(0);

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File must be less than 20MB.',
        variant: 'destructive',
      });
      setUploadingFile(false);
      return;
    }


    try {
      const formData = new FormData();
      formData.append('entityId', user?._id);
      formData.append('file_type', 'resource');
      formData.append('file', file);

      const response = await axiosInstance.post('/documents', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (
        response.status === 200 &&
        response.data?.success &&
        response.data.data?.fileUrl
      ) {
        const fileUrl = response.data.data.fileUrl.trim();
        setUploadState({
          selectedDocument: fileUrl,
          fileName: file.name,
        });
        toast({
          title: 'Success',
          description: 'Document uploaded successfully!',
        });
      } else {
        throw new Error('Upload failed: Invalid API response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload document. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'Could not upload your document.',
        variant: 'destructive',
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleResourceTypeSelect = (type: ResourceType) => {
    setEditingResource(null);
    setSelectedResourceType(type);
    setFormData({
      title: '',
      content: '',
      deadline: undefined,
      learningOutcomes: '',
      assessmentCriteria: [],
    });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  const resetForm = () => {
    setIsCreateDialogOpen(false);
    setSelectedResourceType(null);
    setEditingResource(null);
    setFormData({
      title: '',
      content: '',
      deadline: undefined,
      learningOutcomes: '',
      assessmentCriteria: [],
    });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  const validateAndSaveResource = async () => {
    if (!id || !unitId) {
      toast({
        title: 'Error',
        description: 'Course ID or Unit ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    // === Handle Assignment Definition (Admin only) ===
    if (selectedResourceType === 'assignment') {
      if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'Only instructors can create assignments.',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.title?.trim()) {
        toast({
          title: 'Error',
          description: 'Assignment title is required.',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.deadline) {
        toast({
          title: 'Error',
          description: 'Deadline is required.',
          variant: 'destructive',
        });
        return;
      }

      try {
        let existingMaterial: any = null;
        try {
          const res = await axiosInstance.get(`/unit-material?unitId=${unitId}&limit=1`);
          existingMaterial = res.data.data.result[0] || null;
        } catch (err) {
          // OK if not exists
        }

        const newAssignment = {
          title: formData.title.trim(),
          deadline: formData.deadline,
          type: 'assignment',
        };

        const payload: any = {
          courseId: id,
          unitId,
        };

        let currentAssignments = existingMaterial?.assignments || [];

        if (editingResource) {
          currentAssignments = currentAssignments.map((item: any) =>
            item._id === editingResource._id
              ? { ...newAssignment, _id: item._id }
              : item
          );
        } else {
          currentAssignments = [...currentAssignments, newAssignment];
        }

        payload.assignments = currentAssignments;

        if (existingMaterial) {
          await axiosInstance.patch(`/unit-material/${existingMaterial._id}`, payload);
          toast({ title: 'Assignment updated successfully!' });
        } else {
          await axiosInstance.post('/unit-material', payload);
          toast({ title: 'Assignment created successfully!' });
        }

        fetchData(); // ✅ Refresh all data
        resetForm();
        return;
      } catch (error) {
        console.error('Save assignment definition error:', error);
        toast({
          title: 'Failed to save assignment.',
          variant: 'destructive',
        });
        return;
      }
    }

    // === Handle other unit-material resources ===
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only instructors can create this type of resource.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let existingMaterial: any = null;
      try {
        const res = await axiosInstance.get(`/unit-material?unitId=${unitId}&limit=1`);
        existingMaterial = res.data.data.result[0] || null;
      } catch (err) {
        // OK
      }

      const payload: any = { courseId: id, unitId };

      if (selectedResourceType === 'introduction') {
        payload.introduction = {
          type: 'introduction',
          content: formData.content || '',
        };
      } else {
        const fieldMap: Record<
          Exclude<ResourceType, 'introduction' | 'assignment'>,
          string
        > = {
          'study-guide': 'studyGuides',
          lecture: 'lectures',
          'learning-outcome': 'learningOutcomes',
        };

        const targetField = fieldMap[
          selectedResourceType as Exclude<ResourceType, 'introduction' | 'assignment'>
        ];

        if (!targetField) {
          throw new Error(`Unsupported resource type: ${selectedResourceType}`);
        }

        const newResource: any = {
          type: selectedResourceType,
          title: formData.title || undefined,
          content: contentType === 'text' ? formData.content : undefined,
          learningOutcomes: formData.learningOutcomes || undefined,
          assessmentCriteria:
            formData.assessmentCriteria.length > 0
              ? formData.assessmentCriteria
              : undefined,
        };

        if (contentType === 'upload' && uploadState.selectedDocument) {
          newResource.fileUrl = uploadState.selectedDocument;
          newResource.fileName = uploadState.fileName;
        }

        let currentArray: any[] = existingMaterial?.[targetField] || [];

        if (editingResource) {
          currentArray = currentArray.map((item: any) =>
            item._id === editingResource._id
              ? { ...newResource, _id: item._id }
              : item
          );
        } else {
          currentArray = [...currentArray, newResource];
        }

        payload[targetField] = currentArray;
      }

      if (existingMaterial) {
        await axiosInstance.patch(`/unit-material/${existingMaterial._id}`, payload);
      } else {
        await axiosInstance.post('/unit-material', payload);
      }

      toast({ title: editingResource ? 'Resource updated!' : 'Resource created!' });
      fetchData(); // ✅ Refresh all data
      resetForm();
    } catch (error) {
      console.error('Save resource error:', error);
      toast({
        title: 'Failed to save resource.',
        variant: 'destructive',
      });
    }
  };

const handleDeleteResource = async (id: string) => {
  const resource = resources.find((r) => r._id === id);
  if (!resource) return;

  try {
    // Determine which section the resource belongs to
    let updatePayload: any = {};

    if (resource.type === 'introduction') {
      // Set introduction to null or remove it
      updatePayload.introduction = null;
    } else if (resource.type === 'study-guide') {
      updatePayload.$pull = { studyGuides: { _id: id } };
    } else if (resource.type === 'lecture') {
      updatePayload.$pull = { lectures: { _id: id } };
    } else if (resource.type === 'learning-outcome') {
      updatePayload.$pull = { learningOutcomes: { _id: id } };
    } else if (resource.type === 'assignment') {
      updatePayload.$pull = { assignments: { _id: id } };
    } else {
      toast({
        title: 'Unsupported resource type',
        variant: 'destructive',
      });
      return;
    }

    const response = await axiosInstance.patch(`/unit-material/${unitMaterial?._id}`, updatePayload);

    if (response.status === 200) {
      toast({
        title: 'Resource deleted successfully',
      });
      setResources(resources.filter(r => r._id !== id));
    }
  } catch (error: any) {
    toast({
      title: 'Failed to delete resource',
      description: error?.response?.data?.message || error.message || 'Please try again.',
      variant: 'destructive',
    });
  }
};

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setSelectedResourceType(resource.type);
    setIsCreateDialogOpen(true);
  };

  const introductionExists = resources.some((r) => r.type === 'introduction');

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    return moment(date).format('DD MMM, YYYY');
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-2">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-sm font-semibold text-slate-900">
            Course Name: <span className="text-slate-700 font-medium">{courseName}</span> <br />
            Unit Name: <span className="text-slate-700 font-medium">{unitTitle}</span>
          </h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate(-1)} size="sm" className='bg-watney text-white hover:bg-watney/90'>
              <MoveLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Admin: Full resource creation */}
            {isAdmin && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-watney text-white hover:bg-watney/90">
                    <Plus className="mr-2 h-5 w-5" /> Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent className="z-[9999] max-h-[90vh] max-w-4xl overflow-y-auto ">
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
            )}
          </div>
        </div>

        {resources.length > 0 ? (
          <ResourceList
            resources={resources}
            studentSubmissions={studentSubmissions}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            formatDate={formatDate}
          />
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <GraduationCap className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-xl font-semibold">No Resources Yet</h3>
              <p className="mb-6 text-slate-600">
                {isAdmin
                  ? 'Get started by creating your first course resource.'
                  : 'No assignments available yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CourseModule;