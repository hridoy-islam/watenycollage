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
  _id: string;
  type: ResourceType;
  title?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  deadline?: string;
  learningOutcomes?: string;
  isFinalFeedback?: boolean;
  isObservationFeedback?: boolean;
  description?: string;
  assessmentCriteria?: LearningOutcomeItem[];
}

export interface UploadState {
  selectedDocument: string | null;
  fileName: string | null;
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
