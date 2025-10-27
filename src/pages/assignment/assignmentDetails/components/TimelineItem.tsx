import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  User,
  MessageSquare,
  Edit,
  Trash2,
  File,
  Calendar
} from 'lucide-react';
import moment from 'moment';
import { TimelineItemSkeleton } from './TimelineItemSkeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface TimelineItemProps {
  type: 'submission' | 'feedback';
  data: {
    _id: string;
    submitBy: { name: string };
    comment?: string;
    files: string[];
    deadline?: string;
    createdAt: string;
  };
  isTeacher: boolean;
  isStudent?: boolean;
  assignment?: any;
  isLatestSubmissionItem?: boolean;
  hasFeedbackAfter?: boolean;
  onEdit: (type: 'submission' | 'feedback', id: string) => void;
  onDelete: (type: 'submission' | 'feedback', id: string) => void;
  isLoading?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  type,
  data,
  isTeacher,
  isStudent = false,
  assignment,
  isLatestSubmissionItem = false,
  hasFeedbackAfter = false,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  if (isLoading) {
    return <TimelineItemSkeleton type={type} />;
  }

  const isSubmission = type === 'submission';

  const showEditDeleteButtons = () => {
    if (isTeacher) return true;

    if (isStudent && isSubmission) {
      const canEdit = isLatestSubmissionItem && !hasFeedbackAfter;
      return canEdit;
    }

    return false;
  };

  const canEditDelete = showEditDeleteButtons();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (canEditDelete) {
      onEdit(type, data._id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (canEditDelete) {
      setOpenDeleteDialog(true);
    }
  };

  const confirmDelete = () => {
    onDelete(type, data._id);
    setOpenDeleteDialog(false);
  };

  // Check if deadline exists and is valid
  const hasDeadline = data.deadline && moment(data.deadline).isValid();

  return (
    <div
      className={`${
        isSubmission
          ? 'rounded-lg border border-blue-200 bg-blue-50 p-4'
          : 'rounded-lg border border-purple-200 bg-purple-50 p-4'
      } w-full`}
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* === Left Side: User Info & Details === */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* === Icon === */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isSubmission ? 'bg-blue-200' : 'bg-purple-200'
              }`}
            >
              {isSubmission ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <MessageSquare className="h-4 w-4 text-purple-600" />
              )}
            </div>

            {/* === Info Texts === */}
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
              <p
                className={`font-semibold ${
                  isSubmission ? 'text-blue-900' : 'text-purple-900'
                }`}
              >
                {data.submitBy?.name}
              </p>

              <p className="text-xs font-medium text-green-700 sm:text-sm">
                <span className="font-medium">
                  {isSubmission
                    ? 'Assignment Submitted:'
                    : 'Feedback Provided:'}
                </span>{' '}
                {moment(data.createdAt).format('DD MMM YYYY')}
              </p>

              {/* === Deadline Display === */}
              {hasDeadline && (
                <div className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                  {isSubmission ? (
                    <p className="font-medium text-red-700">
                      Deadline: {moment(data.deadline).format('DD MMM YYYY')}
                    </p>
                  ) : (
                    <>
                      <Calendar className="h-3 w-3 text-orange-500 sm:h-4 sm:w-4" />
                      <p className="font-medium text-orange-700">
                        Resubmission Deadline:{' '}
                        {moment(data.deadline).format('DD MMM YYYY')}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === Edit/Delete Buttons === */}
        {canEditDelete && (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={handleEditClick}
              className="flex h-7 w-7 items-center justify-center rounded transition hover:bg-blue-100"
              title={isStudent ? 'Edit submission' : 'Edit'}
            >
              <Edit className="h-4 w-4 text-gray-500" />
            </button>
            {/* Uncomment if delete is needed */}
            {/* <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-red-100 transition"
            title={isStudent ? 'Delete submission' : 'Delete'}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button> */}
          </div>
        )}
      </div>

      {/* === Comment Text === */}
      {/* {data.comment && (
      <p className="mb-3 text-sm sm:text-base text-gray-800 leading-relaxed break-words">
        {data.comment}
      </p>
    )} */}

      {data.comment && (
        <div
          className="mb-3 break-words text-sm leading-relaxed text-gray-800 sm:text-base"
          dangerouslySetInnerHTML={{ __html: data.comment }}
        />
      )}

      {/* === Files === */}
      {data.files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {data.files.map((file, i) => (
            <Button
              key={i}
              asChild
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90 sm:text-sm"
            >
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                View Document {i + 1}
              </a>
            </Button>
          ))}
        </div>
      )}

      {/* === Delete Dialog === */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {type}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
