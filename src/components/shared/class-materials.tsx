/**
 * The materials (lessons) uploaded for a class session, as shown on the
 * student and teacher class routine.
 *
 * Clicking one previews it in a dialog when the browser can show it - PDF
 * (without the viewer's toolbar), image or video - with a download button;
 * any other file type is downloaded straight away.
 */
import { useState } from 'react';
import { Download, FileText, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

/** A lesson as `/course-routine` hangs it off each routine. */
export interface ClassLesson {
  _id: string;
  title?: string;
  fileUrl?: string;
  fileName?: string;
}

type PreviewKind = 'pdf' | 'image' | 'video';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'ogg', 'm4v'];

const extensionOf = (nameOrUrl = '') =>
  nameOrUrl.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || '';

/** How the dialog can show a file, or null when it can only be downloaded. */
const previewKindOf = (lesson: ClassLesson): PreviewKind | null => {
  const ext = extensionOf(lesson.fileName || lesson.fileUrl);
  if (ext === 'pdf') return 'pdf';
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  return null;
};

const labelOf = (lesson: ClassLesson) => lesson.title || lesson.fileName || 'Material';

/**
 * Saves the file under its own name. Files live on another origin, where the
 * `download` attribute is ignored, so it is fetched as a blob first; if the
 * storage refuses that (CORS), the file is opened in a new tab instead.
 */
const downloadLesson = async (lesson: ClassLesson) => {
  if (!lesson.fileUrl) return;
  const fileName =
    lesson.fileName ||
    lesson.title ||
    lesson.fileUrl.split(/[?#]/)[0].split('/').pop() ||
    'download';
  try {
    const res = await fetch(lesson.fileUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blobUrl = URL.createObjectURL(await res.blob());
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    window.open(lesson.fileUrl, '_blank', 'noopener,noreferrer');
  }
};

export function ClassMaterials({
  lessons = [],
  compact = false
}: {
  lessons?: ClassLesson[];
  /** A single row of chips, for a dialog header. */
  compact?: boolean;
}) {
  const [previewing, setPreviewing] = useState<ClassLesson | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const files = lessons.filter((lesson) => lesson.fileUrl);
  if (files.length === 0 && compact) return null;

  const download = async (lesson: ClassLesson) => {
    setDownloadingId(lesson._id);
    try {
      await downloadLesson(lesson);
    } finally {
      setDownloadingId(null);
    }
  };

  const open = (lesson: ClassLesson) => {
    if (previewKindOf(lesson)) setPreviewing(lesson);
    else download(lesson);
  };

  const kind = previewing ? previewKindOf(previewing) : null;

  return (
    <>
      {compact ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-black">Materials:</span>
          {files.map((lesson) => (
            <button
              key={lesson._id}
              type="button"
              onClick={() => open(lesson)}
              title={lesson.fileName || labelOf(lesson)}
              className="inline-flex max-w-[220px] items-center gap-1 rounded-md border border-watney/30 bg-white px-1.5 py-0.5 text-[11px] font-medium text-black hover:bg-watney/5 hover:text-watney"
            >
              {downloadingId === lesson._id ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
              ) : (
                <FileText className="h-3 w-3 shrink-0 text-watney" />
              )}
              <span className="truncate">{labelOf(lesson)}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-black">
            Class Materials
          </span>
          {files.length === 0 ? (
            <p className="mt-1 text-sm text-black">No materials for this class yet.</p>
          ) : (
            <ul className="mt-1.5 space-y-1.5">
              {files.map((lesson) => (
                <li key={lesson._id}>
                  <button
                    type="button"
                    onClick={() => open(lesson)}
                    title={lesson.fileName || labelOf(lesson)}
                    className="flex w-full min-w-0 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-left transition-colors hover:border-watney/40 hover:bg-watney/5"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-watney" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-black">
                        {labelOf(lesson)}
                      </span>
                      {lesson.fileName && lesson.fileName !== labelOf(lesson) && (
                        <span className="block truncate text-[11px] text-black">
                          {lesson.fileName}
                        </span>
                      )}
                    </span>
                    {downloadingId === lesson._id ? (
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-black" />
                    ) : (
                      <span className="shrink-0 text-[11px] font-semibold text-watney">
                        {previewKindOf(lesson) ? 'View' : 'Download'}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Dialog open={!!previewing} onOpenChange={(isOpen) => !isOpen && setPreviewing(null)}>
        <DialogContent className="z-[9999] flex h-[90vh] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-3 p-4 sm:p-5">
          <DialogHeader className="shrink-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 flex-1 text-left">
                <DialogTitle
                  className="truncate text-base font-semibold text-black"
                  title={previewing ? labelOf(previewing) : ''}
                >
                  {previewing ? labelOf(previewing) : ''}
                </DialogTitle>
                {previewing?.fileName && previewing.fileName !== labelOf(previewing) && (
                  <DialogDescription className="truncate text-xs text-black">
                    {previewing.fileName}
                  </DialogDescription>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => previewing && download(previewing)}
                disabled={!!downloadingId}
                className="h-8 shrink-0 bg-watney text-xs text-white hover:bg-watney/90"
              >
                {downloadingId ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setPreviewing(null)}
                title="Close"
                aria-label="Close preview"
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-black/5">
            {previewing?.fileUrl && kind === 'pdf' && (
              // `toolbar=0` hides the browser's PDF toolbar (Chrome/Edge viewer).
              <iframe
                key={previewing.fileUrl}
                src={`${previewing.fileUrl}#toolbar=0&navpanes=0`}
                title={labelOf(previewing)}
                className="h-full w-full bg-white"
              />
            )}
            {previewing?.fileUrl && kind === 'image' && (
              <img
                src={previewing.fileUrl}
                alt={labelOf(previewing)}
                className="max-h-full max-w-full object-contain"
              />
            )}
            {previewing?.fileUrl && kind === 'video' && (
              <video
                key={previewing.fileUrl}
                src={previewing.fileUrl}
                controls
                autoPlay
                className="max-h-full max-w-full bg-black"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
