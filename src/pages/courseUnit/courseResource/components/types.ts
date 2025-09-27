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
  id: string;
  parentId: string; // references the Resource.id
  description: string;
}

export interface FormData {
  title?: string;
  content?: string;
  deadline?: Date;
  learningOutcomes?: string;
  assessmentCriteria: LearningOutcomeItem[];
}

export interface Resource {
  id: string;
  type: ResourceType;
  title?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  deadline?: string;
  createdAt: string;
  learningOutcomes?: string;
  description?: string;
  assessmentCriteria?: LearningOutcomeItem[];
}

export interface UploadState {
  selectedDocument: string | null;
  fileName: string | null;
}