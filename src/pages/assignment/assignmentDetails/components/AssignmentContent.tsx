import React from 'react';
import moment from 'moment';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AssignmentContentProps {
  assignmentSettingId: string;
  isResultPublished?: boolean;
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
  assignmentSettings?: any[];
  assignmentContent?: any;
  selectedAssignmentName?: string;
  actionButton?: React.ReactNode;
  observationButton?: React.ReactNode;
  finalFeedbackButton?: React.ReactNode;
  gradingOptions?: string[];
  finalGrade?: string;
  updatingGrade?: boolean;
  onFinalGradeChange?: (grade: string) => void;
}

export const AssignmentContent: React.FC<AssignmentContentProps> = ({
  assignmentSettingId,
  isResultPublished,
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
  assignmentSettings = [],
  actionButton,
  finalFeedbackButton,
  observationButton,
  gradingOptions = [],
  finalGrade,
  updatingGrade = false,
  onFinalGradeChange
}) => {
  // Get assignment details from assignment-settings
  const getAssignmentDetails = () => {
    if (assignmentSettings.length === 0) {
      return { title: 'Unknown Assignment', content: null };
    }

    const settingsAssignment = assignmentSettings.find(
      (s: any) => s._id.toString() === assignmentSettingId
    );

    return {
      title: settingsAssignment?.assignmentTitle || 'Unknown Assignment',
      content: settingsAssignment?.description || null
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

           {observationButton && (
             <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              {observationButton}
            </div>
          )}
           {finalFeedbackButton && (
             <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              {finalFeedbackButton}
            </div>
          )}
          </div>
        </div>

        {/* Final Grade Section */}
        {(isTeacher || isResultPublished) && (gradingOptions.length > 0 || finalGrade) ? (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Final Grade:
              </span>
              {finalGrade ? (
                <Badge className="bg-amber-600 text-white border-amber-700 text-sm">
                  {finalGrade}
                </Badge>
              ) : (
                <span className="text-sm font-medium text-amber-700/70">
                  Not graded yet
                </span>
              )}
            </div>

            {isTeacher && gradingOptions.length > 0 && (
              <select
                value={finalGrade || ''}
                onChange={(e) => onFinalGradeChange?.(e.target.value)}
                disabled={updatingGrade}
                className="h-9 rounded-md border border-amber-300 bg-white px-3 py-1 text-sm text-amber-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
              >
                {finalGrade ? (
                  <>
                    <option value="">Clear grade</option>
                    {gradingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">{updatingGrade ? 'Saving...' : 'Select grade'}</option>
                    {gradingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>
        ) : null}

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