import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Plus,
  GraduationCap,
  MoveLeft,
  ChevronRight,
  BookOpen,
  CalendarRange
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useToast } from '@/components/ui/use-toast';
import { MAX_FILE_SIZE } from './components/utils';

import axiosInstance from '@/lib/axios';
import { useEffectiveRole } from '@/hooks/use-effective-role';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  ContentType,
  FormData as ResourceFormData,
  Resource,
  ResourceType,
  UploadState
} from './components/types';
import ResourceTypeSelector from './components/ResourceTypeSelector';
import ResourceForm from './components/ResourceForm';
import ResourceList from './components/ResourceList';

/** Maps a CourseUnitMaterial document to the flat resource list the UI renders. */
const mapMaterialToResources = (
  material: any,
  unitId?: string
): Resource[] => {
  if (!material) return [];

  const mapped: Resource[] = [];

  if (material.introduction) {
    mapped.push({
      // The introduction is a single embedded field, so the material's own id
      // is what identifies it.
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
    (material[key] || []).forEach((item: any) => {
      mapped.push({
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
        finalFeedback: item.finalFeedback || false,
        observation: item.observation || false,
        unitId
      });
    });
  });

  return mapped;
};

/** Maps an AssignmentSettings document to a resource row. */
const mapSettingsToResource = (settings: any, unitId?: string): Resource => ({
  _id: settings._id,
  type: 'assignment',
  status: settings.status,
  title: settings.assignmentTitle || '',
  content: settings.description || '',
  startDate: settings.startDate || '',
  finalDeadline: settings.finalDeadline || '',
  finalFeedback: settings.finalFeedback || false,
  observation: settings.observation || false,
  unitId
});

function CourseModule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  // `isAdmin` here means "may manage resources", which teachers may too - and
  // a teacher held as an employee with a "Teacher" designation is one, so the
  // effective role decides rather than the one stored on the record.
  const {
    user,
    effectiveRole,
    isTeacher,
    isAdmin: isAdminRole
  } = useEffectiveRole();
  const isAdmin = isAdminRole || isTeacher;
  const isStudent = effectiveRole === 'student';
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

  const [formData, setFormData] = useState<ResourceFormData>({
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
      setUnitMaterial(material || {});

      const settingsRes = responses[2];
      const settingsList = settingsRes.data.data.result || [];

      // A draft assignment is not a student's to see. The detail page behind
      // the "Open assignment" button already hides drafts from them, so
      // listing one here produced a card that led to an empty page - the
      // student was being offered an assignment that does not exist yet.
      const visibleSettings = isStudent
        ? settingsList.filter((settings: any) => settings.status === 'published')
        : settingsList;

      setResources([
        ...mapMaterialToResources(material, unitId),
        ...visibleSettings.map((settings: any) =>
          mapSettingsToResource(settings, unitId)
        )
      ]);

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
      startDate: undefined,
      finalDeadline: undefined,
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
      startDate: undefined,
      finalDeadline: undefined,
      learningOutcomes: '',
      assessmentCriteria: [],
      finalFeedback: false,
      observation: false
    });
    setUploadState({ selectedDocument: null, fileName: null });
    setContentType('text');
  };

  /**
   * Saves whichever resource kind the form is on.
   *
   * Both endpoints echo the saved document back, so local state is rebuilt
   * from the response rather than from the request payload - the payload has
   * no `type` and no server-assigned `_id`, which is why a newly created
   * resource used to stay invisible until the page was reloaded. Nothing here
   * refetches, and nothing here touches the page-level loading state.
   */
  const validateAndSaveResource = async () => {
    if (!id || !unitId) {
      toast({
        title: 'Error',
        description: 'Course ID or Unit ID is missing.',
        variant: 'destructive'
      });
      return;
    }

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only instructors can manage resources.',
        variant: 'destructive'
      });
      return;
    }

    // The parent material may not exist yet on the very first resource.
    const findExistingMaterial = async () => {
      try {
        const res = await axiosInstance.get(
          `/unit-material?unitId=${unitId}&limit=1`
        );
        return res.data.data.result[0] || null;
      } catch {
        return null;
      }
    };

    // ── Assignments live in AssignmentSettings, not in the material ──────
    if (selectedResourceType === 'assignment') {
      if (!formData.title?.trim()) {
        toast({
          title: 'Error',
          description: 'Assignment title is required.',
          variant: 'destructive'
        });
        return;
      }

      try {
        const existingMaterial = await findExistingMaterial();

        /** A picked date, stored as the calendar day it reads as. */
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

        const response = editingResource
          ? await axiosInstance.patch(
              `/assignment-settings/${editingResource._id}`,
              newAssignment
            )
          : await axiosInstance.post('/assignment-settings', {
              courseId: id,
              termId: unitTermId,
              groupId: unitGroupId,
              unitId,
              createdBy: user._id,
              unitMaterialId: existingMaterial?._id || unitMaterial?._id,
              assignmentResourceId: 'assignment-' + Date.now(),
              ...newAssignment
            });

        const saved = response.data?.data?.settings || response.data?.data || {};

        // Keep the material in sync when the API creates one alongside.
        if (response.data?.data?.courseUnitMaterial) {
          setUnitMaterial(response.data.data.courseUnitMaterial);
        }

        const savedAssignment = mapSettingsToResource(
          {
            _id: editingResource?._id || saved._id,
            ...newAssignment
          },
          unitId
        );

        setResources((prev) =>
          editingResource
            ? prev.map((r) =>
                r._id === editingResource._id ? savedAssignment : r
              )
            : [...prev, savedAssignment]
        );

        toast({
          title: editingResource
            ? 'Assignment updated successfully!'
            : 'Assignment added successfully!'
        });
        resetForm();
      } catch (error) {
        console.error('Save assignment definition error:', error);
        toast({
          title: 'Failed to save assignment.',
          variant: 'destructive'
        });
      }
      return;
    }

    // ── Everything else hangs off the unit material ──────────────────────
    try {
      const existingMaterial = await findExistingMaterial();

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

      const response = editingResource
        ? await axiosInstance.patch('/unit-material/resource', {
            materialId: existingMaterial?._id || unitMaterial?._id,
            resourceId: editingResource._id,
            resourceType: selectedResourceType,
            resource: newResource
          })
        : await axiosInstance.post('/unit-material/resource', {
            materialId: existingMaterial?._id,
            courseId: id,
            termId: unitTermId,
            groupId: unitGroupId,
            unitId,
            resourceType: selectedResourceType,
            resource: newResource
          });

      // The whole material comes back on both create and update, so the rows
      // are re-derived from it. Assignments are not part of it, so they are
      // carried over untouched.
      const savedMaterial = response.data?.data;

      if (savedMaterial) {
        setUnitMaterial(savedMaterial);
        setResources((prev) => [
          ...mapMaterialToResources(savedMaterial, unitId),
          ...prev.filter((r) => r.type === 'assignment')
        ]);
      }

      toast({ title: editingResource ? 'Resource updated!' : 'Resource added!' });
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Unit header */}
      <header className="border-b border-gray-200 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <nav className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-black">
              <span className="truncate">{courseName || 'Course'}</span>
              {termName && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{termName}</span>
                </>
              )}
              {groupName && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate">{groupName}</span>
                </>
              )}
              <ChevronRight className="h-3 w-3" />
              <span className="text-black">Resources</span>
            </nav>

            <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight text-black">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="min-w-0 truncate">
                {unitTitle || 'Course unit'}
              </span>
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-watney/5 px-2 py-1 text-[11px] font-medium text-black">
                <GraduationCap className="h-3 w-3" />
                {courseName || 'Course'}
              </span>
              {termName && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-watney/5 px-2 py-1 text-[11px] font-medium text-black">
                  <CalendarRange className="h-3 w-3" />
                  {termName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-watney/5 px-2 py-1 text-[11px] font-medium text-black">
                {resources.length} resource{resources.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              size="sm"
              className="h-9"
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
                    className="h-9 bg-watney text-white hover:bg-watney/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add resource
                  </Button>
                </DialogTrigger>

                <DialogContent className="z-[9999] max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-black">
                      {editingResource ? 'Edit resource' : 'Add a resource'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-black">
                      {unitTitle
                        ? `For ${unitTitle}`
                        : 'For this course unit'}
                    </DialogDescription>
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
      </header>

      {/* Resources */}
      <div className="px-5 py-4">
        {resources.length > 0 ? (
          <ResourceList
            resources={resources}
            studentSubmissions={studentSubmissions}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            applicationId={applicationId}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-watney/5 px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-watney shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </span>
            <h3 className="mt-3 text-base font-semibold text-black">
              No resources yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-black">
              {isAdmin
                ? 'Add an introduction, learning outcomes, study guides, lectures or assignments to build this unit out.'
                : 'Your tutor has not published anything for this unit yet.'}
            </p>
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4 bg-watney text-white hover:bg-watney/90"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add the first resource
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseModule;