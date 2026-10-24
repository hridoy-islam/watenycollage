import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import moment from 'moment-timezone';
import {
  ArrowLeft,
  Ban,
  CheckCheck,
  Check,
  ChevronUp,
  Info,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  SendHorizontal,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';
import { AttachmentView, fileIconOf } from './attachment-view';
import { AttachmentPreviewDialog, PreviewTarget } from './attachment-preview-dialog';
import { useAttachmentDownload } from './use-attachment-download';
import {
  ChatMessage,
  Contact,
  MessageAttachment,
  dayLabel,
  deletedLabel,
  displayName,
  formatSize,
  relationLabel
} from './message-utils';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

/** "me" hides a message for you; "everyone" removes your unseen message. */
export type DeleteScope = 'me' | 'everyone';
/** Messages from one person this close together share a header. */
const GROUP_GAP_MINUTES = 5;

interface PendingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  uploaded?: MessageAttachment;
  failed?: boolean;
}

interface ChatPaneProps {
  contact: Contact;
  myId: string;
  messages: ChatMessage[];
  loading: boolean;
  hasMore: boolean;
  loadingOlder: boolean;
  online: boolean;
  isTyping: boolean;
  onLoadOlder: () => void;
  onSend: (text: string, attachments: MessageAttachment[]) => Promise<boolean>;
  onEdit: (messageId: string, text: string) => Promise<boolean>;
  onDelete: (messageId: string, scope: DeleteScope) => Promise<boolean>;
  onTyping: (typing: boolean) => void;
  onBack: () => void;
  onShowFiles: () => void;
  onShowDetails: () => void;
}

