/**
 * One support ticket, as the student sees it: what they raised, every reply
 * since, and a box to answer the support team. Opening it clears the unread
 * count on the replies. Once the ticket is resolved the thread is read-only.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { ArrowLeft, Loader2, Lock, Send } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { StatusPill } from './components/status-pill';
import { AttachmentList, FilePicker } from './components/attachments';
import {
  TICKETS_READ_EVENT,
  formatDate,
  initials,
  personName,
  ticketTitle,
  typeLabel,
  uploadTicketFiles,
  type Attachment,
  type TicketRecord
} from './components/ticket-utils';

function Message({
  author,
  agent,
  verb,
  date,
  message,
  attachments,
  edited
}: {
  author: any;
  agent?: boolean;
  verb: string;
  date?: string;
  message: string;
  attachments?: Attachment[];
  edited?: boolean;
}) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        {author?.image ? (
          <img
            src={author.image}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
              agent ? 'bg-watney text-white' : 'bg-gray-200 text-black'
            )}
          >
            {initials(author)}
          </span>
        )}
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-black">
          <span className="font-semibold text-watney">
            {agent ? personName(author) : 'You'}
          </span>
          <span>{verb} on</span>
          <span className="font-semibold">
            {date ? moment(date).format('MMMM Do, YYYY [at] h:mma') : '—'}
          </span>
          {agent && (
            <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Support Agent
            </span>
          )}
          {edited && <span className="text-[11px] italic">(edited)</span>}
        </p>
      </div>
      <div
        className={cn(
          'ml-10 space-y-3 rounded-lg p-4',
          agent ? 'bg-amber-50' : 'bg-gray-50'
        )}
      >
        {message && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-black">
            {message}
          </p>
        )}
        <AttachmentList attachments={attachments} />
      </div>
    </div>
  );
}

export default function SupportTicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/tickets/${id}`);
      const data: TicketRecord = res.data?.data;
      setTicket(data);
      // Reading the ticket is what clears its replies from the badges.
      if (data?.userUnread) {
        await axiosInstance.patch(`/tickets/${id}/read`).catch(() => {});
        window.dispatchEvent(new Event(TICKETS_READ_EVENT));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'We could not load this ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!ticket) return;
    if (!message.trim() && !files.length) {
      toast({
        title: 'Write a reply or attach a file',
        variant: 'destructive'
      });
      return;
    }
    setSending(true);
    try {
      const attachments = await uploadTicketFiles(files, ticket._id);
      const res = await axiosInstance.post(`/tickets/${ticket._id}/replies`, {
        message: message.trim(),
        attachments
      });
      setTicket(res.data?.data);
      setMessage('');
      setFiles([]);
      toast({ title: 'Reply sent' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description:
          e?.response?.data?.message ||
          e?.message ||
          'Your reply could not be sent.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // The newest message sits just above the reply box: the thread is pinned to
  // its bottom on open and whenever a reply lands.
  const replyCount = ticket?.replies?.length || 0;
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [loading, replyCount]);

  const back = (
    <Button
      type="button"
      onClick={() => navigate('/dashboard/support-tickets')}
      className="inline-flex items-center gap-1.5 text-sm font-medium"
    >
      <ArrowLeft className="h-4 w-4" /> All tickets
    </Button>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        {back}
        <Card>
          <CardContent className="py-10 text-center text-sm text-red-700">
            {error || 'Ticket not found.'}
          </CardContent>
        </Card>
      </div>
    );
  }

  const resolved = ticket.status === 'resolved';
  const replies = ticket.replies || [];
  // Tickets answered before the conversation existed only carry `resolution`.
  const legacyResolution =
    !replies.length && ticket.resolution ? ticket.resolution : '';

  return (
    <Card className="flex h-[calc(100vh-50px)] w-full flex-col overflow-hidden border-gray-200 shadow-sm">
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
     
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className='flex flex-row gap-2'>

            <h1 className="text-2xl font-semibold text-black">
              {ticketTitle(ticket)}
            </h1>
                      <StatusPill status={ticket.status} />
            </div>

            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-black">
              <span className="font-mono">{ticket.ticketId}</span>
              <span>|</span>
              <span>{typeLabel(ticket.type)}</span>
              <span>|</span>
              <span>Raised {formatDate(ticket.createdAt)}</span>
            </p>
          </div>
             {back}
        </div>
      </div>

      <div
        ref={threadRef}
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5"
      >
        <Message
          author={ticket.studentId}
          verb="raised this"
          date={ticket.createdAt}
          message={
            ticket.otherReason
              ? `Reason: ${ticket.otherReason}\n\n${ticket.description}`
              : ticket.description
          }
          attachments={ticket.attachments}
        />
        {replies.map((reply) => (
          <Message
            key={reply._id}
            author={reply.authorId}
            agent={reply.authorRole === 'agent'}
            verb="replied"
            date={reply.createdAt}
            message={reply.message}
            attachments={reply.attachments}
            edited={!!reply.editedAt}
          />
        ))}
        {legacyResolution && (
          <Message
            author={ticket.resolvedBy}
            agent
            verb="replied"
            date={ticket.resolvedAt}
            message={legacyResolution}
          />
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 px-6 py-4">
        {resolved ? (
          <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <Lock className="h-4 w-4 shrink-0" />
            This ticket was resolved on {formatDate(ticket.resolvedAt)} and can
            no longer be replied to. If you still need help, please raise a new
            ticket.
          </p>
        ) : (
          <div className="space-y-3">
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a reply to the support team…"
              className="resize-none border border-gray-300 text-sm"
              disabled={sending}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FilePicker
                files={files}
                onChange={setFiles}
                disabled={sending}
              />
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                onClick={send}
                disabled={sending}
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
