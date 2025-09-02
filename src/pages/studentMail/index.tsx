import { useState, useEffect } from 'react';
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
import { MoveLeft, Plus, Download } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image
} from '@react-pdf/renderer';

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
  'title',
  'firstName',
  'lastName',
  'phone',
  'email',
  'countryOfBirth',
  'nationality',
  'countryOfResidence',
  'dateOfBirth',
  'ethnicity',
  'gender',
  'postalAddressLine1',
  'postalAddressLine2',
  'postalCity',
  'postalCountry',
  'postalPostCode',
  'residentialAddressLine1',
  'residentialAddressLine2',
  'residentialCity',
  'residentialCountry',
  'residentialPostCode',
  'emergencyAddress',
  'emergencyContactNumber',
  'emergencyEmail',
  'emergencyFullName',
  'emergencyRelationship',
  'admin',
  'adminEmail',
  'applicationLocation',
  'courseName',
  'intake',
  'applicationStatus',
  'applicationDate',
  'todayDate'
];

const DYNAMIC_VARIABLES = ['signature id="1"', 'courseCode="1"'];

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  logoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  logo: {
    width: 50,
    height: 50,
    marginLeft: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  subject: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold'
  },
  body: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'justify'
  }
});

const EmailPDFDocument = ({ body }: { body: string }) => {
  // Split body by line breaks
  const lines = body.split('\n');

  // Helper to process each line: detect image URLs or placeholders
 const renderNode = (text: string, index: number) => {
  // Match image URL
  const imageUrlMatch = text.match(
    /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))(?:\s|$)/i
  );

  if (imageUrlMatch) {
    const url = imageUrlMatch[1];
    const before = text.slice(0, imageUrlMatch.index);
    const after = text.slice(imageUrlMatch.index! + url.length).trim();

    return (
      <View key={index} style={{ flexDirection: 'column', marginBottom: 5 }}>
        {before ? <Text style={styles.body}>{before}</Text> : null}
        <Image
          style={{ width: 100, height: 60, objectFit: 'contain', marginBottom: -20 }}
          src={url}
        />
        {after ? <Text style={styles.body}>{after}</Text> : null}
      </View>
    );
  }

  // Preserve empty lines
  if (text.trim() === '') {
    return <Text key={index} style={{ marginBottom: 5 }}>{'\n'}</Text>;
  }

  return <Text key={index} style={[styles.body, { marginBottom: 5 }]}>{text}</Text>;
};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo Top Right */}
        <View style={styles.logoContainer}>
          <Image src="/logo.png" style={styles.logo} />
        </View>

        <View style={styles.section}>
          {lines.map((line, i) => renderNode(line, i))}
        </View>
      </Page>
    </Document>
  );
};

function StudentMailPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [selectedPdfDraft, setSelectedPdfDraft] = useState<EmailDraft | null>(
    null
  );
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sending, setSending] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [errors, setErrors] = useState<{
    subject?: string;
    body?: string;
    draft?: string;
  }>({});
  const { id, applicationId } = useParams();
  const user = useSelector((state: any) => state.auth?.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}`);
        setStudentName(res.data.data.name || 'Unknown');
        setStudentData(res.data.data);
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
      body,
      ...(applicationId && { applicationId })
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

        setSelectedDraft(null);
        setSubject('');
        setBody('');
        setErrors({});
        setOpen(false);

        setTimeout(() => {
          fetchEmailLogs(currentPage, entriesPerPage);
        }, 5000);
      }
    } catch (error: any) {
      toast({
        title:
          error.response?.data?.message ||
          error.message ||
          'Failed to send email',
        className: 'bg-destructive border-none text-white'
      });
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  const replaceVariables = async (text: string, studentData: any) => {
    let replacedText = text;

    // 1. Replace basic AVAILABLE_VARIABLES
    AVAILABLE_VARIABLES.forEach((variable) => {
      let value = studentData?.[variable] || '';
      if (
        (variable === 'dateOfBirth' || variable === 'applicationDate') &&
        value
      ) {
        value = moment(value).format('DD MMM, YYYY');
      }
      if (variable === 'todayDate') {
        value = moment().format('DD MMM, YYYY');
      }

      // Admin overrides
      if (variable === 'admin') value = 'Watney College';
      if (variable === 'adminEmail') value = 'info@watneycollege.co.uk';

      const regex = new RegExp(`\\[${variable}\\]`, 'g');
      replacedText = replacedText.replace(regex, value);
    });

    // 2. Replace [todayDate] directly
    replacedText = replacedText.replace(
      /\[todayDate\]/g,
      moment().format('DD MMM, YYYY')
    );

    // 3. Handle [signature id="1"] tags
    const signatureRegex = /\[signature\s+id=["'](\d+)["']\]/g;
    const signatureMatches = [...replacedText.matchAll(signatureRegex)];

    const signaturePromises = signatureMatches.map(async (match) => {
      const signatureId = match[1];
      const placeholder = match[0]; // Use the full match as placeholder

      try {
        const res = await axiosInstance.get(
          `/signature?signatureId=${signatureId}`
        );
        const url = res.data.data?.result[0]?.documentUrl;
        return {
          placeholder,
          replacement: url
        };
      } catch (error) {
        return {
          placeholder,
          replacement: '[Signature]'
        };
      }
    });

    // 4. Handle [courseCode="LEVEL25"] tags
    const courseCodeRegex = /\[courseCode=["']([^"']+)["']\]/g;
    const courseCodeMatches = [...replacedText.matchAll(courseCodeRegex)];

    const courseCodePromises = courseCodeMatches.map(async (match) => {
      const courseCode = match[1];
      const placeholder = match[0]; // Use the full match as placeholder

      try {
        const res = await axiosInstance.get(
          `/course-code?courseCode=${courseCode}`
        );
        const courseName = res.data.data?.result[0]?.course;
        return {
          placeholder,
          replacement: courseName
        };
      } catch (error) {
        return {
          placeholder,
          replacement: courseCode
        };
      }
    });

    // 5. Wait for all async replacements and apply them
    const allPromises = [...signaturePromises, ...courseCodePromises];

    if (allPromises.length > 0) {
      const replacements = await Promise.all(allPromises);

      // Apply all replacements to the text
      replacements.forEach(({ placeholder, replacement }) => {
        replacedText = replacedText.replace(placeholder, replacement);
      });
    }

    return replacedText;
  };
  const handleDownloadPdf = async () => {
    if (!selectedPdfDraft || !studentData || !studentName) {
      toast({
        title: 'Please select a template and ensure data is loaded.',
        className: 'bg-destructive border-none text-white'
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      // ✅ Replace variables
      const replacedBody = await replaceVariables(
        selectedPdfDraft.body,
        studentData
      );

      // ✅ Use replacedBody, not the original
      const doc = <EmailPDFDocument body={replacedBody} />;

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${studentName}_${selectedPdfDraft.subject.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'PDF downloaded successfully',
        className: 'bg-watney border-none text-white'
      });

      setPdfOpen(false);
      setSelectedPdfDraft(null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Failed to generate PDF',
        className: 'bg-destructive border-none text-white'
      });
    } finally {
      setGeneratingPdf(false);
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
          <Button
            onClick={() => setPdfOpen(true)}
            size="sm"
            className="bg-watney text-white hover:bg-watney/90"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
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

            {emailLogs.length > 6 && (
              <div className="mt-4">
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <p className="py-6 text-center text-gray-500">
            No emails found for this student.
          </p>
        )}
      </div>

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

            <div>
              <label className="mb-1 block font-medium">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-[250px] w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                disabled
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-500">{errors.body}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              onClick={() => {
                setSelectedDraft(null);
                setSubject('');
                setBody('');
                setErrors({});
                setOpen(false);
              }}
            >
              Cancel
            </Button>
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

      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Email as PDF</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-medium">Select Template</label>
              <Select
                options={templateOptions}
                value={
                  selectedPdfDraft
                    ? {
                        value: selectedPdfDraft._id,
                        label: selectedPdfDraft.subject
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  const draft = emailDrafts.find(
                    (d) => d._id === selectedOption.value
                  );
                  if (draft) {
                    setSelectedPdfDraft(draft);
                  }
                }}
                placeholder="Choose a template..."
                isClearable
              />
            </div>

            {/* {selectedPdfDraft && (
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  <strong>Subject:</strong> {selectedPdfDraft.subject}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Preview:</strong>{' '}
                  {selectedPdfDraft.body.substring(0, 100)}...
                </p>
              </div>
            )} */}
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setPdfOpen(false);
                setSelectedPdfDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownloadPdf}
              className="bg-watney text-white hover:bg-watney/90"
              disabled={generatingPdf || !selectedPdfDraft}
            >
              {generatingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentMailPage;
