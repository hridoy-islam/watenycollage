import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessagesSquare } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { socket, setupSocket } from '@/lib/socket';
import { useToast } from '@/components/ui/use-toast';
import { UserContactDialog } from '@/components/shared/user-contact-dialog';
import { cn } from '@/lib/utils';
import { ContactList } from './components/contact-list';
import { ChatPane, DeleteScope } from './components/chat-pane';
import { AttachmentsPanel } from './components/attachments-panel';
import {
  ChatMessage,
  Contact,
  MessageAttachment,
  relationLabel
} from './components/message-utils';

const PAGE_SIZE = 30;
/** A typing signal that is never stopped (closed tab, lost socket) expires. */
const TYPING_TTL = 5000;

const conversationKeyOf = (a: string, b: string) =>
  [String(a), String(b)].sort().join('_');

const appendUnique = (list: ChatMessage[], message: ChatMessage) =>
  list.some((m) => m._id === message._id) ? list : [...list, message];

/**
 * People opened from a contact card but not written to yet. The server only
 * lists people a message has passed between, so without this a fresh chat
 * would vanish from the list on a refresh. Per browser and per signed-in
 * user; storage can be unavailable (private mode), which just means they are
 * not remembered.
 */
const OPENED_LIMIT = 20;
const openedKeyOf = (myId: string) => `messages:opened:${myId}`;

const readOpened = (myId: string): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(openedKeyOf(myId)) || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeOpened = (myId: string, ids: string[]) => {
  try {
    localStorage.setItem(openedKeyOf(myId), JSON.stringify(ids.slice(0, OPENED_LIMIT)));
  } catch {
    // Not remembered - the chat still works.
  }
};

const rememberOpened = (myId: string, id: string) =>
  writeOpened(myId, [id, ...readOpened(myId).filter((x) => x !== id)]);

const forgetOpened = (myId: string, id: string) => {
  const ids = readOpened(myId);
  if (ids.includes(id)) writeOpened(myId, ids.filter((x) => x !== id));
};

