import { useEffect, useState } from 'react';
import {
  Plus,
  Pen,
  MoveLeft,
  Check,
  Copy,
  FileText,
  User,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import axiosInstance from '@/lib/axios';
import { Upload as UploadIcon } from 'lucide-react';
import FileUploadArea from './components/FileUploadArea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

// Zod validation schema
const verificationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  documents: z.array(z.string()).min(1, 'At least one document is required')
});

type FormData = z.infer<typeof verificationSchema>;

export default function StudentVerificationPage() {
  const [verifications, setVerifications] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVerification, setEditingVerification] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verificationToDelete, setVerificationToDelete] = useState(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);

  // Form state with validation
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      name: '',
      studentId: '',
      documents: []
    }
  });

  // Watch documents array to validate required condition
  const watchedDocuments = watch('documents');

  // Upload state
  const [uploadState, setUploadState] = useState({
    selectedDocument: null,
    fileName: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const fetchData = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/verification`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setVerifications(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: 'Error fetching data',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingFile(true);
    setUploadProgress(0);

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'File must be less than 20MB.',
        variant: 'destructive'
      });
      setUploadingFile(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file_type', 'verification'); // Adjust as needed
      uploadFormData.append('file', file);

      const response = await axiosInstance.post('/documents', uploadFormData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (
        response.status === 200 &&
        response.data?.success &&
        response.data.data?.fileUrl
      ) {
        const fileUrl = response.data.data.fileUrl.trim();

        setUploadState({
          selectedDocument: fileUrl,
          fileName: file.name
        });

        // Add to form data documents array
        setValue('documents', [...(watchedDocuments || []), fileUrl]);
        // toast({
        //   title: 'Success',
        //   description: 'Document uploaded successfully!'
        // });
      } else {
        throw new Error('Upload failed: Invalid API response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload document. Please try again.');
      // toast({
      //   title: 'Upload failed',
      //   description: 'Could not upload your document.',
      //   variant: 'destructive'
      // });
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = watchedDocuments.filter((_, i) => i !== index);
    setValue('documents', updatedDocuments);

    // Also update upload state if needed
    if (index === 0) {
      // Simplified for single file
      setUploadState({
        selectedDocument: null,
        fileName: ''
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let response;
      const dataToSend = {
        ...data,
        documents: data.documents || []
      };

      if (editingVerification) {
        response = await axiosInstance.patch(
          `/verification/${editingVerification._id}`,
          dataToSend
        );

        // Update the verification in the state
        setVerifications((prev) =>
          prev.map((item) =>
            item._id === editingVerification._id
              ? { ...item, ...response.data.data }
              : item
          )
        );
      } else {
        response = await axiosInstance.post('/verification', dataToSend);

        // Add the new verification to the state
        setVerifications((prev) => [response.data.data, ...prev]);
      }

      if (response.data && response.data.success === true) {
        toast({
          title: response.data.message || 'Record saved successfully',
          className: 'bg-watney border-none text-white'
        });
      } else if (response.data && response.data.success === false) {
        toast({
          title: response.data.message || 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-red-500 border-none text-white'
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(
        `/verification/${verificationToDelete._id}`
      );

      if (response.data && response.data.success === true) {
        // Remove the deleted verification from the state
        setVerifications((prev) =>
          prev.filter((item) => item._id !== verificationToDelete._id)
        );

        toast({
          title: response.data.message || 'Record deleted successfully',
          className: 'bg-watney border-none text-white'
        });
      } else {
        toast({
          title: response.data.message || 'Delete operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while deleting. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setDeleteDialogOpen(false);
      setVerificationToDelete(null);
    }
  };

  const resetForm = () => {
    reset({ name: '', studentId: '', documents: [] });
    setUploadState({ selectedDocument: null, fileName: '' });
    setEditingVerification(null);
  };

  const handleEdit = (verification) => {
    setEditingVerification(verification);
    reset({
      name: verification.name,
      studentId: verification.studentId,
      documents: verification.documents || []
    });

    // Set the first document for display if available
    if (verification.documents && verification.documents.length > 0) {
      setUploadState({
        selectedDocument: verification.documents[0],
        fileName: 'Uploaded Document' // You might want to get the actual filename from the backend
      });
    } else {
      setUploadState({ selectedDocument: null, fileName: '' });
    }

    setDialogOpen(true);
  };

  const handleDeleteClick = (verification) => {
    setVerificationToDelete(verification);
    setDeleteDialogOpen(true);
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Student Verification</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name or Student ID"
              className="h-8 min-w-[300px]"
            />
            <Button
              onClick={handleSearch}
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
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification: any) => (
                <TableRow key={verification._id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    {verification?.name}
                  </TableCell>
                  <TableCell>{verification?.studentId}</TableCell>
                  <TableCell>
                    {verification?.documents &&
                    verification.documents.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {verification.documents.map(
                          (doc: string, index: number) => {
                            const displayName = doc.replace(
                              /^https:\/\/storage\.googleapis\.com\/watney\/[^-]+-/,
                              ''
                            );

                            return (
                              <span key={index}>
                                <a
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {displayName}
                                </a>
                                {index < verification.documents.length - 1 && (
                                  <span>,{  }</span>
                                )}
                              </span>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No documents</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="space-x-2 border-none bg-watney text-white hover:bg-watney/90"
                        size="icon"
                        onClick={() => handleEdit(verification)}
                      >
                        <Pen className="h-4 w-4 " />
                      </Button>
                      <Button
                        variant="ghost"
                        className="border-none bg-red-500 text-white hover:bg-red-600"
                        size="icon"
                        onClick={() => handleDeleteClick(verification)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="h-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editingVerification ? 'Edit Verification' : 'New Verification'}
            </DialogTitle>
            <DialogDescription>
              {editingVerification
                ? 'Update the verification details'
                : 'Add a new student verification'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
                <Label htmlFor="name" className="text-right">
                  Student Name <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    {...register('name')}
                    className={`col-span-3 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
                <Label htmlFor="studentId" className="text-right">
                  Student ID <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="studentId"
                    {...register('studentId')}
                    className={`col-span-3 ${errors.studentId ? 'border-red-500' : ''}`}
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.studentId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-4">
                <Label className="pt-2 text-right">Documents</Label>
                <div className="col-span-3">
                  <FileUploadArea
                    uploadState={uploadState}
                    uploadingFile={uploadingFile}
                    uploadProgress={uploadProgress}
                    uploadError={uploadError}
                    onFileChange={handleFileChange}
                    onRemoveFile={handleRemoveDocument}
                    uploadedFiles={watchedDocuments.map((doc, index) => {
                      // Clean up the display name from the GCS URL
                      const displayName = doc.replace(
                        /^https:\/\/storage\.googleapis\.com\/watney\/[^-]+-/,
                        ''
                      );

                      return {
                        fileName: displayName,
                        url: doc
                      };
                    })}
                  />
                  {errors.documents && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.documents.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
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
                type="submit"
                className="border-none bg-watney text-white hover:bg-watney/90"
              >
                {editingVerification ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this verification record? This
              action cannot be undone.
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
