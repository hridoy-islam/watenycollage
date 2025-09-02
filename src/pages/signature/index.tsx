import React, { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Clipboard, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';

// Types
interface Signature {
  _id: string;
  signatureId: number;
  name: string;
  documentUrl: string;
}

const signatureSchema = z.object({
  name: z.string().min(1, 'Signature name is required'),
  documentUrl: z.string().optional(),
});

type SignatureFormValues = z.infer<typeof signatureSchema>;

export default function SignaturePage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<Signature | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const form = useForm<SignatureFormValues>({
    resolver: zodResolver(signatureSchema),
    defaultValues: { name: '', documentUrl: '' }
  });

  // Fetch signatures
  const fetchSignatures = async (page = 1, limit = 10) => {
    try {
      setInitialLoading(true);
      const params = { page, limit };
      const response = await axiosInstance.get('/signature', { params });
      setSignatures(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Failed to fetch signatures', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  useEffect(() => {
    if (!dialogOpen) {
      setUploadFile(null);
      setPreviewUrl(null);
    }
  }, [dialogOpen]);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setPreviewUrl(null);
    const fileInput = document.getElementById('signature-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (signature: Signature) => {
    setEditingSignature(signature);
    form.reset({ name: signature.name, documentUrl: signature.documentUrl });
    setPreviewUrl(signature.documentUrl);
    setDialogOpen(true);
  };

  const onSubmit = async (data: SignatureFormValues) => {
    setLoading(true);
    try {
      let fileUrl = data.documentUrl;

      if (uploadFile) {
        const formData = new FormData();
        formData.append('entityId', user._id);
        formData.append('file_type', 'signatureDoc');
        formData.append('file', uploadFile);

        const documentResponse = await axiosInstance.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        fileUrl = documentResponse.data?.data?.fileUrl;
      }

      const signatureData = { name: data.name, documentUrl: fileUrl };
      let response;

      if (editingSignature) {
        response = await axiosInstance.patch(`/signature/${editingSignature._id}`, signatureData);
      } else {
        const maxId = signatures.reduce((max, sig) => Math.max(max, sig.signatureId), 0);
        response = await axiosInstance.post('/signature', {
          ...signatureData,
          signatureId: maxId + 1
        });
      }

      if (response.data.success) {
        setDialogOpen(false);
        setEditingSignature(null);
        setUploadFile(null);
        setPreviewUrl(null);
        form.reset();
        fetchSignatures(currentPage, entriesPerPage);
      }
    } catch (error) {
      console.error('Failed to save signature', error);
    } finally {
      setLoading(false);
    }
  };

const handleCopy = (id: number) => {
  const formatted = `[signature id="${id}"]`;
  navigator.clipboard.writeText(formatted);
  setCopiedId(id);
  setTimeout(() => setCopiedId(null), 1000);
};

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Signatures</h1>
        <div className="flex gap-4">
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="bg-watney text-white hover:bg-watney/90"
            size="sm"
            onClick={() => {
              setEditingSignature(null);
              form.reset({ name: '', documentUrl: '' });
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Signature
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : signatures.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">No signatures found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signature Name</TableHead>
                <TableHead>Signature ID</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatures.map((sig) => (
                <TableRow key={sig._id}>
                  <TableCell>{sig.name}</TableCell>
                 <TableCell className="flex items-center gap-2">
  <span className="font-mono text-sm">{`[signature id="${sig.signatureId}"]`}</span>
  <Button
    variant="ghost"
    size="icon"
    className="p-1"
    onClick={() => handleCopy(sig.signatureId)}
  >
    {copiedId === sig.signatureId ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <Copy className="h-4 w-4" />
    )}
  </Button>
</TableCell>


                  <TableCell>
                    {sig.documentUrl ? (
                      <a
                        href={sig.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {sig.documentUrl.match(/\.(pdf)$/i) ? (
                          <span>📄 View PDF</span>
                        ) : (
                          <img
                            src={sig.documentUrl}
                            alt="Signature"
                            className="h-12"
                          />
                        )}
                      </a>
                    ) : (
                      <span className="text-gray-400">No document</span>
                    )}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-watney text-white hover:bg-watney/90"
                      onClick={() => handleEdit(sig)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingSignature(null);
            form.reset();
            setUploadFile(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSignature ? 'Edit Signature' : 'Add New Signature'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Dr. Jane Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Upload Signature Document</FormLabel>
                <p className="mb-2 text-xs text-gray-500">
                  Upload a PNG, JPG, or PDF file (recommended: transparent PNG for best results)
                </p>

                {!uploadFile && !previewUrl ? (
                  <label
                    htmlFor="signature-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:bg-gray-50"
                  >
                    <input
                      id="signature-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <svg
                      className="mb-2 h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">
                      Click to upload (PNG, JPG, PDF)
                    </span>
                  </label>
                ) : (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {uploadFile ? uploadFile.name : 'Existing file'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={handleRemoveFile}
                      >
                        Remove
                      </Button>
                    </div>

                    {previewUrl && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 rounded border bg-white object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-watney text-white hover:bg-watney/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      {editingSignature ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editingSignature ? 'Update' : 'Save'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
