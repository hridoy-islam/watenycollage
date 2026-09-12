import React, { useMemo, useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  BookA as BookAIcon,
  FileText,
  Target,
  GraduationCap,
  Search,
  X
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

/**
 * Outcomes and guides are usually numbered ("LO2", "Guide 3"), so a numeric
 * prefix wins over alphabetical order; anything unnumbered keeps its position.
 */
const sortBySerialNumber = (resources: Resource[]) =>
  [...resources].sort((a, b) => {
    const serialOf = (text: string) => {
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };
    const aSerial = serialOf(a.learningOutcomes || a.title || '');
    const bSerial = serialOf(b.learningOutcomes || b.title || '');
    if (aSerial !== null && bSerial !== null) return aSerial - bSerial;
    if (aSerial !== null) return -1;
    if (bSerial !== null) return 1;
    return 0;
  });

const searchable = (resource: Resource) =>
  [
    resource.title,
    resource.learningOutcomes,
    resource.fileName,
    resource.content?.replace(/<[^>]*>/g, ' ')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-watney/5 px-6 py-12 text-center">
      <p className="text-sm font-medium text-black">
        No {label.toLowerCase()} yet
      </p>
      <p className="mt-1 text-xs text-black">
        Anything you add here appears for every student in this unit.
      </p>
    </div>
  );
}

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  studentSubmissions = {},
  onEditResource,
  onDeleteResource,
  applicationId
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return resources;
    return resources.filter((resource) => searchable(resource).includes(term));
  }, [resources, search]);

  const {
    introductionResource,
    studyGuides,
    lectures,
    assignments,
    learningOutcomes
  } = useMemo(
    () => ({
      introductionResource: filtered.find((r) => r.type === 'introduction'),
      studyGuides: filtered.filter((r) => r.type === 'study-guide'),
      lectures: filtered.filter((r) => r.type === 'lecture'),
      assignments: filtered.filter((r) => r.type === 'assignment'),
      learningOutcomes: filtered.filter((r) => r.type === 'learning-outcome')
    }),
    [filtered]
  );

  const tabs = [
    {
      id: 'outcomes',
      label: 'Learning outcomes',
      icon: Target,
      items: learningOutcomes
    },
    { id: 'guides', label: 'Study guides', icon: BookOpen, items: studyGuides },
    { id: 'lectures', label: 'Lectures', icon: BookAIcon, items: lectures },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: FileText,
      items: assignments
    }
  ];

  // Open on the first tab that actually has something in it.
  const defaultTab = tabs.find((tab) => tab.items.length > 0)?.id || 'outcomes';

  const nothingMatched = search.trim() && filtered.length === 0;

  return (
    <div className="space-y-4">
      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search resources by title or content"
          className="h-9 pl-8 text-xs"
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {nothingMatched ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-watney/5 px-6 py-14 text-center">
          <GraduationCap className="mx-auto h-9 w-9 text-black" />
          <p className="mt-2 text-sm font-semibold text-black">
            Nothing matches “{search}”
          </p>
          <p className="mt-1 text-xs text-black">
            Try a different title, file name or phrase.
          </p>
        </div>
      ) : (
        <>
          {/* ── Introduction ─────────────────────────────────────────────── */}
          {introductionResource && (
            <ResourceCard
              resource={introductionResource}
              onEdit={onEditResource}
              onDelete={onDeleteResource}
              applicationId={applicationId}
            />
          )}

          {/* ── Everything else, by kind ─────────────────────────────────── */}
          <Tabs key={defaultTab} defaultValue={defaultTab} className="w-full">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-0 rounded-none border-b border-gray-200 bg-transparent p-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'relative flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-xs font-medium transition-all',
                    'data-[state=active]:border-watney data-[state=active]:text-white data-[state=active]:shadow-none',
                    'data-[state=inactive]:text-black data-[state=inactive]:hover:text-black'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-watney/10 px-1.5 py-0.5 text-[10px] font-semibold ">
                    {tab.items.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                {tab.items.length === 0 ? (
                  <EmptyPanel label={tab.label} />
                ) : tab.id === 'assignments' ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {sortBySerialNumber(tab.items).map((assignment) => (
                      <ResourceCard
                        key={assignment._id}
                        resource={assignment}
                        studentSubmission={
                          studentSubmissions[assignment.title || '']
                        }
                        onEdit={onEditResource}
                        onDelete={onDeleteResource}
                        applicationId={applicationId}
                      />
                    ))}
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {sortBySerialNumber(tab.items).map((resource) => (
                      <ResourceCard
                        key={resource._id}
                        resource={resource}
                        onEdit={onEditResource}
                        onDelete={onDeleteResource}
                        applicationId={applicationId}
                      />
                    ))}
                  </Accordion>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ResourceList;
