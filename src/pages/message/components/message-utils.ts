import moment from 'moment-timezone';

export interface MessageAttachment {
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface ChatMessage {
  _id: string;
  conversationKey: string;
  senderId: string;
  receiverId: string;
  text?: string;
  attachments: MessageAttachment[];
  readAt?: string | null;
  editedAt?: string | null;
  /** Set when the sender deleted it for everyone; text and files are gone. */
  deletedAt?: string | null;
  createdAt: string;
}

/** What a message deleted for everyone reads as, from either side. */
export const deletedLabel = (mine: boolean) =>
  mine ? 'You deleted this message' : 'This message was deleted';

export interface Contact {
  _id: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
  role?: string;
  relation: 'teacher' | 'student' | 'admin' | 'other' | string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export interface SharedFile extends MessageAttachment {
  index: number;
  messageId: string;
  senderId: string;
  createdAt: string;
}

export const displayName = (user: any): string =>
  user?.name ||
  [user?.title, user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.email ||
  'User';

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

export const relationLabel = (relation?: string) => {
  switch (relation) {
    case 'teacher':
      return 'Teacher';
    case 'student':
      return 'Student';
    case 'admin':
      return 'Admin';
    default:
      return 'Staff';
  }
};

/** Teams-style time in the list: time today, weekday this week, else a date. */
export const listTime = (date?: string) => {
  if (!date) return '';
  const m = moment(date);
  if (m.isSame(moment(), 'day')) return m.format('HH:mm');
  if (m.isAfter(moment().subtract(6, 'days').startOf('day'))) return m.format('ddd');
  if (m.isSame(moment(), 'year')) return m.format('DD/MM');
  return m.format('DD/MM/YY');
};

export const dayLabel = (date: string) => {
  const m = moment(date);
  if (m.isSame(moment(), 'day')) return 'Today';
  if (m.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
  if (m.isSame(moment(), 'year')) return m.format('dddd, D MMMM');
  return m.format('D MMMM YYYY');
};

export const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImage = (file: MessageAttachment) =>
  (file.mimeType || '').startsWith('image/') ||
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || file.url);

export const isVideo = (file: MessageAttachment) =>
  (file.mimeType || '').startsWith('video/') ||
  /\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name || file.url);

export const isPdf = (file: MessageAttachment) =>
  file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.name || file.url);

/** Images, videos and PDFs open in the viewer; anything else just downloads. */
export const canPreview = (file: MessageAttachment) =>
  isImage(file) || isVideo(file) || isPdf(file);

export const previewOf = (message: ChatMessage | null, myId?: string) => {
  if (!message) return '';
  const mine = String(message.senderId) === String(myId);
  if (message.deletedAt) return deletedLabel(mine);
  const body =
    message.text?.trim() ||
    (message.attachments?.length
      ? `📎 ${message.attachments.length === 1 ? message.attachments[0].name : `${message.attachments.length} files`}`
      : '');
  return mine ? `You: ${body}` : body;
};
