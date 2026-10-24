import { useEffect, useMemo, useState } from 'react';
import moment from 'moment-timezone';
import { Download, Loader2, Paperclip, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { cn } from '@/lib/utils';
import { fileIconOf } from './attachment-view';
import { AttachmentPreviewDialog, PreviewTarget } from './attachment-preview-dialog';
import { useAttachmentDownload } from './use-attachment-download';
import {
  Contact,
  SharedFile,
  canPreview,
  displayName,
  formatSize,
  isImage,
  isVideo
} from './message-utils';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'media', label: 'Media' },
  { value: 'documents', label: 'Documents' }
] as const;

interface AttachmentsPanelProps {
  contact: Contact;
  myId?: string;
  /** Bumped when a new file lands in the thread, so the list re-reads. */
  refreshKey: number;
  onClose: () => void;
}

export function AttachmentsPanel({
  contact,
  myId,
  refreshKey,
  onClose
}: AttachmentsPanelProps) {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('all');
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const { download, isDownloading } = useAttachmentDownload();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance
      .get(`/messages/attachments/${contact._id}`)
      .then((res) => !cancelled && setFiles(res.data?.data || []))
      .catch((error) => {
        console.error('Failed to load attachments:', error);
        if (!cancelled) setFiles([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [contact._id, refreshKey]);

  const visible = useMemo(
    () =>
      files.filter((file) =>
        tab === 'all'
          ? true
          : tab === 'media'
            ? isImage(file) || isVideo(file)
            : !isImage(file) && !isVideo(file)
      ),
    [files, tab]
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-black">Shared files</h3>
          <p className="text-[11px] text-black">
            With {displayName(contact)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shared files"
          className="rounded-md p-1.5 text-black transition-colors hover:bg-gray-100 hover:text-black"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 px-4 py-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
              tab === item.value
                ? 'bg-watney text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Paperclip className="h-7 w-7 text-black" />
            <p className="mt-2 text-xs font-medium text-black">No files yet</p>
            <p className="mt-1 text-[11px] text-black">
              Files shared in this chat will show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {visible.map((file, index) => {
              const Icon = fileIconOf(file);
              const mine = String(file.senderId) === String(myId);
              return (
                <li
                  key={`${file.messageId}-${index}`}
                  className="group flex items-center gap-1 rounded-lg border border-gray-200 pr-1 transition-colors hover:border-watney/40 hover:bg-watney/5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      canPreview(file)
                        ? setPreview({ file, messageId: file.messageId, index: file.index })
                        : download(file.messageId, file.index, file.name)
                    }
                    title={canPreview(file) ? `Preview ${file.name}` : `Download ${file.name}`}
                    className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left"
                  >
                    {isImage(file) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-watney/10 text-watney">
                        <Icon className="h-4 w-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-black">
                        {file.name}
                      </span>
                      <span className="block truncate text-[10px] text-black">
                        {mine ? 'You' : displayName(contact)} ·{' '}
                        {moment(file.createdAt).format('D MMM YYYY')}
                        {file.size !== undefined ? ` · ${formatSize(file.size)}` : ''}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => download(file.messageId, file.index, file.name)}
                    disabled={isDownloading(file.messageId, file.index)}
                    aria-label={`Download ${file.name}`}
                    title="Download"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-watney hover:text-white"
                  >
                    {isDownloading(file.messageId, file.index) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AttachmentPreviewDialog
        target={preview}
        onClose={() => setPreview(null)}
        onDownload={download}
        downloading={preview ? isDownloading(preview.messageId, preview.index) : false}
      />
    </div>
  );
}
