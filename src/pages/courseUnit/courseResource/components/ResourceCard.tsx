import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Pencil,
  CalendarClock,
  Clock
} from 'lucide-react';
import moment from 'moment';
import { Resource } from './types';
import { useEffectiveRole } from '@/hooks/use-effective-role';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNavigate, useParams } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
  studentSubmission?: any;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
  applicationId: any;
}

/**
 * Every resource type shares one surface: a themed icon tile, a black title
 * and a low-opacity subtitle. The only per-type colour is the badge, so the
 * list reads as one family rather than five.
 */
const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactElement; label: string; badge: string }
> = {
  'learning-outcome': {
    icon: <Target className="h-4 w-4" />,
    label: 'Learning outcome',
    badge: 'bg-watney/10 text-watney ring-1 ring-inset ring-watney/20'
  },
  'study-guide': {
    icon: <BookOpen className="h-4 w-4" />,
    label: 'Study guide',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
  },
  lecture: {
    icon: <BookAIcon className="h-4 w-4" />,
    label: 'Lecture',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
  },
  introduction: {
    icon: <GraduationCap className="h-4 w-4" />,
    label: 'Introduction',
    badge: 'bg-watney/10 text-watney ring-1 ring-inset ring-watney/20'
  },
  assignment: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Assignment',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
  }
};

const FALLBACK_CONFIG = {
  icon: <FileText className="h-4 w-4" />,
  label: 'Resource',
  badge: 'bg-watney/10 text-black ring-1 ring-inset ring-watney/20'
};

