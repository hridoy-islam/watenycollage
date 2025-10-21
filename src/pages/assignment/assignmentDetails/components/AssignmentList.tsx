import type React from 'react';
import moment from 'moment';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye } from 'lucide-react';

interface Submission {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  files: string[];
  comment?: string;
  seen: boolean;
  status: 'submitted' | 'resubmitted';
  deadline?: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  comment?: string;
  files: string[];
  seen: boolean;
  createdAt: string;
}

interface Assignment {
  _id: string;
  applicationId: string;
  unitId: {
    _id: string;
    title: string;
    unitReference: string;
    level: string;
    gls: string;
    credit: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  assignmentName: string;
  submissions: Submission[];
  feedbacks: Feedback[];
  status: string;
  deadline?: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentListProps {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  onSelectAssignment: (assignment: Assignment) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getUnseenCounts: (assignment: Assignment) => number;
  isStudent: boolean;
  unitMaterial: any; // Add unitMaterial prop
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
  assignments,
  selectedAssignment,
  onSelectAssignment,
  getStatusBadge,
  getUnseenCounts,
  isStudent,
  unitMaterial // Add unitMaterial to props
}) => {
  // Function to get unit material deadline for a specific assignment
  const getUnitMaterialDeadline = (assignmentName: string): string | null => {
    if (!unitMaterial?.assignments) return null;

    const materialAssignment = unitMaterial.assignments.find(
      (a: any) => a.title === assignmentName
    );

    return materialAssignment?.deadline || null;
  };

  return (
   <div className="w-full md:w-96 max-h-[70vh] overflow-y-auto pr-2 sm:pr-4">
  <Card className="border border-gray-300">
    <CardContent className="space-y-2 p-4">
      {assignments.length === 0 ? (
        <p className="py-6 text-center text-sm sm:text-base text-gray-500">
          No assignments found in this unit
        </p>
      ) : (
        assignments.map((assignment) => {
          const unseenCount = getUnseenCounts(assignment);
          const unitMaterialDeadline = getUnitMaterialDeadline(
            assignment.assignmentName
          );

          return (
            <div
              key={assignment._id}
              className={`cursor-pointer rounded-lg border p-3 sm:p-4 transition-colors ${
                selectedAssignment?._id === assignment._id
                  ? 'border-watney bg-watney/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onSelectAssignment(assignment)}
            >
              {/* === Assignment Header === */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm sm:text-base font-medium text-gray-800 break-words">
                  {assignment.assignmentName}
                </span>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                  {assignment.status === 'completed' && (
                    <span className="text-green-600">
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* === Deadline Info === */}
              <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {unitMaterialDeadline ? (
                  <span>
                    Initial Deadline:{' '}
                    {moment(unitMaterialDeadline).format('DD MMM YYYY')}
                  </span>
                ) : (
                  <span>No deadline</span>
                )}
              </div>

              {/* === Optional Unseen Counter (Hidden Currently) === */}
              {/* {unseenCount > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                  {isStudent
                    ? `${unseenCount} new feedback${unseenCount > 1 ? 's' : ''}`
                    : `${unseenCount} new submission${unseenCount > 1 ? 's' : ''}`}
                </div>
              )} */}
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
</div>

  );
};
