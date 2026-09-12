// src/pages/courseUnit/courseResource/components/types.ts

export type ResourceType = 
  | 'introduction' 
  | 'study-guide' 
  | 'lecture' 
  | 'assignment' 
  | 'learning-outcome';

export type ContentType = 'text' | 'upload';

export type LearningOutcomeFormType = 'learning-outcome' | 'assessment-criteria';

export interface LearningOutcomeItem {
  _id?: string;
  /** Optional heading shown above the criterion body. */
  title?: string;
  /** Set on nested criteria that hang off another item. */
  parentId?: string;
  description: string;
}

export interface FormData {
  title?: string;
  content?: string;
  startDate?: Date | null;
  finalDeadline?: Date | null;
  learningOutcomes?: string;
  assessmentCriteria: LearningOutcomeItem[];
  finalFeedback?: boolean;
  observation?: boolean;
}

export interface Resource {
  _id: string;
  /** The unit the resource belongs to; stamped on every optimistic update. */
  unitId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  /** Legacy alias kept for fixtures that predate `finalDeadline`. */
  deadline?: string | Date;
  type: ResourceType;
  /** Assignments only: `draft` is hidden from students. */
  status?: 'draft' | 'published' | 'closed';
  title?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  startDate?: string;
  finalDeadline?: string;
  learningOutcomes?: string;
  isFinalFeedback?: boolean;
  isObservationFeedback?: boolean;
  finalFeedback?: boolean;
  observation?: boolean;
  description?: string;
  assessmentCriteria?: LearningOutcomeItem[];
}

export interface UploadState {
  selectedDocument: string | null;
  fileName: string | null;
  /** Mirror of `selectedDocument` used when syncing back into form state. */
  fileUrl?: string | null;
}

export interface Assignment {
  applicationId: string;
  studentId: string;
  assignmentName: string;
  document: string;
  unitId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// New interface for course unit materials without assignments
export interface CourseUnitMaterial {
  introduction: Resource;          
  studyGuides: Resource[];          
  lectures: Resource[];             
  learningOutcomes: Resource[];    
}
