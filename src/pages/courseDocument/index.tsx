import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Upload,
  File as FileIcon,
  X,
  Loader2,
  Edit,
  Plus,
  Trash,
  MoveLeft
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface CourseDocument {
  _id: string;
  documentTitle: string;
  documents: string[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadedFile {
  url: string;
  name: string;
  file: File;
}

const CourseDocumentPage = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<CourseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [documentTitle, setDocumentTitle] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit state
  const [editingDocument, setEditingDocument] = useState<CourseDocument | null>(
    null
  );
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const navigate = useNavigate();

  // Fetch documents
  const fetchDocuments = async (page, entriesPerPage) => {
    try {
      const response = await axiosInstance.get(
        `/course-document?courseId=${courseId}`
      );
      if (response.data.success) {
        setDocuments(response.data.data.result);
        setTotalPages(response.data.data.meta.totalPage);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchDocuments(currentPage, entriesPerPage);
    }
  }, [courseId, currentPage, entriesPerPage]);

  // Handle file selection and auto-upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add files to uploading state
    setUploadingFiles((prev) => [...prev, ...files.map((f) => f.name)]);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('entityId', courseId || '');
        formData.append('file_type', 'course_document');
        formData.append('file', file);

        const response = await axiosInstance.post('/documents', formData);
        if (response.data?.success && response.data.data?.fileUrl) {
          const fileUrl = response.data.data.fileUrl.trim();
          const fileName = getFileNameFromUrl(fileUrl);

          // Add to uploaded files
          setUploadedFiles((prev) => [
            ...prev,
            {
              url: fileUrl,
              name: fileName,
              file: file
            }
          ]);
        } else {
          throw new Error(`Upload failed for ${file.name}`);
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive'
        });
      } finally {
        // Remove from uploading state
        setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      }
    }

    // Reset file input
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (url: string) => {
    setExistingFiles((prev) => prev.filter((fileUrl) => fileUrl !== url));
    setFilesToRemove((prev) => [...prev, url]);
  };

  // Add new document with uploaded files
  const handleAddDocument = async () => {
    if (!documentTitle.trim() || uploadedFiles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title and at least one file.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = uploadedFiles.map((file) => file.url);
      const response = await axiosInstance.post('/course-document', {
        courseId,
        documentTitle,
        documents: uploadedUrls
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Document added successfully.'
        });
        setIsDialogOpen(false);
        resetForm();
        fetchDocuments(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add document.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Edit document
  const handleEditDocument = async () => {
    if (!editingDocument || !documentTitle.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title.',
        variant: 'destructive'
      });
      return;
    }

    // Check if we have at least one file (either existing or new)
    if (existingFiles.length === 0 && uploadedFiles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least one file.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const newFileUrls = uploadedFiles.map((file) => file.url);
      const allDocuments = [...existingFiles, ...newFileUrls];

      const response = await axiosInstance.patch(
        `/course-document/${editingDocument._id}`,
        {
          documentTitle,
          documents: allDocuments,
          filesToRemove // Send files that need to be removed from storage
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Document updated successfully.'
        });
        setIsEditDialogOpen(false);
        resetEditForm();
        fetchDocuments(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update document.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (document: CourseDocument) => {
    setEditingDocument(document);
    setDocumentTitle(document.documentTitle);
    setExistingFiles([...document.documents]);
    setUploadedFiles([]);
    setFilesToRemove([]);
    setIsEditDialogOpen(true);
  };

  // Reset forms
  const resetForm = () => {
    setDocumentTitle('');
    setUploadedFiles([]);
    setUploadingFiles([]);
  };

  const resetEditForm = () => {
    setEditingDocument(null);
    setDocumentTitle('');
    setUploadedFiles([]);
    setUploadingFiles([]);
    setExistingFiles([]);
    setFilesToRemove([]);
  };

  // Trigger delete confirmation
  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setIsDeleteDialogOpen(true);
  };

  // Perform deletion
  const handleDeleteDocument = async () => {
    if (!deleteTarget) return;

    try {
      const response = await axiosInstance.delete(
        `/course-document/${deleteTarget}`
      );
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Document deleted successfully.'
        });
        fetchDocuments(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'document');
    } catch {
      return 'document';
    }
  };

  const isFileUploading = (fileName: string) => {
    return uploadingFiles.includes(fileName);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="mx-auto rounded-xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{documents[0]?.courseId?.name} - Documents</h1>
        <div className="flex gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-watney text-white hover:bg-watney/90"
                size={'sm'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[50vh] sm:max-w-5xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="documentTitle">
                    Document Title <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentTitle"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g., Week 3 Lecture Notes"
                    disabled={uploading}
                  />
                </div>

                {/* File Upload UI */}
                <div>
                  <Label className="mb-2 block">
                    Attachments <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="file-upload"
                      className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 py-2 transition hover:bg-gray-50 ${
                        uploading ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      <span className="text-sm">
                        {uploadedFiles.length > 0
                          ? 'Add More Files'
                          : 'Upload Files'}
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <Label>Uploaded Files:</Label>
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border bg-gray-100 px-3 py-1 text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="truncate text-xs">
                                {file.file.name}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFile(index)}
                              disabled={
                                isFileUploading(file.file.name) || uploading
                              }
                              className="h-6 w-6 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                              title={
                                isFileUploading(file.file.name)
                                  ? 'File is uploading...'
                                  : 'Remove file'
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Currently Uploading Files */}
                  {uploadingFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <Label>Uploading Files:</Label>
                      <div className="flex flex-wrap gap-2">
                        {uploadingFiles.map((fileName, index) => (
                          <div
                            key={index}
                            className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs sm:w-[48%] lg:w-[32%]"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-600" />
                              <span className="truncate text-xs text-blue-700">
                                {fileName}
                              </span>
                            </div>
                            <div className="text-xs text-blue-600">
                              Uploading...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={uploading || uploadingFiles.length > 0}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddDocument}
                    disabled={
                      uploading ||
                      uploadingFiles.length > 0 ||
                      !documentTitle.trim() ||
                      uploadedFiles.length === 0
                    }
                    className="bg-watney text-white hover:bg-watney/90"
                  >
                    {uploading ? 'Saving...' : 'Save Document'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="h-[70vh] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-documentTitle">
                Document Title <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="edit-documentTitle"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Week 3 Lecture Notes"
                disabled={uploading}
              />
            </div>

            {/* Existing Files */}
            {existingFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Current Files:</Label>
                <div className="flex flex-wrap gap-2">
                  {existingFiles.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border bg-blue-50 px-3 py-1 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon className="h-3 w-3 flex-shrink-0 text-blue-600" />
                        <span className="truncate text-xs text-blue-700">
                          {getFileNameFromUrl(url)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExistingFile(url)}
                        disabled={uploading}
                        className="h-6 w-6 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                        title="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload UI for Edit */}
            <div>
              <Label className="mb-2 block">Add More Files</Label>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="edit-file-upload"
                  className={`flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 px-4 py-2 transition hover:bg-gray-50 ${
                    uploading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="text-sm">
                    {uploadedFiles.length > 0
                      ? 'Add More Files'
                      : 'Upload Additional Files'}
                  </span>
                  <Input
                    id="edit-file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Newly Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label>New Files to Add:</Label>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-green-50 px-3 py-1 text-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="truncate text-xs text-green-700">
                            {file.file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                          disabled={
                            isFileUploading(file.file.name) || uploading
                          }
                          className="h-6 w-6 flex-shrink-0 hover:bg-red-100 hover:text-red-600"
                          title={
                            isFileUploading(file.file.name)
                              ? 'File is uploading...'
                              : 'Remove file'
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Uploading Files */}
              {uploadingFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label>Uploading Files:</Label>
                  <div className="flex flex-wrap gap-2">
                    {uploadingFiles.map((fileName, index) => (
                      <div
                        key={index}
                        className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs sm:w-[48%] lg:w-[32%]"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-600" />
                          <span className="truncate text-xs text-blue-700">
                            {fileName}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600">
                          Uploading...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetEditForm();
                }}
                disabled={uploading || uploadingFiles.length > 0}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditDocument}
                disabled={
                  uploading ||
                  uploadingFiles.length > 0 ||
                  !documentTitle.trim() ||
                  (existingFiles.length === 0 && uploadedFiles.length === 0)
                }
                className="bg-watney text-white hover:bg-watney/90"
              >
                {uploading ? 'Updating...' : 'Update Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document and its files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Documents Table */}
      <div className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Title</TableHead>
              <TableHead>Files</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No documents uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell className="font-medium">
                    {doc.documentTitle}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {doc.documents.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=""
                        >
                          <Button
                            className="flex items-center gap-2 bg-watney text-white hover:bg-watney/90"
                            variant="default"
                            size="sm"
                          >
                            <FileIcon className="h-3.5 w-3.5" />
                            Document {idx + 1}
                          </Button>
                        </a>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(doc._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {documents.length > 10 && (
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
      </div>
    </div>
  );
};

export default CourseDocumentPage;
