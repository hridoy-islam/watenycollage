import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TimelineItemSkeletonProps {
  type: 'submission' | 'feedback';
}

export const TimelineItemSkeleton: React.FC<TimelineItemSkeletonProps> = ({ type }) => {
  const isSubmission = type === 'submission';
  
  return (
    <Card className={`rounded-lg border p-4 animate-pulse ${
      isSubmission 
        ? 'border-blue-200 bg-blue-50' 
        : 'ml-8 border-purple-200 bg-purple-50'
    }`}>
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className={`h-8 w-8 rounded-full ${
            isSubmission ? 'bg-blue-200' : 'bg-purple-200'
          }`} />
          <div>
            <Skeleton className={`h-4 w-24 mb-1 ${
              isSubmission ? 'bg-blue-200' : 'bg-purple-200'
            }`} />
            <Skeleton className="h-3 w-16 bg-gray-300" />
          </div>
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 bg-gray-300 rounded" />
          <Skeleton className="h-6 w-6 bg-gray-300 rounded" />
        </div>
      </div>
      
      <Skeleton className="h-4 w-full bg-gray-300 mb-2" />
      <Skeleton className="h-4 w-3/4 bg-gray-300 mb-3" />
      
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-32 bg-gray-300 rounded" />
        <Skeleton className="h-8 w-28 bg-gray-300 rounded" />
      </div>
    </Card>
  );
};