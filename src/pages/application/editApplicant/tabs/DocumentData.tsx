import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  ExternalLink,
  Upload,
  CheckCircle,
  Image,
  CreditCard,
  FileCheck,
  User,
  MapPin,
  FileStack,
} from 'lucide-react';
import { z } from 'zod';
import { ImageUploader } from '../components/document-uploader';
import { useSelector } from 'react-redux';

// ✅ Updated Zod schema
export const documentSchema = z.object({
  cvResume: z.string().min(1, 'CV/Resume is required'),
  image: z.string().min(1, 'Photograph is required'),
  idDocuments: z.array(z.string()).nonempty('Proof of ID is required'),
  proofOfAddress1: z.string().min(1, 'Proof of Address 1 is required'),
  proofOfAddress2: z.string().min(1, 'Proof of Address 2 is required'),
  utilityBills: z.array(z.string()).nonempty('Utility Bills are required'),
  bankStatement: z.array(z.string()).nonempty('Bank Statement is required'),
  proofOfNI: z.array(z.string()).nonempty('National Insurance proof is required'),
  immigrationDocument: z.array(z.string()).optional(),
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
  onEdit,
}: DocumentDataProps) {
  const [documents, setDocuments] = useState<DocumentFile>(userData);
  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof DocumentFile | null;
  }>({
    isOpen: false,
    field: null,
  });
  const { user } = useSelector((state: any) => state.auth);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sync when userData changes
  useEffect(() => {
    setDocuments(userData);
  }, [userData]);

  const handleRemoveFile = (field: keyof DocumentFile, fileUrl: string) => {
    if (typeof documents[field] === 'string') {
      setDocuments((prev) => ({ ...prev, [field]: '' }));
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((url) => url !== fileUrl),
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
    const value = documents[field];
    if (!value) return null;

    if (typeof value === 'string') {
      if (!value) return null;
      return (
        <div className="mt-3 space-y-2">
          <FileItem fileUrl={value} onRemove={() => handleRemoveFile(field, value)} />
        </div>
      );
    } else if (Array.isArray(value) && value.length > 0) {
      return (
        <div className="mt-3 space-y-2">
          {value.map((url, index) => (
            <FileItem key={`${url}-${index}`} fileUrl={url} onRemove={() => handleRemoveFile(field, url)} />
          ))}
        </div>
      );
    }
    return null;
  };

  const FileItem = ({ fileUrl, onRemove }: { fileUrl: string; onRemove: () => void }) => {
    const fileName = decodeURIComponent(fileUrl.split('/').pop() || 'Document');
    return (
      <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:shadow-md">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-watney/90"
        >
          <Button className="bg-watney text-white hover:bg-watney/90">
            View <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const openUploader = (field: keyof DocumentFile) => {
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
      if (typeof prev[field] === 'string') {
        return { ...prev, [field]: fileUrl };
      } else {
        return { ...prev, [field]: [...(prev[field] as string[]), fileUrl] };
      }
    });

    setUploadState({ isOpen: false, field: null });
  };

  // ✅ Updated document types to match your list
  const documentTypes = [
    {
      id: 'cvResume',
      label: 'CV/Resume',
      required: true,
      instructions: 'Upload your CV or Resume',
      formats: 'PDF, DOC, DOCX',
      icon: FileText,
    },
    {
      id: 'image',
      label: 'Photograph',
      required: true,
      instructions: 'Recent passport-style photograph',
      formats: 'JPG, PNG',
      icon: Image,
    },
    {
      id: 'idDocuments',
      label: 'Proof of ID',
      required: true,
      instructions: 'Passport, driving licence, or BRP',
      formats: 'PDF, JPG, PNG',
      icon: User,
    },
    {
      id: 'proofOfAddress1',
      label: 'Proof of Address 1',
      required: true,
      instructions: 'Recent utility bill or council tax (last 3 months)',
      formats: 'PDF, JPG, PNG',
      icon: MapPin,
    },
    {
      id: 'proofOfAddress2',
      label: 'Proof of Address 2',
      required: true,
      instructions: 'Second proof of address (e.g., bank statement)',
      formats: 'PDF, JPG, PNG',
      icon: MapPin,
    },
    {
      id: 'utilityBills',
      label: 'Utility Bills',
      required: true,
      instructions: 'Gas, electricity, water, or broadband bills',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: FileStack,
    },
    {
      id: 'bankStatement',
      label: 'Bank Statement',
      required: true,
      instructions: 'Recent bank statement (last 3 months)',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: CreditCard,
    },
    {
      id: 'proofOfNI',
      label: 'National Insurance',
      required: true,
      instructions: 'NI number letter or payslip showing NI',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: FileCheck,
    },
    {
      id: 'immigrationDocument',
      label: 'Immigration Details / Work Permit',
      required: false,
      instructions: 'Visa, work permit, or immigration status documents',
      formats: 'PDF, JPG, PNG',
      uploadLabel: 'You can upload multiple files',
      icon: FileText,
    },
  ];

  return (
    <div className="">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        </CardHeader>
        <CardContent className="">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {documentTypes.map(({ id, label, required, instructions, formats, uploadLabel, icon: Icon }) => {
              const field = id as keyof DocumentFile;
              const value = documents[field];
              const hasFiles =
                typeof value === 'string'
                  ? !!value
                  : Array.isArray(value)
                  ? value.length > 0
                  : false;

              const error = validationErrors[id];

              return (
                <div
                  key={id}
                  className={`rounded-xl border border-gray-300 p-6 transition-all 
                   
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-start space-x-3">
                        <div
                          className={`rounded-lg p-2 ${
                            error
                              ? 'bg-red-100'
                              : hasFiles
                              ? 'bg-green-100'
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
                            {required && <span className="ml-1 text-red-500">*</span>}
                            {hasFiles && !error && (
                              <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">{instructions}</p>
                          <p className="mt-1 text-xs text-gray-500">Accepted formats: {formats}</p>
                          {uploadLabel && (
                            <p className="mt-1 text-xs font-medium text-gray-700">{uploadLabel}</p>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className="mt-2 rounded-lg bg-red-100 p-3">
                          <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => openUploader(field)}
                      className="ml-4 flex items-center space-x-1 rounded-lg bg-watney px-4 py-2 text-white hover:bg-watney/90"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </Button>
                  </div>

                  {renderUploadedFiles(field)}
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          {hasChanges() && (
            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Save Documents
              </Button>
            </div>
          )}

          {/* Uploader Modal */}
          <ImageUploader
            open={uploadState.isOpen}
            onOpenChange={(isOpen) => setUploadState((prev) => ({ ...prev, isOpen }))}
            onUploadComplete={handleUploadComplete}
            entityId={user?._id}
          />
        </CardContent>
      </Card>
    </div>
  );
}