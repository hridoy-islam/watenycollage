import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  FileText,
  ExternalLink,
  CheckCircle,
  Plus,
  Eye,
  Upload,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import axiosInstance from '@/lib/axios';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Select, { SingleValue } from 'react-select';

// ✅ Proof of Address sub-types
const PROOF_OF_ADDRESS_SUBTYPES = [
  { value: 'bankStatement', label: 'Bank Statement' },
  { value: 'utilityBill', label: 'Utility Bill' },
  { value: 'drivingLicense', label: 'Driving License' }
] as const;

type ProofOfAddressType = (typeof PROOF_OF_ADDRESS_SUBTYPES)[number]['value'];

const PROOF_TYPE_LABELS: Record<ProofOfAddressType, string> = {
  bankStatement: 'Bank Statement',
  utilityBill: 'Utility Bill',
  drivingLicense: 'Driving License'
};

export const createDocumentSchema = (
  hasExistingResume = false,
  nationality?: string
) =>
  z.object({
    cvResume: z.string().optional(),
    idDocuments: z.array(z.string()).optional(),
    image: z.string().optional(),
    proofOfAddress1: z.string().optional(),
    proofOfAddress2: z.string().optional(),
    proofOfAddress1Type: z
      .enum(['bankStatement', 'utilityBill', 'drivingLicense'])
      .optional()
      .or(z.literal('')),
    proofOfAddress2Type: z
      .enum(['bankStatement', 'utilityBill', 'drivingLicense'])
      .optional()
      .or(z.literal('')),
    proofOfNI: z.array(z.string()).optional(),
    immigrationDocument: z.array(z.string()).optional(),
    // rtwDocument: z.string().optional(),
    shareCodeDocument: z.string().optional()
  });

export type DocumentFile = z.infer<ReturnType<typeof createDocumentSchema>>;

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentFile> & { nationality?: string };
  onSaveAndContinue: (data: DocumentFile) => void;
  setCurrentStep: (step: number) => void;
  onSave: () => void;
  saveAndLogout: () => void;
}

const documentTypes = [
  {
    id: 'cvResume',
    label: 'CV/Resume',
    required: true,
    formats: 'PDF, DOC, DOCX'
  },
  {
    id: 'idDocuments',
    label: 'Proof of ID',
    required: true,
    formats: 'PDF, JPG, PNG'
  },
  { id: 'image', label: 'Photograph', required: true, formats: 'JPG, PNG' },
  {
    id: 'proofOfAddress1',
    label: 'Proof of Address 1',
    required: true,
    formats: 'PDF, JPG, PNG',
    hasSubtype: true
  },
  {
    id: 'proofOfAddress2',
    label: 'Proof of Address 2',
    required: true,
    formats: 'PDF, JPG, PNG',
    hasSubtype: true
  },
  {
    id: 'proofOfNI',
    label: 'National Insurance',
    required: true,
    formats: 'PDF, JPG, PNG'
  },
  {
    id: 'immigrationDocument',
    label: 'Immigration Details / Work Permit',
    required: false,
    formats: 'PDF, JPG, PNG'
  },
  // {
  //   id: 'rtwDocument',
  //   label: 'Right to Work Document',
  //   required: false,
  //   formats: 'PDF, JPG, PNG'
  // },
  {
    id: 'shareCodeDocument',
    label: 'Right To Work Share Code Document',
    required: false,
    formats: 'PDF, JPG, PNG'
  }
];

interface DocOption {
  value: keyof DocumentFile;
  label: string;
  required: boolean;
}

interface ProofTypeOption {
  value: ProofOfAddressType;
  label: string;
}

