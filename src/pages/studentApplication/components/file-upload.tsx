import type React from 'react';
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  id: string;
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'primary' | 'outline';
}

export function FileUpload({
  id,
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  multiple = false,
  required = false,
  buttonLabel = 'Choose File(s)',
  buttonVariant = 'outline'
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => {
        const updatedFiles = multiple
          ? [...prevFiles, ...newFiles]
          : [...newFiles];
        onFilesSelected(updatedFiles);
        return updatedFiles;
      });
    }
  };

  const getButtonVariant = () => {
    switch (buttonVariant) {
      case 'primary':
        return 'bg-teal-500 hover:bg-teal-600 text-white';
      case 'outline':
        return 'border border-gray-300 hover:border-gray-400 bg-white text-gray-700';
      default:
        return '';
    }
  };

  return (
    <div>
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        required={required}
      />
      <label htmlFor={id}>
        <Button
          type="button"
          className={cn('cursor-pointer', getButtonVariant())}
          variant="outline"
          asChild
        >
          <span>
            <Upload className="mr-2 h-4 w-4" />
            {buttonLabel}
          </span>
        </Button>
      </label>
      {files.length > 0 && (
        <div className="mt-2">
          {files.map((file, index) => (
            <div key={index} className="truncate text-xs text-gray-600">
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
