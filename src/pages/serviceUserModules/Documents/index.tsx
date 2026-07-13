import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios'; 
import { 
  Trash2, 
  Plus, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Pencil,
  ExternalLink,
  Calendar,
  MoveLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import moment from 'moment';

// --- Types based on your Mongoose Model ---
type DocumentCategory = 'General' | 'Legal' | 'Finance' | 'HR' | 'Technical';

interface TServiceUserDocument {
  _id: string;
  userId: string;
  documentTitle: string; 
  category: string;
  document: string;      
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES: DocumentCategory[] = ['General', 'Legal', 'Finance', 'HR', 'Technical'];

export default function DocumentPage() {
  const { sid } = useParams<{ sid: string }>(); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [documents, setDocuments] = useState<TServiceUserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<TServiceUserDocument | null>(null);
  
  // Edit State
  const [editingDoc, setEditingDoc] = useState<TServiceUserDocument | null>(null);

  // Form States
  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  
  // File Upload States
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadedDocUrl, setUploadedDocUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Documents ---
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!sid) return;
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(`/serviceuser-documents`, {
          params: { userId: sid }
        });
        setDocuments(res.data?.data?.result || []);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [sid]);

  // --- File Validation Helper ---
  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { 
      setUploadError('File size exceeds 5MB limit.');
      return false;
    }
    return true;
  };

  // --- Handlers ---

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setDocumentTitle('');
    setCategory('');
    setUploadedDocUrl(null);
    setFileToUpload(null);
    setUploadError(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (doc: TServiceUserDocument) => {
    setEditingDoc(doc);
    setDocumentTitle(doc.documentTitle);
    setCategory(doc.category);
    setUploadedDocUrl(doc.document); // Existing URL
    setFileToUpload(null); // Reset file input
    setUploadError(null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sid) return;

    if (!validateFile(file)) return;

    setFileToUpload(file);
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('entityId', sid); 
    formData.append('file_type', 'serviceUserDoc');
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', formData);
      const url = res.data?.data?.fileUrl;
      
      if (!url) throw new Error('No file URL returned from server');
      
      setUploadedDocUrl(url);
      
      // Auto-fill title if empty and creating new
      if (!documentTitle && !editingDoc) {
        setDocumentTitle(file.name);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Upload failed. Please try again.');
      setFileToUpload(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSelectedFile = () => {
    setFileToUpload(null);
    setUploadedDocUrl(null); // CAREFUL: In edit mode, this removes the existing file link too
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    if(!isUploading) fileInputRef.current?.click();
  }

  // 2. Handle Final Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sid || !uploadedDocUrl || !documentTitle || !category) {
       setUploadError("Please complete all fields.");
       return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId: sid,
        documentTitle: documentTitle,
        category: category,
        document: uploadedDocUrl, 
      };

      if (editingDoc) {
        // --- UPDATE ---
        const res = await axiosInstance.patch(`/serviceuser-documents/${editingDoc._id}`, payload);
        const updatedDoc = res.data?.data;
        
        setDocuments(prev => prev.map(d => d._id === editingDoc._id ? updatedDoc : d));
      } else {
        // --- CREATE ---
        const res = await axiosInstance.post('/serviceuser-documents', payload);
        const newDoc = res.data?.data;
        if (newDoc) {
          setDocuments(prev => [newDoc, ...prev]);
        }
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save document:", error);
      setUploadError("Failed to save document details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if(!confirm("Are you sure you want to delete this document?")) return;
    try {
      await axiosInstance.delete(`/serviceuser-documents/${docId}`);
      setDocuments(prev => prev.filter(d => d._id !== docId));
    } catch (error) {
       console.error("Delete failed", error);
    }
  };

  return (
    <div className="w-full bg-transparent shadow-none px-0 space-y-6">
      
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
           <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Documents</h3>
        </div>
        <div className="flex items-center gap-3">
        <Button variant="default" onClick={() => window.history.back()}>
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenCreate}
              className=' shadow-sm'
            >
              <Plus className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          {/* Create/Edit Dialog */}
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDoc ? "Edit Document" : "Upload New Document"}</DialogTitle>
              <DialogDescription>
                {editingDoc ? "Update document details below." : "Fill in details and upload a file."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              
              {/* Document Title Input */}
              <div className="space-y-2">
                <Label htmlFor="documentTitle">Document Title <span className="text-red-500">*</span></Label>
                <Input
                  id="documentTitle"
                  placeholder="e.g. Care Plan 2024"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium">File Attachment <span className="text-red-500">*</span></Label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                <div
                  onClick={triggerFileInput}
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all
                    ${isUploading 
                      ? 'border-blue-300 bg-blue-50 cursor-wait' 
                      : uploadedDocUrl 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mb-2 h-10 w-10 animate-spin text-blue-500" />
                      <p className="text-sm font-medium text-blue-700">Uploading...</p>
                    </>
                  ) : uploadedDocUrl ? (
                    <>
                      <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                      <p className="text-sm font-medium text-green-700">File Attached</p>
                      {/* Show filename if new upload, otherwise show existing indicator */}
                      <p className="mt-1 text-xs text-green-600 max-w-[200px] truncate">
                        {fileToUpload?.name || "Existing File"}
                      </p>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSelectedFile();
                        }}
                        className="mt-3 h-8 text-xs text-green-700 hover:bg-green-100 hover:text-green-800"
                      >
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Click to upload</p>
                      <p className="mt-1 text-xs text-gray-500">Supported formats: PDF, DOCX, JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className='bg-theme hover:bg-theme/90'
                  disabled={isSubmitting || !uploadedDocUrl || !documentTitle || !category}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingDoc ? "Update Document" : "Save Document"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* --- Documents List --- */}
      <div className="mt-4">
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 rounded-lg border border-dashed bg-gray-50">
             <FileText className="h-10 w-10 text-gray-300 mb-2" />
             <p className="text-muted-foreground">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="rounded-md  bg-white shadow-sm overflow-hidden p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Document Title</TableHead>
                  <TableHead className="w-[20%]">Category</TableHead>
                  <TableHead className="w-[25%]">Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc._id} className="hover:bg-gray-50 transition-colors cursor-pointer"  onClick={() => setViewingDoc(doc)}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            {doc.documentTitle}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge className="font-normal">{doc.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                       {moment(doc.createdAt).format('DD MMM, YYYY')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                      
                        <Button
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(doc); }}
                          className="h-8 w-8"
                          title="Edit Document"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                          className="h-8 w-8"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* --- View Detail Modal (UPDATED UI) --- */}
      {viewingDoc && (
        <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
          <DialogContent className="sm:max-w-3xl gap-0 p-0 overflow-hidden border-0 shadow-2xl outline-none">
            
            {/* 1. Hero / Header Section */}
            <div className="bg-slate-50/80 p-10 flex flex-col items-center justify-center border-b">
              <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-theme" />
              </div>
              <DialogHeader className="mb-2">
                <DialogTitle className="text-center text-3xl font-bold text-slate-900 tracking-tight">
                  {viewingDoc.documentTitle}
                </DialogTitle>
              </DialogHeader>
              <Badge className="px-4 py-1.5 text-sm font-medium rounded-full">
                {viewingDoc.category}
              </Badge>
            </div>

            {/* 2. Details Section */}
            <div className="p-10 space-y-8 bg-white">
              <div className="grid grid-cols-1 gap-4">
                {/* Date Row */}
                <div className="flex items-center p-4 rounded-xl border bg-slate-50">
                  <div className="p-3 bg-white rounded-lg border shadow-sm text-slate-500 mr-4">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Uploaded On</span>
                    <span className="text-base font-semibold text-slate-900">
  {moment(viewingDoc.createdAt).format('DD MMM, YYYY')}
</span>
                  </div>
                </div>
              </div>

              {/* 3. Footer / Actions */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setViewingDoc(null)}
                  className="w-full text-base h-12"
                >
                  Close
                </Button>
                <Button 
                  size="lg"
                  onClick={() => window.open(viewingDoc.document, '_blank')} 
                  className="w-full bg-theme hover:bg-theme/90 text-white text-base h-12"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View File
                </Button>
              </div>
            </div>

          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}