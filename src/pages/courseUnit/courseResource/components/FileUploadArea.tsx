import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText } from 'lucide-react';
import { UploadState } from './types';
import { cn } from '@/lib/utils'; 

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
  const [isDragging, setIsDragging] = useState(false);

  // 1. Handle Drag Events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 2. Handle Drop Event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // This logic ensures compatibility with your existing onFileChange prop
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;

        // Manually trigger the change event
        const event = {
          target: fileInputRef.current,
          currentTarget: fileInputRef.current,
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onFileChange(event);
      }
    }
  };

  return (
    <div
      // 3. Attach Drag Handlers to the container
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border-2 border-dashed p-4 text-center transition-colors duration-200 ease-in-out",
        // 4. Conditional Styling for Drag State
        isDragging 
          ? "border-blue-500 bg-blue-50/50" 
          : "border-slate-300 hover:bg-slate-50/50"
      )}
    >
      <input
        type="file"
        onChange={onFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      {uploadingFile ? (
        <div className="space-y-4 pointer-events-none">
          <div className="text-sm text-slate-600">Uploading...</div>
          <Progress value={uploadProgress} className="mx-auto max-w-xs" />
        </div>
      ) : uploadState.selectedDocument ? (
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-lg bg-green-100 px-4 py-2 text-green-800">
            <FileText className="mr-2 h-4 w-4" />
            {uploadState.fileName}
          </div>
          <br />
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
          <Upload 
            className={cn(
              "mx-auto h-12 w-12 transition-colors",
              isDragging ? "text-blue-500" : "text-slate-400"
            )} 
          />
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-50 text-blue-600 hover:bg-blue-400 hover:text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <p className="mt-2 text-sm text-slate-500">
              {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-slate-400">
              Maximum Size 20MB
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