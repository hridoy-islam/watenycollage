import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import {
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Target
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceCard from './ResourceCard';
import { Resource } from './types';
import { cn } from '@/lib/utils';

interface ResourceListProps {
  resources: Resource[];
  studentSubmissions?: Record<string, any>;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (id: string) => void;
  applicationId: any;
}

const sortBySerialNumber = (resources: Resource[]) => {
  return [...resources].sort((a, b) => {
    const getSerialNumber = (text: string) => {
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };
    const aSerial = getSerialNumber(a.learningOutcomes || a.title || '');
    const bSerial = getSerialNumber(b.learningOutcomes || b.title || '');
    if (aSerial !== null && bSerial !== null) return aSerial - bSerial;
    if (aSerial !== null) return -1;
    if (bSerial !== null) return 1;
    return 0;
  });
};

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  studentSubmissions = {},
  onEditResource,
  onDeleteResource,
  applicationId
}) => {
  // ✅ useMemo successfully caches computed lists to avoid excessive recalculation
  const {
    introductionResource,
    studyGuides,
    lectures,
    assignments,
    learningOutcomes
  } = useMemo(() => {
    return {
      introductionResource: resources.find((r) => r.type === 'introduction'),
      studyGuides: resources.filter((r) => r.type === 'study-guide'),
      lectures: resources.filter((r) => r.type === 'lecture'),
      assignments: resources.filter((r) => r.type === 'assignment'),
      learningOutcomes: resources.filter((r) => r.type === 'learning-outcome')
    };
  }, [resources]);

  const tabs = [
    {
      id: 'outcomes',
      label: 'Learning Outcomes',
      icon: Target,
      count: learningOutcomes.length,
      resources: learningOutcomes,
      color: 'indigo'
    },
    {
      id: 'guides',
      label: 'Study Guides',
      icon: BookOpen,
      count: studyGuides.length,
      resources: studyGuides,
      color: 'emerald'
    },
    {
      id: 'lectures',
      label: 'Lectures',
      icon: BookAIcon,
      count: lectures.length,
      resources: lectures,
      color: 'violet'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Introduction Section */}
      {introductionResource && (
        <div className="bg-white overflow-hidden">
          <div>
            <ResourceCard
              resource={introductionResource}
              onEdit={onEditResource}
              onDelete={onDeleteResource}
              applicationId={applicationId}
            />
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side - Tabs with Resources */}
        {/* Dynamically adjust col-span based on whether assignments exist */}
        <div className={assignments.length > 0 ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
          <Tabs defaultValue="outcomes" className="w-full">
            <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent p-0 h-auto gap-0 rounded-none">
              {tabs.map((tab) => (
                tab.resources.length > 0 && (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-none bg-transparent border-b-2 border-transparent",
                      "data-[state=active]:border-watney data-[state=active]:text-white",
                      "data-[state=inactive]:text-black data-[state=inactive]:hover:text-slate-700",
                      "transition-all duration-200"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {tab.count}
                    </span>
                  </TabsTrigger>
                )
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                {tab.resources.length > 0 ? (
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                      <Accordion type="multiple" className="w-full">
                        {sortBySerialNumber(tab.resources).map((resource) => (
                          <ResourceCard
                            key={resource._id}
                            resource={resource}
                            onEdit={onEditResource}
                            onDelete={onDeleteResource}
                            applicationId={applicationId}
                          />
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p>No {tab.label.toLowerCase()} available</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Sidebar - Assignments (✅ Hide this entirely if empty) */}
        {assignments.length > 0 && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Assignments</h3>
                      <p className="text-xs text-white/80">
                        {assignments.length} {assignments.length === 1 ? 'task' : 'tasks'} to complete
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <ResourceCard
                        key={assignment._id}
                        resource={assignment}
                        studentSubmission={studentSubmissions[assignment.title || '']}
                        onEdit={onEditResource}
                        onDelete={onDeleteResource}
                        applicationId={applicationId}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceList;