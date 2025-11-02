import type React from 'react';
import { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams
} from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Plus,
  Eye
} from 'lucide-react';
import moment, { type Moment } from 'moment';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';
import { AssignmentList } from './components/AssignmentList';
import { AssignmentHeader } from './components/AssignmentHeader';
import { AssignmentContent } from './components/AssignmentContent';
import { AssignmentTimeline } from './components/AssignmentTimeline';
import { SubmissionDialog } from './components/SubmissionDialog';
import { FinalFeedbackDialog } from './components/FinalFeedbackDialog';
import { ObservationFeedbackDialog } from './components/ObservationFeedbackDialog';
import { set } from 'date-fns';
interface Submission {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  files: string[];
  comment?: string;
  deadline?: string;

  seen: boolean;
  status: 'submitted' | 'resubmitted';
  createdAt: string;
}

interface Feedback {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  comment?: string;
  files: string[];
  seen: boolean;
  deadline?: string;
  createdAt: string;
}

interface Assignment {
  _id: string;
  applicationId: string;
  unitId: {
    _id: string;
    title: string;
    unitReference: string;
    level: string;
    gls: string;
    credit: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseMaterialAssignmentId: string;
  assignmentName: string;
  submissions: Submission[];
  feedbacks: Feedback[];
  status: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
  finalFeedback?: any; // Add this line
  observationFeedback?: any; // Add this line
  isFinalFeedback?: boolean;
  isObservationFeedback?: boolean;
}

interface CourseUnit {
  _id: string;
  title: string;
  unitReference: string;
  level: string;
  gls: string;
  credit: string;
}

type FormState = {
  comment: string;
  files: { url: string; name: string }[];
  requireResubmit?: boolean;
  resubmissionDeadline?: Date;
  isAdminSubmission?: boolean;
  uploadError?: string;
};

type TimelineItem =
  | { type: 'submission'; data: Submission & { createdAt: Moment } }
  | { type: 'feedback'; data: Feedback & { createdAt: Moment } };

const getTimeline = (assignment: Assignment | null): TimelineItem[] => {
  if (!assignment) return [];

  const submissions = (assignment.submissions || [])
    .map((s) => ({
      type: 'submission' as const,
      data: { ...s, createdAt: moment(s.createdAt) }
    }))
    .sort((a, b) => a.data.createdAt.valueOf() - b.data.createdAt.valueOf());

  const feedbacks = (assignment.feedbacks || [])
    .map((f) => ({
      type: 'feedback' as const,
      data: { ...f, createdAt: moment(f.createdAt) }
    }))
    .sort((a, b) => a.data.createdAt.valueOf() - b.data.createdAt.valueOf());

  const allItems: any = [...submissions, ...feedbacks].sort(
    (a, b) => a.data.createdAt.valueOf() - b.data.createdAt.valueOf()
  );

  return allItems;
};

// Add this helper function in your main component
const canStudentEditSubmission = (
  submission: Submission,
  assignment: Assignment | null
): boolean => {
  if (!assignment) return false;

  // Find the index of this submission
  const submissionIndex = assignment.submissions.findIndex(
    (s) => s._id === submission._id
  );

  // If this is not the latest submission, cannot edit
  if (submissionIndex !== assignment.submissions.length - 1) {
    return false;
  }

  // If there are any feedbacks after this submission, cannot edit
  const submissionTime = moment(submission.createdAt);
  const hasFeedbackAfterSubmission = assignment.feedbacks.some((feedback) =>
    moment(feedback.createdAt).isAfter(submissionTime)
  );

  return !hasFeedbackAfterSubmission;
};

const AssignmentDetailPage = () => {
  const { id: applicationId, studentId, unitId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const [unitMaterial, setUnitMaterial] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [courseUnit, setCourseUnit] = useState<CourseUnit | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formState, setFormState] = useState<Record<string, FormState>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'submission' | 'feedback';
    id: string;
  } | null>(null);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState(0);
  const [finalFeedbackDialogOpen, setFinalFeedbackDialogOpen] = useState(false);
  const [submittingFinalFeedback, setSubmittingFinalFeedback] = useState(false);

  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [submittingObservation, setSubmittingObservation] = useState(false);
  const counter = () => {
    setCount((prev) => prev + 1);
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher';

  const location = useLocation();
  const assignmentIdFromState =
    searchParams.get('assignmentId') || location.state?.assignmentId;
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [markingCompleted, setMarkingCompleted] = useState(false);
  const [editingFinalFeedback, setEditingFinalFeedback] = useState(false);
  const [editingObservation, setEditingObservation] = useState(false);

  const getUnseenCounts = (assignment: Assignment) => {
    if (isStudent) {
      const unseenFeedbacks = assignment.feedbacks.filter(
        (feedback) => !feedback.seen
      ).length;
      return unseenFeedbacks;
    } else if (isTeacher) {
      const unseenSubmissions = assignment.submissions.filter(
        (submission) => !submission.seen
      ).length;
      return unseenSubmissions;
    }
    return 0;
  };

  // const getAssignmentContent = () => {
  //   if (!selectedAssignment || !unitMaterial?.assignments) return null;

  //   const materialAssignment = unitMaterial.assignments.find(
  //     (a: any) => a.title === selectedAssignment.assignmentName
  //   );

  //   return materialAssignment?.content || null;
  // };

  const getAssignmentContent = () => {
    if (!selectedAssignment || !unitMaterial?.assignments) return null;

    const materialAssignment = unitMaterial.assignments.find(
      (a: any) =>
        a._id.toString() === selectedAssignment.courseMaterialAssignmentId
    );

    return materialAssignment?.content || null;
  };

  const markItemsAsSeen = async (assignment: Assignment) => {
    if (!assignment) return;

    try {
      // Only proceed for the selected assignment
      if (!selectedAssignment || selectedAssignment._id !== assignment._id)
        return;

      let itemsToUpdate: string[] = [];

      if (isStudent) {
        // Handle regular feedbacks (if any)
        const unseenFeedbackIds = assignment.feedbacks
          .filter((feedback) => !feedback.seen)
          .map((feedback) => feedback._id);
        itemsToUpdate = unseenFeedbackIds;
      } else if (isTeacher) {
        const unseenSubmissionIds = assignment.submissions
          .filter((submission) => !submission.seen)
          .map((submission) => submission._id);
        itemsToUpdate = unseenSubmissionIds;
      }

      const updateData: any = { $set: {} };

      if (isStudent) {
        // Update feedbacks
        assignment.feedbacks.forEach((feedback, index) => {
          if (itemsToUpdate.includes(feedback._id)) {
            updateData.$set[`feedbacks.${index}.seen`] = true;
          }
        });

        // Update finalFeedback if exists and unseen
        if (assignment.finalFeedback && !assignment.finalFeedback.seen) {
          updateData.$set['finalFeedback.seen'] = true;
        }

        // Update finalFeedback if exists and unseen
        if (
          assignment.observationFeedback &&
          !assignment.observationFeedback.seen
        ) {
          updateData.$set['observationFeedback.seen'] = true;
        }
      } else if (isTeacher) {
        assignment.submissions.forEach((submission, index) => {
          if (itemsToUpdate.includes(submission._id)) {
            updateData.$set[`submissions.${index}.seen`] = true;
          }
        });
      }

      if (Object.keys(updateData.$set).length === 0) return;

      await axiosInstance.patch(`/assignment/${assignment._id}`, updateData);

      // Update only the selected assignment locally
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === assignment._id ? { ...a, ...updateData.$set } : a
        )
      );

      setSelectedAssignment((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };

        if (isStudent) {
          updated.feedbacks = prev.feedbacks.map((feedback, index) =>
            itemsToUpdate.includes(feedback._id)
              ? { ...feedback, seen: true }
              : feedback
          );
          if (updated.finalFeedback) {
            updated.finalFeedback = { ...updated.finalFeedback, seen: true };
          }

          if (updated.observationFeedback) {
            updated.observationFeedback = {
              ...updated.observationFeedback,
              seen: true
            };
          }
        } else if (isTeacher) {
          updated.submissions = prev.submissions.map((submission, index) =>
            itemsToUpdate.includes(submission._id)
              ? { ...submission, seen: true }
              : submission
          );
        }

        return updated;
      });
    } catch (error) {
      console.error('Error marking items as seen:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Store the current selected assignment ID before refetching
      const currentSelectedId = selectedAssignment?._id;

      const studentRes = await axiosInstance.get(
        `/users/${studentId}?fields=name,firstName,initial,lastName,email,role`
      );
      setStudentName(studentRes.data.data.name || 'Unknown');

      const unitRes = await axiosInstance.get(`/course-unit/${unitId}`);
      setCourseUnit(unitRes.data.data);

      const unitMaterialRes = await axiosInstance.get(`/unit-material`, {
        params: { unitId, limit: 'all' }
      });

      const existingAssignmentsRes = await axiosInstance.get(`/assignment`, {
        params: { applicationId, unitId, studentId, limit: 'all' }
      });

      const existingAssignments = existingAssignmentsRes.data.data.result || [];
      const unitMaterial = unitMaterialRes.data.data.result[0];
      setUnitMaterial(unitMaterial);
      let assignmentsData: Assignment[] = [];

      if (
        unitMaterial &&
        unitMaterial.assignments &&
        unitMaterial.assignments.length > 0
      ) {
        assignmentsData = unitMaterial.assignments.map(
          (materialAssignment: any, index: number) => {
            const existingAssignment = existingAssignments.find(
              (ea: Assignment) =>
                ea.courseMaterialAssignmentId ===
                materialAssignment?._id.toString()
            );

            if (existingAssignment) {
              return existingAssignment;
            }

            return {
              _id: materialAssignment._id || `material-${index}`,
              applicationId: applicationId || '',
              unitId: {
                _id: unitId || '',
                title: courseUnit?.title || '',
                unitReference: courseUnit?.unitReference || '',
                level: courseUnit?.level || '',
                gls: courseUnit?.gls || '',
                credit: courseUnit?.credit || ''
              },
              studentId: {
                _id: studentId || '',
                name: studentName,
                email: ''
              },
              unitMaterialId: unitMaterial?._id,
              courseMaterialAssignmentId: materialAssignment._id.toString(),
              assignmentName:
                materialAssignment.title || `Assignment ${index + 1}`,
              submissions: [],
              feedbacks: [],
              status: 'not_submitted',
              deadline: materialAssignment.deadline,
              requireResubmit: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
        );
      }

      setAssignments(assignmentsData);

      let assignmentToSelect: Assignment | null = null;

      // Priority 1: Use current selected assignment if it still exists
      if (currentSelectedId && assignmentsData.length > 0) {
        assignmentToSelect =
          assignmentsData.find(
            (assignment) => assignment._id === currentSelectedId
          ) || null;
      }

      // Priority 2: Use assignment from state (for navigation from assignment list)
      if (
        !assignmentToSelect &&
        assignmentIdFromState &&
        assignmentsData.length > 0
      ) {
        assignmentToSelect =
          assignmentsData.find(
            (assignment) => assignment._id === assignmentIdFromState
          ) || null;
      }

      // Priority 3: Use assignment from unit-material (when coming from StudentAssignmentsPage)
      if (
        !assignmentToSelect &&
        assignmentIdFromState &&
        assignmentsData.length > 0
      ) {
        // Find assignment by matching the unit-material assignment ID
        assignmentToSelect =
          assignmentsData.find(
            (assignment) => assignment._id === assignmentIdFromState
          ) ||
          // If not found by ID, try to find by assignment name from state
          assignmentsData.find(
            (assignment) => assignment.assignmentName === assignmentIdFromState
          ) ||
          null;
      }

      // Priority 4: Fall back to first assignment
      if (!assignmentToSelect && assignmentsData.length > 0) {
        assignmentToSelect = assignmentsData[0];
      }

      if (assignmentToSelect) {
        setSelectedAssignment(assignmentToSelect);
        markItemsAsSeen(assignmentToSelect);
        if (!formState[assignmentToSelect._id]) {
          setFormState((prev) => ({
            ...prev,
            [assignmentToSelect!._id]: {
              comment: '',
              files: [],
              requireResubmit: false,
              resubmissionDeadline: undefined,
              isAdminSubmission: false
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId && unitId && studentId) {
      fetchData();
    }
  }, [applicationId, unitId, studentId, count]);

  useEffect(() => {
    if (assignmentIdFromState || location.state?.assignmentId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    assignmentIdFromState,
    location.state?.assignmentId,
    location.pathname,
    navigate
  ]);

  useEffect(() => {
    if (selectedAssignment) {
      markItemsAsSeen(selectedAssignment);
    }
  }, [selectedAssignment]);

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileNameWithTimestamp = urlParts[urlParts.length - 1];
      const fileName = fileNameWithTimestamp.split('-').slice(1).join('-');
      return fileName || 'document';
    } catch {
      return 'document';
    }
  };

  const getEffectiveDeadline = (
    assignment: Assignment | null
  ): moment.Moment | null => {
    if (!assignment) return null;

    // Priority 1: Check if there's a feedback deadline (for resubmission)
    const feedbacksWithDeadline = assignment.feedbacks
      .filter((feedback) => feedback.deadline)
      .sort(
        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );

    if (feedbacksWithDeadline.length > 0) {
      return moment(feedbacksWithDeadline[0].deadline);
    }

    // Priority 2: Check unit material deadline (for first submission)
    if (!unitMaterial?.assignments) return null;

    const materialAssignment = unitMaterial.assignments.find(
      (a: any) => a.title === assignment.assignmentName
    );

    return materialAssignment?.deadline
      ? moment(materialAssignment.deadline)
      : null;
  };

  const canStudentSubmit = (assignment: Assignment | null): boolean => {
    if (!assignment || !isStudent) return false;

    // Check if assignment is completed
    if (assignment.status === 'completed') return false;

    // Get the most recent feedback with deadline (for resubmission)
    const getLatestFeedbackDeadline = (): moment.Moment | null => {
      const feedbacksWithDeadline = assignment.feedbacks
        .filter((feedback) => feedback.deadline)
        .sort(
          (a, b) =>
            moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
        );

      return feedbacksWithDeadline.length > 0
        ? moment(feedbacksWithDeadline[0].deadline)
        : null;
    };

    // Get unit material deadline for this specific assignment
    const getUnitMaterialDeadline = (): moment.Moment | null => {
      if (!unitMaterial?.assignments) return null;

      const materialAssignment = unitMaterial.assignments.find(
        (a: any) => a.title === assignment.assignmentName
      );

      return materialAssignment?.deadline
        ? moment(materialAssignment.deadline)
        : null;
    };

    const feedbackDeadline = getLatestFeedbackDeadline();
    const unitMaterialDeadline = getUnitMaterialDeadline();

    const hasStudentSubmittedBefore = assignment.submissions.length > 0;
    const requiresResubmission = assignment.requireResubmit;

    // Scenario 1: First time submission (no submissions yet)
    if (!hasStudentSubmittedBefore) {
      // REMOVED: Deadline check for first submission
      // Allow submission even if deadline has passed
      return true;
    }

    // Scenario 2: Resubmission required (teacher gave feedback with resubmission)
    if (requiresResubmission) {
      // Check feedback deadline first
      if (feedbackDeadline) {
        // REMOVED: Deadline check for resubmission
        // Allow resubmission even if feedback deadline has passed
        return true;
      }
      // If no feedback deadline but resubmission required, allow submission
      return true;
    }

    // Scenario 3: Student has submitted before but no resubmission required
    // In this case, student cannot submit again unless teacher requires resubmission
    return false;
  };

  // Calculate values for the current selected assignment
  const effectiveDeadline = selectedAssignment
    ? getEffectiveDeadline(selectedAssignment)
    : null;
  const isDeadlinePassed = effectiveDeadline
    ? moment().isAfter(effectiveDeadline)
    : false;
  const requireResubmission = selectedAssignment?.requireResubmit || false;
  const isCompleted = selectedAssignment?.status === 'completed';
  const canStudentSubmitCurrent = selectedAssignment
    ? canStudentSubmit(selectedAssignment)
    : false;
  const canTeacherSubmit = isTeacher;

  const hasStudentSubmitted =
    isStudent &&
    selectedAssignment?.status !== 'not_submitted' &&
    !selectedAssignment?.requireResubmit;

  const isFormDisabled = isStudent && !canStudentSubmitCurrent && !editingItem;

  // const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!selectedAssignment || (isStudent && isFormDisabled)) return;
  //   const files = Array.from(e.target.files || []);
  //   if (files.length === 0) return;

  //   setUploadingFiles(true);
  //   for (const file of files) {
  //     try {
  //       const formData = new FormData();
  //       formData.append('entityId', studentId || '');
  //       formData.append(
  //         'file_type',
  //         isStudent ? 'assignment_submission' : 'assignment_feedback'
  //       );
  //       formData.append('file', file);

  //       const response = await axiosInstance.post('/documents', formData);
  //       if (response.data?.success && response.data.data?.fileUrl) {
  //         const fileUrl = response.data.data.fileUrl.trim();
  //         const fileName = getFileNameFromUrl(fileUrl);
  //         setFormState((prev) => ({
  //           ...prev,
  //           [selectedAssignment._id]: {
  //             ...prev[selectedAssignment._id],
  //             files: [
  //               ...(prev[selectedAssignment._id]?.files || []),
  //               { url: fileUrl, name: fileName }
  //             ]
  //           }
  //         }));
  //       }
  //     } catch (error) {
  //       console.error('File upload error:', error);
  //       toast({
  //         title: 'Upload Failed',
  //         description: `Failed to upload ${file.name}.`,
  //         variant: 'destructive'
  //       });
  //     }
  //   }
  //   setUploadingFiles(false);
  //   if (e.target) e.target.value = '';
  // };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAssignment || (isStudent && isFormDisabled)) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Only take the first file
    const file = files[0];

    setUploadingFiles(true);

    // Clear any previous errors
    setFormState((prev) => ({
      ...prev,
      [selectedAssignment._id]: {
        ...prev[selectedAssignment._id],
        uploadError: undefined
      }
    }));

    try {
      // File size validation (20MB = 20 * 1024 * 1024 bytes)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        setFormState((prev) => ({
          ...prev,
          [selectedAssignment._id]: {
            ...prev[selectedAssignment._id],
            uploadError: `File "${file.name}" exceeds the 20MB size limit. Please choose a smaller file.`
          }
        }));
        return;
      }

      const formData = new FormData();
      formData.append('entityId', studentId || '');
      formData.append(
        'file_type',
        isStudent ? 'assignment_submission' : 'assignment_feedback'
      );
      formData.append('file', file);

      const response = await axiosInstance.post('/documents', formData);
      if (response.data?.success && response.data.data?.fileUrl) {
        const fileUrl = response.data.data.fileUrl.trim();
        const fileName = getFileNameFromUrl(fileUrl);
        setFormState((prev) => ({
          ...prev,
          [selectedAssignment._id]: {
            ...prev[selectedAssignment._id],
            files: [{ url: fileUrl, name: fileName }], // Replace with single file
            uploadError: undefined // Clear error on successful upload
          }
        }));
      }
    } catch (error) {
      console.error('File upload error:', error);
      setFormState((prev) => ({
        ...prev,
        [selectedAssignment._id]: {
          ...prev[selectedAssignment._id],
          uploadError: `Upload failed for "${file.name}". Please retry or contact admin.`
        }
      }));
    } finally {
      setUploadingFiles(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    if (!selectedAssignment || (isStudent && isFormDisabled)) return;
    setFormState((prev) => {
      const current = prev[selectedAssignment._id];
      const newFiles = current.files.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedAssignment._id]: { ...current, files: newFiles }
      };
    });
  };

  const handleEditItem = (type: 'submission' | 'feedback', id: string) => {
    console.log('Edit clicked:', { type, id, isStudent, isTeacher });

    if (!selectedAssignment) {
      console.log('No selected assignment');
      return;
    }

    if (type === 'feedback' && !isTeacher) {
      console.log('Student trying to edit feedback - not allowed');
      return;
    }

    console.log('Opening dialog for editing');

    // Find the item and prepare form updates
    let formUpdates: Partial<FormState> = {};

    if (type === 'submission') {
      const submission = selectedAssignment.submissions.find(
        (s) => s._id === id
      );
      if (submission) {
        formUpdates = {
          comment: submission.comment || '',
          files: submission.files.map((url) => ({
            url,
            name: getFileNameFromUrl(url)
          })),
          requireResubmit: false,
          resubmissionDeadline: undefined,
          isAdminSubmission: false
        };
      }
    } else if (type === 'feedback') {
      const feedback = selectedAssignment.feedbacks.find((f) => f._id === id);
      if (feedback) {
        // Get the current requireResubmit value from assignment
        const currentRequireResubmit =
          selectedAssignment.requireResubmit || false;

        // Determine status based on requireResubmit and deadline
        let resubmissionDeadline: Date | undefined = undefined;

        if (currentRequireResubmit && feedback.deadline) {
          resubmissionDeadline = new Date(feedback.deadline);
        }

        console.log('Feedback editing logic:', {
          currentRequireResubmit,
          hasDeadline: !!feedback.deadline,
          resubmissionDeadline
        });

        formUpdates = {
          comment: feedback.comment || '',
          files: feedback.files.map((url) => ({
            url,
            name: getFileNameFromUrl(url)
          })),
          requireResubmit: currentRequireResubmit,
          resubmissionDeadline: resubmissionDeadline,
          isAdminSubmission: false
        };
      }
    }

    // Set editing item first
    setEditingItem({ type, id });

    // Update form state
    setFormState((prev) => ({
      ...prev,
      [selectedAssignment._id]: {
        ...prev[selectedAssignment._id],
        ...formUpdates
      }
    }));

    setDialogOpen(true);
  };

  const handleDeleteItem = async (
    type: 'submission' | 'feedback',
    id: string
  ) => {
    if (!selectedAssignment) return;

    // For students, check if they can delete this submission
    if (isStudent && type === 'submission') {
      const submission = selectedAssignment.submissions.find(
        (s) => s._id === id
      );
      if (
        !submission ||
        !canStudentEditSubmission(submission, selectedAssignment)
      ) {
        toast({
          title: 'Cannot Delete',
          description:
            'You cannot delete this submission as feedback has been provided.',
          variant: 'destructive'
        });
        return;
      }
    }

    // For feedback, only teachers can delete
    if (type === 'feedback' && !isTeacher) {
      return;
    }

    try {
      // ... rest of your existing delete logic
      const updateData: any = {};
      let newStatus = selectedAssignment.status;
      let newRequireResubmit = selectedAssignment.requireResubmit;

      if (type === 'submission') {
        updateData.$pull = { submissions: { _id: id } };

        // Determine if this is the last submission being deleted
        const isLastSubmission = selectedAssignment.submissions.length === 1;
        const isOnlySubmission =
          selectedAssignment.submissions.length === 1 &&
          selectedAssignment.submissions[0]._id === id;

        // If student is deleting their only submission, reset status
        if (isStudent && isOnlySubmission) {
          newStatus = 'not_submitted';
          newRequireResubmit = false;
          updateData.status = 'not_submitted';
          updateData.requireResubmit = false;
        }

        // If teacher is deleting the last submission, also reset status
        if (isTeacher && isLastSubmission) {
          newStatus = 'not_submitted';
          newRequireResubmit = false;
          updateData.status = 'not_submitted';
          updateData.requireResubmit = false;
        }
      } else {
        updateData.$pull = { feedbacks: { _id: id } };
      }

      await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        updateData
      );

      const updatedAssignment = {
        ...selectedAssignment,
        status: newStatus,
        requireResubmit: newRequireResubmit,
        updatedAt: new Date().toISOString()
      };

      if (type === 'submission') {
        updatedAssignment.submissions = updatedAssignment.submissions.filter(
          (s) => s._id !== id
        );
      } else {
        updatedAssignment.feedbacks = updatedAssignment.feedbacks.filter(
          (f) => f._id !== id
        );
      }

      setSelectedAssignment(updatedAssignment);
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === selectedAssignment._id ? updatedAssignment : a
        )
      );

      let description = `${type === 'submission' ? 'Submission' : 'Feedback'} deleted successfully.`;
      if (type === 'submission' && newStatus === 'not_submitted') {
        description =
          'Submission deleted and assignment status reset to not submitted.';
      }

      toast({
        title: 'Success',
        description
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || (isStudent && isFormDisabled)) return;
    const current = formState[selectedAssignment._id];
    if (!current.comment.trim() && current.files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please provide a comment or upload files.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);

      const tempSubmissionId = `loading_submission_${Date.now()}`;
      const tempFeedbackId = `loading_feedback_${Date.now()}`;

      if (editingItem) {
        setLoadingItems((prev) => ({ ...prev, [editingItem.id]: true }));
      } else {
        if (isStudent || (isTeacher && current.isAdminSubmission)) {
          setLoadingItems((prev) => ({ ...prev, [tempSubmissionId]: true }));
        } else {
          setLoadingItems((prev) => ({ ...prev, [tempFeedbackId]: true }));
        }
      }

      if (editingItem) {
        if (editingItem.type === 'submission') {
          const submissionIndex = selectedAssignment.submissions.findIndex(
            (s) => s._id === editingItem.id
          );

          if (submissionIndex === -1) {
            throw new Error('Submission not found');
          }

          const updateData = {
            $set: {
              [`submissions.${submissionIndex}.comment`]:
                current.comment.trim() || undefined,
              [`submissions.${submissionIndex}.files`]: current.files
                .map((f) => f.url.trim())
                .filter(Boolean),
              [`submissions.${submissionIndex}.updatedAt`]:
                new Date().toISOString()
            }
          };

          const response = await axiosInstance.patch(
            `/assignment/${selectedAssignment._id}`,
            updateData
          );

          if (response.data.success && response.data.data) {
            const serverAssignment = response.data.data;
            setSelectedAssignment(serverAssignment);
            setAssignments((prev) =>
              prev.map((a) =>
                a._id === selectedAssignment._id ? serverAssignment : a
              )
            );
          }

          toast({
            title: 'Success',
            description: 'Submission updated successfully!'
          });
        } else if (editingItem.type === 'feedback') {
          const feedbackIndex = selectedAssignment.feedbacks.findIndex(
            (f) => f._id === editingItem.id
          );

          if (feedbackIndex === -1) {
            throw new Error('Feedback not found');
          }

          // FIXED: Determine new status based on requireResubmit and deadline for EDITING feedback
          let newStatus = selectedAssignment.status;
          let newRequireResubmit = current.requireResubmit || false;

          if (current.requireResubmit && current.resubmissionDeadline) {
            newStatus = 'resubmission_required';
            newRequireResubmit = true;
          } else {
            newStatus = 'completed';
            newRequireResubmit = false;
            // Ensure deadline is undefined when not requiring resubmission
            current.resubmissionDeadline = undefined;
          }

          const updateData: any = {
            $set: {
              [`feedbacks.${feedbackIndex}.comment`]:
                current.comment.trim() || undefined,
              [`feedbacks.${feedbackIndex}.files`]: current.files
                .map((f) => f.url.trim())
                .filter(Boolean),
              [`feedbacks.${feedbackIndex}.updatedAt`]:
                new Date().toISOString(),
              // ADD THESE LINES TO UPDATE ASSIGNMENT STATUS WHEN EDITING FEEDBACK
              status: newStatus,
              requireResubmit: newRequireResubmit
            }
          };

          // Update deadline in the specific feedback item if provided
          if (current.resubmissionDeadline) {
            updateData.$set[`feedbacks.${feedbackIndex}.deadline`] =
              current.resubmissionDeadline.toISOString();
          } else {
            // If no deadline provided, remove it from the feedback
            updateData.$set[`feedbacks.${feedbackIndex}.deadline`] = null;
          }

          console.log('Editing teacher feedback:', {
            requireResubmit: current.requireResubmit,
            hasDeadline: !!current.resubmissionDeadline,
            newStatus: newStatus,
            newRequireResubmit: newRequireResubmit,
            updateData
          });

          const response = await axiosInstance.patch(
            `/assignment/${selectedAssignment._id}`,
            updateData
          );

          // Update with real data from server response
          if (response.data.success && response.data.data) {
            const serverAssignment = response.data.data;
            setSelectedAssignment(serverAssignment);
            setAssignments((prev) =>
              prev.map((a) =>
                a._id === selectedAssignment._id ? serverAssignment : a
              )
            );
          }

          toast({
            title: 'Success',
            description: 'Feedback updated successfully!'
          });
        }
      } else {
        if (isStudent) {
          const cleanedFiles = current.files
            .map((f) => f.url.trim())
            .filter((url) => url.length > 0);

          if (cleanedFiles.length === 0) {
            toast({
              title: 'Error',
              description:
                'At least one valid file is required for submission.',
              variant: 'destructive'
            });
            return;
          }

          const submissionStatus =
            selectedAssignment.status === 'not_submitted'
              ? 'submitted'
              : 'resubmitted';

          let submissionDeadline: string | undefined;

          if (selectedAssignment.status === 'not_submitted') {
            const materialAssignment = unitMaterial?.assignments?.find(
              (a: any) =>
                a._id.toString() ===
                selectedAssignment.courseMaterialAssignmentId
            );

            submissionDeadline = materialAssignment?.deadline;
          } else if (selectedAssignment.requireResubmit) {
            const latestFeedbackWithDeadline = selectedAssignment.feedbacks
              .filter((feedback) => feedback.deadline)
              .sort(
                (a, b) =>
                  moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
              )[0];

            submissionDeadline = latestFeedbackWithDeadline?.deadline;
          }

          const backendSubmission: any = {
            submitBy: user?._id,
            files: cleanedFiles,
            comment: current.comment.trim() || undefined,
            status: submissionStatus,
            seen: false
          };

          if (submissionDeadline) {
            backendSubmission.deadline = submissionDeadline;
          }

          try {
            const patchRes = await axiosInstance.patch(
              `/assignment/${selectedAssignment._id}`,
              {
                $push: { submissions: backendSubmission },
                status: 'submitted',
                requireResubmit: false
              }
            );

            if (patchRes.data.success && patchRes.data.data) {
              const serverAssignment = patchRes.data.data;
              setSelectedAssignment(serverAssignment);
              setAssignments((prev) =>
                prev.map((a) =>
                  a._id === selectedAssignment._id ? serverAssignment : a
                )
              );
            }

            if (!patchRes.data.success) {
              throw new Error('Submission failed');
            }

            toast({
              title: 'Success',
              description:
                submissionStatus === 'submitted'
                  ? 'Assignment submitted!'
                  : 'Resubmission uploaded!'
            });
          } catch (patchError: any) {
            if (
              patchError.response?.status === 404 ||
              patchError.response?.data?.message?.includes('not found')
            ) {
              const newAssignmentData: any = {
                applicationId,
                unitId,
                studentId,
                unitMaterialId: unitMaterial?._id,
                courseMaterialAssignmentId:
                  selectedAssignment.courseMaterialAssignmentId,
                // assignmentName: selectedAssignment.assignmentName,
                submissions: [backendSubmission],
                status: 'submitted',
                requireResubmit: false
              };

              const createRes = await axiosInstance.post(
                '/assignment',
                newAssignmentData
              );

              if (createRes.data.success) {
                const newAssignment = createRes.data.data;
                setSelectedAssignment(newAssignment);
                setAssignments((prev) =>
                  prev.map((a) =>
                    a._id === selectedAssignment._id ? newAssignment : a
                  )
                );

                toast({
                  title: 'Success',
                  description: 'Assignment submitted successfully!'
                });
              } else {
                throw new Error('Failed to create assignment');
              }
            } else {
              throw patchError;
            }
          }
        } else if (isTeacher) {
          const cleanedFiles = current.files
            .map((f) => f.url.trim())
            .filter((url) => url.length > 0);

          if (current.isAdminSubmission) {
            if (cleanedFiles.length === 0) {
              toast({
                title: 'Error',
                description:
                  'At least one valid file is required for submission.',
                variant: 'destructive'
              });
              return;
            }

            const submissionStatus =
              selectedAssignment.status === 'not_submitted'
                ? 'submitted'
                : 'resubmitted';

            const backendSubmission: any = {
              submitBy: user?._id,
              files: cleanedFiles,
              comment: current.comment.trim() || undefined,
              status: submissionStatus,
              submittedByAdmin: true,
              seen: false
            };

            if (selectedAssignment.status === 'not_submitted') {
              const materialAssignment = unitMaterial?.assignments?.find(
                (a: any) =>
                  a._id.toString() ===
                  selectedAssignment.courseMaterialAssignmentId
              );
              if (materialAssignment?.deadline) {
                backendSubmission.deadline = materialAssignment.deadline;
              }
            }

            try {
              const patchRes = await axiosInstance.patch(
                `/assignment/${selectedAssignment._id}`,
                {
                  $push: { submissions: backendSubmission },
                  status: 'submitted',
                  requireResubmit: false
                }
              );

              if (patchRes.data.success && patchRes.data.data) {
                const serverAssignment = patchRes.data.data;
                setSelectedAssignment(serverAssignment);
                setAssignments((prev) =>
                  prev.map((a) =>
                    a._id === selectedAssignment._id ? serverAssignment : a
                  )
                );
              }

              if (!patchRes.data.success) {
                throw new Error('Admin submission failed');
              }

              toast({
                title: 'Success',
                description: `Assignment submitted on behalf of ${studentName}!`
              });
            } catch (patchError: any) {
              if (
                patchError.response?.status === 404 ||
                patchError.response?.data?.message?.includes('not found')
              ) {
                const newAssignmentData: any = {
                  applicationId,
                  unitId,
                  studentId,
                  unitMaterialId: unitMaterial?._id,
                  // assignmentName: selectedAssignment.assignmentName,
                  courseMaterialAssignmentId:
                    selectedAssignment.courseMaterialAssignmentId,
                  submissions: [backendSubmission],
                  status: 'submitted',
                  requireResubmit: false
                };

                const createRes = await axiosInstance.post(
                  '/assignment',
                  newAssignmentData
                );

                if (createRes.data.success) {
                  const newAssignment = createRes.data.data;
                  setSelectedAssignment(newAssignment);
                  setAssignments((prev) =>
                    prev.map((a) =>
                      a._id === selectedAssignment._id ? newAssignment : a
                    )
                  );

                  toast({
                    title: 'Success',
                    description: `Assignment submitted on behalf of ${studentName}!`
                  });
                } else {
                  throw new Error(
                    'Failed to create assignment for admin submission'
                  );
                }
              } else {
                throw patchError;
              }
            }
          } else {
            // CORRECTED TEACHER FEEDBACK LOGIC FOR NEW FEEDBACK
            let newStatus = 'completed';
            let newRequireResubmit = false;

            // Determine status based on requireResubmit and deadline
            if (current.requireResubmit && current.resubmissionDeadline) {
              newStatus = 'resubmission_required';
              newRequireResubmit = true;
            } else {
              newStatus = 'completed';
              newRequireResubmit = false;
              // Ensure deadline is undefined when not requiring resubmission
              current.resubmissionDeadline = undefined;
            }

            const backendFeedback: any = {
              submitBy: user?._id,
              comment: current.comment.trim() || undefined,
              files: current.files.map((f) => f.url.trim()).filter(Boolean),
              seen: false
            };

            // Only add deadline if requireResubmit is true AND deadline exists
            if (newRequireResubmit && current.resubmissionDeadline) {
              backendFeedback.deadline =
                current.resubmissionDeadline.toISOString();
            }

            const updateData: any = {
              $push: { feedbacks: backendFeedback },
              status: newStatus,
              requireResubmit: newRequireResubmit
            };

            console.log('Submitting teacher feedback:', {
              requireResubmit: current.requireResubmit,
              hasDeadline: !!current.resubmissionDeadline,
              newStatus: newStatus,
              newRequireResubmit: newRequireResubmit,
              backendFeedback
            });

            const patchRes = await axiosInstance.patch(
              `/assignment/${selectedAssignment._id}`,
              updateData
            );

            if (patchRes.data.success && patchRes.data.data) {
              const serverAssignment = patchRes.data.data;
              setSelectedAssignment(serverAssignment);
              setAssignments((prev) =>
                prev.map((a) =>
                  a._id === selectedAssignment._id ? serverAssignment : a
                )
              );
            }

            if (!patchRes.data.success) throw new Error('Feedback failed');

            toast({
              title: 'Success',
              description: newRequireResubmit
                ? 'Feedback submitted! Student needs to resubmit.'
                : 'Assignment marked as completed!'
            });
          }
        }
      }

      // Reset form and close dialog
      setFormState((prev) => ({
        ...prev,
        [selectedAssignment._id]: {
          comment: '',
          files: [],
          requireResubmit: false,
          resubmissionDeadline: undefined,
          isAdminSubmission: false
        }
      }));

      setDialogOpen(false);
      setEditingItem(null);
      counter();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
      setLoadingItems({});
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedAssignment || !isTeacher) return;

    const prevAssignment = selectedAssignment;

    try {
      setMarkingCompleted(true);

      const updatedAssignment = {
        ...selectedAssignment,
        status: 'completed' as const,
        updatedAt: new Date().toISOString()
      };

      setSelectedAssignment(updatedAssignment);
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === selectedAssignment._id ? updatedAssignment : a
        )
      );

      const res = await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        { status: 'completed' }
      );

      if (!res.data.success) {
        throw new Error('Failed to mark as completed');
      }

      toast({
        title: 'Success',
        description: 'Assignment marked as completed!'
      });
    } catch (error) {
      console.error('Mark as completed error:', error);
      setSelectedAssignment(prevAssignment);
      setAssignments((prev) =>
        prev.map((a) => (a._id === selectedAssignment._id ? prevAssignment : a))
      );
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive'
      });
    } finally {
      setMarkingCompleted(false);
      setCompletionDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; className: string; icon?: React.ReactNode }
    > = {
      not_submitted: {
        label: 'Not Submitted',
        className: 'bg-gray-100 text-gray-800 text-xs'
      },
      submitted: {
        label: 'Submitted',
        className: 'bg-blue-100 text-blue-800 text-xs'
      },
      under_review: {
        label: 'Under Review',
        className: 'bg-yellow-100 text-yellow-800 text-xs'
      },
      feedback_given: {
        label: 'Feedback Given',
        className: 'bg-purple-100 text-purple-800 text-xs',
        icon: <MessageSquare className="mr-1 h-3 w-3" />
      },
      resubmission_required: {
        label: 'Resubmission Required',
        className: 'bg-orange-100 text-orange-800 text-xs',
        icon: <AlertCircle className="mr-1 h-3 w-3" />
      },
      completed: {
        label: 'Completed',
        className: 'bg-green-100 text-green-800 text-xs'
      }
    };
    const c = config[status] || config.not_submitted;
    return (
      <Badge className={`${c.className} flex items-center gap-1`}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const handleSelectAssignment = (assignment: Assignment) => {
    // Reset editing state when switching assignments
    setEditingItem(null);
    setDialogOpen(false);

    setSelectedAssignment(assignment);
    markItemsAsSeen(assignment);
    if (!formState[assignment._id]) {
      setFormState((prev) => ({
        ...prev,
        [assignment._id]: {
          comment: '',
          files: [],
          requireResubmit: false,
          resubmissionDeadline: undefined,
          isAdminSubmission: false
        }
      }));
    }
  };

  const handleFinalFeedback = async (feedbackData: any) => {
    if (!selectedAssignment) return;

    try {
      const response = await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        {
          finalFeedback: feedbackData,
          submittedBy: user?._id,
          status: 'completed',
          isFinalFeedback: true
        }
      );

      counter();
    } catch (error) {
      console.error('Error submitting final feedback:', error);
      return Promise.reject(error);
    }
  };

  const handleObservation = async (feedbackData: any) => {
    if (!selectedAssignment) return;

    try {
      const response = await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        {
          observationFeedback: feedbackData,
          submittedBy: user?._id,
          status: 'feedback_given',
          isObservationFeedback: true
        }
      );

      counter();
    } catch (error) {
      console.error('Error submitting observation feedback:', error);
      return Promise.reject(error);
    }
  };

  const handleEditFinalFeedback = async (feedbackData: any) => {
    if (!selectedAssignment) return;

    try {
      setSubmittingFinalFeedback(true);

      const response = await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        {
          finalFeedback: feedbackData,
          submittedBy: user?._id,
          updatedAt: new Date().toISOString()
        }
      );

      counter();
    } catch (error) {
      console.error('Error updating final feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update final feedback.',
        variant: 'destructive'
      });
      return Promise.reject(error);
    } finally {
      setSubmittingFinalFeedback(false);
    }
  };

  const handleEditObservationFeedback = async (feedbackData: any) => {
    if (!selectedAssignment) return;

    try {
      setSubmittingObservation(true);

      const response = await axiosInstance.patch(
        `/assignment/${selectedAssignment._id}`,
        {
          observationFeedback: feedbackData,
          submittedBy: user?._id,
          updatedAt: new Date().toISOString()
        }
      );

      counter();
    } catch (error) {
      console.error('Error updating observation feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update observation feedback.',
        variant: 'destructive'
      });
      return Promise.reject(error);
    } finally {
      setSubmittingObservation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  const currentForm = selectedAssignment
    ? formState[selectedAssignment._id] || {
        comment: '',
        files: [],
        requireResubmit: false,
        resubmissionDeadline: undefined,
        isAdminSubmission: false
      }
    : null;

  return (
    <div className="mx-auto flex flex-col overflow-auto rounded-lg bg-white p-4 shadow-md">
      {/* Header */}
      <AssignmentHeader
        isStudent={isStudent}
        studentName={studentName}
        courseUnit={courseUnit}
      />

      {/* Responsive layout: column on mobile, row on medium+ */}
      <div className="mt-4 flex flex-col md:flex-row">
        {/* Assignment List */}
        <div className="mb-4 w-full md:mb-0 md:mr-4 md:w-auto">
          <AssignmentList
            assignments={assignments}
            selectedAssignment={selectedAssignment}
            onSelectAssignment={handleSelectAssignment}
            getStatusBadge={getStatusBadge}
            getUnseenCounts={getUnseenCounts}
            isStudent={isStudent}
            unitMaterial={unitMaterial}
          />
        </div>

        {/* Right Content Area */}
        <div className="flex flex-1 flex-col rounded-lg bg-white">
          {selectedAssignment ? (
            <>
              {/* Assignment Content */}
              <AssignmentContent
                courseMaterialAssignmentId={
                  selectedAssignment.courseMaterialAssignmentId
                }
                effectiveDeadline={effectiveDeadline}
                isDeadlinePassed={isDeadlinePassed || false}
                assignmentContent={getAssignmentContent()}
                isTeacher={isTeacher}
                isCompleted={selectedAssignment.status === 'completed'}
                onMarkCompleted={handleMarkAsCompleted}
                completionDialogOpen={completionDialogOpen}
                setCompletionDialogOpen={setCompletionDialogOpen}
                markingCompleted={markingCompleted}
                studentName={studentName}
                selectedAssignmentName={selectedAssignment.assignmentName}
                unitMaterial={unitMaterial}
                actionButton={
                  isStudent
                    ? // Student button
                      selectedAssignment.status !== 'completed' &&
                      canStudentSubmitCurrent && (
                        <Button
                          onClick={() => {
                            setEditingItem(null);
                            setDialogOpen(true);
                          }}
                          size={'sm'}
                          className="bg-watney text-white hover:bg-watney/90"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Submit Assignment
                        </Button>
                      )
                    : isTeacher
                      ? // Teacher button
                        selectedAssignment.status !== 'completed' &&
                        selectedAssignment.status !== 'not_submitted' &&
                        selectedAssignment.status !== null && (
                          <Button
                            onClick={() => {
                              setEditingItem(null);
                              setDialogOpen(true);
                            }}
                            size={'sm'}
                            className="bg-watney text-white hover:bg-watney/90"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Feedback
                          </Button>
                        )
                      : null
                }
                finalFeedbackButton={
                  isTeacher &&
                  selectedAssignment.status !== 'completed' && (
                    <Button
                      onClick={() => {
                        setEditingFinalFeedback(false); // Ensure we're not in editing mode
                        setFinalFeedbackDialogOpen(true);
                      }}
                      variant="outline"
                      size={'sm'}
                      className="bg-watney text-white hover:bg-watney/90"
                      disabled={selectedAssignment.status === 'not_submitted'}
                    >
                      {/* <CheckCircle className="mr-2 h-4 w-4" /> */}
                      Final Feedback
                    </Button>
                  )
                }
                observationButton={
                  isTeacher &&
                  selectedAssignment.status !== 'completed' && (
                    <Button
                      onClick={() => {
                        setEditingObservation(false); // Ensure we're not in editing mode
                        setObservationDialogOpen(true);
                      }}
                      variant="outline"
                      size={'sm'}
                      className="bg-watney text-white hover:bg-watney/90"
                      disabled={selectedAssignment.status === 'not_submitted'}
                    >
                      {/* <CheckCircle className="mr-2 h-4 w-4" /> */}
                      Observation Feedback
                    </Button>
                  )
                }
              />

              {/* Timeline Section */}
              <AssignmentTimeline
                timeline={getTimeline(selectedAssignment)}
                isTeacher={isTeacher}
                isStudent={isStudent}
                selectedAssignment={selectedAssignment}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                hasSelectedAssignment={!!selectedAssignment}
                loadingItems={loadingItems}
                isFinalFeedback={!!selectedAssignment?.isFinalFeedback}
                isObservationFeedback={
                  !!selectedAssignment?.isObservationFeedback
                }
                onEditFinalFeedback={() => {
                  setEditingFinalFeedback(true);
                  setFinalFeedbackDialogOpen(true);
                }}

                onEditObservationFeedback={() => {
                  setEditingObservation(true);
                  setObservationDialogOpen(true);
                }}
              />

              {/* Final Feedback Dialog */}
              <FinalFeedbackDialog
                isOpen={finalFeedbackDialogOpen}
                onOpenChange={setFinalFeedbackDialogOpen}
                unitMaterial={unitMaterial}
                assignmentId={selectedAssignment?._id || ''}
                onSubmit={async (feedbackData) => {
                  setSubmittingFinalFeedback(true);
                  try {
                    if (editingFinalFeedback) {
                      await handleEditFinalFeedback(feedbackData);
                      setEditingFinalFeedback(false); // Reset editing state after successful update
                    } else {
                      await handleFinalFeedback(feedbackData);
                    }
                  } finally {
                    setSubmittingFinalFeedback(false);
                  }
                }}
                isSubmitting={submittingFinalFeedback}
                initialData={selectedAssignment?.finalFeedback} // Pass existing data for editing
                isEditing={editingFinalFeedback} // Pass editing state to the dialog
              />

              {/* Final Feedback Dialog */}
              <ObservationFeedbackDialog
                isOpen={observationDialogOpen}
                onOpenChange={setObservationDialogOpen}
                unitMaterial={unitMaterial}
                assignmentId={selectedAssignment?._id || ''}
                onSubmit={async (feedbackData) => {
                  setSubmittingObservation(true);
                  try {
                    if (editingObservation) {
                      await handleEditObservationFeedback(feedbackData);
                      setEditingObservation(false); // Reset editing state after successful update
                    } else {
                      await handleObservation(feedbackData);
                    }
                  } finally {
                    setSubmittingObservation(false);
                  }
                }}
                isSubmitting={submittingObservation}
                initialData={selectedAssignment?.observationFeedback} // Pass existing data for editing
                isEditing={editingObservation} // Pass editing state to the dialog
              />

              {/* Submission Dialog */}
              <SubmissionDialog
                isOpen={dialogOpen}
                onOpenChange={(open) => {
                  // console.log('Dialog onOpenChange called with:', open);
                  setDialogOpen(open);
                  if (!open) {
                    setEditingItem(null);
                    if (selectedAssignment) {
                      setFormState((prev) => ({
                        ...prev,
                        [selectedAssignment._id]: {
                          comment: '',
                          files: [],
                          requireResubmit: false,
                          resubmissionDeadline: undefined,
                          isAdminSubmission: false
                        }
                      }));
                    }
                  }
                }}
                isStudent={isStudent}
                isTeacher={isTeacher}
                studentName={studentName}
                formState={currentForm || { comment: '', files: [] }}
                onFormChange={(updates) =>
                  setFormState((prev) => ({
                    ...prev,
                    [selectedAssignment._id]: {
                      ...prev[selectedAssignment._id],
                      ...updates
                    }
                  }))
                }
                onFileSelect={handleFileSelect}
                onRemoveFile={removeFile}
                onSubmit={handleSubmit}
                uploadingFiles={uploadingFiles}
                submitting={submitting}
                isFormDisabled={
                  isStudent && !canStudentSubmitCurrent && !editingItem
                }
                editingItem={editingItem}
                assignment={selectedAssignment}
                triggerButton={null}
              />
            </>
          ) : (
            <AssignmentTimeline
              timeline={getTimeline(selectedAssignment)}
              isTeacher={isTeacher}
              isStudent={isStudent}
              selectedAssignment={selectedAssignment}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              hasSelectedAssignment={!!selectedAssignment}
              loadingItems={loadingItems}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
