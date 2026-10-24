import { useCallback, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';

export const attachmentKey = (messageId: string, index: number) =>
  `${messageId}:${index}`;

/**
 * Saves an attachment under its own name.
 *
 * The files sit on another host, where a plain link with `download` is
 * ignored and the browser opens the file instead - so it is fetched through
 * the API, which answers as an attachment, and saved from a local blob.
 */
export function useAttachmentDownload() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const download = useCallback(
    async (messageId: string, index: number, name: string) => {
      const key = attachmentKey(messageId, index);
      setDownloading((prev) => new Set(prev).add(key));
      try {
        const res = await axiosInstance.get(
          `/messages/${messageId}/attachments/${index}/download`,
          { responseType: 'blob' }
        );
        const url = URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error('Failed to download attachment:', error);
        toast({
          title: 'Download failed',
          description: `Could not download ${name}.`,
          variant: 'destructive'
        });
      } finally {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [toast]
  );

  const isDownloading = useCallback(
    (messageId: string, index: number) =>
      downloading.has(attachmentKey(messageId, index)),
    [downloading]
  );

  return { download, isDownloading };
}
