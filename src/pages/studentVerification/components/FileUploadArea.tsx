import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X } from 'lucide-react';
import { UploadState } from './types';

interface FileUploadAreaProps {
  uploadState: UploadState;
  uploadingFile: boolean;
  uploadProgress: number;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile?: (index: number) => void; // Optional function to remove a file
  uploadedFiles?: Array<{ fileName: string; url: string }>; // For showing multiple files
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  uploadState,
  uploadingFile,
  uploadProgress,
  uploadError,
  onFileChange,
  onRemoveFile,
  uploadedFiles = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <input
        type="file"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      {uploadingFile ? (
        <div className="space-y-4">
          <div className="text-sm text-slate-600">Uploading...</div>
          <Progress value={uploadProgress} className="mx-auto max-w-xs" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className='flex flex-row items-center gap-4'>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-50 text-blue-600 hover:bg-blue-400"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <p className="text-xs text-slate-500 font-semibold">
              Maximum Size 20MB <br />
              You can upload multiple documents.
            </p>
          </div>
        </div>
      )}

      {/* Show uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-green-600" />
                <span className="text-xs truncate min-w-[150px]">{file.fileName}</span>
              </div>
              {onRemoveFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
};

export default FileUploadArea;