/** Icon-only action with a tooltip, so a dense row still explains itself. */
function IconAction({
  label,
  icon: Icon,
  onClick,
  tone = 'default'
}: {
  label: string;
  icon: any;
  onClick: (event: React.MouseEvent) => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
              tone === 'danger'
                ? 'border-gray-200 text-black hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                : 'border-gray-200 text-black hover:border-watney/50 hover:bg-watney/10 hover:text-watney'
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadData, setThreadData] = useState<{ assignment: any } | null>(
    null
  );

  const isAssignment = resource.type === 'assignment';

  // A student opening an assignment needs their own submission thread, which
  // is keyed on the assignment title rather than on the settings document.
  useEffect(() => {
    if (!isAssignment || !isStudent || !user?._id || !id || !unitId) return;

    const loadAssignment = async () => {
      try {
        const assignmentRes = await axiosInstance.get(
          `/assignment?studentId=${user._id}&assignmentName=${encodeURIComponent(
            resource.title || ''
          )}&unitId=${unitId}`
        );

        const assignmentData = Array.isArray(assignmentRes.data.data.result)
          ? assignmentRes.data.data.result[0]
          : assignmentRes.data.data;

        setThreadData({ assignment: assignmentData });
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
  }, [isAssignment, isStudent, user?._id, id, unitId, resource.title, toast]);

  const DeleteConfirmDialog = () => (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
            <Trash2 className="h-5 w-5 text-rose-600" />
          </div>
          <DialogTitle className="text-center text-base font-semibold text-black">
            Delete this resource?
          </DialogTitle>
          <DialogDescription className="text-center text-xs leading-relaxed text-black">
            {resource.title || TYPE_CONFIG[resource.type]?.label} will be
            removed from this unit. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-1 gap-2 sm:gap-2">
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
            className="w-full bg-rose-600 hover:bg-rose-700 sm:w-auto"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ── Assignment ─────────────────────────────────────────────────────────
  if (isAssignment) {
    const deadline = resource.finalDeadline
      ? moment(resource.finalDeadline)
      : null;
    const isOverdue = deadline ? deadline.isBefore(moment()) : false;
    const daysLeft = deadline ? deadline.diff(moment(), 'days') : null;
    const submitted = Boolean(studentSubmission);

    return (
      <>
        <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-watney/40 hover:shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-black">
                  {resource.title}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                  {resource.startDate && (
                    <span className="inline-flex items-center gap-1 text-black">
                      <Calendar className="h-3 w-3" />
                      Opens {moment(resource.startDate).format('DD MMM YYYY')}
                    </span>
                  )}
                  {deadline && (
                    <span className="inline-flex items-center gap-1 text-black">
                      <CalendarClock className="h-3 w-3" />
                      Due {deadline.format('DD MMM YYYY')}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {isOverdue ? (
                    <Badge className="gap-1 rounded-full border-0 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-50">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </Badge>
                  ) : (
                    daysLeft !== null && (
                      <Badge className="gap-1 rounded-full border-0 bg-watney/10 px-2 py-0.5 text-[10px] font-semibold text-watney ring-1 ring-inset ring-watney/20 hover:bg-watney/10">
                        <Clock className="h-3 w-3" />
                        {daysLeft === 0
                          ? 'Due today'
                          : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                      </Badge>
                    )
                  )}
                  {resource.finalFeedback && (
                    <Badge className="gap-1 rounded-full border-0 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50">
                      <CheckCircle2 className="h-3 w-3" />
                      Final feedback
                    </Badge>
                  )}
                  {resource.observation && (
                    <Badge className="gap-1 rounded-full border-0 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-50">
                      <Eye className="h-3 w-3" />
                      Observation
                    </Badge>
                  )}
                  {isStudent && submitted && (
                    <Badge className="gap-1 rounded-full border-0 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50">
                      <CheckCircle2 className="h-3 w-3" />
                      Submitted
                    </Badge>
                  )}
                  {/* Only staff ever see this - a draft is filtered out of the
                      student's list - so it says why the assignment has not
                      reached them yet. */}
                  {!isStudent && resource.status === 'draft' && (
                    <Badge className="gap-1 rounded-full border-0 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-black ring-1 ring-inset ring-gray-200 hover:bg-gray-100">
                      Draft - not visible to students
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex shrink-0 items-center gap-1.5">
                {/* <IconAction
                  label="Edit assignment"
                  icon={Pencil}
                  onClick={() => onEdit(resource)}
                /> */}
                {/* Assignment settings is an admin-side page; this app mounts
                    no route for it, so the button is left out rather than
                    leading nowhere. */}
              </div>
            )}
          </div>

          {resource.content?.trim() && (
            <div
              className="prose prose-sm mt-3 max-w-none rounded-lg bg-watney/5 p-3 text-xs leading-relaxed text-black [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          )}

          {isStudent && applicationId && (
            <Button
              onClick={() =>
                navigate(
                  `/dashboard/student-applications/${applicationId}/assignment/${user._id}/unit-assignments/${unitId}`,
                  { state: { assignmentId: threadData?.assignment?._id } }
                )
              }
              className="group/btn mt-3 w-full justify-between"
            >
              <span className="font-medium ">
                {submitted ? 'View submission' : 'Open assignment'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        <DeleteConfirmDialog />
      </>
    );
  }

  // ── Introduction ───────────────────────────────────────────────────────
  if (resource.type === 'introduction') {
    return (
      <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-watney/5 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-watney text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-black">
                  Introduction
                </h3>
                <p className="text-[11px] text-black">
                  How this unit opens for the student
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex shrink-0 items-center gap-1.5">
                <IconAction
                  label="Edit introduction"
                  icon={Pencil}
                  onClick={() => onEdit(resource)}
                />
                <IconAction
                  label="Delete introduction"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => setDeleteDialogOpen(true)}
                />
              </div>
            )}
          </div>

          <div className="px-4 py-4">
            <div
              className="prose prose-sm max-w-none text-sm leading-relaxed text-black [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: resource.content || '' }}
            />
          </div>
        </div>
        <DeleteConfirmDialog />
      </>
    );
  }

  // ── Learning outcome / study guide / lecture ───────────────────────────
  const typeConfig = TYPE_CONFIG[resource.type] || FALLBACK_CONFIG;
  const criteriaCount = resource.assessmentCriteria?.length || 0;

  return (
    <>
      <AccordionItem
        key={resource._id}
        value={resource._id}
        className="mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white px-0 transition-shadow last:mb-0 hover:shadow-sm"
      >
        <AccordionTrigger className="px-4 py-3 hover:bg-watney/5 hover:no-underline [&[data-state=open]]:bg-watney/5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
                {React.cloneElement(typeConfig.icon, {
                  className: 'h-4 w-4'
                })}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold text-black">
                  {resource.type === 'learning-outcome'
                    ? resource.title ||
                      resource.learningOutcomes ||
                      'Learning outcome'
                    : resource.title}
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeConfig.badge}`}
                  >
                    {typeConfig.label}
                  </span>
                  {resource.type === 'learning-outcome' && (
                    <span className="rounded-full bg-watney/10 px-2 py-0.5 text-[10px] font-semibold text-black">
                      {criteriaCount} criteri{criteriaCount === 1 ? 'on' : 'a'}
                    </span>
                  )}
                  {resource.fileUrl?.trim() && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-watney/10 px-2 py-0.5 text-[10px] font-semibold text-black">
                      <File className="h-2.5 w-2.5" />
                      File
                    </span>
                  )}
                  {isAdmin && resource.type === 'learning-outcome' && (
                    <>
                      {resource.finalFeedback && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Final feedback
                        </span>
                      )}
                      {resource.observation && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                          <Eye className="h-2.5 w-2.5" />
                          Observation
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex shrink-0 items-center gap-1.5">
                <IconAction
                  label="Edit resource"
                  icon={Pencil}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(resource);
                  }}
                />
                <IconAction
                  label="Delete resource"
                  icon={Trash2}
                  tone="danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t border-gray-200 bg-white px-4 pb-4 pt-3">
          <div className="space-y-3">
            {resource.content?.trim() && (
              <div
                className="prose prose-sm max-w-none rounded-lg bg-watney/5 p-4 text-sm leading-relaxed text-black [&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: resource.content }}
              />
            )}

            {resource.type === 'learning-outcome' &&
              (criteriaCount > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-black">
                    Assessment criteria
                  </h4>
                  {resource.assessmentCriteria!.map((criteria: any, index) => (
                    <div
                      key={criteria._id || index}
                      className="rounded-lg border border-gray-200 bg-watney/5 p-3.5 transition-colors hover:bg-watney/10"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-watney text-[11px] font-bold text-white">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 text-sm leading-relaxed text-black">
                          {criteria.title && (
                            <p className="mb-1 font-medium text-black">
                              {criteria.title}
                            </p>
                          )}
                          {criteria.description ? (
                            <div
                              className="[&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5"
                              dangerouslySetInnerHTML={{
                                __html: criteria.description
                              }}
                            />
                          ) : (
                            <span className="italic text-black">
                              No description available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-watney/5 p-5 text-center">
                  <p className="text-xs text-black">
                    No assessment criteria defined yet
                  </p>
                </div>
              ))}

            {resource.fileUrl?.trim() && (
              <div className="group/file flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-watney/5 p-3.5 transition-colors hover:bg-watney/10">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-watney">
                    <File className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                      {resource.fileName || 'Attached file'}
                    </p>
                    <p className="text-[11px] text-black">
                      Opens in a new tab
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  asChild
                  className="shrink-0 bg-watney text-xs text-white hover:bg-watney/90"
                >
                  <a
                    href={resource.fileUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5 transition-transform duration-200 group-hover/file:translate-x-0.5" />
                    <span className="hidden sm:inline">Open</span>
                  </a>
                </Button>
              </div>
            )}

            {!resource.content?.trim() &&
              !resource.fileUrl?.trim() &&
              resource.type !== 'learning-outcome' && (
                <div className="rounded-lg border border-dashed border-gray-200 bg-watney/5 p-5 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                    <File className="h-4 w-4" />
                  </span>
                  <p className="mt-2 text-xs text-black">
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
