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
  Eye
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
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  studentSubmission,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id, unitId } = useParams();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  // Dialog state for student submission
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    selectedDocument: null,
    fileName: null
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSubmission, setLocalSubmission] = useState(
    studentSubmission || null
  );

  // 🔥 Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB

  // Fetch applicationId when dialog opens (for student)
  useEffect(() => {
    if (dialogOpen && isStudent && user?._id && id) {
      const fetchApplicationId = async () => {
        try {
          const res = await axiosInstance.get(
            `/application-course?studentId=${user._id}&courseId=${id}`
          );
          const applications = res.data.data.result || [];
          if (applications.length > 0) {
            setApplicationId(applications[0]._id);
          } else {
            toast({
              title: 'Error',
              description: 'No active application found for this unit.',
              variant: 'destructive'
            });
            setDialogOpen(false);
          }
        } catch (error) {
          console.error('Failed to fetch application ID:', error);
          toast({
            title: 'Error',
            description: 'Could not load your application. Please try again.',
            variant: 'destructive'
          });
          setDialogOpen(false);
        }
      };
      fetchApplicationId();
    }
  }, [dialogOpen, isStudent, user?._id, id, toast]);

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
        toast({
          title: 'Success',
          description: 'Document uploaded successfully!'
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
        variant: 'destructive'
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!uploadState.selectedDocument) {
      toast({
        title: 'Error',
        description: 'Please upload a document.',
        variant: 'destructive'
      });
      return;
    }

    if (!applicationId || !unitId) {
      toast({
        title: 'Error',
        description: 'Missing application or unit ID.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/assignment', {
        applicationId,
        studentId: user._id,
        unitId,
        assignmentName: resource.title,
        document: uploadState.selectedDocument
      });

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully!'
      });

      setLocalSubmission({
        document: uploadState.selectedDocument,
        createdAt: new Date().toISOString()
      });

      setUploadState({ selectedDocument: null, fileName: null });
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatDeadline = (deadline: string | Date) => {
    return moment(deadline).format('DD-MM-YYYY');
  };

  // === Render Assignment Card ===
  if (resource.type === 'assignment') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
        <div className="flex flex-1 items-center gap-3">
          <Badge
            className={`${getResourceTypeColor(resource.type)} p-2 text-white`}
          >
            {getResourceTypeIcon(resource.type)}
          </Badge>
          <h3 className="font-medium">{resource.title}</h3>
          {resource.deadline && (
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="ml-3 mr-1 h-4 w-4" />
              <span>Due: {formatDeadline(resource.deadline)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="icon"
                onClick={() => onEdit(resource)}
                className="text-watney hover:text-watney/90"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
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
            </div>
          )}

          {isStudent && (
            <>
              {localSubmission ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="ml-3 mr-1 h-4 w-4" />
                    <span>
                      Submitted: {formatDeadline(localSubmission.createdAt)}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Submitted
                  </Badge>
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="h-8 px-2"
                  >
                    <a
                      href={localSubmission.document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-watney text-white hover:bg-watney/90"
                    >
                      <Eye className="h-4 w-4" />
                      View Document
                    </a>
                  </Button>
                </div>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-watney text-white hover:bg-watney/90"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Submit Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="z-[9999] max-w-md">
                    <DialogHeader>
                      <DialogTitle>Submit Assignment</DialogTitle>
                      <DialogDescription>
                        Upload your work for: <strong>{resource.title}</strong>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignment-name">
                          Assignment Title
                        </Label>
                        <Input
                          id="assignment-name"
                          value={resource.title}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Document</Label>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-watney text-white hover:bg-watney/90"
                          disabled={uploadingFile}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {uploadState.selectedDocument
                            ? 'Change Document'
                            : 'Upload Document'}
                        </Button>

                        {uploadState.selectedDocument && (
                          <div className="flex items-center justify-between rounded-md bg-gray-100 p-3">
                            <a
                              href={uploadState.selectedDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 truncate text-sm font-medium text-black hover:underline"
                            >
                              <File className="h-4 w-4" />
                              {uploadState.fileName || 'Uploaded Document'}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadState({
                                  selectedDocument: null,
                                  fileName: null
                                });
                                if (fileInputRef.current)
                                  fileInputRef.current.value = '';
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {uploadingFile && (
                          <div className="text-center text-sm text-muted-foreground">
                            Uploading... {uploadProgress}%
                          </div>
                        )}
                        {uploadError && (
                          <p className="text-sm text-red-600">{uploadError}</p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogOpen(false);
                            setUploadState({
                              selectedDocument: null,
                              fileName: null
                            });
                            if (fileInputRef.current)
                              fileInputRef.current.value = '';
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitAssignment}
                          disabled={
                            submitting || uploadingFile || !applicationId
                          }
                          className="bg-watney text-white hover:bg-watney/90"
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // === Introduction Card ===
  if (resource.type === 'introduction') {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <GraduationCap className="h-6 w-6 text-watney" />
              </div>
              <CardTitle>Introduction</CardTitle>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => onEdit(resource)}
                  className="text-watney hover:text-watney/90"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this introduction? This action cannot be undone.
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
        </CardHeader>
        <CardContent>
          <div
            className="space-y-2 px-2 leading-relaxed text-slate-700 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: resource.content || '' }}
          />
        </CardContent>
      </Card>
    );
  }

  // === Learning Outcome ===
  if (resource.type === 'learning-outcome') {
    return (
      <AccordionItem key={resource._id} value={resource._id}>
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-500 p-2 text-white">
                <Target className="h-4 w-4" />
              </Badge>
              <span className="font-medium">
                {resource.learningOutcomes || ''}
              </span>
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
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this learning outcome? This action cannot be undone.
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
                    <span className="mt-0.5 flex-shrink-0 font-medium text-slate-700">
                      {index + 1}.
                    </span>
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
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
                      Are you sure you want to delete this resource? This action cannot be undone.
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
          <div className="flex-1">
            {resource.content && resource.content.trim() ? (
              <div
                className="space-y-2 px-2 leading-relaxed text-slate-700 [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            ) : resource.fileUrl && resource.fileUrl.trim() ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                <Button
                  asChild
                  variant="link"
                  className="p-0 font-medium text-blue-600 hover:underline"
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
            ) : (
              <p className="px-4 italic text-slate-500">No content available</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ResourceCard;