export function DocumentStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep,
  onSave,
  saveAndLogout
}: DocumentsStepProps) {
  const hasExistingResume = !!defaultValues?.cvResume;
  const documentSchema = createDocumentSchema(
    hasExistingResume,
    defaultValues?.nationality
  );

  const [documents, setDocuments] = useState<DocumentFile>({
    cvResume: '',
    image: '',
    idDocuments: [],
    proofOfAddress1: '',
    proofOfAddress2: '',
    proofOfAddress1Type: '',
    proofOfAddress2Type: '',
    proofOfNI: [],
    immigrationDocument: [],
    // rtwDocument: '',
    shareCodeDocument: ''
  });

  useEffect(() => {
    if (defaultValues) {
      setDocuments({
        cvResume: defaultValues.cvResume ?? '',
        idDocuments: defaultValues.idDocuments ?? [],
        image: defaultValues.image ?? '',
        proofOfAddress1: defaultValues.proofOfAddress1 ?? '',
        proofOfAddress2: defaultValues.proofOfAddress2 ?? '',
        proofOfAddress1Type: defaultValues.proofOfAddress1Type ?? '',
        proofOfAddress2Type: defaultValues.proofOfAddress2Type ?? '',
        proofOfNI: defaultValues.proofOfNI ?? [],
        immigrationDocument: defaultValues.immigrationDocument ?? [],
        // rtwDocument: defaultValues.rtwDocument ?? '',
        shareCodeDocument: defaultValues.shareCodeDocument ?? ''
      });
    }
  }, [defaultValues]);

  const documentsRef = useRef(documents);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { user } = useSelector((state: any) => state.auth);

  // Fields whose value is a single string (not an array of files)
  const singleValueFields: (keyof DocumentFile)[] = [
    'cvResume',
    'image',
    'proofOfAddress1',
    'proofOfAddress2',
    // 'rtwDocument',
    'shareCodeDocument'
  ];

  // Deleting a file never splices an array for these fields — it just
  // resets the field to '' (or undefined). Deleting a proof-of-address
  // slot also clears its tracked subtype and, if that subtype had mirrored
  // into Utility Bill / Bank Statement, clears that mirrored field too —
  // reopening both the subtype option and the standalone requirement.
  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    if (singleValueFields.includes(field)) {
      setDocuments((prev) => {
        const updated: DocumentFile = { ...prev, [field]: '' };

        if (field === 'proofOfAddress1') {
          updated.proofOfAddress1Type = '';
        }

        if (field === 'proofOfAddress2') {
          updated.proofOfAddress2Type = '';
        }

        return updated;
      });
    } else {
      setDocuments((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((file) => file !== fileName)
      }));
    }
  };

  const handleBack = () => setCurrentStep(12);

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

  const visibleDocumentTypes = documentTypes;

  const allDocumentsUploaded =
    documents.cvResume &&
    documents.idDocuments.length > 0 &&
    documents.image &&
    documents.proofOfAddress1 &&
    documents.proofOfAddress1Type &&
    documents.proofOfAddress2 &&
    documents.proofOfAddress2Type &&
    documents.proofOfNI.length > 0;

  const renderUploadedFiles = (field: keyof DocumentFile) => {
    const value = documents[field];
    if (!value) return null;

    const files = Array.isArray(value) ? value : [value];

    return (
      <div className="mt-2 space-y-2">
        {files.map((fileUrl, index) => {
          const fileName = decodeURIComponent(
            fileUrl.split('/').pop() || `File-${index}`
          );
          return (
            <div
              key={`${fileUrl}-${index}`}
              className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {/* View button */}
                <Button
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="flex items-center gap-1 bg-watney px-3 py-1 text-sm text-white hover:bg-watney/90 sm:text-base"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  View
                </Button>

                {/* Delete button */}
                <Button
                  variant={'destructive'}
                  onClick={() => handleRemoveFile(field, fileUrl)}
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const isDocumentUploaded = (field: keyof DocumentFile): boolean => {
    const value = documents[field];
    if (typeof value === 'string') return !!value;
    return Array.isArray(value) && value.length > 0;
  };

  const hasUploadedDocuments = documentTypes.some((doc) =>
    isDocumentUploaded(doc.id)
  );

  // ✅ Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocOption, setSelectedDocOption] =
    useState<SingleValue<DocOption> | null>(null);
  const [selectedProofAddressType, setSelectedProofAddressType] =
    useState<SingleValue<ProofTypeOption> | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProofOfAddressField =
    selectedDocOption?.value === 'proofOfAddress1' ||
    selectedDocOption?.value === 'proofOfAddress2';

  // A subtype is unavailable if:
  // - the matching standalone requirement (Utility Bill / Bank Statement)
  //   has already been satisfied (mirrored from the other slot, or
  //   uploaded on its own), or
  // - it's Driving License and the OTHER proof-of-address slot already
  //   used Driving License
  const isSubtypeUnavailable = (subtype: ProofOfAddressType): boolean => {
    if (selectedDocOption?.value === 'proofOfAddress1') {
      return documents.proofOfAddress2Type === subtype;
    }
    if (selectedDocOption?.value === 'proofOfAddress2') {
      return documents.proofOfAddress1Type === subtype;
    }
    return false;
  };

  const proofOfAddressSubtypeOptions: ProofTypeOption[] =
    PROOF_OF_ADDRESS_SUBTYPES.filter((opt) => !isSubtypeUnavailable(opt.value)).map(
      (opt) => ({ value: opt.value, label: opt.label })
    );

  const canShowUploadArea =
    !!selectedDocOption && (!isProofOfAddressField || !!selectedProofAddressType);

  const uploadableOptions: DocOption[] = visibleDocumentTypes
    .map((doc) => ({
      value: doc.id,
      label: `${doc.label}${doc.required ? ' *' : ''}`,
      required: doc.required
    }))
    .filter((option) => !isDocumentUploaded(option.value));

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedDocOption(null);
      setSelectedProofAddressType(null);
      setFileToUpload(null);
      setIsUploading(false);
      setUploadError(null);
      setUploadedFileUrl(null);
    }
  };

  const handleDocOptionChange = (option: SingleValue<DocOption>) => {
    setSelectedDocOption(option);
    setSelectedProofAddressType(null);
    setFileToUpload(null);
    setUploadedFileUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateFile = (file: File, docId: keyof DocumentFile): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be less than 5MB.');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocOption || !user?._id) return;
    if (isProofOfAddressField && !selectedProofAddressType) return;

    if (!validateFile(file, selectedDocOption.value)) return;

    setFileToUpload(file);
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('entityId', user._id);
    formData.append('file_type', 'careerDoc');
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', formData);
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) throw new Error('No file URL returned');

      setUploadedFileUrl(fileUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Failed to upload document. Please try again.');
      setFileToUpload(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitDocument = () => {
    if (!uploadedFileUrl || !selectedDocOption) return;
    if (isProofOfAddressField && !selectedProofAddressType) return;

    const field = selectedDocOption.value;
    const proofType = selectedProofAddressType?.value;

    setDocuments((prev) => {
      const updated: DocumentFile = { ...prev };

      if (singleValueFields.includes(field)) {
        updated[field] = uploadedFileUrl as any;

        if (field === 'proofOfAddress1') {
          updated.proofOfAddress1Type = proofType as ProofOfAddressType;
        }
        if (field === 'proofOfAddress2') {
          updated.proofOfAddress2Type = proofType as ProofOfAddressType;
        }

        return updated;
      } else {
        return {
          ...prev,
          [field]: [...(prev[field] as string[]), uploadedFileUrl]
        };
      }
    });

    setTimeout(() => onSave(documentsRef.current), 0);
    setUploadedFileUrl(null);
    setFileToUpload(null);
    setSelectedDocOption(null);
    setSelectedProofAddressType(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsDialogOpen(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveSelectedFile = () => {
    setFileToUpload(null);
    setUploadedFileUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getProofTypeLabel = (id: keyof DocumentFile): string | null => {
    if (id === 'proofOfAddress1' && documents.proofOfAddress1Type) {
      return PROOF_TYPE_LABELS[documents.proofOfAddress1Type as ProofOfAddressType];
    }
    if (id === 'proofOfAddress2' && documents.proofOfAddress2Type) {
      return PROOF_TYPE_LABELS[documents.proofOfAddress2Type as ProofOfAddressType];
    }
    return null;
  };

  return (
    <div className="w-full">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>
          <p className="text-md mt-1 text-gray-600">
            Please upload all required documents to complete your application
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left: Upload Area */}
            <div className="lg:flex-1">
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Upload Documents
                </h3>

                <Dialog
                  open={isDialogOpen}
                  onOpenChange={handleDialogOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button className=" mb-6 flex items-center gap-2 bg-watney text-lg text-white hover:bg-watney/90">
                      <Plus className="h-5 w-5" />
                      Add Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Document</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label
                          htmlFor="docType"
                          className="mb-2 block text-sm font-medium"
                        >
                          Document Type
                        </Label>
                        <Select<DocOption>
                          inputId="docType"
                          value={selectedDocOption}
                          onChange={handleDocOptionChange}
                          options={uploadableOptions}
                          placeholder="Choose document type"
                          isClearable={false}
                          isSearchable={true}
                          className="basic-single"
                          classNamePrefix="select"
                        />
                      </div>

                      {/* Proof of Address subtype selector */}
                      {selectedDocOption && isProofOfAddressField && (
                        <div>
                          <Label
                            htmlFor="proofType"
                            className="mb-2 block text-sm font-medium"
                          >
                            Proof Type
                          </Label>
                          <Select<ProofTypeOption>
                            inputId="proofType"
                            value={selectedProofAddressType}
                            onChange={(option) => {
                              setSelectedProofAddressType(option);
                              setFileToUpload(null);
                              setUploadedFileUrl(null);
                              setUploadError(null);
                              if (fileInputRef.current)
                                fileInputRef.current.value = '';
                            }}
                            options={proofOfAddressSubtypeOptions}
                            placeholder="Bank Statement, Utility Bill, or Driving License"
                            isClearable={false}
                            isSearchable={false}
                            className="basic-single"
                            classNamePrefix="select"
                          />
                          {proofOfAddressSubtypeOptions.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">
                              All proof types have already been used or
                              satisfied elsewhere.
                            </p>
                          )}
                        </div>
                      )}

                      {canShowUploadArea && (
                        <div>
                          <Label className="mb-2 block text-sm font-medium">
                            Upload File
                          </Label>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                          />

                          {/* Professional Upload Area */}
                          <div
                            onClick={triggerFileInput}
                            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                              isUploading
                                ? 'border-blue-300 bg-blue-50'
                                : uploadedFileUrl
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-gray-300 bg-gray-50 hover:border-watney hover:bg-watney/5'
                            }`}
                          >
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                                <p className="text-sm font-medium text-gray-900">
                                  Uploading...
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                  Please wait
                                </p>
                              </div>
                            ) : uploadedFileUrl ? (
                              <div className="flex flex-col items-center">
                                <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
                                <p className="text-sm font-medium text-gray-900">
                                  File Uploaded Successfully!
                                </p>
                                <p className="mt-1 max-w-full truncate text-xs text-gray-600">
                                  {fileToUpload?.name}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSelectedFile();
                                  }}
                                  className="mt-2"
                                >
                                  Choose Different File
                                </Button>
                              </div>
                            ) : fileToUpload ? (
                              <div className="flex flex-col items-center">
                                <FileText className="mb-2 h-8 w-8 text-blue-600" />
                                <p className="text-sm font-medium text-gray-900">
                                  Ready to Upload
                                </p>
                                <p className="mt-1 max-w-full truncate text-xs text-gray-600">
                                  {fileToUpload.name}
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveSelectedFile();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerFileInput();
                                    }}
                                  >
                                    Change File
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900">
                                  Click to select file
                                </p>
                                <p className="mt-1 text-xs text-gray-600">
                                  Max file size: 5MB
                                </p>
                              </div>
                            )}
                          </div>

                          {uploadError && (
                            <div className="mt-2 flex items-center rounded bg-red-50 p-2 text-sm text-red-600">
                              <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                              {uploadError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitDocument}
                        disabled={
                          !uploadedFileUrl ||
                          isUploading ||
                          (isProofOfAddressField && !selectedProofAddressType)
                        }
                        className="bg-watney text-white hover:bg-watney/90"
                      >
                        Submit Document
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Uploaded Documents List */}
                {hasUploadedDocuments && (
                  <div className="space-y-4">
                    {visibleDocumentTypes.map(({ id, label, required }) => {
                      const isUploaded = isDocumentUploaded(id);
                      if (!isUploaded) return null;

                      const proofTypeLabel = getProofTypeLabel(id);

                      return (
                        <div
                          key={id}
                          className="flex w-full flex-col items-start gap-2 border-b border-gray-100 px-3 py-2 last:border-b-0 hover:bg-watney/10 sm:flex-row sm:items-center sm:gap-3"
                        >
                          {/* Icon */}
                          <FileText className="mt-1 h-6 w-6 flex-shrink-0 text-gray-500 sm:mt-0" />

                          {/* Content */}
                          <div className="flex w-full flex-row justify-between max-md:flex-col">
                            {/* Label with tick */}
                            <div className="mb-1 flex flex-wrap items-center gap-1">
                              <span className="text-lg font-medium text-gray-900">
                                {label}
                                {proofTypeLabel && (
                                  <span className="ml-1 text-sm font-normal text-gray-500">
                                    ({proofTypeLabel})
                                  </span>
                                )}
                                {required && (
                                  <span className="ml-0.5 text-red-500">*</span>
                                )}
                              </span>
                              <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                            </div>

                            {/* Uploaded files (responsive) */}
                            {renderUploadedFiles(id)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Progress Sidebar */}
            <div className="lg:w-80">
              <Card className="sticky top-6 border border-gray-200">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Required Documents
                  </h3>
                  <p className="text-sm text-gray-600">
                    {
                      visibleDocumentTypes.filter(
                        (d) => d.required && isDocumentUploaded(d.id)
                      ).length
                    }{' '}
                    of {visibleDocumentTypes.filter((d) => d.required).length}{' '}
                    completed
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {visibleDocumentTypes
                      .filter((doc) => doc.required)
                      .map(({ id, label }) => {
                        const uploaded = isDocumentUploaded(id);
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between py-2"
                          >
                            <span className={`text-sm text-gray-600`}>
                              {label}
                            </span>
                            {uploaded ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className=" w-full justify-center bg-watney text-lg text-white hover:bg-watney/90 sm:w-auto"
            >
              Back
            </Button>
            <Button
              onClick={() => saveAndLogout()}
              className="bg-watney  text-white hover:bg-watney/90"
            >
              Save And Exit
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allDocumentsUploaded}
              className="w-full justify-center bg-watney text-lg text-white hover:bg-watney/90 sm:w-auto"
            >
              Save And Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}