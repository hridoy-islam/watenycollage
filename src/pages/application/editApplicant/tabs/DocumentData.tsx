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
import Select from 'react-select';
import TabSection from '../TabSection';

const PROOF_OF_ADDRESS_SUBTYPES = [
  { value: 'bankStatement', label: 'Bank Statement' },
  { value: 'utilityBill', label: 'Utility Bill' },
  { value: 'drivingLicense', label: 'Driving License' }
] as const;

type ProofOfAddressType = (typeof PROOF_OF_ADDRESS_SUBTYPES)[number]['value'];

export const documentSchema = z.object({
  cvResume: z.string().min(1, 'CV/Resume is required'),
  image: z.string().min(1, 'Photograph is required'),
  idDocuments: z.array(z.string()).min(1, 'At least one proof of ID is required'),
  proofOfAddress1: z.string().min(1, 'Proof of Address 1 is required'),
  proofOfAddress2: z.string().min(1, 'Proof of Address 2 is required'),
  proofOfAddress1Type: z
    .enum(['bankStatement', 'utilityBill', 'drivingLicense'])
    .optional()
    .or(z.literal('')),
  proofOfAddress2Type: z
    .enum(['bankStatement', 'utilityBill', 'drivingLicense'])
    .optional()
    .or(z.literal('')),
  proofOfNI: z.array(z.string()).min(1, 'National Insurance document is required'),
  immigrationDocument: z.array(z.string()).optional(),
  shareCodeDocument: z.string().optional(),
});

export type DocumentFile = z.infer<typeof documentSchema>;

interface DocumentDataProps {
  userData: DocumentFile;
  isEditing?: boolean;
  onSave: (documents: DocumentFile) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const documentTypes = [
  { id: 'cvResume', label: 'CV/Resume', required: true, formats: 'PDF, DOC, DOCX', icon: FileText },
  { id: 'image', label: 'Photograph', required: true, formats: 'JPG, PNG', icon: Image },
  { id: 'idDocuments', label: 'Proof of ID', required: true, formats: 'PDF, JPG, PNG', icon: User, isArray: true },
  { id: 'proofOfAddress1', label: 'Proof of Address 1', required: true, formats: 'PDF, JPG, PNG', icon: MapPin, hasSubtype: true },
  { id: 'proofOfAddress2', label: 'Proof of Address 2', required: true, formats: 'PDF, JPG, PNG', icon: MapPin, hasSubtype: true },
  { id: 'proofOfNI', label: 'National Insurance', required: true, formats: 'PDF, JPG, PNG', icon: FileCheck, isArray: true },
  { id: 'immigrationDocument', label: 'Immigration share-code', required: false, formats: 'PDF, JPG, PNG', icon: FileStack, isArray: true },
  { id: 'shareCodeDocument', label: 'Right To Work Share Code Document', required: false, formats: 'PDF, JPG, PNG', icon: CreditCard },
];

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

  useEffect(() => {
    setDocuments(userData);
  }, [userData]);

  const handleInputChange = (field: keyof DocumentFile, value: any) => {
    setDocuments((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveFile = (field: keyof DocumentFile, fileUrl: string) => {
    if (typeof documents[field] === 'string') {
      setDocuments((prev) => {
        const updated = { ...prev, [field]: '' };
        if (field === 'proofOfAddress1') updated.proofOfAddress1Type = '';
        if (field === 'proofOfAddress2') updated.proofOfAddress2Type = '';
        return updated;
      });
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((url) => url !== fileUrl),
      }));
    }
  };

  const handleSave = () => {
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

  const isDocumentUploaded = (field: keyof DocumentFile): boolean => {
    const value = documents[field];
    if (typeof value === 'string') return !!value;
    return Array.isArray(value) && value.length > 0;
  };

  const getProofTypeLabel = (id: keyof DocumentFile): string | null => {
    if (id === 'proofOfAddress1' && documents.proofOfAddress1Type) {
      return PROOF_OF_ADDRESS_SUBTYPES.find(s => s.value === documents.proofOfAddress1Type)?.label || null;
    }
    if (id === 'proofOfAddress2' && documents.proofOfAddress2Type) {
      return PROOF_OF_ADDRESS_SUBTYPES.find(s => s.value === documents.proofOfAddress2Type)?.label || null;
    }
    return null;
  };

  const renderUploadedFiles = (field: keyof DocumentFile) => {
    const value = documents[field];
    if (!value) return null;

    const files = Array.isArray(value) ? value : [value].filter(Boolean);

    if (files.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        {files.map((fileUrl, index) => {
          const fileName = decodeURIComponent(fileUrl.split('/').pop() || 'Document');
          return (
            <div key={`${fileUrl}-${index}`} className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:shadow-md">
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
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field, fileUrl)}
                  className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
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

  return (
    <TabSection
      title="Documents"
      description="Upload and manage your documents"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {documentTypes.map(({ id, label, required, formats, icon: Icon, hasSubtype, isArray }) => {
          const field = id as keyof DocumentFile;
          const hasFiles = isDocumentUploaded(field);
          const error = validationErrors[id];
          const proofTypeLabel = getProofTypeLabel(field);

          return (
            <div
              key={id}
              className={`rounded-xl border border-gray-300 p-6 transition-all`}
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
                      {proofTypeLabel && (
                        <p className="mt-1 text-sm font-medium text-watney">
                          Type: {proofTypeLabel}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-600">Accepted formats: {formats}</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-2 rounded-lg bg-red-100 p-3">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <Button
                    type="button"
                    onClick={() => openUploader(field)}
                    className="ml-4 flex items-center space-x-1 rounded-lg bg-watney px-4 py-2 text-white hover:bg-watney/90"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                )}
              </div>

              {isEditing && hasSubtype && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proof Type
                  </label>
                  <Select
                    options={[...PROOF_OF_ADDRESS_SUBTYPES]}
                    value={
                      PROOF_OF_ADDRESS_SUBTYPES.find(
                        (s) => s.value === documents[`${field}Type` as keyof DocumentFile]
                      ) || null
                    }
                    onChange={(option) =>
                      handleInputChange(
                        `${field}Type` as keyof DocumentFile,
                        option?.value || ''
                      )
                    }
                    placeholder="Select type..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                        minHeight: '2.5rem',
                      }),
                    }}
                  />
                </div>
              )}

              {renderUploadedFiles(field)}
            </div>
          );
        })}
      </div>

      <ImageUploader
        open={uploadState.isOpen}
        onOpenChange={(isOpen) => setUploadState((prev) => ({ ...prev, isOpen }))}
        onUploadComplete={handleUploadComplete}
        entityId={user?._id}
      />
    </TabSection>
  );
}