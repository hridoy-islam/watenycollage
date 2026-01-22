import { useState, useRef, useEffect } from 'react';
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
  photoId: z.array(z.string()).nonempty({ message: 'Photo ID is required' }),
  proofOfAddress: z
    .array(z.string())
    .nonempty({ message: 'Proof of address is required' }),
  qualification: z.array(z.string()).optional(),
  workExperience: z.array(z.string()).optional(),
  personalStatement: z.array(z.string()).optional()
});

export type DocumentFile = z.infer<typeof documentSchema>;

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentFile>;
  onSaveAndContinue: (data: DocumentFile) => void;
  setCurrentStep: (step: number) => void;
  onSave: (data: DocumentFile) => void;
}

export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  onSave
}: DocumentsStepProps) {
  const [documents, setDocuments] = useState<DocumentFile>({
    image: defaultValues?.image ?? '',
    proofOfAddress: defaultValues?.proofOfAddress ?? [],
    photoId: defaultValues?.photoId ?? [],
    qualification: defaultValues?.qualification ?? [],
    workExperience: defaultValues?.workExperience ?? [],
    personalStatement: defaultValues?.personalStatement ?? []
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
    setCurrentStep(8);
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
    // documents.image !== '' &&
    documents.photoId.length > 0 && documents.proofOfAddress.length > 0;

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
                    <span className="truncate sm:hidden">
                        {fileName.length > 20
                          ? fileName.slice(0, 10) + '...'
                          : fileName}
                      </span>
                      <span className="hidden truncate sm:inline">
                        {fileName}
                      </span>
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
                      <span className="truncate sm:hidden">
                        {fileName.length > 20
                          ? fileName.slice(0, 10) + '...'
                          : fileName}
                      </span>
                      <span className="hidden truncate sm:inline">
                        {fileName}
                      </span>
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
      label: 'Photograph',
      required: false,
      instructions: 'Please upload a recent and formal photo of yourself.',
      formats: 'JPG, PNG, PDF',
      error: validationErrors.image,
      icon: FileText
    },
    {
      id: 'photoId',
      label: 'Photo ID',
      required: true,
      instructions:
        'Upload a clear copy of any valid photo ID (e.g., passport, driver’s license)',
      formats: 'PDF, JPG, PNG',
      error: validationErrors.photoId,
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
 <div className="w-full">
  <Card className="border-0 shadow-none">
    {/* Header Section */}
    <CardHeader className="">
      <div className="space-y-5">
        {/* Title & Description */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Document Upload
          </h2>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Please upload all required documents to complete your application.
          </p>
        </div>

        {/* Document Requirements Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="mb-4 flex items-center text-sm font-semibold text-gray-900 sm:text-base">
            <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
            Document Requirements
          </h3>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {/* Required Documents */}
            <div>
              <p className="mb-3 flex text-xs font-semibold uppercase tracking-wide text-gray-700 sm:text-sm">
                Required Documents
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                  Passport or ID document
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="mr-2 h-2 w-2 rounded-full bg-red-500"></div>
                  Bank statement
                </li>
              </ul>
            </div>

            {/* Optional Documents */}
            <div>
              <p className="mb-3 flex text-xs font-semibold uppercase tracking-wide text-gray-700 sm:text-sm">
                Optional Documents
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                  Photograph
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                  Work experience documents
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="mr-2 h-2 w-2 rounded-full bg-gray-400"></div>
                  Personal statements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>

    {/* Upload Sections */}
    <CardContent className="p-5 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {documentTypes.map(
          ({ id, label, required, instructions, formats, error, icon: Icon, uploadLabel }) => {
            const hasFiles =
              id === 'image'
                ? !!documents.image
                : Array.isArray(documents[id as keyof DocumentFile]) &&
                  (documents[id as keyof DocumentFile] as string[]).length > 0;

            return (
              <div
                key={id}
                className={`rounded-xl border transition-colors duration-200 ${
                  error
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="p-4 sm:p-6">
                  {/* Upload Item Header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Info Section */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        {/* Icon Badge */}
                        <div
                          className={`mt-1 rounded-lg p-2 ${
                            error ? 'bg-red-100' : 'bg-gray-100'
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

                        {/* Text Content */}
                        <div>
                          <h3 className="flex flex-wrap items-center gap-y-1 text-sm font-semibold text-gray-900 sm:text-base">
                            {label}
                            {required && (
                              <span className="ml-1.5 text-red-500">*</span>
                            )}
                            {hasFiles && (
                              <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                            )}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
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

                      {/* Error Message */}
                      {error && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-100 px-3 py-2">
                          <p className="text-xs font-medium text-red-700 sm:text-sm">
                            {error}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <Button
                      type="button"
                      onClick={() =>
                        openImageUploader(id as keyof DocumentFile)
                      }
                      className="mt-2 w-full self-start rounded-lg bg-watney px-4 py-2 text-xs font-medium text-white transition hover:bg-watney/90 focus:ring-2 focus:ring-watney/40 sm:mt-0 sm:w-auto sm:px-6 sm:text-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <Upload className="h-4 w-4" />
                        Upload
                      </span>
                    </Button>
                  </div>

                  {/* Render Uploaded Files */}
                  {renderUploadedFiles(id as keyof DocumentFile)}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!allDocumentsUploaded}
          className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
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
