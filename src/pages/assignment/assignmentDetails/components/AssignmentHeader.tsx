import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CourseUnit {
  title: string;
  unitReference: string;
}

interface AssignmentHeaderProps {
  isStudent: boolean;
  studentName: string;
  courseUnit: CourseUnit | null;
  onBack: () => void;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  isStudent,
  studentName,
  courseUnit,
  onBack
}) => {
  return (
    <div className="mb-4 flex items-center justify-between text-lg">
      <h1 className=" font-bold">
        {isStudent ? 'My Assignment' : 'Assignment'}
      </h1>
      <div className="flex flex-row justify-between gap-4">
        <div className=" flex items-center gap-4 ">
          {!isStudent && (
            <span>
              Student: <span className="font-semibold">{studentName}</span>
            </span>
          )}

          <span>
            Unit: <span className="font-semibold">{courseUnit?.title}</span>
          </span>
          {/* {courseUnit && (
            <>
              <span>
                Ref:{' '}
                <span className="font-semibold">
                  {courseUnit.unitReference}
                </span>
              </span>
            </>
          )} */}
        </div>
      </div>
      <Button
        variant="default"
        size="sm"
        onClick={onBack}
        className="bg-watney text-white hover:bg-watney/90"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
    </div>
  );
};