export function ChatPane({
  contact,
  myId,
  messages,
  loading,
  hasMore,
  loadingOlder,
  online,
  isTyping,
  onLoadOlder,
  onSend,
  onEdit,
  onDelete,
  onTyping,
  onBack,
  onShowFiles,
  onShowDetails
}: ChatPaneProps) {
  const { toast } = useToast();
  const name = displayName(contact);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const typingSent = useRef(false);

  const [text, setText] = useState('');
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [sending, setSending] = useState(false);

  // ── Scrolling ────────────────────────────────────────────────────────
  // Older messages are prepended, so the view is held where it was by the
  // height they added. New messages at the bottom follow the thread down only
  // if the reader was already near it - or sent the message themselves.
  const firstIdRef = useRef<string | undefined>();
  const lastIdRef = useRef<string | undefined>();
  const heightRef = useRef(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstId = messages[0]?._id;
    const last = messages[messages.length - 1];

    if (firstIdRef.current && firstId !== firstIdRef.current && last?._id === lastIdRef.current) {
      el.scrollTop += el.scrollHeight - heightRef.current;
    } else if (last?._id !== lastIdRef.current) {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 160 || !lastIdRef.current;
      if (nearBottom || String(last?.senderId) === String(myId)) {
        el.scrollTop = el.scrollHeight;
      }
    }

    firstIdRef.current = firstId;
    lastIdRef.current = last?._id;
    heightRef.current = el.scrollHeight;
  }, [messages, myId]);

  useEffect(() => {
    // A fresh thread starts at the bottom.
    firstIdRef.current = undefined;
    lastIdRef.current = undefined;
    setText('');
    setPending([]);
    textareaRef.current?.focus();
  }, [contact._id]);

  useEffect(() => {
    if (isTyping && scrollRef.current) {
      const el = scrollRef.current;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [isTyping]);

  // ── Attachments ──────────────────────────────────────────────────────
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const { download, isDownloading } = useAttachmentDownload();
  const openPreview = useCallback(
    (file: MessageAttachment, messageId: string, index: number) =>
      setPreview({ file, messageId, index }),
    []
  );

  // ── Delete ───────────────────────────────────────────────────────────
  // One dialog for the whole thread, WhatsApp style. It only opens for your
  // own unseen message: "Delete for everyone" and "Delete for me". A seen
  // message can not be deleted at all.
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [deletingScope, setDeletingScope] = useState<DeleteScope | null>(null);
  const requestDelete = useCallback((message: ChatMessage) => setDeleteTarget(message), []);

  const confirmDelete = async (scope: DeleteScope) => {
    if (!deleteTarget || deletingScope) return;
    setDeletingScope(scope);
    const ok = await onDelete(deleteTarget._id, scope);
    setDeletingScope(null);
    if (ok) setDeleteTarget(null);
  };

  const canDeleteForEveryone =
    !!deleteTarget &&
    String(deleteTarget.senderId) === String(myId) &&
    !deleteTarget.readAt &&
    !deleteTarget.deletedAt;

  // Seen while the dialog was open - the delete would now be refused.
  const targetSeen = Boolean(
    deleteTarget && messages.find((m) => m._id === deleteTarget._id)?.readAt
  );
  useEffect(() => {
    if (!targetSeen || deletingScope) return;
    setDeleteTarget(null);
    toast({
      title: 'Message already seen',
      description: 'A seen message can no longer be deleted.'
    });
  }, [targetSeen, deletingScope, toast]);

  // ── Typing signal ────────────────────────────────────────────────────
  const stopTyping = () => {
    clearTimeout(typingTimeout.current);
    if (typingSent.current) {
      typingSent.current = false;
      onTyping(false);
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (!typingSent.current && value.trim()) {
      typingSent.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(stopTyping, 2500);
  };

  useEffect(() => stopTyping, [contact._id]);

  // Grow with the text, up to a few lines.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  // ── Files ────────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPending((prev) => [...prev, { id, name: file.name, size: file.size, progress: 0 }]);

    try {
      const formData = new FormData();
      formData.append('entityId', myId);
      formData.append('file_type', 'messageDoc');
      formData.append('file', file);

      const res = await axiosInstance.post('/documents', formData, {
        onUploadProgress: (event) => {
          const progress = event.total
            ? Math.round((event.loaded * 100) / event.total)
            : 0;
          setPending((prev) =>
            prev.map((item) => (item.id === id ? { ...item, progress } : item))
          );
        }
      });

      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error('No file URL returned');

      setPending((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                progress: 100,
                uploaded: { name: file.name, url, mimeType: file.type, size: file.size }
              }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      setPending((prev) =>
        prev.map((item) => (item.id === id ? { ...item, failed: true } : item))
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} is over 25 MB.`,
          variant: 'destructive'
        });
        return;
      }
      uploadFile(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploading = pending.some((item) => !item.uploaded && !item.failed);
  const ready = pending.filter((item) => item.uploaded).map((item) => item.uploaded!);
  const canSend = !sending && !uploading && (text.trim().length > 0 || ready.length > 0);

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    stopTyping();
    const ok = await onSend(text.trim(), ready);
    setSending(false);
    if (ok) {
      setText('');
      setPending([]);
      textareaRef.current?.focus();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  const lastMine = [...messages].reverse().find((m) => String(m.senderId) === String(myId));
  // Passed as a string so a row only re-renders when its own files change.
  const downloadingIndexesOf = (message: ChatMessage) =>
    (message.attachments || [])
      .map((_, i) => (isDownloading(message._id, i) ? i : -1))
      .filter((i) => i >= 0)
      .join(',');

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to chats"
          className="rounded-md p-1.5 text-black transition-colors hover:bg-gray-100 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onShowDetails}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <UserAvatar name={name} image={contact.image} online={online} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-black">
              {name}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-black">
              <span className="rounded bg-watney/10 px-1.5 py-px text-[10px] font-medium text-watney">
                {relationLabel(contact.relation)}
              </span>
              {isTyping ? (
                <span className="italic text-watney">Typing…</span>
              ) : (
                <span>{online ? 'Available' : 'Offline'}</span>
              )}
            </span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Chat options"
              className="rounded-md p-2 text-black transition-colors hover:bg-gray-100"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onShowFiles} className="gap-2 text-xs">
              <Paperclip className="h-3.5 w-3.5" /> View attachments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowDetails} className="gap-2 text-xs">
              <Info className="h-3.5 w-3.5" /> Contact details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Thread */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto bg-gray-50/70 px-3 py-4 sm:px-6"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <UserAvatar name={name} image={contact.image} size="lg" />
            <p className="mt-3 text-sm font-semibold text-black">{name}</p>
            <p className="mt-1 max-w-xs text-xs text-black">
              This is the start of your conversation. Say hello or share a file.
            </p>
          </div>
        ) : (
          <>
            {/* Only the latest page is loaded; earlier ones on request. */}
            {hasMore && (
              <div className="mb-2 flex justify-center">
                <button
                  type="button"
                  onClick={onLoadOlder}
                  disabled={loadingOlder}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-black shadow-sm transition-colors hover:border-watney/40 hover:bg-watney/5 disabled:opacity-70"
                >
                  {loadingOlder ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-watney" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                  {loadingOlder ? 'Loading…' : 'Load earlier messages'}
                </button>
              </div>
            )}
            {messages.map((message, index) => {
              const prev = messages[index - 1];
              const newDay = !prev || !moment(prev.createdAt).isSame(message.createdAt, 'day');
              const startsGroup =
                newDay ||
                String(prev.senderId) !== String(message.senderId) ||
                moment(message.createdAt).diff(prev.createdAt, 'minutes') >= GROUP_GAP_MINUTES;

              return (
                <MessageRow
                  key={message._id}
                  message={message}
                  mine={String(message.senderId) === String(myId)}
                  newDay={newDay}
                  startsGroup={startsGroup}
                  showStatus={lastMine?._id === message._id}
                  name={name}
                  image={contact.image}
                  downloadingIndexes={downloadingIndexesOf(message)}
                  onPreview={openPreview}
                  onDownload={download}
                  onEdit={onEdit}
                  onRequestDelete={requestDelete}
                />
              );
            })}
            {isTyping && (
              <div className="mt-3 flex items-center gap-2">
                <UserAvatar name={name} image={contact.image} size="sm" />
                <span className="flex gap-1 rounded-2xl rounded-tl-md bg-sky-100 px-3.5 py-3 shadow-sm">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-watney/60"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="rounded-3xl border border-gray-300 bg-gray-50 shadow-sm transition-all focus-within:border-watney focus-within:bg-white focus-within:ring-2 focus-within:ring-watney/20">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-gray-200 px-3 pb-2 pt-3">
              {pending.map((item) => {
                const Icon = fileIconOf({ name: item.name, url: '' });
                return (
                  <span
                    key={item.id}
                    className={cn(
                      'relative flex max-w-[220px] items-center gap-2 overflow-hidden rounded-md border px-2 py-1.5',
                      item.failed ? 'border-rose-200 bg-rose-50' : 'border-gray-200 bg-white'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-watney" />
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-black">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          'block text-[10px]',
                          item.failed ? 'text-rose-600' : 'text-black'
                        )}
                      >
                        {item.failed
                          ? 'Upload failed'
                          : item.uploaded
                            ? formatSize(item.size)
                            : `Uploading ${item.progress}%`}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        setPending((prev) => prev.filter((p) => p.id !== item.id))
                      }
                      className="shrink-0 text-black hover:text-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {!item.uploaded && !item.failed && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 bg-watney transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          )}
          {/* Enter sends; Shift+Enter starts a new line. */}
          <div className="flex items-end gap-2 p-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach files"
              title="Attach files"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-watney/10 hover:text-watney"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={text}
              rows={1}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={(e) => {
                // Not while an IME is still composing a character.
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Write a message…"
              aria-label="Message"
              className="block max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm leading-5 text-black placeholder:text-black/50 focus:outline-none"
            />
            <Button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              title="Send message"
              className="h-10 shrink-0 gap-2 rounded-full bg-watney px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-watney/90 disabled:opacity-40"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !deletingScope && setDeleteTarget(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm gap-0 overflow-hidden rounded-2xl p-0">
          <div className="flex flex-col items-center px-6 pb-5 pt-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-8 ring-rose-50">
              <Trash2 className="h-5 w-5" />
            </span>
            <DialogHeader className="mt-4 space-y-1.5 text-center sm:text-center">
              <DialogTitle className="text-lg font-semibold text-black">
                Delete message?
              </DialogTitle>
              <DialogDescription className="text-sm text-black">
                {canDeleteForEveryone
                  ? 'It has not been seen yet. Remove it for everyone in this chat, or only from your view.'
                  : 'It will be removed from your view only.'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
            {canDeleteForEveryone && (
              <Button
                type="button"
                onClick={() => confirmDelete('everyone')}
                disabled={!!deletingScope}
                className="h-10 w-full gap-2 rounded-lg bg-rose-600 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                {deletingScope === 'everyone' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                Delete for everyone
              </Button>
            )}
            <Button
              type="button"
              onClick={() => confirmDelete('me')}
              disabled={!!deletingScope}
              className={cn(
                'h-10 w-full gap-2 rounded-lg text-sm font-semibold shadow-sm',
                canDeleteForEveryone
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              )}
            >
              {deletingScope === 'me' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
              Delete for me
            </Button>
            <Button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={!!deletingScope}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white text-sm font-semibold text-black shadow-sm hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AttachmentPreviewDialog
        target={preview}
        onClose={() => setPreview(null)}
        onDownload={download}
        downloading={preview ? isDownloading(preview.messageId, preview.index) : false}
      />
    </div>
  );
}

interface MessageRowProps {
  message: ChatMessage;
  mine: boolean;
  newDay: boolean;
  startsGroup: boolean;
  showStatus: boolean;
  name: string;
  image?: string;
  /** Comma-joined indexes of this message's files being downloaded. */
  downloadingIndexes: string;
  onPreview: (file: MessageAttachment, messageId: string, index: number) => void;
  onDownload: (messageId: string, index: number, name: string) => void;
  onEdit: (messageId: string, text: string) => Promise<boolean>;
  onRequestDelete: (message: ChatMessage) => void;
}

/**
 * One message. Memoised so that typing, a typing signal or a new message at
 * the bottom does not redraw every row - and every image and video - in a
 * long thread.
 */
const MessageRow = memo(function MessageRow({
  message,
  mine,
  newDay,
  startsGroup,
  showStatus,
  name,
  image,
  downloadingIndexes,
  onPreview,
  onDownload,
  onEdit,
  onRequestDelete
}: MessageRowProps) {
  const downloading = new Set(
    downloadingIndexes ? downloadingIndexes.split(',').map(Number) : []
  );
  // Deleted for everyone: only the marker is left, no text or files.
  const deleted = Boolean(message.deletedAt);
  const hasText = !deleted && Boolean(message.text?.trim());
  const attachments = deleted ? [] : message.attachments || [];

  // Your own text can be corrected - and your own message deleted - until the
  // other person has seen it. Once seen, it stands.
  const canEdit = mine && hasText && !message.readAt;
  // The "deleted" marker itself stays - it can not be deleted again.
  const canDelete = mine && !message.readAt && !deleted;
  const hasActions = canEdit || canDelete;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Seen while the editor was open - the edit would be refused, so it closes.
  useEffect(() => {
    if (message.readAt) setEditing(false);
  }, [message.readAt]);

  // A phone has no hover, so there the actions are held for: a long press on
  // the message brings up its icons, and a tap anywhere else puts them away.
  const [actionsOpen, setActionsOpen] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();
  const rowRef = useRef<HTMLDivElement>(null);

  // Seen while the icons were up - nothing is left to do with it.
  useEffect(() => {
    if (!hasActions) setActionsOpen(false);
  }, [hasActions]);

  const startPress = () => {
    if (editing || !hasActions) return;
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      setActionsOpen(true);
      navigator.vibrate?.(15);
    }, 450);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  useEffect(() => () => clearTimeout(pressTimer.current), []);

  useEffect(() => {
    if (!actionsOpen) return;
    const close = (event: PointerEvent) => {
      if (!rowRef.current?.contains(event.target as Node)) setActionsOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [actionsOpen]);

  const startEdit = () => {
    setActionsOpen(false);
    setDraft(message.text || '');
    setEditing(true);
  };

  const requestDelete = () => {
    setActionsOpen(false);
    onRequestDelete(message);
  };

  // Icons only. On a hover device they appear beside the message on hover;
  // on a phone, after a long press.
  const actions = (
    <div
      className={cn(
        'flex shrink-0 items-center gap-0.5 self-center transition-opacity',
        actionsOpen
          ? 'animate-in fade-in zoom-in-95 rounded-full border border-gray-200 bg-white p-0.5 shadow-md'
          : 'pointer-events-none opacity-0 [@media(hover:hover)]:pointer-events-auto [@media(hover:hover)]:focus-within:opacity-100 [@media(hover:hover)]:group-hover/msg:opacity-100'
      )}
    >
      {canEdit && (
        <button
          type="button"
          onClick={startEdit}
          aria-label="Edit message"
          title="Edit (until it is seen)"
          className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-watney/10 hover:text-watney"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={requestDelete}
          aria-label="Delete message"
          title="Delete (until it is seen)"
          className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  const saveEdit = async () => {
    const next = draft.trim();
    if (!next || saving) return;
    if (next === message.text?.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onEdit(message._id, next);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <Fragment>
      {newDay && (
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-medium text-black">
            {dayLabel(message.createdAt)}
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
      )}
      <div
        className={cn(
          'flex gap-2',
          mine ? 'justify-end' : 'justify-start',
          startsGroup ? 'mt-3' : 'mt-0.5'
        )}
      >
        {!mine && (
          <span className="w-8 shrink-0">
            {startsGroup && <UserAvatar name={name} image={image} size="sm" />}
          </span>
        )}
        {/* The message and its action icons, the icons on the inner side. */}
        <div
          ref={rowRef}
          className={cn(
            'group/msg flex min-w-0 max-w-[85%] items-center gap-1 sm:max-w-[70%]',
            mine && 'flex-row-reverse'
          )}
        >
        <div
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          onTouchMove={cancelPress}
          onTouchCancel={cancelPress}
          onContextMenu={(event) => {
            // The browser's own long-press menu would cover ours.
            if (hasActions && window.matchMedia('(hover: none)').matches) {
              event.preventDefault();
            }
          }}
          className={cn(
            'flex min-w-0 flex-col gap-1.5 transition-transform',
            mine ? 'items-end' : 'items-start',
            // Held text would otherwise start a selection.
            hasActions &&
              !editing &&
              '[-webkit-touch-callout:none] [@media(hover:none)]:select-none',
            actionsOpen && 'scale-[0.98]'
          )}
        >
          {startsGroup && (
            <span className="-mb-0.5 flex items-center gap-2 px-1 text-[11px] text-black">
              {!mine && <span className="font-semibold text-black">{name}</span>}
              <span>{moment(message.createdAt).format('HH:mm')}</span>
            </span>
          )}
          {hasText && editing && (
            <div className="w-80 max-w-full rounded-2xl border border-watney bg-white p-2 shadow-sm ring-2 ring-watney/20">
              <textarea
                value={draft}
                autoFocus
                rows={Math.min(Math.max(draft.split('\n').length, 2), 6)}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={(e) => {
                  const end = e.target.value.length;
                  e.target.setSelectionRange(end, end);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditing(false);
                  // Same as the composer: Enter saves, Shift+Enter is a new line.
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    saveEdit();
                  }
                }}
                aria-label="Edit message"
                className="block w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-5 text-black focus:outline-none"
              />
              <div className="mt-1.5 flex justify-end gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="h-7 rounded-full px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={saveEdit}
                  disabled={saving || !draft.trim()}
                  className="h-7 gap-1 rounded-full bg-watney px-3 text-xs text-white hover:bg-watney/90"
                >
                  {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          )}
          {deleted && (
            <div
              title={moment(message.createdAt).format('D MMM YYYY, HH:mm')}
              className={cn(
                'flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-sm italic text-black shadow-sm',
                startsGroup && (mine ? 'rounded-tr-md' : 'rounded-tl-md')
              )}
            >
              <Ban className="h-3.5 w-3.5 shrink-0" />
              {deletedLabel(mine)}
            </div>
          )}
          {hasText && !editing && (
            <div
              title={moment(message.createdAt).format('D MMM YYYY, HH:mm')}
              className={cn(
                'rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                // Your own messages in the brand colour, theirs in a light
                // blue - the corner nearest the sender is squared so a run
                // of bubbles reads as one voice.
                mine ? 'bg-watney text-white' : 'bg-sky-100 text-black',
                startsGroup && (mine ? 'rounded-tr-md' : 'rounded-tl-md')
              )}
            >
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.text}
              </p>
              {message.editedAt && (
                <span className="mt-0.5 block text-right text-[10px] italic">
                  Edited
                </span>
              )}
            </div>
          )}
          {/* Files stand on their own, outside the bubble. */}
          {attachments.map((file, fileIndex) => (
            <AttachmentView
              key={fileIndex}
              file={file}
              messageId={message._id}
              index={fileIndex}
              downloading={downloading.has(fileIndex)}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
          {mine && showStatus && (
            <span className="flex items-center gap-1 px-1 text-[10px] text-black">
              {message.readAt ? (
                <>
                  <CheckCheck className="h-3 w-3 text-watney" /> Seen
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" /> Sent
                </>
              )}
            </span>
          )}
        </div>
        {!editing && hasActions && actions}
        </div>
      </div>
    </Fragment>
  );
});
