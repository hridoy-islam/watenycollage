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

import { useToast } from '@/components/ui/use-toast';
import { MAX_FILE_SIZE } from './components/utils';

import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  ContentType,
  Resource,
  ResourceType,
  UploadState
} from './components/types';
import type { FormData } from './components/types';
import ResourceTypeSelector from './components/ResourceTypeSelector';
import ResourceForm from './components/ResourceForm';
import ResourceList from './components/ResourceList';

function CourseModule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const [groupName, setGroupName] = useState<string>('');
  const [termName, setTermName] = useState<string>('');
  const [unitGroupId, setUnitGroupId] = useState<string>('');
  const [unitTermId, setUnitTermId] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<
    Record<string, any>
  >({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] =
    useState<ResourceType | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    startDate: null,
    finalDeadline: null,
    learningOutcomes: '',
    assessmentCriteria: [],
    finalFeedback: false,
    observation: false
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
  const [unitMaterial, setUnitMaterial] = useState<any>({});
  const [applicationId, setApplicationId] = useState(null);

  // ✅ Single loading state for all data fetching
  const fetchData = async () => {
    if (!unitId) return;

    try {
      setLoading(true);

      // Parallel API calls
      const requests = [
        axiosInstance.get(`/course-unit/${unitId}`),
        axiosInstance.get(`/unit-material?unitId=${unitId}&limit=all`),
        axiosInstance.get(`/assignment-settings?unitId=${unitId}&limit=all`)
      ];

      // Add student submissions request if student
      if (isStudent && user?._id) {
        requests.push(
          axiosInstance.get(
            `/assignment?studentId=${user._id}&unitId=${unitId}`
          )
        );

        requests.push(
          axiosInstance.get(
            `/application-course?studentId=${user._id}&courseId=${id}`
          )
        );
      }

      const responses = await Promise.all(requests);

      // Process course/unit info
      const unitRes = responses[0];
      setUnitTitle(unitRes.data.data.title || '');
      setCourseName(unitRes.data.data.courseId?.name || '');
      setGroupName(unitRes.data.data.groupId?.name || '');
      setTermName(unitRes.data.data.termId?.name || '');
      setUnitGroupId(unitRes.data.data.groupId?._id || '');
      setUnitTermId(unitRes.data.data.termId?._id || '');

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
            unitId
          });
        }

        const typeMap: Record<string, ResourceType> = {
          studyGuides: 'study-guide',
          lectures: 'lecture',
          learningOutcomes: 'learning-outcome'
        };

        Object.entries(typeMap).forEach(([key, resourceType]) => {
          const items = material[key] || [];
          items.forEach((item: any) => {
            mappedResources.push({
              _id: item._id,
              type: resourceType,
              title: item.title || '',
              content: item.content || '',
              fileUrl: item.fileUrl?.trim() || '',
              fileName: item.fileName?.trim() || '',
              learningOutcomes: item.learningOutcomes || '',
              assessmentCriteria:
                item.assessmentCriteria?.map((ao: any) => ({
                  _id: ao._id,
                  description: ao.description
                })) || [],
              finalFeedback: item.finalFeedback || false, // Added
              observation: item.observation || false, // Added

              unitId
            });
          });
        });
      }

      // Process assignments (stored in AssignmentSettings)
      // Teacher/Student: only show assignments that have been published
      const settingsRes = responses[2];
      const settingsList = settingsRes.data.data.result || [];
      const visibleSettings =
        user?.role === 'admin'
          ? settingsList
          : settingsList.filter((s: any) => s.status === 'published');
      visibleSettings.forEach((s: any) => {
        mappedResources.push({
          _id: s._id,
          type: 'assignment',
          title: s.assignmentTitle || '',
          content: s.description || '',
          startDate: s.startDate || '',
          finalDeadline: s.finalDeadline || '',
          finalFeedback: s.finalFeedback || false,
          observation: s.observation || false,
          unitId
        });
      });

      setResources(mappedResources);

      // Process student submissions (if applicable)
      if (isStudent && responses[3]) {
        const submissions = responses[3].data.data.result || [];
        const grouped: Record<string, any> = {};
        submissions.forEach((sub: any) => {
          grouped[sub.assignmentName] = sub;
        });
        setStudentSubmissions(grouped);
      }

      if (isStudent && responses[4]) {
        const appRes = responses[4];
        const apps = appRes.data.data.result || [];
        const appId = apps.length > 0 ? apps[0]._id : null;
        setApplicationId(appId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course data.',
        variant: 'destructive'
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
        startDate: editingResource.startDate
          ? new Date(editingResource.startDate)
          : null,
        finalDeadline: editingResource.finalDeadline
          ? new Date(editingResource.finalDeadline)
          : null,
        learningOutcomes: editingResource.learningOutcomes || '',
        assessmentCriteria: editingResource.assessmentCriteria || [],
        finalFeedback: editingResource.finalFeedback || false,
        observation: editingResource.observation || false
      });
      setUploadState({
        selectedDocument: editingResource.fileUrl || null,
        fileName: editingResource.fileName || null
      });
      setContentType(editingResource.content ? 'text' : 'upload');
      setSelectedResourceType(editingResource.type);
    } else {
      setFormData({
        title: '',
        content: '',
        startDate: null,
        finalDeadline: null,
        learningOutcomes: '',
        assessmentCriteria: [],
        finalFeedback: false,
        observation: false
      });
      setUploadState({ selectedDocument: null, fileName: null });
      setContentType('text');
    }
  }, [editingResource]);

  // ✅ File upload handler
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
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('entityId', user?._id);
      uploadFormData.append('file_type', 'resource');
      uploadFormData.append('file', file);

      const response = await axiosInstance.post('/documents', uploadFormData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (
        response.status === 200 &&
        response.data?.success &&
        response.data.data?.fileUrl
      ) {
        const fileUrl = response.data.data.fileUrl.trim();

        setUploadState({
          selectedDocument: fileUrl,
          fileName: file.name
        });

        setContentType('upload');
      } else {
        throw new Error('Upload failed: Invalid API response');
      }
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
    setFormData({
      title: '',
      content: '',
      startDate: null,
      finalDeadline: null,
      learningOutcomes: '',
      assessmentCriteria: [],
      finalFeedback: false,
      observation: false
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
      startDate: null,
      finalDeadline: null,
      learningOutcomes: '',
      assessmentCriteria: [],
      finalFeedback: false,
      observation: false
    });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  const validateAndSaveResource = async () => {
    if (!id || !unitId) {
      toast({
        title: 'Error',
        description: 'Course ID or Unit ID is missing.',
        variant: 'destructive'
      });
      return;
    }

    // === Handle Assignment Definition (Admin only) ===
    if (selectedResourceType === 'assignment') {
      if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'Only instructors can create assignments.',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.title?.trim()) {
        toast({
          title: 'Error',
          description: 'Assignment title is required.',
          variant: 'destructive'
        });
        return;
      }

      try {
        let existingMaterial: any = null;
        try {
          const res = await axiosInstance.get(
            `/unit-material?unitId=${unitId}&limit=1`
          );
          existingMaterial = res.data.data.result[0] || null;
        } catch (err) {
          // OK if not exists
        }

        // Convert dates to UTC midnight format
        const toUtcIso = (date: any) => {
          const d = date ? new Date(date) : null;
          if (!d || isNaN(d.getTime())) return undefined;
          return new Date(
            Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
          ).toISOString();
        };

        const newAssignment = {
          assignmentTitle: formData.title.trim(),
          description: formData.content?.trim() || '',
          startDate: toUtcIso(formData.startDate),
          finalDeadline: toUtcIso(formData.finalDeadline),
          finalFeedback: formData.finalFeedback || false,
          observation: formData.observation || false
        };

        let response;
        if (editingResource) {
          response = await axiosInstance.patch(
            `/assignment-settings/${editingResource._id}`,
            newAssignment
          );
          toast({ title: 'Assignment updated successfully!' });
        } else {
          response = await axiosInstance.post('/assignment-settings', {
            courseId: id,
            termId: unitTermId,
            groupId: unitGroupId,
            unitId,
            createdBy: user._id,
            unitMaterialId: existingMaterial?._id || unitMaterial?._id,
            assignmentResourceId: 'assignment-' + Date.now(),
            ...newAssignment
          });
          toast({ title: 'Assignment added successfully!' });
        }

        if (response.data?.data) {
          if (response.data.data.settings) {
            setUnitMaterial(
              response.data.data.courseUnitMaterial || unitMaterial
            );
          }
        }

        // ✅ Optmistic State Update (NO REFETCH)
        const updatedSettings = response.data?.data?.settings;
        const updatedId = editingResource
          ? editingResource._id
          : updatedSettings?._id || Date.now().toString();
        const optimisticAssignment = {
          _id: updatedId,
          type: 'assignment' as ResourceType,
          title: newAssignment.assignmentTitle,
          content: newAssignment.description,
          startDate: newAssignment.startDate,
          finalDeadline: newAssignment.finalDeadline,
          finalFeedback: newAssignment.finalFeedback,
          observation: newAssignment.observation,
          unitId
        };
        setResources(prev => {
          if (editingResource) {
            return prev.map(r =>
              r._id === editingResource._id
                ? { ...r, ...optimisticAssignment }
                : r
            );
          }
          return [...prev, optimisticAssignment as Resource];
        });

        resetForm();
        return;
      } catch (error) {
        console.error('Save assignment definition error:', error);
        toast({
          title: 'Failed to save assignment.',
          variant: 'destructive'
        });
        return;
      }
    }

    // === Handle other unit-material resources ===
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only instructors can create this type of resource.',
        variant: 'destructive'
      });
      return;
    }

    try {
      let existingMaterial: any = null;
      try {
        const res = await axiosInstance.get(
          `/unit-material?unitId=${unitId}&limit=1`
        );
        existingMaterial = res.data.data.result[0] || null;
      } catch (err) {
        // OK
      }

      let newResource: any = {
        title: formData.title?.trim() || undefined,
        content: formData.content?.trim() || undefined,
        learningOutcomes: formData.learningOutcomes?.trim() || undefined,
        assessmentCriteria:
          formData.assessmentCriteria.length > 0
            ? formData.assessmentCriteria
            : undefined
      };

      if (selectedResourceType === 'introduction') {
        newResource = {
          content: formData.content || '',
          title: formData.title?.trim() || undefined
        };
      }

      if (selectedResourceType === 'learning-outcome') {
        newResource.finalFeedback = formData.finalFeedback;
        newResource.observation = formData.observation;
      }

      if (uploadState.selectedDocument) {
        newResource.fileUrl = uploadState.selectedDocument;
      }
      if (uploadState.fileName) {
        newResource.fileName = uploadState.fileName;
      }

      let response;
      if (editingResource) {
        response = await axiosInstance.patch('/unit-material/resource', {
          materialId: existingMaterial?._id || unitMaterial?._id,
          resourceId: editingResource._id,
          resourceType: selectedResourceType,
          resource: newResource
        });
        toast({ title: 'Resource updated!' });
      } else {
        response = await axiosInstance.post('/unit-material/resource', {
          materialId: existingMaterial?._id,
          courseId: id,
          termId: unitTermId,
          groupId: unitGroupId,
          unitId,
          resourceType: selectedResourceType,
          resource: newResource
        });
        toast({ title: 'Resource added!' });
      }

      if (response.data?.data) {
        setUnitMaterial(response.data.data); // Store newly created parent doc
      }

      // ✅ Optmistic State Update (NO REFETCH)
      const updatedId = editingResource ? editingResource._id : (response.data?.data?._id || Date.now().toString());

      setResources(prev => {
        if (selectedResourceType === 'introduction') {
           const filtered = prev.filter(r => r.type !== 'introduction');
           return [...filtered, { _id: updatedId, type: 'introduction', content: formData.content || '', unitId }];
        }

        if (editingResource) {
          return prev.map(r => r._id === editingResource._id ? { ...r, ...newResource } : r);
        }

        return [...prev, { ...newResource, _id: updatedId, unitId } as Resource];
      });

      resetForm();
    } catch (error) {
      console.error('Save resource error:', error);
      toast({
        title: 'Failed to save resource.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    const resource = resources.find((r) => r._id === id);
    if (!resource) return;

    try {
      // Assignments now live in AssignmentSettings
      if (resource.type === 'assignment') {
        const response = await axiosInstance.delete(
          `/assignment-settings/${id}`
        );

        if (response.status === 200) {
          toast({ title: 'Assignment deleted successfully' });
          setResources(resources.filter((r) => r._id !== id));
        }
        return;
      }

      let updatePayload: any = {};

      if (resource.type === 'introduction') {
        updatePayload.introduction = null;
      } else if (resource.type === 'study-guide') {
        updatePayload.$pull = { studyGuides: { _id: id } };
      } else if (resource.type === 'lecture') {
        updatePayload.$pull = { lectures: { _id: id } };
      } else if (resource.type === 'learning-outcome') {
        updatePayload.$pull = { learningOutcomes: { _id: id } };
      } else {
        toast({
          title: 'Unsupported resource type',
          variant: 'destructive'
        });
        return;
      }

      const response = await axiosInstance.patch(
        `/unit-material/${unitMaterial?._id}`,
        updatePayload
      );

      if (response.status === 200) {
        toast({
          title: 'Resource deleted successfully'
        });
        // ✅ State already updating smoothly here!
        setResources(resources.filter((r) => r._id !== id));
      }
    } catch (error: any) {
      toast({
        title: 'Failed to delete resource',
        description:
          error?.response?.data?.message ||
          error.message ||
          'Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setSelectedResourceType(resource.type);
    setIsCreateDialogOpen(true);
  };

  const introductionExists = resources.some((r) => r.type === 'introduction');

  // ✅ Single loading state at the top
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen rounded-2xl p-4 bg-white">
      <div className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Section (Course + Unit Info) */}
          <div className="flex flex-col items-start gap-1 text-left">
            {/* Course Name on top */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {courseName || "Loading Course..."}
            </h1>

            {/* Breadcrumb below: Group -> Term -> Unit Title */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <GraduationCap className="h-4 w-4 " />
              <span>{groupName}</span>
              <span className="">/</span>
              <span>{termName}</span>
              <span className="">/</span>
              <span className="font-semibold text-watney">{unitTitle}</span>
            </div>
          </div>

          {/* Right Section (Buttons) */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Button
              onClick={() => navigate(-1)}
              size="sm"
              className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
            >
              <MoveLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {isAdmin && (
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Add Resource
                  </Button>
                </DialogTrigger>

                <DialogContent className="z-[9999] max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {editingResource
                        ? 'Edit Resource'
                        : 'Create New Resource'}
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
                      allResources={resources}
                      selectedParentId={null}
                      setSelectedParentId={() => {}}
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
            applicationId={applicationId}
          />
        ) : (
          <Card className="shadow-lg">
            <CardContent className=" text-center">
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