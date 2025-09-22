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

// ✅ Updated Schema — Added proofOfAddress1 & proofOfAddress2, kept utilityBills
export const createDocumentSchema = (
  hasExistingResume = false,
  nationality?: string
) =>
  z.object({
    cvResume: z.string().optional(),
    idDocuments: z.array(z.string()).optional(),
    image: z.string().optional(),
    utilityBills: z.array(z.string()).optional(),
    proofOfAddress1: z.string().optional(), // ✅ New
    proofOfAddress2: z.string().optional(), // ✅ New
    bankStatement: z.array(z.string()).optional(),
    proofOfNI: z.array(z.string()).optional(),
    immigrationDocument: z.array(z.string()).optional()
  });

// 🧾 Type derived from schema
export type DocumentFile = z.infer<ReturnType<typeof createDocumentSchema>>;

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentFile> & { nationality?: string };
  onSaveAndContinue: (data: DocumentFile) => void;
  setCurrentStep: (step: number) => void;
  onSave: () => void;
}

export function DocumentStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  onSave
}: DocumentsStepProps) {
  const hasExistingResume = !!defaultValues?.cvResume;

  const documentSchema = createDocumentSchema(
    hasExistingResume,
    defaultValues?.nationality
  );

  const [documents, setDocuments] = useState({
    cvResume: '',
    image: '',
    idDocuments: [],
    utilityBills: [],
    proofOfAddress1: '', // ✅ New
    proofOfAddress2: '', // ✅ New
    bankStatement: [],
    proofOfNI: [],
    immigrationDocument: []
  });

  useEffect(() => {
    if (defaultValues) {
      setDocuments({
        cvResume: defaultValues?.cvResume ?? '',
        idDocuments: defaultValues?.idDocuments ?? [],
        image: defaultValues?.image ?? '',
        utilityBills: defaultValues?.utilityBills ?? [],
        proofOfAddress1: defaultValues?.proofOfAddress1 ?? '',
        proofOfAddress2: defaultValues?.proofOfAddress2 ?? '',
        bankStatement: defaultValues?.bankStatement ?? [],
        proofOfNI: defaultValues?.proofOfNI ?? [],
        immigrationDocument: defaultValues?.immigrationDocument ?? []
      });
    }
  }, [defaultValues]);

  const documentsRef = useRef(documents);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof DocumentFile | null;
  }>({ isOpen: false, field: null });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { user } = useSelector((state: any) => state.auth);

  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    // Handle single-file fields
    if (
      field === 'cvResume' ||
      field === 'image' ||
      field === 'proofOfAddress1' ||
      field === 'proofOfAddress2'
    ) {
      setDocuments((prev) => ({ ...prev, [field]: '' }));
    } else {
      // Handle array fields
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((file) => file !== fileName)
      }));
    }
  };

  const handleBack = () => setCurrentStep(10);

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
    onSaveAndContinue(validationResult.data);
  };

  const isBritish = defaultValues?.nationality === 'british';

  const allDocumentsUploaded =
    documents.cvResume &&
    documents.idDocuments.length > 0 &&
    documents.image &&
    documents.utilityBills.length > 0 &&
    documents.proofOfAddress1 && // ✅ Required
    documents.proofOfAddress2 && // ✅ Required
    documents.bankStatement.length > 0 &&
    documents.proofOfNI.length > 0 
    // &&
    // (isBritish ? true : documents.immigrationDocument.length > 0);

  const renderUploadedFiles = (field: keyof DocumentFile) => {
    const value = documents[field];
    if (!value) return null;

    const files = Array.isArray(value) ? value : [value];

    return (
      <div className="mt-3 space-y-2">
        {files.map((fileUrl, index) => {
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
                      {fileName.length > 35
                        ? fileName.slice(0, 30) + '...'
                        : fileName}
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
  };

  const openImageUploader = (field: keyof DocumentFile) =>
    setUploadState({ isOpen: true, field });

  const handleUploadComplete = (uploadResponse: any) => {
    const { field } = uploadState;
    if (!field || !uploadResponse?.success || !uploadResponse.data?.fileUrl) {
      setUploadState({ isOpen: false, field: null });
      return;
    }

    const fileUrl = uploadResponse.data.fileUrl;

    // Handle single-file fields
    if (
      field === 'cvResume' ||
      field === 'image' ||
      field === 'proofOfAddress1' ||
      field === 'proofOfAddress2'
    ) {
      setDocuments((prev) => ({ ...prev, [field]: fileUrl }));
    } else {
      // Handle array fields
      setDocuments((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), fileUrl]
      }));
    }

    setTimeout(() => onSave(documentsRef.current), 0);
    setUploadState({ isOpen: false, field: null });
  };

  // ✅ Added two new entries for proofOfAddress1 and proofOfAddress2
  const documentTypes: Array<{
    id: keyof DocumentFile;
    label: string;
    required: boolean;
    instructions: string;
    formats: string;
  }> = [
    {
      id: 'cvResume',
      label: 'CV/Resume',
      required: true,
      instructions: 'Upload your CV or Resume',
      formats: 'PDF, DOC, DOCX'
    },
    {
      id: 'idDocuments',
      label: 'Proof of ID',
      required: true,
      instructions:
        'e.g., Passport, Birth Certificate, Driver’s Licence, or Marriage Certificate',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'image',
      label: 'Photograph',
      required: true,
      instructions: 'Recent passport-size photos',
      formats: 'JPG, PNG'
    },
    {
      id: 'proofOfAddress1', // ✅ New
      label: 'Proof of Address 1',
      required: true,
      instructions: 'First document proving your current address',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'utilityBills',
      label: 'Utility Bills',
      required: true,
      instructions: 'Not older than 3 months',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'proofOfAddress2', // ✅ New
      label: 'Proof of Address 2',
      required: true,
      instructions: 'Second document proving your current address',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'bankStatement',
      label: 'Bank Statement',
      required: true,
      instructions: 'Address must correspond with utility bill',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'proofOfNI',
      label: 'National Insurance',
      required: true,
      instructions: 'N.I Card, P45, etc.',
      formats: 'PDF, JPG, PNG'
    },
    {
      id: 'immigrationDocument',
      label: 'Immigration Details / Work Permit',
      // required: defaultValues?.nationality !== 'british',
      required:false,
      instructions: 'Upload if applicable',
      formats: 'PDF, JPG, PNG'
    }
  ];

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
          <p className="mt-1 text-gray-600">
            Please upload all required documents to complete your application
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {documentTypes.map(
              ({ id, label, required, instructions, formats }) => {
                const value = documents[id];
                const hasFiles =
                  typeof value === 'string'
                    ? !!value
                    : Array.isArray(value)
                      ? value.length > 0
                      : false;

                return (
                  <div
                    key={id}
                    className={`rounded-xl border transition-colors duration-200 ${hasFiles ? 'border-green-400' : 'border-gray-100'} bg-gray-50`}
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3">
                            <div className="mt-1 rounded-lg bg-gray-100 p-2">
                              <FileText
                                className={`h-5 w-5 ${hasFiles ? 'text-green-600' : 'text-gray-600'}`}
                              />
                            </div>
                            <div>
                              <h3 className="flex items-center text-sm font-semibold text-gray-900 sm:text-base">
                                {label}{' '}
                                {required && (
                                  <span className="ml-1 text-red-500">*</span>
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
                            </div>
                          </div>
                          {renderUploadedFiles(id)}
                        </div>
                        <Button
                          type="button"
                          onClick={() => openImageUploader(id)}
                          className="mt-2 w-full self-start rounded-lg bg-watney px-4 py-2 text-xs font-medium text-white hover:bg-watney/90 sm:mt-0 sm:w-auto sm:px-6 sm:text-sm"
                        >
                          <span className="flex items-center gap-1.5">
                            <Upload className="h-4 w-4" /> Upload
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

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
