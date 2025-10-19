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
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                isSubmission ? 'bg-blue-200' : 'bg-purple-200'
              }`}
            >
              {isSubmission ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <MessageSquare className="h-4 w-4 text-purple-600" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold ${
                    isSubmission ? 'text-blue-900' : 'text-purple-900'
                  }`}
                >
                  {data.submitBy?.name}
                </p>
                <p className="text-sm font-medium text-green-700">
                  <span className="font-medium">
                    {isSubmission ? 'Assignment Submitted:' : 'Feedback Provided:'}
                  </span>{' '}
                  {moment(data.createdAt).format('DD MMM YYYY')}
                </p>
              </div>

              {/* Show deadline for submission items */}
              {isSubmission && hasDeadline && (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-red-700 ">
                    Deadline: {moment(data.deadline).format('DD MMM YYYY')}
                  </p>
                </div>
              )}

              {/* Show deadline for feedback items */}
              {!isSubmission && hasDeadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium text-orange-700">
                    Resubmission Deadline: {moment(data.deadline).format('DD MMM YYYY')}
                  </p>
                </div>
              )}
            </div>
          </div>

          
        </div>

        {canEditDelete && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleEditClick}
              className="flex h-6 w-6 items-center justify-center rounded p-0 hover:bg-blue-100"
              title={isStudent ? 'Edit submission' : 'Edit'}
            >
              <Edit className="h-4 w-4 text-gray-500" />
            </button>
            {/* <button
              type="button"
              onClick={handleDeleteClick}
              className="flex h-6 w-6 items-center justify-center rounded p-0 hover:bg-red-50"
              title={isStudent ? 'Delete submission' : 'Delete'}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button> */}
          </div>
        )}
      </div>

      {data.comment && (
        <p className="mb-3 text-xs text-gray-800">{data.comment}</p>
      )}

      {data.files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.files.map((file, i) => (
            <Button
              key={i}
              asChild
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
            >
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <File className="h-4 w-4" />
                View Document {i + 1}
              </a>
            </Button>
          ))}
        </div>
      )}

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