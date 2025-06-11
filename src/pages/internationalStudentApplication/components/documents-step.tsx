import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { FileUpload } from './file-upload';
import { ImageUploader } from './document-uploader';
import { useSelector } from 'react-redux';
import passport from '@/assets/imges/home/passport.jpg';

interface DocumentFile {
  cv: string[];
  coverLetter: string[];
  rightToWork: string[];
  image: string;
  signature: string;
}

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentFile>;
  onSaveAndContinue: (data: DocumentFile) => void;
  setCurrentStep: (step: number) => void;
}

export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}: DocumentsStepProps) {
  const [documents, setDocuments] = useState<DocumentFile>({
    cv: defaultValues?.cv ?? [],
    coverLetter: defaultValues?.coverLetter ?? [],
    rightToWork: defaultValues?.rightToWork ?? [],
    image: defaultValues?.image ?? '',
    signature: defaultValues?.signature ?? ''
  });

  const [uploadState, setUploadState] = useState<{
    isOpen: boolean;
    field: keyof DocumentFile | null;
  }>({
    isOpen: false,
    field: null
  });

  const { user } = useSelector((state: any) => state.auth);

  const handleRemoveFile = (field: keyof DocumentFile, fileName: string) => {
    if (field === 'image' || field === 'signature') {
      // For single string fields, reset to empty string
      setDocuments((prev) => ({
        ...prev,
        [field]: ''
      }));
    } else {
      // For array fields, filter out the specific file
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
    onSaveAndContinue(documents);
  };

  // Check if all required documents have at least one file
  const allDocumentsUploaded =
    documents.cv.length > 0 &&
    documents.coverLetter.length > 0 &&
    documents.rightToWork.length > 0 &&
    documents.image.length > 0 &&
    documents.signature.length > 0;

  const renderUploadedFiles = (field: keyof DocumentFile) => {
    const value = documents[field];

    // Handle single string fields (image, signature)
    if ((field === 'image' || field === 'signature') && value) {
      const fileName =
        typeof value === 'string'
          ? decodeURIComponent(value.split('/').pop() || 'File')
          : 'File';
      return (
        <div className="mt-2 w-1/2 space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-gray-50 p-2">
            <span className="truncate text-sm">{fileName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFile(field, value as string)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      );
    }

    // Handle array fields (cv, coverLetter, rightToWork)
    if (Array.isArray(value) && value.length > 0) {
      return (
        <div className="mt-2 space-y-2">
          {value.map((fileUrl, index) => {
            const fileName = decodeURIComponent(
              fileUrl.split('/').pop() || `File-${index}`
            );
            return (
              <div
                key={`${fileUrl}-${index}`}
                className="flex items-center justify-between rounded-md border bg-gray-50 p-2"
              >
                <span className="truncate text-sm">{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(field, fileUrl)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
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
      // Handle single string fields
      if (field === 'image' || field === 'signature') {
        return {
          ...prev,
          [field]: fileUrl
        };
      }
      // Handle array fields - append to existing array
      else {
        return {
          ...prev,
          [field]: [...(prev[field] as string[]), fileUrl]
        };
      }
    });

    setUploadState({ isOpen: false, field: null });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Please upload all required documents directly below.
        </p>
        <div className="mt-4 text-sm">
          <p className="font-medium">Required Documents:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              Updated <strong>CV or Resume</strong>
            </li>
            <li>Cover letter</li>
            <li>
              Proof of right to work in the UK (e.g., passport, BRP, settled
              status)
            </li>
            <li>Photograph</li>
            <li>Signature</li>
          </ul>
        </div>
      </CardHeader>
      <CardContent>
        {/* CV Upload */}
        <div className="mb-6 space-y-1">
          <label className="text-sm font-medium">
            CV or Resume <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openImageUploader('cv')}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Please upload your most recent CV or Resume. Accepted file formats:
            PDF, DOCX, or TXT.
          </p>
          {renderUploadedFiles('cv')}
        </div>

        {/* Cover Letter Upload */}
        <div className="mb-6 space-y-1">
          <label className="text-sm font-medium">
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openImageUploader('coverLetter')}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Please upload your cover letter. Accepted file formats: PDF, DOCX,
            or TXT.
          </p>
          {renderUploadedFiles('coverLetter')}
        </div>

        {/* Right to Work Upload */}
        <div className="mb-6 space-y-1">
          <label className="text-sm font-medium">
            Proof of Right to Work in the UK{' '}
            <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openImageUploader('rightToWork')}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Please upload a document proving your eligibility to work in the UK.
            Accepted file formats: PDF, JPG, PNG.
          </p>
          {renderUploadedFiles('rightToWork')}
        </div>

        {/* Photo Upload */}
        <div className="mb-6 flex flex-col space-y-4">
          <div className="flex w-full flex-col space-y-1">
            <label className="text-sm font-medium">
              Photograph <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex flex-col-reverse items-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openImageUploader('image')}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Upload
              </Button>
              {/* Example Image */}
              <div className="flex-shrink-0">
                <img
                  src={passport}
                  alt="Example"
                  className="h-32 w-32 object-cover"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Please upload a recent passport-style photograph. Accepted file
              formats: JPG, PNG.
            </p>
          </div>
          {/* Render uploaded files below */}
          <div className="mt-4">{renderUploadedFiles('image')}</div>
        </div>

        {/* Signature Upload */}
        <div className="mb-6 space-y-1">
          <label className="text-sm font-medium">
            Signature <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openImageUploader('signature')}
              className="bg-watney text-white hover:bg-watney/90"
            >
              Upload
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Please upload your signature. Accepted file formats: JPG, PNG, or
            PDF.
          </p>
          {renderUploadedFiles('signature')}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            type="button"
            className="bg-watney text-white hover:bg-watney/90"
            onClick={handleSubmit}
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
  );
}
