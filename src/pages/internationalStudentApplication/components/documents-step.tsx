

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  ExternalLink,
  Upload,
  CheckCircle
} from 'lucide-react';
import { ImageUploader } from './document-uploader';
import { useSelector } from 'react-redux';
import { z } from 'zod';

// Zod validation schema
export const documentSchema = z.object({
  image: z.string().optional(),

  passport: z.array(z.string()).nonempty({
    message: 'Passport is required'
  }),

  workExperience: z.array(z.string()).optional(),
  personalStatement: z.array(z.string()).optional(),
  bankStatement: z.array(z.string()).nonempty({
    message: 'Bank statement is required'
  })
});

export type DocumentFile = z.infer<typeof documentSchema>;

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentFile>;
  onSaveAndContinue: (data: DocumentFile) => void;
  setCurrentStep: (step: number) => void;
  onSave
}

export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  onSave
}: DocumentsStepProps) {
  const [documents, setDocuments] = useState<DocumentFile>({
    image: defaultValues?.image ?? '',
    passport: defaultValues?.passport ?? [],
    workExperience: defaultValues?.workExperience ?? [],
    personalStatement: defaultValues?.personalStatement ?? [],
    bankStatement: defaultValues?.bankStatement ?? []
  });

    // Ref to always have the latest documents
    const documentsRef = useRef<DocumentFile>(documents);
    useEffect(() => {
      documentsRef.current = documents;
    }, [documents]);
  
    
  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof Omit<DocumentFile, 'image'> | 'image' | null;
  }>({
    isOpen: false,
    field: null
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const { user } = useSelector((state: any) => state.auth);

  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    if (field === 'image') {
      setDocuments((prev) => ({
        ...prev,
        image: ''
      }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((file) => file !== fileName)
      }));
    }
  };

  const handleBack = () => {
    setCurrentStep(6);
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
    onSaveAndContinue(documents);
  };

  // Check if all required documents have at least one file
  const allDocumentsUploaded =
    
    documents.passport.length > 0 &&
    documents.bankStatement.length > 0;

  const renderUploadedFiles = (field: keyof DocumentFile) => {
    if (field === 'image') {
      const fileUrl = documents.image;
      if (fileUrl) {
        const fileName = decodeURIComponent(
          fileUrl.split('/').pop() || 'Photo-ID'
        );
        return (
          <div className="mt-3 space-y-2">
            <div className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-watney/90"
                  >
                    <span className="truncate">{fileName}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
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
          </div>
        );
      }
      return null;
    }

    const value = documents[field];
    if (Array.isArray(value) && value.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {value.map((fileUrl, index) => {
            const fileName = decodeURIComponent(
              fileUrl.split('/').pop() || `File-${index}`
            );
            return (
              <div
                key={`${fileUrl}-${index}`}
                className="flex w-auto items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm font-medium text-gray-900 transition-colors hover:text-watney/90"
                    >
                      <span className="truncate">{fileName}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
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
        if (field === 'image') {
          return {
            ...prev,
            image: fileUrl
          };
        } else {
          return {
            ...prev,
            [field]: [...(prev[field as keyof DocumentFile] as string[]), fileUrl]
          };
        }
      });
  
      setTimeout(() => {
        onSave(documentsRef.current);
      }, 0);
  
      setUploadState({ isOpen: false, field: null });
    };
  

  const documentTypes = [
    {
      id: 'image',
      label: 'Photograpgh',
      required: false,
      instructions: 'Please upload a recent and formal photo of yourself.',
      formats: 'JPG, PNG',
      error: validationErrors.image,
      icon: FileText
    },
    {
      id: 'passport',
      label: 'Passport/ID Document',
      required: true,
      instructions: 'Upload a clear copy of your passport or ID document',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.passport,
      icon: FileText
    },

    {
      id: 'bankStatement',
      label: 'Bank Statement',
      required: true,
      instructions: 'Upload recent bank statement (last 3 months)',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.bankStatement,
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
      label: 'Personal Statements',
      required: false,
      instructions: 'Upload personal statements',
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
              <h2 className="text-2xl font-bold text-gray-900">
                Document Upload
              </h2>
              <p className="mt-1 text-gray-600">
                Please upload all required documents to complete your
                application
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 flex items-center font-semibold text-gray-900">
                <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                Document Requirements
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-medium text-gray-700">
                    Required Documents:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                      Passport or ID document
                    </li>

                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                      Bank statement
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-medium text-gray-700">
                    Optional Documents:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                      Photograpgh
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                      Work experience documents
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                      Personal statements
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 ">
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
                  Array.isArray(documents[id as keyof DocumentFile]) &&
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
                              <p className="text-sm text-gray-600">
                                {instructions}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Accepted formats: {formats}
                              </p>
                              <p className="mt-1 text-xs font-semibold text-gray-800">
                                {uploadLabel}
                              </p>
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
                          onClick={() =>
                            openImageUploader(id as keyof DocumentFile)
                          }
                          className="ml-4 flex items-center space-x-2 rounded-lg bg-watney px-6 py-2 text-white transition-colors  hover:bg-watney/90"
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
          <div className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!allDocumentsUploaded}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Next
            </Button>
          </div>

          {/* Image Uploader Modal */}
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
