import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil } from 'lucide-react';

interface SignatureFieldProps {
  label: string;
  entityId?: string;
  signatureUrl?: string;
  onSaved: (url: string) => void;
}

export function SignatureField({
  label,
  entityId,
  signatureUrl,
  onSaved
}: SignatureFieldProps) {
  const { toast } = useToast();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const dataUrl = signatureRef.current?.toDataURL();
    if (!dataUrl) return;
    setSaving(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      const uploadFormData = new FormData();
      uploadFormData.append('entityId', entityId || '');
      uploadFormData.append('file_type', 'careerDoc');
      uploadFormData.append('file', file);
      const response = await axiosInstance.post('/documents', uploadFormData);
      const url =
        response.data?.data?.fileUrl ||
        response.data?.data?.url ||
        response.data?.url;
      if (url) {
        onSaved(url);
        // toast({
        //   title: 'Success!',
        //   description: 'Signature saved',
        //   className: 'bg-watney border-none text-white'
        // });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to upload signature',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className='text-sm'>{label}</Label>
      {signatureUrl ? (
        <div className="flex max-w-sm flex-col items-start gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <img
            src={signatureUrl}
            alt={label}
            className="h-16 rounded border border-gray-300 bg-white object-contain"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSaved('')}
          >
            <Pencil className="mr-1 h-4 w-4" /> Update Signature
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-w-sm rounded-lg border border-gray-300 bg-white">
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              canvasProps={{
                width: 400,
                height: 120,
                className: 'rounded-lg signature-canvas w-full max-w-sm'
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => signatureRef.current?.clear()}
              disabled={saving}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              variant="default"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Signature'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
