import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { MessageAttachment, formatSize, isImage, isPdf, isVideo } from './message-utils';

export interface PreviewTarget {
  file: MessageAttachment;
  messageId: string;
  index: number;
}

interface AttachmentPreviewDialogProps {
  target: PreviewTarget | null;
  onClose: () => void;
  onDownload: (messageId: string, index: number, name: string) => void;
  downloading: boolean;
}

/** An image, video or PDF at full size, with a way to save it. */
export function AttachmentPreviewDialog({
  target,
  onClose,
  onDownload,
  downloading
}: AttachmentPreviewDialogProps) {
  const file = target?.file;

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-200 py-3 pl-4 pr-12">
          <div className="min-w-0">
            <DialogTitle className="truncate text-sm font-semibold text-black">
              {file?.name}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-black">
              {file?.size !== undefined ? formatSize(file.size) : 'Attachment'}
            </DialogDescription>
          </div>
          {file && target && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                onClick={() => onDownload(target.messageId, target.index, file.name)}
                disabled={downloading}
                className="h-8 gap-1.5 bg-watney text-xs text-white hover:bg-watney/90"
              >
                {downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Download
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-gray-900/95">
          {file && isImage(file) && (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[80vh] max-w-full object-contain"
            />
          )}
          {file && isVideo(file) && (
            <video
              src={file.url}
              controls
              autoPlay
              className="max-h-[80vh] w-full bg-black"
            />
          )}
          {file && isPdf(file) && (
            <iframe
              // Hides the browser's own PDF toolbar - downloading is the
              // button above.
              src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={file.name}
              className="h-[80vh] w-full bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
