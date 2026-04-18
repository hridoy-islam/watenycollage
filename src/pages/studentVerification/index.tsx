import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Trash2, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import axiosInstance from '@/lib/axios';
import FileUploadArea from './components/FileUploadArea';
import Select from 'react-select';
import clsx from 'clsx';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const DOCUMENT_CATEGORIES = [
  'Offer letters',
  'Certificates & qualifications',
  'Admission correspondence',
  'Other'
];

export default function StudentVerificationPage() {
  const [verifications, setVerifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVerification, setEditingVerification] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verificationToDelete, setVerificationToDelete] = useState<any>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  // New Wizard States
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Step 1: Application Search States
  const [applications, setApplications] = useState([]);
  const [hasSearchedApps, setHasSearchedApps] = useState(false);
  const [courses, setCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedTerm, setSelectedTerm] = useState<any>(null);
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);

  // Form State Management for Documents (Model: { fileName: String, files: [String] })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [otherCategoryName, setOtherCategoryName] = useState<string>('');
  const [categoryFiles, setCategoryFiles] = useState<Record<string, string[]>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Upload state per category
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocs, setPreviewDocs] = useState([]);
  const [previewStudent, setPreviewStudent] = useState('');

  // --- Base Data Fetching ---
  const fetchData = async (page: number, limit: number, search = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/verification`, {
        params: { page, limit, ...(search ? { searchTerm: search } : {}) }
      });
      setVerifications(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error fetching data',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
    fetchCourses();
    fetchTerms();
  }, [currentPage, entriesPerPage]);

  // --- Step 1 Application Data Fetching ---
  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/courses?status=1&limit=all');
      const data = res.data.data.result || [];
      setCourses(data.map((c: any) => ({ value: c._id, label: c.name })));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get('/terms?&limit=all');
      const data = res.data.data.result || [];
      setTerms(data.map((t: any) => ({ value: t._id, label: t.termName })));
    } catch (error) {
      console.error('Error fetching Terms:', error);
    }
  };

  const handleAppSearch = async () => {
    try {
      setLoadingApps(true);
      setHasSearchedApps(true);
      const params: any = { page: 1, limit: 'all' };
      if (selectedCourse?.value) params.courseId = selectedCourse.value;
      if (selectedTerm?.value) params.intakeId = selectedTerm.value;
      if (appSearchTerm) params.searchTerm = appSearchTerm;

      const res = await axiosInstance.get('/application-course', { params });
      setApplications(res.data.data.result || []);
    } catch (error) {
      console.error('Error fetching student applications:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAppSearch();
  };

  const selectStudentAndProceed = (app: any) => {
    setSelectedStudent(app);
    setDialogStep(2);
  };

  // --- Document & Category Management ---
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
      // Optionally clean up files if category is deselected
      setCategoryFiles((prev) => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      if (category === 'Other') setOtherCategoryName('');
    } else {
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File must be less than 20MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploadingCategory(categoryKey);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file_type', 'verification');
      uploadFormData.append('file', file);

      const response = await axiosInstance.post('/documents', uploadFormData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
          }
        }
      });

      if (
        response.status === 200 &&
        response.data?.success &&
        response.data.data?.fileUrl
      ) {
        const fileUrl = response.data.data.fileUrl.trim();
        setCategoryFiles((prev) => ({
          ...prev,
          [categoryKey]: [...(prev[categoryKey] || []), fileUrl]
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploadingCategory(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveDocument = (categoryKey: string, fileIndex: number) => {
    setCategoryFiles((prev) => {
      const updatedFiles = [...(prev[categoryKey] || [])];
      updatedFiles.splice(fileIndex, 1);
      return { ...prev, [categoryKey]: updatedFiles };
    });
  };

  // --- Form Submission ---
  const onSubmit = async () => {
    setFormError(null);

    // Build the documents payload
    const documentsPayload: { fileName: string; files: string[] }[] = [];

    for (const cat of selectedCategories) {
      const isOther = cat === 'Other';
      const actualCatName = isOther ? otherCategoryName.trim() : cat;
      const files = categoryFiles[cat] || [];

      if (isOther && !actualCatName) {
        setFormError('Please specify a name for the "Other" document type.');
        return;
      }

      if (files.length === 0) {
        setFormError(
          `Please upload at least one file for the "${actualCatName || cat}" category.`
        );
        return;
      }

      documentsPayload.push({
        fileName: actualCatName,
        files: files
      });
    }

    if (documentsPayload.length === 0) {
      setFormError(
        'Please select at least one document category and upload files.'
      );
      return;
    }

    try {
      const dataToSend = {
        name: editingVerification
          ? editingVerification.name
          : `${selectedStudent.studentId?.firstName || ''} ${selectedStudent.studentId?.lastName || ''}`.trim(),
        studentId: editingVerification
          ? editingVerification.studentId
          : selectedStudent.studentId?._id,
        dob: editingVerification
          ? editingVerification.dob
          : format(
              new Date(selectedStudent.studentId?.dateOfBirth),
              'dd-MM-yyyy'
            ),
        applicationId: editingVerification
          ? editingVerification.applicationId
          : selectedStudent._id,
        documents: documentsPayload
      };

      let response;
      if (editingVerification) {
        response = await axiosInstance.patch(
          `/verification/${editingVerification._id}`,
          dataToSend
        );
        setVerifications((prev: any) =>
          prev.map((item: any) =>
            item._id === editingVerification._id
              ? { ...item, ...response.data.data }
              : item
          )
        );
        fetchData(currentPage, entriesPerPage);
      } else {
        response = await axiosInstance.post('/verification', dataToSend);
          fetchData(currentPage, entriesPerPage);
      }

      toast({
        title: response?.data?.message || 'Record saved successfully',
        className: 'bg-watney border-none text-white'
      });

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(
        `/verification/${verificationToDelete._id}`
      );
      if (response.data && response.data.success) {
        setVerifications((prev) =>
          prev.filter((item: any) => item._id !== verificationToDelete._id)
        );
        toast({
          title: 'Record deleted successfully',
          className: 'bg-watney border-none text-white'
        });
      }
    } catch (error) {
      toast({ title: 'Error deleting record', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setVerificationToDelete(null);
    }
  };

  const resetForm = () => {
    setEditingVerification(null);
    setDialogStep(1);
    setSelectedStudent(null);
    setAppSearchTerm('');
    setSelectedCourse(null);
    setSelectedTerm(null);
    setApplications([]);
    setHasSearchedApps(false);
    setSelectedCategories([]);
    setOtherCategoryName('');
    setCategoryFiles({});
    setFormError(null);
  };

  const handleEdit = (verification: any) => {
    setEditingVerification(verification);

    // Parse existing documents back into state
    const docs = verification.documents || [];
    const predefinedCats = [
      'Offer letters',
      'Certificates & qualifications',
      'Admission correspondence'
    ];
    const activeCategories: string[] = [];
    const parsedFiles: Record<string, string[]> = {};
    let parsedOtherName = '';

    docs.forEach((doc: any) => {
      if (predefinedCats.includes(doc.fileName)) {
        activeCategories.push(doc.fileName);
        parsedFiles[doc.fileName] = doc.files;
      } else {
        activeCategories.push('Other');
        parsedOtherName = doc.fileName;
        parsedFiles['Other'] = doc.files;
      }
    });

    setSelectedCategories(activeCategories);
    setOtherCategoryName(parsedOtherName);
    setCategoryFiles(parsedFiles);

    setDialogStep(2); // Skip to step 2
    setDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'dd-MM-yyyy');
    } catch {
      return dateStr;
    }
  };


  const requiredDocs = [
  "Offer letters",
  "Certificates & qualifications",
  "Admission correspondence"
];

  const CustomDocumentModal = ({
    isOpen,
    onClose,
    documents,
    studentName
  }: any) => {
    if (!isOpen) return null;

    const REQUIRED_CATEGORIES = [
      'Offer letters',
      'Certificates & qualifications',
      'Admission correspondence'
    ];

    // 1. Find extra documents (those not in the REQUIRED_CATEGORIES)
    const extraDocs = (documents || []).filter(
      (doc: any) =>
        !REQUIRED_CATEGORIES.some(
          (req) => req.toLowerCase() === doc.fileName?.toLowerCase()
        )
    );

    // 2. Combine the standard 3 categories with any extra ones found
    const combinedDocs = [
      ...REQUIRED_CATEGORIES.map((reqCat) => {
        const found = (documents || []).find(
          (d: any) => d.fileName?.toLowerCase() === reqCat.toLowerCase()
        );
        return {
          fileName: reqCat,
          files: found ? found.files : []
        };
      }),
      ...extraDocs
    ];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl duration-200 animate-in fade-in zoom-in">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-50 p-4">
            <h3 className="font-bold text-gray-900">
              Documents: {studentName}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
            {combinedDocs.map((docGroup: any, idx: number) => {
              const hasFiles = docGroup.files && docGroup.files.length > 0;

              return (
                <div
                  key={idx}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-watney">
                    {docGroup.fileName}
                  </p>
                  
                  <div className="space-y-2">
                    {hasFiles ? (
                      docGroup.files.map((fileUrl: string, fileIdx: number) => {
                        // Clean file name logic from your source
                        const displayName = fileUrl.replace(
                          /^https:\/\/storage\.googleapis\.com\/watney\/[^-]+-/,
                          ''
                        );
                        return (
                          <a
                            key={fileIdx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 p-2 transition-colors hover:bg-blue-100"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-watney" />
                              <span className="max-w-[250px] truncate text-sm font-medium">
                                {docGroup.files.length > 1
                                  ? `Document ${fileIdx + 1}: `
                                  : ''}
                                {displayName}
                              </span>
                            </div>
                            <span className="rounded bg-watney px-2 py-0.5 text-[10px] text-white ">
                              View
                            </span>
                          </a>
                        );
                      })
                    ) : (
                      // Fallback UI when no files are found for this specific category
                      <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-3 text-sm italic text-gray-500">
                         No document found
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4">
            <Button
              onClick={onClose}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Student Verification</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name"
              className="h-8 min-w-[300px]"
            />
            <Button
              onClick={() => fetchData(1, entriesPerPage, searchTerm)}
              size="sm"
              className="min-w-[100px] border-none bg-watney text-white hover:bg-watney/90"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Verification
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification: any) => (
                <TableRow key={verification._id}>
                  <TableCell className="align-middle">
                    <div className="font-semibold text-gray-900">
                      {verification?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {verification?.applicationId?.studentId?.email || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    {verification?.applicationId?.courseId?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="align-middle">
                    {verification?.applicationId?.intakeId?.termName || 'N/A'}
                  </TableCell>
                  <TableCell className="align-middle">
                    {verification?.applicationId?.studentId?.dateOfBirth
                      ? formatDate(
                          verification.applicationId.studentId.dateOfBirth
                        )
                      : verification?.dob || 'N/A'}
                  </TableCell>
                  <TableCell className="align-middle">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
                      onClick={() => {
                        setPreviewDocs(verification.documents);
                        setPreviewStudent(verification.name);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      View Documents
                    </Button>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="bg-watney text-white hover:bg-watney/90"
                        size="icon"
                        onClick={() => handleEdit(verification)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="bg-red-500 text-white hover:bg-red-600"
                        size="icon"
                        onClick={() => {
                          setVerificationToDelete(verification);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <CustomDocumentModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          documents={previewDocs}
          studentName={previewStudent}
        />
        {verifications.length > 20 && (
          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Wizard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={clsx('h-[90vh] max-h-[94vh] transition-all sm:max-w-6xl')}
        >
          <DialogHeader>
            <DialogTitle>
              {editingVerification ? 'Edit Verification' : `New Verification`}
            </DialogTitle>
            <DialogDescription>
              {dialogStep === 1
                ? 'Search and select a student application.'
                : 'Provide verification details and upload documents.'}
            </DialogDescription>
          </DialogHeader>

          {dialogStep === 1 && !editingVerification && (
            <div className="space-y-4 py-4">
              <div className="flex flex-row items-center gap-4 rounded-md bg-slate-50 ">
                <Input
                  type="text"
                  value={appSearchTerm}
                  onChange={(e) => setAppSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by student name, email"
                  className="h-9 w-[300px] rounded-sm bg-white"
                />
                <div className="w-[200px]">
                  <Select
                    options={courses}
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    placeholder="Filter by course"
                    isClearable
                    className="text-sm"
                  />
                </div>
                <div className="w-[200px]">
                  <Select
                    options={terms}
                    value={selectedTerm}
                    onChange={setSelectedTerm}
                    placeholder="Filter by term"
                    isClearable
                    className="text-sm"
                  />
                </div>
                <Button
                  onClick={handleAppSearch}
                  size="sm"
                  variant={'default'}
                  className="h-9 bg-watney text-white hover:bg-watney/90"
                >
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>

              <div className="h-[500px] overflow-y-auto rounded-md border bg-white">
                {!hasSearchedApps && !loadingApps ? (
                  <div className="flex h-full min-h-[200px] items-center justify-center text-gray-500">
                    Enter search criteria and click Search to find students.
                  </div>
                ) : (
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingApps ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center">
                            <BlinkingDots color="bg-black" />
                          </TableCell>
                        </TableRow>
                      ) : applications.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-gray-500"
                          >
                            No applications found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((app: any) => (
                          <TableRow
                            key={app._id}
                            className="transition-colors hover:bg-slate-50"
                          >
                            <TableCell className="font-medium">
                              {app?.refId || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-gray-900">
                                {app.studentId?.firstName}{' '}
                                {app.studentId?.lastName}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {app.studentId?.email ?? 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>{app.courseId?.name ?? 'N/A'}</TableCell>
                            <TableCell>
                              {app.intakeId?.termName ?? 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={clsx(
                                  'capitalize',
                                  app?.status === 'applied' &&
                                    'bg-blue-500 text-white',
                                  app?.status === 'approved' &&
                                    'bg-green-500 text-white',
                                  app?.status === 'cancelled' &&
                                    'bg-red-500 text-white'
                                )}
                              >
                                {app?.status === 'approved'
                                  ? 'Enrolled'
                                  : app?.status === 'cancelled'
                                    ? 'Rejected'
                                    : app?.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => selectStudentAndProceed(app)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {dialogStep === 2 && (
            <div className="space-y-3">
              {/* Selected Student Read-Only Summary */}
              {selectedStudent && !editingVerification && (
                <div className="grid grid-cols-4 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800">
                      Student Name:
                    </div>
                    <div>
                      {selectedStudent.studentId?.firstName}{' '}
                      {selectedStudent.studentId?.lastName}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">DOB:</span>
                    <span>
                      {formatDate(selectedStudent.studentId?.dateOfBirth)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">Course:</span>
                    <span>{selectedStudent.courseId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">Term:</span>
                    <span>{selectedStudent.intakeId?.termName || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Edit Verification Read-Only Summary */}
              {editingVerification && (
                <div className="grid grid-cols-4 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800">
                      Student Name:
                    </div>
                    <div>{editingVerification.name}</div>
                    <div className="text-xs text-gray-500">
                      {editingVerification?.applicationId?.studentId?.email ||
                        'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">DOB:</span>
                    <span>{editingVerification.dob || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">Course:</span>
                    <span>
                      {editingVerification?.applicationId?.courseId?.name ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">Term:</span>
                    <span>
                      {editingVerification?.applicationId?.intakeId?.termName ||
                        'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Error Display */}
              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Document Selection and Upload */}
              <div className="space-y-2">
                <div className="space-y-2 border-b pb-4">
                  <Label className="text-base font-semibold">
                    Select Document Types to Upload
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        htmlFor={`checkbox-${cat}`}
                        className="flex cursor-pointer items-center space-x-2 rounded border bg-slate-50 p-2 hover:bg-slate-100"
                      >
                        <Checkbox
                          id={`checkbox-${cat}`}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <span className="text-sm font-medium leading-none">
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dynamic Upload Zones */}
                <div className="h-[34vh] space-y-4 overflow-y-auto pr-2">
                  {selectedCategories.length === 0 && (
                    <p className="text-sm italic text-gray-500">
                      Select at least one document type above to start
                      uploading.
                    </p>
                  )}

                  {selectedCategories.map((cat) => {
                    const isOther = cat === 'Other';
                    const categoryKey = cat;

                    return (
                      <div
                        key={categoryKey}
                        className="rounded-md border bg-white p-4 shadow-sm"
                      >
                        <div className="mb-3">
                          <Label className="text-md font-semibold text-black">
                            {isOther ? 'Other Document Type' : cat}
                          </Label>
                          {isOther && (
                            <div className="mt-2">
                              <Input
                                placeholder="Specify document name (e.g., Passport, Resume)"
                                value={otherCategoryName}
                                onChange={(e) =>
                                  setOtherCategoryName(e.target.value)
                                }
                                className="h-9 max-w-md"
                              />
                            </div>
                          )}
                        </div>

                        <FileUploadArea
                          uploadState={{ selectedDocument: null, fileName: '' }}
                          uploadingFile={uploadingCategory === categoryKey}
                          uploadProgress={
                            uploadingCategory === categoryKey
                              ? uploadProgress
                              : 0
                          }
                          uploadError={null}
                          onFileChange={(e) => handleFileChange(e, categoryKey)}
                          onRemoveFile={(index) =>
                            handleRemoveDocument(categoryKey, index)
                          }
                          uploadedFiles={(categoryFiles[categoryKey] || []).map(
                            (url) => ({
                              fileName: url.replace(
                                /^https:\/\/storage\.googleapis\.com\/watney\/[^-]+-/,
                                ''
                              ),
                              url
                            })
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="!flex w-full !flex-row !items-center !justify-between">
                {!editingVerification && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogStep(1)}
                  >
                    Back
                  </Button>
                )}

                <div className="ml-auto flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    className="hover:bg-watney-90 bg-watney text-white"
                  >
                    {editingVerification
                      ? 'Update Verification'
                      : 'Submit Verification'}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this verification record?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
