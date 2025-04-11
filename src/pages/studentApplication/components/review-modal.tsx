import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: any;
}

export function ReviewModal({ open, onClose, formData }: ReviewModalProps) {
  // Helper function to render form data sections
  const renderSection = (title: string, data: any) => {
    if (!data) return null;

    // Function to recursively render nested objects
    const renderValue = (value: any, depth = 0): React.ReactNode => {
      if (value === null || value === undefined) {
        return 'Not provided';
      }

      if (value instanceof Date) {
        return value.toLocaleDateString();
      }

      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return 'None';

        return (
          <div className="mt-2 border-l-2 border-gray-200 pl-4">
            {value.map((item, idx) => (
              <div key={idx} className="mb-2">
                {typeof item === 'object' && item !== null
                  ? Object.entries(item).map(([k, v]) => (
                      <div key={k} className="mb-1 grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium capitalize">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm">
                          {renderValue(v, depth + 1)}
                        </div>
                      </div>
                    ))
                  : renderValue(item, depth + 1)}
              </div>
            ))}
          </div>
        );
      }

      if (typeof value === 'object') {
        return (
          <div
            className={depth > 0 ? 'mt-2 border-l-2 border-gray-200 pl-4' : ''}
          >
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="mb-1 grid grid-cols-2 gap-2">
                <div className="text-sm font-medium capitalize">
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm">{renderValue(v, depth + 1)}</div>
              </div>
            ))}
          </div>
        );
      }

      return String(value);
    };

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-blue-700">{title}</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {Object.entries(data).map(([key, value]) => {
            // Skip rendering file objects directly
            if (
              value instanceof File ||
              (Array.isArray(value) && value[0] instanceof File)
            ) {
              return (
                <div key={key} className="mb-2 grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-sm">
                    {Array.isArray(value)
                      ? `${value.length} file(s) uploaded`
                      : 'File uploaded'}
                  </div>
                </div>
              );
            }

            return (
              <div key={key} className="mb-2 grid grid-cols-2 gap-2">
                <div className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm">{renderValue(value)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            Application Summary
          </DialogTitle>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ maxHeight: 'calc(80vh - 120px)' }}
        >
          <div className="space-y-6">
            {renderSection('Personal Details', formData.personalDetails)}
            {renderSection('Address', formData.address)}
            {renderSection('Course Details', formData.courseDetails)}
            {renderSection('Contact', formData.contact)}
            {renderSection('Education', formData.education)}
            {renderSection('Employment', formData.employment)}
            {renderSection('Compliance', formData.compliance)}
            {renderSection('Documents', formData.documents)}
            {renderSection('Terms and Conditions', formData.termsAndSubmit)}
          </div>
        </div>

        <div className="flex justify-end border-t p-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
