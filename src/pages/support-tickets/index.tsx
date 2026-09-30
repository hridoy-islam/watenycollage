/**
 * Support tickets, as the student sees them.
 *
 * One card rather than a list and a separate form: raising a ticket is the
 * thing a student comes here to do, and the history is what tells them whether
 * they already have. A ticket opens on its own page, where the conversation
 * with the support team carries on; a red count on a row is replies from the
 * team the student has not opened yet.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import moment from 'moment';
import { LifeBuoy, Loader2, Plus, Search } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import { StatusPill } from './components/status-pill';
import { FilePicker } from './components/attachments';
import {
  TICKET_TYPES,
  formatDate,
  ticketTitle,
  typeLabel,
  uploadTicketFiles,
  type Option,
  type TicketRecord
} from './components/ticket-utils';

const formatRelative = (value?: string) =>
  value ? moment(value).fromNow() : '—';

// The repo styles react-select through `.react-select__*` in index.css; this
// only adds what that cannot know about.
//
// The menu has to be portalled out to the body: DialogContent is `z-[1000]`
// and carries `translate-x/y-[-50%]`, and that transform makes it the
// containing block for any `position: fixed` descendant - so a menu laid out
// "fixed" lands against the dialog while react-select computes viewport
// coordinates for it. Portalling then needs a z-index above the dialog's 1000,
// and `pointerEvents: auto`, because Radix sets `pointer-events: none` on the
// body while a modal dialog is open and the menu would inherit it.
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '40px',
    fontSize: '14px',
    borderRadius: '8px',
    borderColor: state.isFocused ? 'hsl(var(--watney))' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--watney))' : 'none',
    '&:hover': { borderColor: 'hsl(var(--watney))' }
  }),
  menu: (base: any) => ({ ...base, fontSize: '14px', zIndex: 9999 }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: 'auto' as const
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected
      ? 'hsl(var(--watney))'
      : state.isFocused
        ? 'hsl(var(--watney) / 0.08)'
        : 'white',
    color: state.isSelected ? 'white' : '#111827'
  }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af' })
};

// Resolved once, and guarded for the server-rendered pass where there is no
// document to portal into.
const selectPortalTarget =
  typeof document !== 'undefined' ? document.body : undefined;

// The portalled menu lives outside the dialog, so Radix reads a click on an
// option as a click outside and would close the dialog underneath it. Spread
// onto a DialogContent, this lets that one case through and leaves every other
// outside click behaving normally.
const menuAwareDialogProps = {
  onPointerDownOutside: (event: any) => {
    const target = event?.detail?.originalEvent?.target as HTMLElement | null;
    if (target?.closest?.('.react-select__menu')) event.preventDefault();
  },
  onInteractOutside: (event: any) => {
    const target = event?.detail?.originalEvent?.target as HTMLElement | null;
    if (target?.closest?.('.react-select__menu')) event.preventDefault();
  }
};

const emptyForm = {
  type: '',
  otherReason: '',
  description: ''
};

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>;

const ALL = 'all';

const FILTERS: Option[] = [
  { value: ALL, label: 'All tickets' },
  { value: 'reported', label: 'Reported' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' }
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SupportTicketsPage() {
  const user = useSelector((state: any) => state.auth.user);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);

  // Filtering and paging are the server's job now that the list is paged: the
  // page only holds the rows it asked for, so it cannot filter what it was
  // never sent.
  //
  // Both controls are drafts until Search commits them - `statusDraft` and
  // `searchInput` are what the student is editing, `appliedStatus` and
  // `searchTerm` are what the list is actually showing. Nothing refetches
  // until the button (or Enter) moves one to the other, so changing the filter
  // and typing a search is a single request rather than one per change.
  const [statusDraft, setStatusDraft] = useState<string>(ALL);
  const [appliedStatus, setAppliedStatus] = useState<string>(ALL);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  const [raiseOpen, setRaiseOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: entriesPerPage
      };
      if (appliedStatus !== ALL) params.status = appliedStatus;
      if (searchTerm.trim()) params.searchTerm = searchTerm.trim();

      const res = await axiosInstance.get(`/tickets/my/${user._id}`, {
        params
      });
      const data = res.data?.data;
      setTickets(Array.isArray(data?.result) ? data.result : []);
      setTotalPages(data?.meta?.totalPage || 1);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your support tickets.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user?._id, page, entriesPerPage, appliedStatus, searchTerm, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // One commit point for both controls. Starting again at page one matters
  // here, or a narrower list can leave the student sitting on an empty page 3.
  const runSearch = () => {
    setSearchTerm(searchInput);
    setAppliedStatus(statusDraft);
    setPage(1);
  };

  const changePageSize = (size: number) => {
    setEntriesPerPage(size);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusDraft(ALL);
    setAppliedStatus(ALL);
    setPage(1);
  };

  const filtering = appliedStatus !== ALL || !!searchTerm.trim();

  const openRaise = () => {
    setForm(emptyForm);
    setFiles([]);
    setErrors({});
    setRaiseOpen(true);
  };

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!form.type) next.type = 'Choose what your problem is about';
    // The one field that only exists for one type: "Other" says nothing on its
    // own, so without a reason nobody can route the ticket.
    if (form.type === 'other' && !form.otherReason.trim()) {
      next.otherReason = 'Tell us what the problem is about';
    }
    if (!form.description.trim()) {
      next.description = 'Describe the problem so we can help';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        studentId: user?._id,
        type: form.type,
        description: form.description.trim()
      };
      if (form.type === 'other') payload.otherReason = form.otherReason.trim();
      if (files.length) {
        payload.attachments = await uploadTicketFiles(files, user?._id);
      }

      const res = await axiosInstance.post('/tickets', payload);
      const created = res.data?.data;

      toast({
        title: 'Ticket raised',
        description: created?.ticketId
          ? `Your reference is ${created.ticketId}. We have emailed you a copy.`
          : 'We have emailed you a copy.'
      });
      setRaiseOpen(false);

      // The list is paged and sorted newest-first on the server, so the new
      // ticket is fetched back rather than spliced in - anything else would
      // put an eleventh row on a page of ten. Setting the page re-runs the
      // fetch on its own; refetching by hand is only needed when it is
      // already page one.
      if (page === 1) await fetchTickets();
      else setPage(1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'We could not raise your ticket. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-watney/10 text-watney">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-xl tracking-tight sm:text-2xl">
                  Raise Ticket
                </CardTitle>
               
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-watney text-white hover:bg-watney/90"
                onClick={openRaise}
              >
                <Plus className="mr-2 h-4 w-4" />
                Raise a ticket
              </Button>
          
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and filter, together on the left - they are one control
              now that both only take effect on Search. */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSearch();
                }}
                placeholder="Search reference or problem"
                className="h-10 w-full text-sm sm:w-72"
              />

              <div className="w-full sm:w-44">
                <Select
                  options={FILTERS}
                  value={FILTERS.find((f) => f.value === statusDraft)}
                  onChange={(option) =>
                    setStatusDraft((option as Option)?.value || ALL)
                  }
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>

              <Button
                size="sm"
                className="h-10 bg-watney text-white hover:bg-watney/90"
                onClick={runSearch}
              >
                <Search className="mr-1.5 h-4 w-4" />
                Search
              </Button>
            </div>

            
          </div>

          {/* Tickets */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
              {filtering ? (
                <>
                  <Search className="mx-auto h-8 w-8 text-black" />
                  <h3 className="mt-3 text-sm font-semibold text-black">
                    Nothing matches
                  </h3>
                  <p className="mt-1 text-sm text-black">
                    Try a different search, or widen the filter.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-watney/10 text-watney">
                    <LifeBuoy className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-black">
                    You have not raised any tickets
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-black">
                    If something is not working, or you are not sure who to ask,
                    raise a ticket and our team will pick it up.
                  </p>
                  <Button
                    size="sm"
                    className="mt-5 bg-watney text-white hover:bg-watney/90"
                    onClick={openRaise}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Raise a ticket
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto ">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                      <TableHead className="text-xs">Reference</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Problem</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Raised</TableHead>
                      <TableHead className="text-right text-xs">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket._id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/dashboard/support-tickets/${ticket._id}`)}
                      >
                        <TableCell className="whitespace-nowrap font-mono text-xs text-black">
                          <span className="inline-flex items-center gap-2">
                            {ticket.ticketId}
                            {!!ticket.userUnread && (
                              <span
                                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 font-sans text-[10px] font-bold text-white"
                                title={`${ticket.userUnread} new ${ticket.userUnread === 1 ? 'reply' : 'replies'} from the support team`}
                              >
                                {ticket.userUnread}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs font-medium text-black">
                          {typeLabel(ticket.type)}
                        </TableCell>
                        <TableCell className="max-w-[260px] text-xs">
                          <span className="block truncate font-medium text-black">
                            {ticketTitle(ticket)}
                          </span>
                          <span className="block truncate text-[11px] text-black">
                            {ticket.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={ticket.status} />
                        </TableCell>
                        <TableCell
                          className="whitespace-nowrap text-xs text-black"
                          title={formatDate(ticket.createdAt)}
                        >
                          {formatRelative(ticket.createdAt)}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            className="h-8 whitespace-nowrap text-xs"
                            onClick={() =>
                              navigate(`/dashboard/support-tickets/${ticket._id}`)
                            }
                          >
                            {ticket.userUnread ? 'View reply' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className=" pt-1">
                  <DataTablePagination
                    pageSize={entriesPerPage}
                    setPageSize={changePageSize}
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Raise a ticket */}
      <Dialog open={raiseOpen} onOpenChange={setRaiseOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          {...menuAwareDialogProps}
        >
          <DialogHeader>
            <DialogTitle>Raise a support ticket</DialogTitle>
            <DialogDescription>
              Tell us what is wrong and our team will look into it. You will get
              an email confirming your reference, and another when it is
              resolved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-black">
                What is it about? <span className="text-red-600">*</span>
              </Label>
              <Select
                options={TICKET_TYPES}
                value={TICKET_TYPES.find((t) => t.value === form.type) || null}
                onChange={(option) =>
                  setField('type', (option as Option)?.value || '')
                }
                placeholder="Select a type"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={selectStyles}
                menuPortalTarget={selectPortalTarget}
                menuPlacement="auto"
              />
              {errors.type && (
                <p className="text-xs text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Only "Other" has to explain itself - every other type already
                says what the ticket is about. */}
            {form.type === 'other' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-black">
                  Please give the reason <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={form.otherReason}
                  onChange={(e) => setField('otherReason', e.target.value)}
                  placeholder="e.g. Library access, student card, something else"
                />
                {errors.otherReason && (
                  <p className="text-xs text-red-600">{errors.otherReason}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-black">
                Describe the problem <span className="text-red-600">*</span>
              </Label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                className='border border-gray-300'
                placeholder="What happened, when it happened, and anything you have already tried."
              />
              {errors.description && (
                <p className="text-xs text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-black">
                Supporting documents
              </Label>
              <FilePicker files={files} onChange={setFiles} disabled={submitting} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRaiseOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-watney text-white hover:bg-watney/90"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit ticket'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
