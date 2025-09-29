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
  studentSubmissions?: Record<string, any>; // ✅ Add this
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  studentSubmissions = {}, // ✅ Default to empty object
  onEditResource,
  onDeleteResource
}) => {
  const introductionResource = resources.find((r) => r.type === 'introduction');
  const studyGuides = resources.filter((r) => r.type === 'study-guide');
  const lectures = resources.filter((r) => r.type === 'lecture');
  const assignments = resources.filter((r) => r.type === 'assignment');
  const learningOutcomes = resources.filter(
    (r) => r.type === 'learning-outcome'
  );

  return (
    <div className="space-y-2">
      {/* Introduction Section */}
      {introductionResource && (
        <ResourceCard
          resource={introductionResource}
          studentSubmission={undefined} // Introduction doesn't have submissions
          onEdit={onEditResource}
          onDelete={onDeleteResource}
        />
      )}

      {/* Learning Outcomes Section */}
      {learningOutcomes.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Learning Outcomes</CardTitle>
                <CardDescription>
                  {learningOutcomes.length} unit{learningOutcomes.length > 1 ? 's' : ''} defined
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {learningOutcomes.map((loResource) => (
                <ResourceCard
                  key={loResource._id}
                  resource={loResource}
                  studentSubmission={undefined} // Learning outcomes don't have submissions
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
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Study Guides</CardTitle>
                <CardDescription>
                  {studyGuides.length} guide{studyGuides.length > 1 ? 's' : ''} available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {studyGuides.map((guide) => (
                <ResourceCard
                  key={guide._id}
                  resource={guide}
                  studentSubmission={undefined} // Study guides don't have submissions
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
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <BookAIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Lectures</CardTitle>
                <CardDescription>
                  {lectures.length} lecture{lectures.length > 1 ? 's' : ''} available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {lectures.map((lecture) => (
                <ResourceCard
                  key={lecture._id}
                  resource={lecture}
                  studentSubmission={undefined} // Lectures don't have submissions
                  onEdit={onEditResource}
                  onDelete={onDeleteResource}
                />
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Assignments Section */}
      {assignments.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  {assignments.length} assignment{assignments.length > 1 ? 's' : ''} available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <ResourceCard
                  key={assignment._id}
                  resource={assignment}
                  studentSubmission={studentSubmissions[assignment.title]} // ✅ Critical: Match by title
                  onEdit={onEditResource}
                  onDelete={onDeleteResource}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourceList;