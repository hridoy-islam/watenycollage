import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  FileText,
  Calendar,
  User,
  Download,
  MoveLeft,
  X,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useSelector } from 'react-redux';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface Assignment {
  _id: string;
  applicationId: string;
  studentId: string;
  assignmentName: string;
  document: string;
  createdAt: string;
  updatedAt: string;
}

function AssignmentPage() {
  const { id: applicationId } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // State management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignmentName, setAssignmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState({
    selectedDocument: '',
    fileName: ''
  });

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 5MB

  // Fetch assignments
  const fetchAssignments = async (page = 1, limit = 100) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/assignment`, {
        params: {
          applicationId,
          page,
          limit
        }
      });

      const data = response.data.data.result;
      setAssignments(data || []);
      setTotalPages(response.data.data?.meta?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingFile(true);
    setUploadProgress(0);

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File must be less than 5MB.',
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    const allowedTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
    if (!isValidType) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image, PDF, or Word document.',
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('entityId', user?._id);
      formData.append('file_type', 'careerDoc');
      formData.append('file', file);

      const response = await axiosInstance.post('/documents', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });

      // ✅ Correct check for your API structure
      if (
        response.status === 200 &&
        response.data?.success &&
        response.data.data?.fileUrl
      ) {
        const fileUrl = response.data.data.fileUrl.trim(); // 🔥 Trim whitespace!
        setUploadState({
          selectedDocument: fileUrl,
          fileName: file.name
        });
        toast({
          title: 'Success',
          description: 'Document uploaded successfully!'
        });
      } else {
        throw new Error('Upload failed: Invalid API response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload document. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'Could not upload your document.',
        variant: 'destructive'
      });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // Submit assignment
  const handleSubmitAssignment = async () => {
    if (!assignmentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an assignment name.',
        variant: 'destructive'
      });
      return;
    }

    if (!uploadState.selectedDocument) {
      toast({
        title: 'Error',
        description: 'Please upload a document.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/assignment', {
        applicationId,
        studentId: user._id,
        assignmentName,
        document: uploadState.selectedDocument
      });

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully!'
      });

      // Reset form and refresh data
      setAssignmentName('');
      setUploadState({ selectedDocument: '', fileName: '' });
      setDialogOpen(false);
      fetchAssignments(currentPage, entriesPerPage);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchAssignments(page, entriesPerPage);
  };

  const handlePageSizeChange = (size: number) => {
    setEntriesPerPage(size);
    fetchAssignments(1, size);
  };

  // Load assignments on component mount
  useEffect(() => {
    if (applicationId) {
      fetchAssignments(currentPage, entriesPerPage);
    }
  }, [applicationId]);

  const handleDownload = (fileUrl: string, assignmentName: string) => {
    if (!fileUrl) {
      toast({
        title: 'Error',
        description: 'No document available to download.',
        variant: 'destructive'
      });
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl.trim();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-stretch space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Assignment Submissions
          </h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto"
              onClick={() => navigate(-1)}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {user.role === 'student' && (
              <DialogTrigger asChild>
                <Button className="w-full justify-center bg-watney text-white hover:bg-watney/90 sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
            )}
          </div>

          <DialogContent className="sm:max-w-md z-[9999]">
            <DialogHeader>
              <DialogTitle>Submit New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-name">Assignment Title</Label>
                <Input
                  id="assignment-name"
                  placeholder="Enter assignment title..."
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Document Upload Section - Inline */}
              <div className="space-y-2">
                <Label>Document</Label>
                <div className="flex w-full flex-col items-stretch gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex-1 bg-watney text-white hover:bg-watney/90"
                    disabled={uploadingFile}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {uploadState.selectedDocument
                      ? 'Change Document'
                      : 'Upload Document'}
                  </Button>

                  {uploadState.selectedDocument && (
                    <div className="flex items-center justify-between p-2 bg-gray-200 rounded-md">
                      <a
                        href={uploadState.selectedDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm font-medium text-black hover:underline focus:outline-none focus:ring-2 focus:ring-watney"
                      >
                        <div className='flex flex-row items-center gap-2'>

                        <File className='h-4 w-4 '/>{uploadState.fileName || 'Document uploaded'}
                        </div>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the link
                          setUploadState({
                            selectedDocument: '',
                            fileName: ''
                          });
                          if (fileInputRef.current)
                            fileInputRef.current.value = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {uploadingFile && (
                    <div className="text-center text-sm text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </div>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse justify-between gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setUploadState({ selectedDocument: '', fileName: '' });
                    setAssignmentName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={submitting || uploadingFile}
                  className="w-full bg-watney text-white hover:bg-watney/90 sm:w-auto"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignments Table */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4">
          <h1 className="flex items-center font-semibold">
            <FileText className="mr-2 h-5 w-5" />
            {user.role === 'admin'
              ? `${assignments[0]?.studentId?.title ?? ''} ${assignments[0]?.studentId?.firstName ?? ''} ${assignments[0]?.studentId?.initial ?? ''} ${assignments[0]?.studentId?.lastName ?? ''}'s Submissions`
              : 'Your Submissions'}
          </h1>
        </div>
        <div className="">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                No assignments
              </h3>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Assignment Name
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Submitted Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="whitespace-nowrap">
                              {assignment.assignmentName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(
                              new Date(assignment.createdAt),
                              'dd MMM, yyyy'
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleDownload(
                                assignment.document,
                                assignment.assignmentName
                              )
                            }
                            className="bg-watney text-white hover:bg-watney/90"
                          >
                            <div className="flex flex-row items-center gap-2">
                              <Download className="h-4 w-4" />
                              Download
                            </div>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {assignments.length > 8 && (
                <div className="mt-4 w-full max-md:flex max-md:scale-75 max-md:justify-center">
                  <DataTablePagination
                    pageSize={entriesPerPage}
                    setPageSize={handlePageSizeChange}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignmentPage;
