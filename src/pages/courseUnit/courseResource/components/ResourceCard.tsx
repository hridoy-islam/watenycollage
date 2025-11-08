import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  GraduationCap,
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Clock,
  Pencil,
  Trash2,
  Target,
  Plus,
  MoveLeft,
  File,
  X,
  CheckCircle,
  Eye,
  AlertCircle,
  MessageSquare,
  Download,
  Upload
} from 'lucide-react';
import moment from 'moment';
import { Resource } from './types';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// Define upload state type
interface UploadState {
  selectedDocument: string | null;
  fileName: string | null;
}

interface ResourceCardProps {
  resource: Resource;
  studentSubmission?: any;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  applicationId: any;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  studentSubmission,
  onEdit,
  onDelete,
  applicationId
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  console.log(isAdmin);

  // 🔥 Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'introduction':
        return <GraduationCap className="h-4 w-4" />;
      case 'study-guide':
        return <BookOpen className="h-4 w-4" />;
      case 'lecture':
        return <BookAIcon className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'introduction':
        return 'bg-blue-500';
      case 'study-guide':
        return 'bg-green-500';
      case 'lecture':
        return 'bg-purple-500';
      case 'assignment':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

if (resource.type === 'assignment') {
  const [threadData, setThreadData] = useState<{
    assignment: any;
  } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isStudent || !user?._id || !id || !unitId) return;

    const loadAssignment = async () => {
      try {
        // Get Assignment Data
        const assignmentRes = await axiosInstance.get(
          `/assignment?studentId=${user._id}&assignmentName=${encodeURIComponent(resource.title)}&unitId=${unitId}`
        );

        const assignmentData = Array.isArray(assignmentRes.data.data.result)
          ? assignmentRes.data.data.result[0]
          : assignmentRes.data.data;

        setThreadData({
          assignment: assignmentData
        });
      } catch (err) {
        console.error('Failed to load assignment', err);
        toast({
          title: 'Error',
          description: 'Could not load assignment.',
          variant: 'destructive'
        });
      }
    };

    loadAssignment();
  }, [isStudent, user?._id, id, unitId]);

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Deadline */}
        <div>
          <h3 className="font-medium text-gray-900 break-words">{resource.title}</h3>
          {resource.deadline && (
            <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-500">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Deadline:{' '}
                {resource.deadline
                  ? moment(resource.deadline).format('DD MMM, YYYY')
                  : 'No deadline'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Edit Button */}
          {isAdmin && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onEdit(resource)}
              className="h-8 w-8 p-0 sm:w-auto sm:px-3"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
            </Button>
          )}

          {/* Delete Button */}
          {isAdmin && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this assignment? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(resource._id);
                      setDeleteDialogOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* View Button */}
          {isStudent && applicationId && (
            <Button
              size="sm"
              className="bg-watney text-white hover:bg-watney/90 h-8 w-full sm:w-auto"
              onClick={() =>
                navigate(
                  `/dashboard/student-applications/${applicationId}/assignment/${user._id}/unit-assignments/${unitId}`,
                  { state: { assignmentId: threadData?.assignment?._id } }
                )
              }
            >
              Assignment Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

  // === Introduction Card ===
if (resource.type === 'introduction') {
  return (
    <Card className="border border-gray-300 shadow-none">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left section: Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-watney" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Introduction
            </CardTitle>
          </div>

          {/* Right section: Admin buttons */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button
                variant="default"
                size="icon"
                onClick={() => onEdit(resource)}
                className="text-watney hover:text-watney/90  bg-transparent hover:bg-watney/10 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-destructive hover:bg-destructive/90 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this introduction? This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <DialogClose asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete(resource._id);
                        setDeleteDialogOpen(false);
                      }}
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="space-y-3 px-2 leading-relaxed text-slate-700 break-words [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: resource.content || '' }}
        />
      </CardContent>
    </Card>
  );
}


  // === Learning Outcome ===
  if (resource.type === 'learning-outcome') {
    console.log(resource, 'aa');

    return (
      <AccordionItem key={resource._id} value={resource._id}>
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-500 p-2 text-white">
                <Target className="h-4 w-4" />
              </Badge>
              <span className="font-medium text-start">
                {resource.learningOutcomes || ''}
              </span>

              {isAdmin && (
                <>
                  {resource?.finalFeedback && (
                    <Badge className="text-white bg-watney text-xs">Final Feedback</Badge>
                  )}
                  {resource?.observation && (
                    <Badge className="text-white bg-watney text-xs">Observation Feedback</Badge>
                  )}
                </>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(resource);
                  }}
                  className="text-watney hover:text-watney/90"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this learning outcome?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onDelete(resource._id);
                          setDeleteDialogOpen(false);
                        }}
                      >
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-4">
          {resource.assessmentCriteria &&
          resource.assessmentCriteria.length > 0 ? (
            <div className="space-y-4">
              {resource.assessmentCriteria.map((lo, index) => (
                <div
                  key={lo._id}
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* <span className="mt-0.5 flex-shrink-0 font-medium text-slate-700">
                      {index + 1}.
                    </span> */}
                    <div className="ql-snow flex-1 text-slate-800">
                      {lo.description ? (
                        <div
                          className="space-y-2 px-2 leading-relaxed text-slate-700 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                          dangerouslySetInnerHTML={{ __html: lo.description }}
                        />
                      ) : (
                        <span className="italic text-slate-500">
                          No description
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="italic text-slate-500">
              No assessment criteria defined.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  }

  // === Default: study-guide, lecture ===
  return (
    <AccordionItem key={resource._id} value={resource._id}>
      <AccordionTrigger className="py-2 hover:no-underline">
        <div className="flex w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Badge
              className={`${getResourceTypeColor(resource.type)} p-2 text-white`}
            >
              {getResourceTypeIcon(resource.type)}
            </Badge>
            <span className="font-medium">{resource.title}</span>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                className="text-watney hover:text-watney/90"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this resource? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete(resource._id);
                        setDeleteDialogOpen(false);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Render rich text content if available */}
            {resource.content && resource.content.trim() && (
              <div
                className="space-y-2 px-2 leading-relaxed text-slate-700 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            )}

            {/* Render file link if available */}
            {resource.fileUrl && resource.fileUrl.trim() && (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                <Button
                  asChild
                  variant="link"
                  className="p-0 font-medium text-watney hover:underline"
                >
                  <a
                    href={resource.fileUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.fileName && resource.fileName.trim() !== ''
                      ? resource.fileName
                      : 'View Document'}
                  </a>
                </Button>
              </div>
            )}

            {/* Show "No content" only if neither exists */}
            {!resource.content?.trim() && !resource.fileUrl?.trim() && (
              <p className="px-4 italic text-slate-500">No content available</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ResourceCard;
