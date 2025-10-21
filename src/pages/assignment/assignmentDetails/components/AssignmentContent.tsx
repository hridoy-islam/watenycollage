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
  <div className="flex flex-col w-full space-y-4">
    {/* Header Row */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
      {/* Assignment Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-left w-full sm:w-auto">
        {assignmentName}
      </h2>

      {/* Action Button */}
      {actionButton && (
        <div className="w-full sm:w-auto flex justify-start sm:justify-end">
          {actionButton}
        </div>
      )}
    </div>

    {/* Assignment Instructions */}
    {assignmentContent && (
      <div className="w-full">
        <div
          className="whitespace-pre-wrap text-sm sm:text-base text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: assignmentContent
          }}
        />
      </div>
    )}
  </div>
</div>

  );
};