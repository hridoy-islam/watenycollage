import React from 'react';
import moment from 'moment';

interface AssignmentContentProps {
  courseMaterialAssignmentId: string; // Changed from assignmentName
  effectiveDeadline: moment.Moment | null;
  isDeadlinePassed: boolean;
  isTeacher: boolean;
  isCompleted: boolean;
  onMarkCompleted: () => void;
  completionDialogOpen: boolean;
  setCompletionDialogOpen: (open: boolean) => void;
  markingCompleted: boolean;
  studentName: string;
  unitMaterial: any;
  actionButton?: React.ReactNode;
  finalFeedbackButton?: React.ReactNode;
}

export const AssignmentContent: React.FC<AssignmentContentProps> = ({
  courseMaterialAssignmentId,
  effectiveDeadline,
  isDeadlinePassed,
  isTeacher,
  isCompleted,
  onMarkCompleted,
  completionDialogOpen,
  setCompletionDialogOpen,
  markingCompleted,
  studentName,
  unitMaterial,
  actionButton,
  finalFeedbackButton
}) => {
  // Get assignment details from unit material
  const getAssignmentDetails = () => {
    if (!unitMaterial?.assignments) return { title: 'Unknown Assignment', content: null };

    const materialAssignment = unitMaterial.assignments.find(
      (a: any) => a._id.toString() === courseMaterialAssignmentId
    );

    return {
      title: materialAssignment?.title || 'Unknown Assignment',
      content: materialAssignment?.content || null
    };
  };

  const assignmentDetails = getAssignmentDetails();
  const assignmentName = assignmentDetails.title;
  const assignmentContent = assignmentDetails.content;

  return (
    <div className="border-b border-gray-200 bg-white p-4 w-full">
      <div className="flex flex-col w-full space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Assignment Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-left w-full sm:w-auto">
            {assignmentName}
          </h2>

          <div className='flex flex-row items-center gap-4'>


          {actionButton && (
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              {actionButton}
            </div>
          )}

           {finalFeedbackButton && (
             <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              {finalFeedbackButton}
            </div>
          )}
          </div>
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