import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { MoveLeft, Plus } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';

// Types
interface EmailDraft {
  _id: string;
  subject: string;
  body: string;
}

interface EmailLog {
  id: string;
  subject: string;
  issuedBy: string;
  createdAt: string;
  status: 'sent' | 'pending';
}

const AVAILABLE_VARIABLES = [
  'name',
  'dob',
  'email',
  'countryOfBirth',
  'nationality',
  'dateOfBirth',
  'admin',
  'adminEmail'
];

function StudentMailPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sending, setSending] = useState(false); // ✅ sending state
  const [errors, setErrors] = useState<{
    subject?: string;
    body?: string;
    draft?: string;
  }>({});
  const { id } = useParams();
  const user = useSelector((state: any) => state.auth?.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentName, setStudentName] = useState<string>('');
  const { toast } = useToast()

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}`);
        setStudentName(res.data.data.name || 'Unknown');
      } catch (error) {
        console.error('Failed to fetch student info:', error);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await axiosInstance.get('/email-drafts?limit=all');
        setEmailDrafts(res.data.data.result);
      } catch (error) {
        console.error('Failed to fetch email drafts:', error);
      }
    };
    fetchDrafts();
  }, []);

  // Fetch email logs
  const fetchEmailLogs = async (page, entriesPerPage, searchTerm = '') => {
    if (!id) return;
    setLoadingLogs(true);
    try {
      const res = await axiosInstance.get(`/email?userId=${id}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      const logs = res.data.data.result || [];

      const formattedLogs: EmailLog[] = logs.map((log: any) => ({
        id: log._id,
        subject: log.subject,
        issuedBy: log.issuedBy?.name || log.issuedBy?._id || 'Unknown',
        createdAt: moment(log.sentAt).format('DD MMM, YYYY'),
        status: log.status
      }));

      setEmailLogs(formattedLogs);
      setTotalPages(res.data.data.meta.totalPage);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      setEmailLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs(currentPage, entriesPerPage);
  }, [id, currentPage, entriesPerPage]);

  const handleTemplateChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (!selectedOption) return;
    const draft = emailDrafts.find((d) => d._id === selectedOption.value);
    if (draft) {
      setSelectedDraft(draft);
      setSubject(draft.subject);
      setBody(draft.body);
    }
  };

  const handleSendEmail = async () => {
    // validation
    const newErrors: typeof errors = {};
    if (!selectedDraft) newErrors.draft = 'Template is required';
    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!body.trim()) newErrors.body = 'Body is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      emailDraft: selectedDraft!._id,
      userId: id,
      issuedBy: user._id,
      subject,
      body
    };

    setSending(true);
    try {
      const res = await axiosInstance.post('/email', payload);

      if (res.data.success) {
        const newLog: EmailLog = {
          id: res.data.data._id || Date.now().toString(),
          subject,
          issuedBy: user.name,
          createdAt: moment().format('DD MMM, YYYY'),
          status: 'pending'
        };


        toast({
        title: 'Email Sent successfully',
        className: 'bg-watney border-none text-white'
      });
        setEmailLogs((prev) => [newLog, ...prev]);

        // ✅ clear form after send
        setSelectedDraft(null);
        setSubject('');
        setBody('');
        setErrors({});
        setOpen(false);

        // ✅ refetch after 5s
        setTimeout(() => {
          fetchEmailLogs(currentPage, entriesPerPage);
        }, 5000);
      }
    } catch (error:any) {
       toast({
        title: error.response?.data?.message || error.message || 'Failed to send email',
        className: 'bg-destructive border-none text-white'
      });
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  const templateOptions = emailDrafts.map((draft) => ({
    value: draft._id,
    label: draft.subject
  }));

  return (
    <div className="p-4">
      <div className="mb-6 flex justify-between">
        <h2 className="text-2xl font-semibold">{studentName}'s Email Logs</h2>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="bg-watney text-white hover:bg-watney/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-lg">
        {loadingLogs ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : emailLogs.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Issued By</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.subject}</TableCell>
                    <TableCell>{log.issuedBy}</TableCell>
                    <TableCell>{log.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                          log.status === 'sent'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* ✅ pagination */}
            <div className="mt-4">
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-gray-500">
            No emails found for this student.
          </p>
        )}
      </div>

      {/* Send Email Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-h-[95vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Select Template</label>
              <Select
                options={templateOptions}
                value={
                  selectedDraft
                    ? { value: selectedDraft._id, label: selectedDraft.subject }
                    : null
                }
                onChange={handleTemplateChange}
                placeholder="Choose a template..."
                isClearable
              />
              {errors.draft && (
                <p className="mt-1 text-sm text-red-500">{errors.draft}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-watney"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Variables */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Available Variables:
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {AVAILABLE_VARIABLES.map((v) => (
                  <span key={v} className="rounded bg-gray-100 px-2 py-1">
                    {`[${v}]`}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-medium">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-[250px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-500">{errors.body}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button
              onClick={handleSendEmail}
              className="bg-watney text-white hover:bg-watney/90"
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentMailPage;
