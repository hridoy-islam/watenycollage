import { useRef, useState } from 'react';
import { Download, FileText, ImageIcon, Loader2, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { Attachment } from './ticket-utils';

type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'text';

const extensionOf = (file: Attachment) =>
  (file.name.split('.').pop() || file.url.split('?')[0].split('.').pop() || '')
    .toLowerCase();

/** What the browser can show inline; anything else is downloaded instead. */
const previewKind = (file: Attachment): PreviewKind | null => {
  const ext = extensionOf(file);
  if (/^(png|jpe?g|gif|webp|bmp|svg|avif)$/.test(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (/^(mp4|webm|ogv|mov)$/.test(ext)) return 'video';
  if (/^(mp3|wav|ogg|m4a|aac)$/.test(ext)) return 'audio';
  if (/^(txt|csv|log|json|xml|md)$/.test(ext)) return 'text';
  return null;
};

/**
 * Saves a file under its own name. The files live on another origin, where
 * `<a download>` is ignored, so it is fetched as a blob first; if that is
 * refused, it is opened in a new tab to save from there.
 */
const downloadFile = async (file: Attachment) => {
  try {
    const res = await fetch(file.url);
    if (!res.ok) throw new Error(String(res.status));
    const blobUrl = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(file.url, '_blank', 'noopener,noreferrer');
  }
};

function PreviewBody({ file, kind }: { file: Attachment; kind: PreviewKind }) {
  switch (kind) {
    case 'image':
      return (
        <img
          src={file.url}
          alt={file.name}
          className="mx-auto max-h-full max-w-full object-contain"
        />
      );
    case 'video':
      return <video src={file.url} controls className="mx-auto max-h-full max-w-full" />;
    case 'audio':
      return (
        <div className="flex h-full items-center justify-center">
          <audio src={file.url} controls className="w-full max-w-md" />
        </div>
      );
    default:
      // PDFs and plain text render in the browser's own viewer.
      return <iframe src={file.url} title={file.name} className="h-full w-full bg-white" />;
  }
}

/** Files already on a ticket or reply, as chips that open a preview. */
export function AttachmentList({
  attachments,
  onRemove
}: {
  attachments?: Attachment[];
  onRemove?: (index: number) => void;
}) {
  const [preview, setPreview] = useState<{ file: Attachment; kind: PreviewKind } | null>(
    null
  );
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!attachments?.length) return null;

  const download = async (file: Attachment) => {
    setDownloading(file.url);
    await downloadFile(file);
    setDownloading(null);
  };

  const open = (file: Attachment) => {
    const kind = previewKind(file);
    if (kind) setPreview({ file, kind });
    else download(file);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((file, index) => {
          const Icon = previewKind(file) === 'image' ? ImageIcon : FileText;
          return (
            <span
              key={`${file.url}-${index}`}
              className="inline-flex max-w-[240px] items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-black shadow-sm"
            >
              {downloading === file.url ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-watney" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0 text-watney" />
              )}
              <button
                type="button"
                onClick={() => open(file)}
                className="truncate text-left text-watney hover:underline"
                title={previewKind(file) ? `Open ${file.name}` : `Download ${file.name}`}
              >
                {file.name}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="rounded p-0.5 text-black hover:bg-gray-100"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          );
        })}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="flex h-[90vh] max-w-5xl flex-col gap-3 bg-white p-4 text-black">
          {preview && (
            <>
              <DialogHeader className="flex-row items-center justify-between gap-3 space-y-0 pr-8">
                <DialogTitle className="truncate text-sm font-semibold text-black">
                  {preview.file.name}
                </DialogTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => download(preview.file)}
                  disabled={downloading === preview.file.url}
                >
                  {downloading === preview.file.url ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Download
                </Button>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-auto rounded-md bg-gray-100">
                <PreviewBody file={preview.file} kind={preview.kind} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Picks several files at once; the caller uploads them when it sends. */
export function FilePicker({
  files,
  onChange,
  disabled
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          if (picked.length) onChange([...files, ...picked]);
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip className="mr-1.5 h-3.5 w-3.5" />
        Attach files
      </Button>
      {files.map((file, index) => (
        <span
          key={`${file.name}-${index}`}
          className="inline-flex max-w-[200px] items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-[11px] text-black"
        >
          <span className="truncate" title={file.name}>
            {file.name}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(files.filter((_, i) => i !== index))}
            className="rounded p-0.5 hover:bg-gray-200"
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
