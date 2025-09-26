import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText } from 'lucide-react';
import { UploadState } from './types';

interface FileUploadAreaProps {
  uploadState: UploadState;
  uploadingFile: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  uploadState,
  uploadingFile,
  uploadProgress,
  uploadError,
  onFileChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
      <input
        type="file"
        accept="image/*,application/pdf,.doc,.docx,video/*,audio/*"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      {uploadingFile ? (
        <div className="space-y-4">
          <div className="text-sm text-slate-600">Uploading...</div>
          <Progress value={uploadProgress} className="mx-auto max-w-xs" />
        </div>
      ) : uploadState.selectedDocument ? (
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-lg bg-green-100 px-4 py-2 text-green-800">
            <FileText className="mr-2 h-4 w-4" />
            {uploadState.fileName}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2"
          >
            Change File
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-50 text-blue-600 hover:bg-blue-400"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <p className="mt-2 text-sm text-slate-500">
              PDF, DOC, DOCX, Images, Videos up to 5MB
            </p>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
};

export default FileUploadArea;