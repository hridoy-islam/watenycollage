import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle } from 'lucide-react';
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Routed through the same hidden input so the drop path and the click
      // path hand `onFileChange` an identical event shape.
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;

        const event = {
          target: fileInputRef.current,
          currentTarget: fileInputRef.current
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onFileChange(event);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed p-5 text-center transition-colors duration-200',
          isDragging
            ? 'border-watney bg-watney/10'
            : 'border-gray-200 bg-watney/[0.03] hover:border-watney/40 hover:bg-watney/5'
        )}
      >
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        {uploadingFile ? (
          <div className="pointer-events-none space-y-3">
            <Upload className="mx-auto h-8 w-8 animate-pulse text-watney" />
            <p className="text-sm font-medium text-black">
              Uploading… {uploadProgress}%
            </p>
            <Progress value={uploadProgress} className="mx-auto max-w-xs" />
          </div>
        ) : uploadState.selectedDocument ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-black">
                  {uploadState.fileName || 'Attached file'}
                </p>
                <p className="text-[11px] text-black">Ready to save</p>
              </div>
              <a
                href={uploadState.selectedDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[11px] font-semibold text-watney hover:underline"
              >
                Preview
              </a>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Replace file
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <span
              className={cn(
                'mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                isDragging ? 'bg-watney text-white' : 'bg-watney/10 text-watney'
              )}
            >
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-200 text-watney hover:bg-watney hover:text-white"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Choose a file
              </Button>
              <p className="mt-2 text-xs font-medium text-black">
                {isDragging ? 'Drop the file here' : 'or drag and drop it here'}
              </p>
              <p className="mt-0.5 text-[11px] text-black">
                PDF, Word, image, audio or video · up to 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {uploadError}
        </p>
      )}
    </div>
  );
};

export default FileUploadArea;
