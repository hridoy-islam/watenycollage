import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Send, File, X, Info, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface Submission {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  files: string[];
  comment?: string;
  seen: boolean;
  status: 'submitted' | 'resubmitted';
  deadline?: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  submitBy: {
    _id: string;
    name: string;
    email: string;
  };
  comment?: string;
  files: string[];
  seen: boolean;
  createdAt: string;
}

interface Assignment {
  _id: string;
  applicationId: string;
  unitId: {
    _id: string;
    title: string;
    unitReference: string;
    level: string;
    gls: string;
    credit: string;
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  assignmentName: string;
  submissions: Submission[];
  feedbacks: Feedback[];
  status: string;
  deadline?: string;
  requireResubmit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  comment: string;
  files: { url: string; name: string }[];
  requireResubmit?: boolean;
  resubmissionDeadline?: Date;
  isAdminSubmission?: boolean;
}

interface SubmissionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isStudent: boolean;
  isTeacher: boolean;
  studentName: string;
  formState: FormState;
  onFormChange: (updates: Partial<FormState>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
  uploadingFiles: boolean;
  submitting: boolean;
  isFormDisabled: boolean;
  triggerButton: React.ReactNode;
  // Add these new props for editing
  editingItem?: { type: 'submission' | 'feedback'; id: string } | null;
  assignment?: Assignment | null;
}

export const SubmissionDialog: React.FC<SubmissionDialogProps> = ({
  isOpen,
  onOpenChange,
  isStudent,
  isTeacher,
  studentName,
  formState,
  onFormChange,
  onFileSelect,
  onRemoveFile,
  onSubmit,
  uploadingFiles,
  submitting,
  isFormDisabled,
  triggerButton,
  editingItem,
  assignment
}) => {
  // Reset form when dialog closes and we're not editing
  React.useEffect(() => {
    if (!isOpen && !editingItem) {
      onFormChange({
        comment: '',
        files: [],
        requireResubmit: false,
        resubmissionDeadline: undefined,
        isAdminSubmission: false
      });
    }
  }, [isOpen, editingItem]);

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileNameWithTimestamp = urlParts[urlParts.length - 1];
      const fileName = fileNameWithTimestamp.split('-').slice(1).join('-');
      return fileName || 'document';
    } catch {
      return 'document';
    }
  };

  const getDialogTitle = () => {
    if (editingItem) {
      if (editingItem.type === 'submission') {
        return isStudent ? 'Edit Your Submission' : 'Edit Submission';
      } else {
        return 'Edit Feedback';
      }
    }
    return isStudent
      ? 'Submit Assignment'
      : formState?.isAdminSubmission
        ? `Submit Assignment for ${studentName}`
        : 'Add Feedback';
  };

  // Check if submission requires at least one file
  const requiresFiles = () => {
    if (editingItem) {
      // When editing a submission, files are required
      return editingItem.type === 'submission';
    }
    // For new submissions, files are required
    return isStudent || (isTeacher && formState?.isAdminSubmission);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const hasComment = formState?.comment?.trim().length > 0;
    const hasFiles = formState?.files && formState.files.length > 0;

    if (requiresFiles()) {
      return hasFiles; // For submissions, files are required
    }
    return hasComment || hasFiles; // For feedback, either comment or files are required
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingFiles || (isStudent && isFormDisabled)) return;
    await onFileSelect(e);
  };

  const handleRemoveFile = (index: number) => {
    if ((isStudent && isFormDisabled) || !formState?.files) return;

    // For editing submissions, allow removing any file including the last one
    // The submit button will be disabled if no files remain
    if (editingItem && editingItem.type === 'submission') {
      onRemoveFile(index);
      return;
    }

    // For new submissions, don't allow removing the last file
    if (requiresFiles() && formState.files.length <= 1) {
      return;
    }

    onRemoveFile(index);
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      const errorMessage = requiresFiles()
        ? 'At least one file is required for submission.'
        : 'Please provide a comment or upload files.';
      console.error(errorMessage);
      return;
    }
    onSubmit();
  };

  // Check if this is an editing mode
  const isEditing = !!editingItem;

  // Check if we should disable file removal
  const shouldDisableFileRemoval = (fileIndex: number) => {
    if ((isStudent && isFormDisabled) || !formState?.files) return true;
    
    // For editing submissions, allow removing any file
    if (editingItem && editingItem.type === 'submission') {
      return false;
    }
    
    // For new submissions, disable removing the last file
    return requiresFiles() && formState.files.length <= 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild className="fixed top-[90vh]">
        {triggerButton}
      </DialogTrigger>

      <DialogContent className="h-[80vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comment Input */}
          <div>
            <Label htmlFor="comment" className="mb-2 block">
              {isStudent || (isEditing && editingItem?.type === 'submission')
                ? 'Submission Notes'
                : 'Feedback/Comments'}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isStudent || (isEditing && editingItem?.type === 'submission')
                  ? 'Add your submission notes...'
                  : formState?.isAdminSubmission
                    ? `Submit assignment on behalf of ${studentName}...`
                    : 'Write your feedback...'
              }
              value={formState?.comment || ''}
              onChange={(e) => onFormChange({ comment: e.target.value })}
              rows={12}
              disabled={isStudent && isFormDisabled}
              className="resize-none"
            />
          </div>

          {/* File Upload - Show for both new and editing modes */}
          <div>
            <Label className="mb-2 block">
              Attachments
              {requiresFiles() && <span className="ml-1 text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="file-upload"
                className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 py-2 transition hover:bg-gray-50 ${
                  uploadingFiles || (isStudent && isFormDisabled)
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="text-sm">
                  {isEditing ? 'Add More Files' : 'Upload Files'}
                </span>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploadingFiles || (isStudent && isFormDisabled)}
                  className="hidden"
                />
              </label>
              {uploadingFiles && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <BlinkingDots size="small" color="bg-blue-600" />
                  Uploading...
                </div>
              )}
            </div>

            {/* File requirement hint */}
            {requiresFiles() && (
              <p className="mt-1 text-xs text-gray-500">
                At least one file is required for {isEditing ? 'updating' : 'submitting'} this assignment.
              </p>
            )}
          </div>

          {/* Uploaded Files List */}
          {formState?.files && formState.files.length > 0 && (
            <div className="space-y-2">
              <Label>Attached Files:</Label>

              <div className="flex flex-wrap gap-2">
                {formState.files.map((file, i) => (
                  <div
                    key={i}
                    className="flex w-full items-center justify-between rounded-lg bg-gray-200 px-3 py-1 text-xs sm:w-[48%] lg:w-[32%]"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <span className="truncate text-xs">{file.name}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(i)}
                      disabled={shouldDisableFileRemoval(i)}
                      className="h-6 w-6 flex-shrink-0"
                      title={
                        shouldDisableFileRemoval(i)
                          ? 'At least one file is required'
                          : 'Remove file'
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show warning if no files but files are required */}
          {requiresFiles() &&
            (!formState?.files || formState.files.length === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">File Required</span>
                </div>
                <p className="mt-1 text-xs text-amber-700">
                  You need to upload at least one file to{' '}
                  {isEditing ? 'update' : 'submit'} this assignment.
                </p>
              </div>
            )}

          {/* Teacher Options - Only show for new feedback, not when editing */}
          {isTeacher &&
            !isStudent &&
            (!editingItem || editingItem.type === 'feedback') && (
              <div className="space-y-3 border-t pt-4">
                {!formState?.isAdminSubmission && (
                  <>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="require-resubmit"
                        checked={formState?.requireResubmit || false}
                        onCheckedChange={(checked) =>
                          onFormChange({
                            requireResubmit: Boolean(checked),
                            resubmissionDeadline: checked
                              ? formState?.resubmissionDeadline || new Date()
                              : undefined
                          })
                        }
                      />
                      <Label htmlFor="require-resubmit" className="text-sm">
                        Require Resubmission
                      </Label>
                    </div>

                    {formState?.requireResubmit && (
                      <div className="flex items-center gap-2 pl-6">
                        <Info className="h-4 w-4 text-gray-500" />
                        <Label className="text-sm">
                          Resubmission Deadline:
                        </Label>
                        <DatePicker
                          selected={formState.resubmissionDeadline}
                          onChange={(date: Date | null) =>
                            onFormChange({
                              resubmissionDeadline: date || undefined
                            })
                          }
                          minDate={new Date()}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          dateFormat="dd MMM yyyy"
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          {/* Student editing info */}
          {/* {isStudent && isEditing && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Editing Submission</span>
              </div>
              <p className="mt-1 text-xs text-blue-700">
                You are editing your submission. You can update your files and
                notes. At least one file is required to update your submission.
              </p>
            </div>
          )} */}
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              uploadingFiles ||
              (isStudent && isFormDisabled) ||
              submitting ||
              !isFormValid()
            }
            className="bg-watney text-white hover:bg-watney/90"
            title={
              !isFormValid()
                ? requiresFiles()
                  ? 'Please upload at least one file'
                  : 'Please provide a comment or upload files'
                : ''
            }
          >
            {submitting ? (
              <>
                <BlinkingDots size="small" color="bg-white" />
                {isEditing
                  ? 'Updating...'
                  : isStudent
                    ? 'Submitting...'
                    : 'Sending...'}
              </>
            ) : (
              <>
                {isEditing
                  ? 'Update'
                  : isStudent
                    ? 'Submit'
                    : formState?.isAdminSubmission
                      ? 'Submit for Student'
                      : 'Send Feedback'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};