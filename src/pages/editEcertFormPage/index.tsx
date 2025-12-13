import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Eye,
  CheckCircle,
  Plus,
  Upload,
  AlertCircle,
  Loader2,
  MoveLeft,
  Trash2
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Select, { SingleValue } from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';

// Types
interface EcertOption {
  _id: string;
  title: string;
}

interface UploadedEcert {
  _id: string;
  ecertId: string | { _id: string; title: string };
  document: string;
}

export default function EditTrainingCertificatesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // State
  const [ecertOptions, setEcertOptions] = useState<EcertOption[]>([]);
  const [uploadedCerts, setUploadedCerts] = useState<UploadedEcert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog & Upload
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEcert, setSelectedEcert] = useState<SingleValue<{
    value: string;
    label: string;
  }> | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch available Certificate Types
        const ecertsRes = await axiosInstance.get(
          '/ecerts?limit=all&status=active'
        );
        const ecerts: EcertOption[] = ecertsRes.data.data.result;
        setEcertOptions(ecerts);

        // 2. Fetch User's existing uploads
        const uploadsRes = await axiosInstance.get(
          `/ecert-form?userId=${id}&limit=all`
        );
        const uploads: UploadedEcert[] = uploadsRes.data.data.result || [];
        setUploadedCerts(uploads);
        
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        toast({
            title: 'Error loading data',
            description: 'Could not fetch certificates. Please refresh.',
            variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  // --- Logic to Map Uploads to Certificate Types ---
  const uploadedMap = new Map<string, UploadedEcert[]>();

  uploadedCerts.forEach((item) => {
    const rawId = item.ecertId;
    const ecertIdString =
      typeof rawId === 'object' && rawId !== null ? rawId._id : rawId;

    if (!uploadedMap.has(ecertIdString)) {
      uploadedMap.set(ecertIdString, []);
    }
    uploadedMap.get(ecertIdString)?.push(item);
  });

  // Filter uploadable options for the Add Dialog
  // ✅ UPDATED: Now filters out options that exist in uploadedMap
  const uploadableOptions = ecertOptions
    .map((opt) => ({ value: opt._id, label: opt.title }))
    .filter((opt) => !uploadedMap.has(opt.value)); 

  // --- File Upload Helpers ---
  const validateFile = (file: File): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be less than 5MB.');
      return false;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEcert || !id) return;

    if (!validateFile(file)) return;

    setFileToUpload(file);
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('entityId', id);
    formData.append('file_type', 'trainingCert');
    formData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', formData);
      const url = res.data?.data?.fileUrl;
      if (!url) throw new Error('No file URL');
      setUploadedFileUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Upload failed. Please try again.');
      setFileToUpload(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Actions ---
  const handleSubmitDocument = async () => {
    if (!uploadedFileUrl || !selectedEcert || !id) return;

    try {
      // 1. Post new entry
      const res = await axiosInstance.post('/ecert-form', {
        userId: id,
        ecertId: selectedEcert.value,
        document: uploadedFileUrl
      });
      
      // Get the real ID from response if possible, or use temp ID
      const newId = res.data?.data?._id || Date.now().toString();

      // 2. Update Local State
      const newUploadedCert: UploadedEcert = {
        _id: newId,
        ecertId: selectedEcert.value,
        document: uploadedFileUrl
      };
      setUploadedCerts((prev) => [...prev, newUploadedCert]);

      // 3. Reset UI
      setIsDialogOpen(false);
      setSelectedEcert(null);
      setUploadedFileUrl(null);
      setFileToUpload(null);
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // 4. Update User Profile Status
      await axiosInstance.patch(`/users/${id}`, { ecertDone: true });

      toast({
        title: 'Certificate Added',
        description: 'Your training certificate has been saved successfully.',
      });

    } catch (err: any) {
      console.error('Failed to save certificate:', err);
      toast({
        title: 'Submission Failed',
        description: err?.response?.data?.message || 'Failed to link certificate.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDocument = async (recordId: string) => {
    if (!confirm("Are you sure you want to remove this certificate?")) return;

    try {
      await axiosInstance.delete(`/ecert-form/${recordId}`);

      // Remove from state
      setUploadedCerts((prev) => prev.filter(item => item._id !== recordId));

      toast({
        title: 'Removed',
        description: 'Certificate removed successfully.',
      });
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete certificate.',
        variant: 'destructive'
      });
    }
  };

  // --- Render Helpers ---
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleRemoveSelectedFile = () => {
    setFileToUpload(null);
    setUploadedFileUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasUploaded = uploadedCerts.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Training Certificates
                </h1>
                <p className="mt-1 text-gray-500">
                  Manage and upload your professional training eCertificates.
                </p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <Button
                  className="border-none bg-watney text-white hover:bg-watney/90"
                  onClick={() => navigate(-1)}
                >
                  <MoveLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {/* Add Certificate Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-watney text-white shadow-md hover:bg-watney/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Certificate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Certificate</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="mb-2 block text-sm font-medium">
                          Certificate Type
                        </Label>
                        <Select
                          value={selectedEcert}
                          onChange={setSelectedEcert}
                          options={uploadableOptions}
                          placeholder="Select type..."
                          noOptionsMessage={() => "No more certificates available"}
                        />
                      </div>

                      {selectedEcert && (
                        <div className="duration-200 animate-in fade-in zoom-in-95">
                          <Label className="mb-2 block text-sm font-medium">
                            Document File
                          </Label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <div
                            onClick={triggerFileInput}
                            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all
                              ${
                                isUploading
                                  ? 'border-blue-300 bg-blue-50'
                                  : uploadedFileUrl
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:border-watney hover:bg-watney/5'
                              }
                            `}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mb-2 h-10 w-10 animate-spin text-blue-500" />
                                <p className="text-sm font-medium text-blue-700">
                                  Uploading...
                                </p>
                              </>
                            ) : uploadedFileUrl ? (
                              <>
                                <CheckCircle className="mb-2 h-10 w-10 text-green-500" />
                                <p className="text-sm font-medium text-green-700">
                                  Upload Complete
                                </p>
                                <p className="mt-1 text-xs text-green-600">
                                  {fileToUpload?.name}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSelectedFile();
                                  }}
                                  className="mt-2 h-8 text-xs text-green-700 hover:bg-green-100"
                                >
                                  Change File
                                </Button>
                              </>
                            ) : fileToUpload ? (
                              <>
                                <FileText className="mb-2 h-10 w-10 text-blue-500" />
                                <p className="text-sm font-medium text-blue-700">
                                  Ready to Upload
                                </p>
                                <p className="mt-1 text-xs text-blue-600">
                                  {fileToUpload.name}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                                  <Upload className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  Click to upload
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  PDF, JPG or PNG (max 5MB)
                                </p>
                              </>
                            )}
                          </div>

                          {uploadError && (
                            <div className="mt-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              {uploadError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitDocument}
                        disabled={!uploadedFileUrl || isUploading}
                        className="bg-watney text-white hover:bg-watney/90"
                      >
                        Confirm
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {hasUploaded ? (
              <div className="space-y-6">
                {ecertOptions.map((ecert) => {
                  const files = uploadedMap.get(ecert._id) || [];

                  if (files.length === 0) return null;

                  return (
                    <div
                      key={ecert._id}
                      className="group flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all hover:bg-gray-50 hover:shadow-lg sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4 sm:mb-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ecert.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {files.map((fileRecord, idx) => (
                          <div
                            key={`${ecert._id}-${idx}`}
                            className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 shadow-sm gap-4"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 text-watney" />
                              <span className="max-w-[150px] truncate text-sm text-gray-600">
                                Document
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {/* View Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(fileRecord.document, '_blank')}
                                className="h-8 w-8 p-0 text-gray-500 hover:bg-watney/10 hover:text-watney"
                                title="View Document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {/* Delete Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(fileRecord._id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                title="Remove Document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No certificates uploaded
                </h3>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}