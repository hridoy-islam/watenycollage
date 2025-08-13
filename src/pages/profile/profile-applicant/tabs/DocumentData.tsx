
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  ExternalLink,
  Upload,
  CheckCircle
} from 'lucide-react';
import { z } from 'zod';
import { ImageUploader } from '../components/document-uploader';
import { useSelector } from 'react-redux';

// Zod validation schema
export const documentSchema = z.object({
  cvResume: z.string().optional(),
  image: z.string().optional(),
  proofOfAddress: z.array(z.string()).nonempty({
    message: 'Proof of address is required'
  }),
  passport: z.array(z.string()).nonempty({
    message: 'Passport or ID is required'
  }),
  workExperience: z.array(z.string()).optional(),
  personalStatement: z.array(z.string()).optional(),
    immigrationDocument: z.array(z.string()).optional()
});

export type DocumentFile = z.infer<typeof documentSchema>;

interface DocumentDataProps {
  userData: DocumentFile;
  isEditing?: boolean;
  onSave: (documents: DocumentFile) => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function DocumentData({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}: DocumentDataProps) {
  const [documents, setDocuments] = useState<DocumentFile>(userData);
  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof DocumentFile | null;
  }>({
    isOpen: false,
    field: null
  });
  const { user } = useSelector((state: any) => state.auth);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    if (typeof documents[field] === 'string') {
      setDocuments((prev) => ({
        ...prev,
        [field]: ''
      }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((file) => file !== fileName)
      }));
    }
  };

  const hasChanges = () => {
    return JSON.stringify(userData) !== JSON.stringify(documents);
  };

  const handleSubmit = () => {
    const validationResult = documentSchema.safeParse(documents);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    onSave(documents);
  };

const renderUploadedFiles = (field: keyof DocumentFile) => {
  const fieldValue = documents[field];
  
  // Handle string fields (cvResume, image)
  if (typeof fieldValue === 'string') {
    if (!fieldValue) return null;
    
    try {
      const fileName = decodeURIComponent(fieldValue.split('/').pop() || 'Document');
      return (
        <div className="mt-3 space-y-2">
          <div className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md">
            <div className="flex items-center space-x-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-1 gap-2">
                  <a
                    href={fieldValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-watney/90"
                  >
                    <Button className="flex flex-row items-center gap-4 bg-watney text-white hover:bg-watney/90">
                      View <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(field, fieldValue)}
              className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    } catch (e) {
      console.error('Error processing file URL:', e);
      return null;
    }
  }

  // Handle array fields
  if (Array.isArray(fieldValue)) {
    const validUrls = fieldValue.filter(url => typeof url === 'string' && url.trim() !== '');
    if (validUrls.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {validUrls.map((fileUrl, index) => {
          try {
            const fileName = decodeURIComponent(
              fileUrl.split('/').pop() || `File-${index}`
            );
            return (
              <div
                key={`${fileUrl}-${index}`}
                className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex min-w-0 flex-1 gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-watney/90"
                    >
                      <Button className="flex flex-row items-center gap-4 bg-watney text-white hover:bg-watney/90">
                        View <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </Button>
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field, fileUrl)}
                  className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          } catch (e) {
            console.error('Error processing file URL:', fileUrl, e);
            return null;
          }
        })}
      </div>
    );
  }

  return null;
};

  const openImageUploader = (field: keyof DocumentFile) => {
    setUploadState({ isOpen: true, field });
  };

 const handleUploadComplete = (uploadResponse: any) => {
  const { field } = uploadState;
  if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
    setUploadState({ isOpen: false, field: null });
    return;
  }

  const fileUrl = uploadResponse.data.fileUrl;

  setDocuments((prev) => {
    const currentValue = prev[field];

    // Handle cvResume and image as single string values
    if (field === 'cvResume' || field === 'image') {
      return {
        ...prev,
        [field]: fileUrl
      };
    }

    // All other fields are arrays
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    return {
      ...prev,
      [field]: [...currentArray, fileUrl]
    };
  });

  setUploadState({ isOpen: false, field: null });
};

  const documentTypes = [
     {
      id: 'cvResume',
      label: 'Resume',
      required: true,
      instructions: 'Upload your CV or Resume',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.cvResume,
      icon: FileText
    },
    {
      id: 'proofOfAddress',
      label: 'Proof of Address',
      required: true,
      instructions:
        'Upload recent utility bill or bank statement showing your address',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.proofOfAddress,
      icon: FileText
    },
    {
      id: 'passport',
      label: 'Passport or UK ID',
      required: true,
      instructions:
        'Please upload a clear copy of your valid passport, BRP, or UK driving licence',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.proofOfAddress,
      icon: FileText
    },
    {
      id: 'immigrationDocument',
      label: 'Immigration Documents',
      required: false,
      instructions: 'Upload any relevant visas, permits, or immigration-related documents.',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: FileText
    },
    {
      id: 'workExperience',
      label: 'Work Experience Documents',
      required: false,
      instructions: 'Upload relevant work experience documents',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: FileText
    },
    {
      id: 'personalStatement',
      label: 'Personal Statement',
      required: false,
      instructions: 'Upload your personal statement',
      formats: 'PDF, DOCX, TXT',
      icon: FileText
    }
  ];

  return (
    <div className="">
      <Card className="border-0 shadow-none">
        <CardHeader className="">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Document</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="gap-4 grid md:grid-cols-2 grid-cols-1 ">
            {documentTypes.map(
              ({
                id,
                label,
                required,
                instructions,
                formats,
                error,
                icon: Icon,
                uploadLabel
              }) => {
                const hasFiles =
                  typeof documents[id as keyof DocumentFile] === 'string'
                    ? (documents[id as keyof DocumentFile] as string).length > 0
                    : Array.isArray(documents[id as keyof DocumentFile]) &&
                      (documents[id as keyof DocumentFile] as string[]).length > 0;
                return (
                  <div
                    key={id}
                    className={`rounded-xl border-2 transition-all ${
                      error
                        ? 'border-red-200 bg-red-50'
                        : hasFiles
                        ? 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-3">
                            <div
                              className={`rounded-lg p-2 ${
                                error
                                  ? 'bg-red-100'
                                  : hasFiles
                                  ? 'bg-gray-100'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  error
                                    ? 'text-red-600'
                                    : hasFiles
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                {label}
                                {required && (
                                  <span className="ml-2 text-red-500">*</span>
                                )}
                                {hasFiles && (
                                  <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{instructions}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                Accepted formats: {formats}
                              </p>
                              {uploadLabel && (
                                <p className="mt-1 text-xs text-gray-800 font-semibold">
                                  {uploadLabel}
                                </p>
                              )}
                            </div>
                          </div>
                          {error && (
                            <div className="mt-2 rounded-lg border border-red-200 bg-red-100 p-3">
                              <p className="text-sm font-medium text-red-700">
                                {error}
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => openImageUploader(id as keyof DocumentFile)}
                          className="ml-4 flex items-center space-x-2 rounded-lg bg-watney px-6 py-2 text-white transition-colors hover:bg-watney/90"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload</span>
                        </Button>
                      </div>
                      {renderUploadedFiles(id as keyof DocumentFile)}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-8">
            {hasChanges() && (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Save
              </Button>
            )}
          </div>
          <ImageUploader
            open={uploadState.isOpen}
            onOpenChange={(isOpen) =>
              setUploadState((prev) => ({ ...prev, isOpen }))
            }
            onUploadComplete={handleUploadComplete}
            entityId={user?._id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
