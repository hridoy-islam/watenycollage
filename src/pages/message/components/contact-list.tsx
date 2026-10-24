import { useMemo, useState } from 'react';
import { MessageSquare, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';
import {
  Contact,
  displayName,
  listTime,
  previewOf,
  relationLabel
} from './message-utils';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' }
] as const;

type Filter = (typeof FILTERS)[number]['value'];

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  selectedId: string | null;
  myId?: string;
  online: Set<string>;
  typing: Set<string>;
  onSelect: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  loading,
  selectedId,
  myId,
  online,
  typing,
  onSelect
}: ContactListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      if (filter === 'unread' && contact.unreadCount === 0) return false;
      if (!term) return true;
      return [displayName(contact), contact.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [contacts, search, filter]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b border-gray-200 px-4 pb-3 pt-4">
        <h2 className="text-lg font-bold text-black">Chat</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people"
            className="h-9 border-gray-200 bg-gray-50 pl-8 text-xs focus-visible:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                filter === item.value
                  ? 'bg-watney text-white'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-black" />
            <p className="mt-2 text-sm font-medium text-black">
              {contacts.length === 0 ? 'No one to message yet' : 'No matches'}
            </p>
            <p className="mt-1 text-[11px] text-black">
              {contacts.length === 0
                ? 'Your teachers and anyone you message will appear here.'
                : 'Try a different name or filter.'}
            </p>
          </div>
        ) : (
          <ul className="py-1">
            {visible.map((contact) => {
              const name = displayName(contact);
              const selected = contact._id === selectedId;
              const unread = contact.unreadCount > 0;
              const isTyping = typing.has(contact._id);
              return (
                <li key={contact._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(contact)}
                    className={cn(
                      'relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selected ? 'bg-watney/10' : 'hover:bg-gray-50'
                    )}
                  >
                    {selected && (
                      <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-watney" />
                    )}
                    <UserAvatar
                      name={name}
                      image={contact.image}
                      online={online.has(contact._id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-sm text-black',
                            unread ? 'font-bold' : 'font-medium'
                          )}
                        >
                          {name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 text-[10px]',
                            unread ? 'font-semibold text-watney' : 'text-black'
                          )}
                        >
                          {listTime(contact.lastMessage?.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'truncate text-[11px]',
                            isTyping
                              ? 'italic text-watney'
                              : unread
                                ? 'font-semibold text-black'
                                : 'text-black'
                          )}
                        >
                          {isTyping
                            ? 'Typing…'
                            : previewOf(contact.lastMessage, myId) ||
                              relationLabel(contact.relation)}
                        </span>
                        {unread && (
                          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-watney px-1 text-[9px] font-bold text-white">
                            {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
