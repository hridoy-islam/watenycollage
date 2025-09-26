import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { GraduationCap, BookOpen, BookA as BookAIcon, FileText } from 'lucide-react';
import ResourceCard from './ResourceCard';
import { Resource } from './types';

interface ResourceListProps {
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  onEditResource,
  onDeleteResource
}) => {
  const introductionResource = resources.find(r => r.type === 'introduction');
  const studyGuides = resources.filter(r => r.type === 'study-guide');
  const lectures = resources.filter(r => r.type === 'lecture');
  const assignments = resources.filter(r => r.type === 'assignment');

  return (
    <div className="space-y-2">
      {/* Introduction Section */}
      {introductionResource && (
        <ResourceCard
          resource={introductionResource}
          onEdit={onEditResource}
          onDelete={onDeleteResource}
        />
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
                  key={guide.id}
                  resource={guide}
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
                  key={lecture.id}
                  resource={lecture}
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
                  key={assignment.id}
                  resource={assignment}
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