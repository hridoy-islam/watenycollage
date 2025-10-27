import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import {
  GraduationCap,
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Target
} from 'lucide-react';
import ResourceCard from './ResourceCard';
import { Resource } from './types';

interface ResourceListProps {
  resources: Resource[];
  studentSubmissions?: Record<string, any>;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  applicationId:any
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  studentSubmissions = {},
  onEditResource,
  onDeleteResource,
  applicationId
  
}) => {
  const introductionResource = resources.find((r) => r.type === 'introduction');
  const studyGuides = resources.filter((r) => r.type === 'study-guide');
  const lectures = resources.filter((r) => r.type === 'lecture');
  const assignments = resources.filter((r) => r.type === 'assignment');
  const learningOutcomes = resources.filter(
    (r) => r.type === 'learning-outcome'
  );


  // 🔢 Sorts items based on any serial number pattern (e.g., LO1, LOC2, STEP3, PART10)
const sortBySerialNumber = (resources: Resource[]) => {
  return resources.sort((a, b) => {
    const getSerialNumber = (text: string) => {
      // Extract first number found in the text (e.g., LO1 → 1, PART12 → 12)
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };

    const aSerial = getSerialNumber(a.learningOutcomes || a.title || '');
    const bSerial = getSerialNumber(b.learningOutcomes || b.title || '');

    // ✅ Both have numbers — sort numerically
    if (aSerial !== null && bSerial !== null) return aSerial - bSerial;

    // ✅ Only A has a number — it comes first
    if (aSerial !== null) return -1;

    // ✅ Only B has a number — it comes first
    if (bSerial !== null) return 1;

    // ✅ Neither has a number — keep original order or sort alphabetically if needed
    return 0;
  });
};

  

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Column - All content except assignments */}
      <div className="flex-1 space-y-4">
        {/* Introduction Section */}
        {introductionResource && (
          <ResourceCard
            resource={introductionResource}
            studentSubmission={undefined}
            onEdit={onEditResource}
            onDelete={onDeleteResource}
          />
        )}

        {/* Learning Outcomes Section */}
        {learningOutcomes.length > 0 && (
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Learning Outcomes</CardTitle>
                  <CardDescription>
                    {learningOutcomes.length} unit
                    {learningOutcomes.length > 1 ? 's' : ''} defined
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {sortBySerialNumber(learningOutcomes).map((loResource) => (
                  <ResourceCard
                    key={loResource._id}
                    resource={loResource}
                    studentSubmission={undefined}
                    onEdit={onEditResource}
                    onDelete={onDeleteResource}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Study Guides Section */}
        {studyGuides.length > 0 && (
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Study Guides</CardTitle>
                  <CardDescription>
                    {studyGuides.length} guide
                    {studyGuides.length > 1 ? 's' : ''} available
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {sortBySerialNumber(studyGuides).map((guide) => (
                  <ResourceCard
                    key={guide._id}
                    resource={guide}
                    studentSubmission={undefined}
                    onEdit={onEditResource}
                    onDelete={onDeleteResource}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Lectures Section */}
        {lectures.length > 0 && (
          <Card className="border border-gray-300 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <BookAIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Lectures</CardTitle>
                  <CardDescription>
                    {lectures.length} lecture{lectures.length > 1 ? 's' : ''}{' '}
                    available
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {sortBySerialNumber(lectures).map((lecture) => (
                  <ResourceCard
                    key={lecture._id}
                    resource={lecture}
                    studentSubmission={undefined}
                    onEdit={onEditResource}
                    onDelete={onDeleteResource}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Assignments (Sticky) */}
      {assignments.length > 0 && (
        <div className="lg:w-1/3 ">
          <div className="sticky top-4">
            <Card className="rounded-xl border border-gray-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Assignments
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {assignments.length} assignment
                      {assignments.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <ResourceCard
                        key={assignment._id}
                        resource={assignment}
                        studentSubmission={studentSubmissions[assignment.title]}
                        onEdit={onEditResource}
                        onDelete={onDeleteResource}
                        applicationId={applicationId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-sm italic text-gray-500">
                    No assignments available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList;
