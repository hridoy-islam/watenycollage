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

// ✅ Schema (unchanged)
export const createDocumentSchema = (
  hasExistingResume = false,
  nationality?: string
) =>
  z.object({
    cvResume: z.string().optional(),
    idDocuments: z.array(z.string()).optional(),
    image: z.string().optional(),
    utilityBills: z.array(z.string()).optional(),
    proofOfAddress1: z.string().optional(),
    proofOfAddress2: z.string().optional(),
    bankStatement: z.array(z.string()).optional(),
    proofOfNI: z.array(z.string()).optional(),
    immigrationDocument: z.array(z.string()).optional()
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
    formats: 'PDF, JPG, PNG'
  },
  {
    id: 'proofOfAddress2',
    label: 'Proof of Address 2',
    required: true,
    formats: 'PDF, JPG, PNG'
  },
  {
    id: 'utilityBills',
    label: 'Utility Bills',
    required: true,
    formats: 'PDF, JPG, PNG'
  },
  {
    id: 'bankStatement',
    label: 'Bank Statement',
    required: true,
    formats: 'PDF, JPG, PNG'
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
  }
];

interface DocOption {
  value: keyof DocumentFile;
  label: string;
  required: boolean;
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
    utilityBills: [],
    proofOfAddress1: '',
    proofOfAddress2: '',
    bankStatement: [],
    proofOfNI: [],
    immigrationDocument: []
  });

  useEffect(() => {
    if (defaultValues) {
      setDocuments({
        cvResume: defaultValues.cvResume ?? '',
        idDocuments: defaultValues.idDocuments ?? [],
        image: defaultValues.image ?? '',
        utilityBills: defaultValues.utilityBills ?? [],
        proofOfAddress1: defaultValues.proofOfAddress1 ?? '',
        proofOfAddress2: defaultValues.proofOfAddress2 ?? '',
        bankStatement: defaultValues.bankStatement ?? [],
        proofOfNI: defaultValues.proofOfNI ?? [],
        immigrationDocument: defaultValues.immigrationDocument ?? []
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

  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    if (
      ['cvResume', 'image', 'proofOfAddress1', 'proofOfAddress2'].includes(
        field
      )
    ) {
      setDocuments((prev) => ({ ...prev, [field]: '' }));
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

  const allDocumentsUploaded =
    documents.cvResume &&
    documents.idDocuments.length > 0 &&
    documents.image &&
    documents.utilityBills.length > 0 &&
    documents.proofOfAddress1 &&
    documents.proofOfAddress2 &&
    documents.bankStatement.length > 0 &&
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
              {/* File name */}
              {/* <span className="text-gray-900 truncate text-base sm:text-lg w-full sm:flex-1">
              {fileName}
            </span> */}

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
                  onClick={() => handleRemoveFile(field, fileUrl)}
                  className="text-gray-500 hover:text-red-600 "
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
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadableOptions: DocOption[] = documentTypes
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
      setFileToUpload(null);
      setIsUploading(false);
      setUploadError(null);
      setUploadedFileUrl(null);
    }
  };

  const validateFile = (file: File, docId: keyof DocumentFile): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be less than 5MB.');
      return false;
    }

    const allowedTypes =
      documentTypes
        .find((d) => d.id === docId)
        ?.formats.split(', ')
        .map((f) => f.toLowerCase()) || [];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    // const valid = allowedTypes.some(type => {
    //   if (type.startsWith('.')) {
    //     return fileExt === type.slice(1);
    //   }
    //   return mimeType.includes(type.toLowerCase());
    // });

    // if (!valid) {
    //   setUploadError(`Invalid file type. Allowed: ${documentTypes.find(d => d.id === docId)?.formats}`);
    //   return false;
    // }

    return true;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocOption || !user?._id) return;

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

    const field = selectedDocOption.value;
    setDocuments((prev) => {
      if (
        ['cvResume', 'image', 'proofOfAddress1', 'proofOfAddress2'].includes(
          field
        )
      ) {
        return { ...prev, [field]: uploadedFileUrl };
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
                          onChange={setSelectedDocOption}
                          options={uploadableOptions}
                          placeholder="Choose document type"
                          isClearable={false}
                          isSearchable={true}
                          className="basic-single"
                          classNamePrefix="select"
                        />
                      </div>

                      {selectedDocOption && (
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
                        disabled={!uploadedFileUrl || isUploading}
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
                    {documentTypes.map(({ id, label, required }) => {
                      const isUploaded = isDocumentUploaded(id);
                      if (!isUploaded) return null;

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

                {/* {!hasUploadedDocuments && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Get started by uploading your first document</p>
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                      <DialogTrigger asChild>
                        <Button className=" bg-watney text-lg text-white hover:bg-watney/90 flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Upload First Document
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )} */}
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
                      documentTypes.filter(
                        (d) => d.required && isDocumentUploaded(d.id)
                      ).length
                    }{' '}
                    of {documentTypes.filter((d) => d.required).length}{' '}
                    completed
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {documentTypes
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
