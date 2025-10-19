import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageCircle, FileText } from 'lucide-react';
import { TimelineItem } from './TimelineItem';
import moment, { type Moment } from 'moment';
import { TimelineItemSkeleton } from './TimelineItemSkeleton';

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
  deadline?: string;
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

type TimelineItemType =
  | { type: 'submission'; data: Submission & { createdAt: Moment } }
  | { type: 'feedback'; data: Feedback & { createdAt: Moment } };

interface AssignmentTimelineProps {
  timeline: TimelineItemType[];
  isTeacher: boolean;
  isStudent?: boolean;
  selectedAssignment?: Assignment | null;
  onEditItem: (type: 'submission' | 'feedback', id: string) => void;
  onDeleteItem: (type: 'submission' | 'feedback', id: string) => void;
  hasSelectedAssignment: boolean;
  loadingItems?: Record<string, boolean>;
}

// Helper function to determine if a submission is the latest
const isFirstSubmission = (submissionId: string, submissions: Submission[]): boolean => {
  if (submissions.length === 0) return false;
  const firstSubmission = submissions[0];
  return firstSubmission._id === submissionId;
};

// Helper function to check if there's feedback after a submission
const hasFeedbackAfterSubmission = (
  submissionId: string, 
  submissionCreatedAt: string, 
  feedbacks: Feedback[]
): boolean => {
  const submissionTime = moment(submissionCreatedAt);
  
  // Find all feedbacks that were created after this submission
  const feedbacksAfter = feedbacks.filter(feedback => 
    moment(feedback.createdAt).isAfter(submissionTime)
  );
  
  return feedbacksAfter.length > 0;
};

export const AssignmentTimeline: React.FC<AssignmentTimelineProps> = ({
  timeline,
  isTeacher,
  isStudent = false,
  selectedAssignment,
  onEditItem,
  onDeleteItem,
  hasSelectedAssignment,
  loadingItems = {}
}) => {
  if (!hasSelectedAssignment) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="px-6 py-10 text-center">
          <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">No Assignment Selected</h3>
          <p className="text-gray-500">Select an assignment to continue.</p>
        </Card>
      </div>
    );
  }

  // Get loading item IDs
  const loadingItemIds = Object.keys(loadingItems);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {timeline.length === 0 && loadingItemIds.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p>No submissions or feedback yet</p>
            </div>
          </div>
        ) : (
          <>
            {/* Show loading skeletons first */}
            {/* {loadingItemIds.map(loadingId => {
              // Determine type based on ID prefix
              const isSubmission = loadingId.startsWith('loading_submission');
              const type = isSubmission ? 'submission' : 'feedback';
              
              return (
                <div key={loadingId} className="flex flex-col">
                  <TimelineItemSkeleton type={type} />
                </div>
              );
            })} */}
            
            {/* Then show actual timeline items */}
            {timeline.map((item, idx) => {
              // Skip if this item is still loading
              if (loadingItems[item.data._id]) return null;
              
              // Calculate edit/delete permissions for submissions
              let isFirstSubmissionItem = false;
              let hasFeedbackAfter = false;
              
              if (item.type === 'submission' && selectedAssignment) {
                isFirstSubmissionItem = isFirstSubmission(
                  item.data._id, 
                  selectedAssignment.submissions || []
                );
                
                hasFeedbackAfter = hasFeedbackAfterSubmission(
                  item.data._id,
                  item.data.createdAt.toISOString(),
                  selectedAssignment.feedbacks || []
                );
              }

              return (
                <div key={item.data._id || idx} className="flex flex-col">
                  <TimelineItem
                    type={item.type}
                    data={{
                      _id: item.data._id,
                      submitBy: item.data.submitBy,
                      comment: item.data.comment,
                      deadline: item?.data?.deadline,
                      files: item.data.files,
                      createdAt: item.data.createdAt.toISOString()
                    }}
                    isTeacher={isTeacher}
                    isStudent={isStudent}
                    assignment={selectedAssignment}
                    isFirstSubmissionItem={isFirstSubmissionItem}
                    hasFeedbackAfter={hasFeedbackAfter}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    isLoading={loadingItems[item.data._id]}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};