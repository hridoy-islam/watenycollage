import {
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MessageAttachment,
  formatSize,
  isImage,
  isPdf,
  isVideo
} from './message-utils';

export const fileIconOf = (file: MessageAttachment) => {
  if (isImage(file)) return ImageIcon;
  if (isVideo(file)) return Video;
  if (/\.(xlsx?|csv)$/i.test(file.name)) return FileSpreadsheet;
  if (/\.(pdf|docx?|txt|pptx?)$/i.test(file.name)) return FileText;
  return File;
};

interface AttachmentViewProps {
  file: MessageAttachment;
  messageId: string;
  index: number;
  downloading: boolean;
  onPreview: (file: MessageAttachment, messageId: string, index: number) => void;
  onDownload: (messageId: string, index: number, name: string) => void;
}

/** Round download button laid over a preview. */
function DownloadButton({
  onClick,
  downloading,
  className
}: {
  onClick: () => void;
  downloading: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      disabled={downloading}
      aria-label="Download"
      title="Download"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-black shadow-md transition-colors hover:bg-watney hover:text-white disabled:opacity-70',
        className
      )}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  );
}

/** The name-and-size strip under a video or PDF preview. */
function FileFooter({
  file,
  downloading,
  onDownload
}: {
  file: MessageAttachment;
  downloading: boolean;
  onDownload: () => void;
}) {
  const Icon = fileIconOf(file);
  return (
    <div className="flex items-center gap-2.5 border-t border-gray-200 bg-white px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-watney" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-black">
          {file.name}
        </span>
        {file.size !== undefined && (
          <span className="block text-[10px] text-black">{formatSize(file.size)}</span>
        )}
      </span>
      <DownloadButton
        onClick={onDownload}
        downloading={downloading}
        className="h-7 w-7 bg-gray-100 shadow-none"
      />
    </div>
  );
}

/**
 * A file in the thread. Images, videos and PDFs render where they are and
 * open full size; any other file downloads when it is clicked. None of them
 * sit inside the coloured bubble - a file is its own card.
 */
export function AttachmentView({
  file,
  messageId,
  index,
  downloading,
  onPreview,
  onDownload
}: AttachmentViewProps) {
  const save = () => onDownload(messageId, index, file.name);
  const open = () => onPreview(file, messageId, index);

  if (isImage(file)) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => event.key === 'Enter' && open()}
        className="group relative block cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <img
          src={file.url}
          alt={file.name}
          loading="lazy"
          decoding="async"
          className="max-h-72 w-full max-w-xs object-cover"
        />
        <DownloadButton
          onClick={save}
          downloading={downloading}
          className="absolute right-2 top-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        />
      </div>
    );
  }

  if (isVideo(file)) {
    return (
      <div className="w-72 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:w-80">
        {/* Only the first frame and length load until it is played. */}
        <video
          src={file.url}
          controls
          preload="metadata"
          className="aspect-video w-full bg-black"
        />
        <FileFooter file={file} downloading={downloading} onDownload={save} />
      </div>
    );
  }

  if (isPdf(file)) {
    return (
      <div className="w-72 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:w-80">
        <div className="group relative h-48 bg-gray-100">
          <iframe
            src={`${file.url}#toolbar=0&navpanes=0&view=FitH`}
            title={file.name}
            loading="lazy"
            className="pointer-events-none h-full w-full"
          />
          {/* The frame would swallow the click, so a layer above opens it. */}
          <button
            type="button"
            onClick={open}
            aria-label={`Preview ${file.name}`}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/10"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-black opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" /> Preview
            </span>
          </button>
        </div>
        <FileFooter file={file} downloading={downloading} onDownload={save} />
      </div>
    );
  }

  const Icon = fileIconOf(file);
  return (
    <button
      type="button"
      onClick={save}
      disabled={downloading}
      title={`Download ${file.name}`}
      className="flex w-72 max-w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-watney/40 hover:bg-watney/5 disabled:opacity-80"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-watney/10 text-watney">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-black">
          {file.name}
        </span>
        <span className="block text-[10px] text-black">
          {downloading
            ? 'Downloading…'
            : file.size !== undefined
              ? formatSize(file.size)
              : 'Click to download'}
        </span>
      </span>
      {downloading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-watney" />
      ) : (
        <Download className="h-4 w-4 shrink-0 text-black" />
      )}
    </button>
  );
}