export default function MessagesPage() {
  const { user } = useSelector((state: any) => state.auth);
  const myId: string = user?._id ? String(user._id) : '';
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('user');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const [typing, setTyping] = useState<Set<string>>(new Set());
  const [showFiles, setShowFiles] = useState(false);
  const [filesRefresh, setFilesRefresh] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const selectedRef = useRef<string | null>(selectedId);
  selectedRef.current = selectedId;
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const contactIdsRef = useRef<string[]>([]);
  contactIdsRef.current = contacts.map((c) => c._id);

  const selectedContact = useMemo(
    () => contacts.find((c) => c._id === selectedId) || null,
    [contacts, selectedId]
  );

  const selectContact = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (id) next.set('user', id);
      else next.delete('user');
      setSearchParams(next, { replace: true });
      setShowFiles(false);
    },
    [searchParams, setSearchParams]
  );

  // ── Contacts ─────────────────────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/messages/contacts');
      const list: Contact[] = res.data?.data || [];

      // Bring back the people opened but not yet written to.
      const listed = new Set(list.map((c) => String(c._id)));
      const opened = readOpened(myId);
      opened.filter((id) => listed.has(id)).forEach((id) => forgetOpened(myId, id));
      const missing = opened.filter((id) => !listed.has(id));
      const results = await Promise.allSettled(
        missing.map((id) => axiosInstance.get(`/messages/contacts/${id}`))
      );
      const restored: Contact[] = [];
      results.forEach((result, i) => {
        const contact = result.status === 'fulfilled' ? result.value.data?.data : null;
        if (contact) restored.push(contact);
        // No longer reachable (removed from the group, account gone).
        else forgetOpened(myId, missing[i]);
      });

      setContacts([...list, ...restored]);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, [myId]);

  useEffect(() => {
    if (myId) loadContacts();
  }, [myId, loadContacts]);

  const requestPresence = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    socket.emit('presence:get', ids, (onlineIds: string[]) =>
      setOnline(new Set((onlineIds || []).map(String)))
    );
  }, []);

  const contactIds = useMemo(() => contacts.map((c) => c._id).join(','), [contacts]);
  useEffect(() => {
    requestPresence(contactIds ? contactIds.split(',') : []);
  }, [contactIds, requestPresence]);

  // Opened with ?user= for someone who has never been written to - they are
  // not in the list yet, so they are looked up and put at the top.
  useEffect(() => {
    if (!selectedId || contactsLoading || selectedContact) return;
    let cancelled = false;
    axiosInstance
      .get(`/messages/contacts/${selectedId}`)
      .then((res) => {
        const contact = res.data?.data;
        if (!cancelled && contact) {
          rememberOpened(myId, String(contact._id));
          setContacts((prev) =>
            prev.some((c) => c._id === contact._id) ? prev : [contact, ...prev]
          );
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to open conversation:', error);
        toast({
          title: 'Unable to open chat',
          description:
            error?.response?.data?.message || 'You cannot message this user.',
          variant: 'destructive'
        });
        selectContact(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, contactsLoading, selectedContact, selectContact, toast, myId]);

  // ── Conversation ─────────────────────────────────────────────────────
  const markRead = useCallback((otherId: string) => {
    setContacts((prev) =>
      prev.map((c) => (c._id === otherId && c.unreadCount ? { ...c, unreadCount: 0 } : c))
    );
    axiosInstance
      .patch(`/messages/read/${otherId}`)
      .catch((error) => console.error('Failed to mark as read:', error));
  }, []);

  useEffect(() => {
    if (!selectedId || !myId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessages([]);
    setHasMore(false);
    setMessagesLoading(true);
    axiosInstance
      .get(`/messages/conversation/${selectedId}`, { params: { limit: PAGE_SIZE } })
      .then((res) => {
        if (cancelled) return;
        setMessages(res.data?.data?.result || []);
        setHasMore(Boolean(res.data?.data?.hasMore));
        markRead(selectedId);
      })
      .catch((error) => {
        console.error('Failed to load messages:', error);
        if (!cancelled) setMessages([]);
      })
      .finally(() => !cancelled && setMessagesLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId, myId, markRead]);

  const loadOlder = useCallback(async () => {
    if (!selectedId || messages.length === 0 || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await axiosInstance.get(`/messages/conversation/${selectedId}`, {
        params: { limit: PAGE_SIZE, before: messages[0].createdAt }
      });
      if (selectedRef.current !== selectedId) return;
      const older: ChatMessage[] = res.data?.data?.result || [];
      setMessages((prev) => [
        ...older.filter((m) => !prev.some((p) => p._id === m._id)),
        ...prev
      ]);
      setHasMore(Boolean(res.data?.data?.hasMore));
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlder(false);
    }
  }, [selectedId, messages, loadingOlder]);

  const updateContactWith = useCallback(
    (otherId: string, message: ChatMessage, incrementUnread: boolean) => {
      setContacts((prev) => {
        const existing = prev.find((c) => c._id === otherId);
        if (!existing) return prev;
        const updated: Contact = {
          ...existing,
          lastMessage: message,
          unreadCount: incrementUnread ? existing.unreadCount + 1 : existing.unreadCount
        };
        return [updated, ...prev.filter((c) => c._id !== otherId)];
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string, attachments: MessageAttachment[]) => {
      if (!selectedId) return false;
      try {
        const res = await axiosInstance.post('/messages', {
          receiverId: selectedId,
          text,
          attachments
        });
        const message: ChatMessage = res.data?.data;
        if (message) {
          // A real conversation now - the server lists them from here on.
          forgetOpened(myId, selectedId);
          setMessages((prev) => appendUnique(prev, message));
          updateContactWith(selectedId, message, false);
          if (attachments.length) setFilesRefresh((n) => n + 1);
        }
        return true;
      } catch (error: any) {
        console.error('Failed to send message:', error);
        toast({
          title: 'Message not sent',
          description: error?.response?.data?.message || 'Please try again.',
          variant: 'destructive'
        });
        return false;
      }
    },
    [selectedId, toast, updateContactWith, myId]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!selectedId || !myId) return;
      socket.emit(isTyping ? 'message:typing' : 'message:stop-typing', {
        from: myId,
        to: selectedId
      });
    },
    [selectedId, myId]
  );

  /** Puts an edited message wherever the old copy is shown. */
  const applyUpdatedMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, ...message } : m)));
    setContacts((prev) =>
      prev.map((c) =>
        c.lastMessage?._id === message._id ? { ...c, lastMessage: message } : c
      )
    );
  }, []);

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      try {
        const res = await axiosInstance.patch(`/messages/${messageId}`, { text });
        if (res.data?.data) applyUpdatedMessage(res.data.data);
        return true;
      } catch (error: any) {
        console.error('Failed to edit message:', error);
        toast({
          title: 'Message not edited',
          description: error?.response?.data?.message || 'Please try again.',
          variant: 'destructive'
        });
        return false;
      }
    },
    [applyUpdatedMessage, toast]
  );

  /**
   * Drops a message deleted "for me" from the thread, and - if it was the
   * chat's latest - shows the one before it in the list instead.
   */
  const removeMessage = useCallback((messageId: string) => {
    // Read from the ref, not inside the messages updater: updaters run later,
    // during render, so a value set in one is not there for the contacts one.
    const remaining = messagesRef.current.filter((m) => m._id !== messageId);
    const latest = remaining[remaining.length - 1] || null;
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    setContacts((prev) =>
      prev.map((c) =>
        c.lastMessage?._id === messageId
          ? {
              ...c,
              lastMessage:
                latest && latest.conversationKey === c.lastMessage.conversationKey
                  ? latest
                  : null
            }
          : c
      )
    );
    setFilesRefresh((n) => n + 1);
  }, []);

  const deleteMessage = useCallback(
    async (messageId: string, scope: DeleteScope) => {
      try {
        const res = await axiosInstance.delete(`/messages/${messageId}`, {
          params: { scope }
        });
        if (scope === 'me') removeMessage(messageId);
        else if (res.data?.data) {
          applyUpdatedMessage(res.data.data);
          setFilesRefresh((n) => n + 1);
        }
        return true;
      } catch (error: any) {
        console.error('Failed to delete message:', error);
        toast({
          title: 'Message not deleted',
          description: error?.response?.data?.message || 'Please try again.',
          variant: 'destructive'
        });
        return false;
      }
    },
    [applyUpdatedMessage, removeMessage, toast]
  );

  // ── Realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!myId) return;

    const setup = () => {
      setupSocket(myId);
      requestPresence(contactIdsRef.current);
    };
    setup();

    const clearTyping = (from: string) => {
      clearTimeout(typingTimers.current[from]);
      setTyping((prev) => {
        if (!prev.has(from)) return prev;
        const next = new Set(prev);
        next.delete(from);
        return next;
      });
    };

    const onNew = ({ message, sender }: { message: ChatMessage; sender: any }) => {
      if (!message) return;
      const mine = String(message.senderId) === myId;
      const otherId = String(mine ? message.receiverId : message.senderId);
      const isOpen = selectedRef.current === otherId;

      if (!mine) clearTyping(otherId);

      if (isOpen) {
        setMessages((prev) => appendUnique(prev, message));
        if (message.attachments?.length) setFilesRefresh((n) => n + 1);
        if (!mine && document.visibilityState === 'visible') markRead(otherId);
      }

      setContacts((prev) => {
        const existing = prev.find((c) => c._id === otherId);
        const unreadBump = !mine && !(isOpen && document.visibilityState === 'visible');
        if (existing) {
          return [
            {
              ...existing,
              lastMessage: message,
              unreadCount: existing.unreadCount + (unreadBump ? 1 : 0)
            },
            ...prev.filter((c) => c._id !== otherId)
          ];
        }
        if (!mine && sender) {
          return [
            {
              ...sender,
              _id: String(sender._id),
              relation: sender.role || 'other',
              lastMessage: message,
              unreadCount: unreadBump ? 1 : 0
            },
            ...prev
          ];
        }
        return prev;
      });
    };

    const onRead = ({
      conversationKey,
      readBy,
      readAt
    }: {
      conversationKey: string;
      readBy: string;
      readAt: string;
    }) => {
      if (String(readBy) === myId) {
        // Read in another tab of mine.
        setContacts((prev) =>
          prev.map((c) =>
            conversationKeyOf(myId, c._id) === conversationKey
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.conversationKey === conversationKey &&
          String(m.senderId) === myId &&
          !m.readAt
            ? { ...m, readAt }
            : m
        )
      );
    };

    const onUpdated = ({ message }: { message: ChatMessage }) => {
      if (message?._id) applyUpdatedMessage(message);
    };

    // Deleted for everyone - by either side, so it becomes the marker here.
    const onDeleted = ({ message }: { message: ChatMessage }) => {
      if (!message?._id) return;
      applyUpdatedMessage(message);
      setFilesRefresh((n) => n + 1);
    };

    // Deleted "for me" in another of my tabs.
    const onHidden = ({ messageId }: { messageId: string }) => {
      if (messageId) removeMessage(String(messageId));
    };

    const onTyping = ({ from }: { from: string }) => {
      const id = String(from);
      setTyping((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      clearTimeout(typingTimers.current[id]);
      typingTimers.current[id] = setTimeout(() => clearTyping(id), TYPING_TTL);
    };

    const onStopTyping = ({ from }: { from: string }) => clearTyping(String(from));

    const onPresence = ({ userId, online: isOnline }: { userId: string; online: boolean }) =>
      setOnline((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(String(userId));
        else next.delete(String(userId));
        return next;
      });

    socket.on('connect', setup);
    socket.on('message:new', onNew);
    socket.on('message:read', onRead);
    socket.on('message:updated', onUpdated);
    socket.on('message:deleted', onDeleted);
    socket.on('message:hidden', onHidden);
    socket.on('message:typing', onTyping);
    socket.on('message:stop-typing', onStopTyping);
    socket.on('presence:update', onPresence);

    return () => {
      socket.off('connect', setup);
      socket.off('message:new', onNew);
      socket.off('message:read', onRead);
      socket.off('message:updated', onUpdated);
      socket.off('message:deleted', onDeleted);
      socket.off('message:hidden', onHidden);
      socket.off('message:typing', onTyping);
      socket.off('message:stop-typing', onStopTyping);
      socket.off('presence:update', onPresence);
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [myId, markRead, requestPresence, applyUpdatedMessage, removeMessage]);

  // Coming back to the tab reads whatever arrived while it was hidden.
  useEffect(() => {
    const onVisible = () => {
      const id = selectedRef.current;
      if (document.visibilityState !== 'visible' || !id) return;
      if (contacts.find((c) => c._id === id)?.unreadCount) markRead(id);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [contacts, markRead]);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="relative flex h-[calc(100dvh-4.5rem)] min-h-[560px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md lg:h-[calc(100dvh-1rem)]">
        {/* Contacts */}
        <aside
          className={cn(
            'h-full w-full shrink-0 border-r border-gray-200 md:block md:w-72 lg:w-80',
            selectedId ? 'hidden' : 'block'
          )}
        >
          <ContactList
            contacts={contacts}
            loading={contactsLoading}
            selectedId={selectedId}
            myId={myId}
            online={online}
            typing={typing}
            onSelect={(contact) => selectContact(contact._id)}
          />
        </aside>

        {/* Conversation */}
        <section
          className={cn(
            'h-full min-w-0 flex-1 md:block',
            selectedId ? 'block' : 'hidden'
          )}
        >
          {selectedContact ? (
            <ChatPane
              contact={selectedContact}
              myId={myId}
              messages={messages}
              loading={messagesLoading}
              hasMore={hasMore}
              loadingOlder={loadingOlder}
              online={online.has(selectedContact._id)}
              isTyping={typing.has(selectedContact._id)}
              onLoadOlder={loadOlder}
              onSend={sendMessage}
              onEdit={editMessage}
              onDelete={deleteMessage}
              onTyping={sendTyping}
              onBack={() => selectContact(null)}
              onShowFiles={() => setShowFiles(true)}
              onShowDetails={() => setDetailsOpen(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gray-50/70 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-watney/10 text-watney">
                <MessagesSquare className="h-8 w-8" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-black">
                {selectedId ? 'Opening chat…' : 'Select a chat'}
              </h3>
              <p className="mt-1 max-w-xs text-xs text-black">
                Message your teachers and classmates, and share documents with them.
              </p>
            </div>
          )}
        </section>

        {/* Shared files - a column on wide screens, over the chat on narrow ones */}
        {showFiles && selectedContact && (
          <aside className="absolute inset-0 z-10 h-full w-full border-l border-gray-200 bg-white lg:static lg:w-80 lg:shrink-0">
            <AttachmentsPanel
              contact={selectedContact}
              myId={myId}
              refreshKey={filesRefresh}
              onClose={() => setShowFiles(false)}
            />
          </aside>
        )}
      </div>

      <UserContactDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        person={selectedContact}
        roleLabel={relationLabel(selectedContact?.relation)}
        showMessageButton={false}
      />
    </div>
  );
}
