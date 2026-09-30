import moment from 'moment';
import axiosInstance from '@/lib/axios';

// ─── Shared vocabulary — kept in step with the ticket module's enums ─────────

export type Option = { value: string; label: string };

export const TICKET_TYPES: Option[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'technical', label: 'Technical / IT' },
  { value: 'finance', label: 'Finance & Fees' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'assignment', label: 'Assignments' },
  { value: 'course-material', label: 'Course Material' },
  { value: 'enrolment', label: 'Enrolment' },
  { value: 'other', label: 'Other' }
];

export const typeLabel = (value: string) =>
  TICKET_TYPES.find((t) => t.value === value)?.label || value;

// With no subject on a ticket, the type is what names it - except for "other",
// where the reason the student gave is the only thing describing the problem.
export const ticketTitle = (ticket: { type: string; otherReason?: string }) =>
  ticket.type === 'other' && ticket.otherReason?.trim()
    ? ticket.otherReason.trim()
    : typeLabel(ticket.type);

export const formatDate = (value?: string) =>
  value ? moment(value).format('DD MMM YYYY, HH:mm') : '—';

export const personName = (person: any) =>
  person?.name ||
  `${person?.firstName || ''} ${person?.lastName || ''}`.trim() ||
  '—';

export const initials = (person: any) =>
  personName(person)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('') || '?';

export type Attachment = { name: string; url: string };

export type TicketReply = {
  _id: string;
  authorId?: any;
  authorRole: 'agent' | 'user';
  message: string;
  attachments?: Attachment[];
  createdAt?: string;
  editedAt?: string;
};

export type TicketRecord = {
  _id: string;
  ticketId: string;
  type: string;
  otherReason?: string;
  description: string;
  attachments?: Attachment[];
  replies?: TicketReply[];
  userUnread?: number;
  lastReplyAt?: string;
  status?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: any;
  createdAt?: string;
  studentId?: any;
};

/** Fired after a ticket is read, so the side nav can recount its badge. */
export const TICKETS_READ_EVENT = 'support-tickets:read';

/**
 * Uploads each file through `/documents` and hands back what a ticket or a
 * reply stores for it.
 */
export const uploadTicketFiles = async (
  files: File[],
  entityId?: string
): Promise<Attachment[]> =>
  Promise.all(
    files.map(async (file) => {
      const formData = new FormData();
      formData.append('entityId', entityId || 'ticket');
      formData.append('file_type', 'ticketDoc');
      formData.append('file', file);
      const res = await axiosInstance.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error(`Could not upload ${file.name}`);
      return { name: file.name, url };
    })
  );
