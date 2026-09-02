import React, { useState, useEffect } from 'react';
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
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion';
import {
  GraduationCap,
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Trash2,
  Target,
  File,
  Eye,
  AlertCircle,
  ExternalLink,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Pencil
} from 'lucide-react';
import moment from 'moment';
import { Resource } from './types';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useNavigate, useParams } from 'react-router-dom';

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getResourceTypeConfig = (type: string) => {
    switch (type) {
      case 'learning-outcome':
        return {
          icon: <Target className="h-4 w-4" />,
          gradient: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
          badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
          label: 'Learning Outcome',
          bgColor: 'bg-indigo-50/10',
          borderAccent: 'border-l-4 border-l-indigo-500'
        };
      case 'study-guide':
        return {
          icon: <BookOpen className="h-4 w-4" />,
          gradient: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
          badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
          label: 'Study Guide',
          bgColor: 'bg-emerald-50/10',
          borderAccent: 'border-l-4 border-l-emerald-500'
        };
      case 'lecture':
        return {
          icon: <BookAIcon className="h-4 w-4" />,
          gradient: 'from-violet-500 to-violet-600 shadow-violet-200',
          badge: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
          label: 'Lecture',
          bgColor: 'bg-violet-50/10',
          borderAccent: 'border-l-4 border-l-violet-500'
        };
      case 'introduction':
        return {
          icon: <GraduationCap className="h-4 w-4" />,
          gradient: 'from-blue-500 to-blue-600',
          badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
          label: 'Introduction',
          bgColor: 'bg-blue-50/10',
          borderAccent: 'border-l-4 border-l-blue-500'
        };
      case 'assignment':
        return {
          icon: <FileText className="h-4 w-4" />,
          gradient: 'from-amber-500 to-amber-600',
          badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
          label: 'Assignment',
          bgColor: 'bg-amber-50/10',
          borderAccent: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          gradient: 'from-slate-500 to-slate-600',
          badge: 'bg-slate-50  ring-1 ring-inset ring-slate-200',
          label: 'Resource',
          bgColor: 'bg-white',
          borderAccent: ''
        };
    }
  };

  // Delete confirmation component
  const DeleteConfirmDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="rounded-2xl border-slate-200 p-6 sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-center text-lg font-semibold text-slate-900">
            Delete Resource
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed ">
            Are you sure you want to delete this resource? This action cannot be
            undone and all associated data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="w-full rounded-lg sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(resource._id);
              setDeleteDialogOpen(false);
            }}
            className="w-full rounded-lg bg-red-600 hover:bg-red-700 sm:w-auto"
          >
            Delete Resource
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Assignment Card
  if (resource.type === 'assignment') {
    const [threadData, setThreadData] = useState<{
      assignment: any;
    } | null>(null);

    useEffect(() => {
      if (!isStudent || !user?._id || !id || !unitId) return;

      const loadAssignment = async () => {
        try {
          const assignmentRes = await axiosInstance.get(
            `/assignment?studentId=${user._id}&assignmentName=${encodeURIComponent(resource.title || '')}&unitId=${unitId}`
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

    const isOverdue = resource.finalDeadline
      ? moment(resource.finalDeadline).isBefore(moment())
      : false;

    return (
      <>
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-200">
                <FileText className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight text-slate-900">
                  {resource.title}
                </h3>
                {resource.finalDeadline && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 ">
                      <Calendar className="h-3.5 w-3.5 " />
                      Due {moment(resource.finalDeadline).format('MMM D, YYYY')}
                    </span>
                    {isOverdue && (
                      <Badge className="gap-1 rounded-full border-0 bg-red-50 px-2 py-0.5 font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50">
                        <AlertCircle className="h-3 w-3" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex flex-shrink-0 items-center gap-1 ">
                <Button
                  size="sm"
                  variant={'outline'}
                  onClick={() => onEdit(resource)}
                >
                  <Pencil className="h-4 w-4 " />
                </Button>
              </div>
            )}
          </div>

          {/* Student Action */}
          {isStudent && applicationId && (
            <Button
              onClick={() =>
                navigate(
                  `/dashboard/student-applications/${applicationId}/assignment/${user._id}/unit-assignments/${unitId}`,
                  { state: { assignmentId: threadData?.assignment?._id } }
                )
              }
              className="group/btn w-full justify-between rounded-lg  transition-colors"
            >
              <span className="font-medium">View Assignment</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </Button>
          )}
        </div>
        <DeleteConfirmDialog />
      </>
    );
  }

  // Introduction Card
  if (resource.type === 'introduction') {
    return (
      <>
        <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <CardHeader className="border-b border-slate-100 bg-green-400 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 ">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight text-white">
                    Introduction
                  </CardTitle>
                  <CardDescription className="text-sm text-white">
                    Course overview and objectives
                  </CardDescription>
                </div>
              </div>

              {isAdmin && (
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => onEdit(resource)}
                    className="h-9 w-9 "
                  >
                    <Pencil className="h-4 w-4 " />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-9 w-9 "
                  >
                    <Trash2 className="h-4 w-4 " />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <div className="prose prose-slate max-w-none">
              <div
                className="text-sm leading-relaxed  [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: resource.content || '' }}
              />
            </div>
          </CardContent>
        </Card>
        <DeleteConfirmDialog />
      </>
    );
  }

  const typeConfig = getResourceTypeConfig(resource.type);

  // Unified Dropdown Accordion Render for Learning Outcomes, Study Guides, and Lectures
  return (
    <>
      <AccordionItem
        key={resource._id}
        value={resource._id}
        className={`mb-3 overflow-hidden rounded-xl border border-slate-200 px-0 shadow-sm transition-all duration-300 last:mb-0 hover:shadow-md ${typeConfig.bgColor} ${typeConfig.borderAccent}`}
      >
        <AccordionTrigger className="px-4 py-4 hover:bg-slate-50/80 hover:no-underline [&[data-state=open]]:bg-slate-50/60">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${typeConfig.gradient} shadow-sm`}
              >
                {React.cloneElement(typeConfig.icon, {
                  className: 'h-4 w-4 text-white'
                })}
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold text-slate-900">
                  {resource.type === 'learning-outcome' 
                    ? (resource.title || resource.learningOutcomes || 'Learning Outcome')
                    : resource.title
                  }
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide  mr-1">
                    {typeConfig.label}
                  </p>
                  {isAdmin && resource.type === 'learning-outcome' && (
                    <>
                      {resource?.finalFeedback && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-[11px] font-medium text-emerald-700 shadow-sm hover:from-emerald-50 hover:to-teal-50 py-0 px-2"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Final Feedback
                        </Badge>
                      )}
                      {resource?.observation && (
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-[11px] font-medium text-amber-700 shadow-sm hover:from-amber-50 hover:to-orange-50 py-0 px-2"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Observation
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex flex-shrink-0 items-center gap-1">
                <Button
                  
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(resource);
                  }}
                  className="h-8 w-8 "
                >
                  <Pencil className="h-4 w-4 " />
                </Button>
                <Button
                  variant={'destructive'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                  className="h-8 w-8 "
                >
                  <Trash2 className="h-4 w-4 " />
                </Button>
              </div>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="border-t border-slate-100 bg-white px-4 pb-4 pt-3">
          <div className="space-y-3">
            {/* Rich text content / description */}
            {resource.content?.trim() && (
              <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-4">
                <div
                  className="prose prose-slate max-w-none text-sm leading-relaxed  [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                />
              </div>
            )}

            {/* Assessment Criteria Custom Block (Specific to Learning Outcomes) */}
            {resource.type === 'learning-outcome' && (
              <>
                {resource.assessmentCriteria && resource.assessmentCriteria.length > 0 ? (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide ">
                      Assessment Criteria
                    </h4>
                    {resource.assessmentCriteria.map((criteria, index) => (
                      <div
                        key={(criteria as any)._id || index}
                        className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-sm leading-relaxed ">
                            {(criteria as any).title && (
                              <p className="mb-1 font-medium">{(criteria as any).title}</p>
                            )}
                            {criteria.description ? (
                              <div
                                className="[&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                                dangerouslySetInnerHTML={{
                                  __html: criteria.description
                                }}
                              />
                            ) : (
                              <span className="italic ">
                                No description available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
                    <p className="text-sm ">
                      No assessment criteria defined yet
                    </p>
                  </div>
                )}
              </>
            )}

            {/* File attachment rendering for non-assignment resources (Lectures / Study Guides) */}
            {resource.fileUrl?.trim() && (
              <div className="group/file flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50">
                <div className="min-w-0 items-center gap-3 flex">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <File className="h-4 w-4 " />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium ">
                      {resource.fileName || 'Attached File'}
                    </p>
                    <p className="text-xs ">Click to view</p>
                  </div>
                </div>
                <Button
                  
                  size="sm"
                  asChild
                  className="flex-shrink-0 rounded-lg hover:bg-white"
                >
                  <a
                    href={resource.fileUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 "
                  >
                    <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover/file:translate-x-0.5" />
                    <span className="hidden sm:inline">Open</span>
                  </a>
                </Button>
              </div>
            )}

            {/* Empty state fallback if neither content nor file exists */}
            {!resource.content?.trim() && !resource.fileUrl?.trim() && resource.type !== 'learning-outcome' && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <File className="h-5 w-5 " />
                </div>
                <p className="mt-2.5 text-sm ">
                  No content available
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
      <DeleteConfirmDialog />
    </>
  );
};

export default ResourceCard;