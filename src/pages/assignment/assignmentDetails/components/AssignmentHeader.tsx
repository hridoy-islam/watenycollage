import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseUnit {
  title: string;
  unitReference: string;
}

interface AssignmentHeaderProps {
  isStudent: boolean;
  studentName: string;
  courseUnit: CourseUnit | null;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  isStudent,
  studentName,
  courseUnit,
}) => {
  const navigate = useNavigate()
   const canGoBack = window.history.length > 1;
  return (
    <div className="mb-4 flex items-center justify-between text-lg">
  <h1 className="font-bold max-md:hidden">
    {isStudent ? 'My Assignment' : 'Assignment'}
  </h1>

  <div
    className={`flex flex-row gap-4 text-sm md:text-lg ${
      canGoBack ? 'justify-between' : 'justify-center w-full'
    }`}
  >
    <div className="flex items-center gap-4">
      {!isStudent && (
        <span>
          Student: <span className="font-semibold">{studentName}</span>
        </span>
      )}

      <span>
        <span className="font-semibold">{courseUnit?.title}</span>
      </span>
    </div>
  </div>

  {canGoBack && (
    <Button
      variant="default"
      size="sm"
      onClick={() => navigate(-1)}
      className="bg-watney text-white hover:bg-watney/90"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  )}
</div>

  );
};
