import React from 'react';
import moment from 'moment';

interface AssignmentContentProps {
  assignmentName: string;
  effectiveDeadline: moment.Moment | null;
  isDeadlinePassed: boolean;
  assignmentContent: string | null;
  isTeacher: boolean;
  isCompleted: boolean;
  onMarkCompleted: () => void;
  completionDialogOpen: boolean;
  setCompletionDialogOpen: (open: boolean) => void;
  markingCompleted: boolean;
  studentName: string;
  selectedAssignmentName: string;
  unitMaterial: any;
  actionButton?: React.ReactNode;
}

export const AssignmentContent: React.FC<AssignmentContentProps> = ({
  assignmentName,
  effectiveDeadline,
  isDeadlinePassed,
  assignmentContent,
  isTeacher,
  isCompleted,
  onMarkCompleted,
  completionDialogOpen,
  setCompletionDialogOpen,
  markingCompleted,
  studentName,
  selectedAssignmentName,
  unitMaterial,
  actionButton
}) => {
  return (
    <div className="border-b border-gray-200 bg-white p-4 w-full">
      <div className="flex flex-col items-start justify-between w-full">
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Header row with assignment name and action button */}
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">{assignmentName}</h2>
            
            {/* Action button positioned to the right */}
            {actionButton && (
              <div className="flex items-center justify-end">
                {actionButton}
              </div>
            )}
          </div>

          {/* Assignment Instructions */}
          {assignmentContent && (
            <div className="w-full">
              <div
                className="whitespace-pre-wrap text-xs text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: assignmentContent
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};