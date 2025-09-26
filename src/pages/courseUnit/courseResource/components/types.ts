export interface Resource {
  id: string;
  type: 'introduction' | 'study-guide' | 'lecture' | 'assignment';
  title?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  deadline?: string;
  createdAt: string;
}

export interface UploadState {
  selectedDocument: string | null;
  fileName: string | null;
}

export interface FormData {
  title: string;
  content: string;
  deadline: Date | undefined;
}

export type ResourceType = 'introduction' | 'study-guide' | 'lecture' | 'assignment';
export type ContentType = 'text' | 'upload';