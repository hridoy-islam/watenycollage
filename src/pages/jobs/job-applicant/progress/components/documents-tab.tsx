import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Eye,
  Upload,
  FileText,
  CheckCircle,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Pencil
} from "lucide-react"
import { Label } from "@/components/ui/label"
import Select from "react-select"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"

const PROOF_TYPE_LABELS: Record<string, string> = {
  bankStatement: "Bank Statement",
  utilityBill: "Utility Bill",
  drivingLicense: "Driving License"
}

const PROOF_TYPE_OPTIONS = [
  { value: "bankStatement", label: "Bank Statement" },
  { value: "utilityBill", label: "Utility Bill" },
  { value: "drivingLicense", label: "Driving License" }
]

interface DocumentField {
  id: string
  label: string
  required: boolean
  formats: string
  isArray?: boolean
  subtypeField?: string
  maxFiles?: number
}

const documentFields: DocumentField[] = [
  { id: "cvResume", label: "CV / Resume", required: true, formats: "PDF, DOC, DOCX", maxFiles: 1 },
  { id: "idDocuments", label: "Proof of ID", required: true, formats: "PDF, JPG, PNG", isArray: true },
  { id: "image", label: "Photograph", required: true, formats: "JPG, PNG", maxFiles: 1 },
  {
    id: "proofOfAddress1",
    label: "Proof of Address 1",
    required: true,
    formats: "PDF, JPG, PNG",
    subtypeField: "proofOfAddress1Type",
    maxFiles: 1
  },
  {
    id: "proofOfAddress2",
    label: "Proof of Address 2",
    required: true,
    formats: "PDF, JPG, PNG",
    subtypeField: "proofOfAddress2Type",
    maxFiles: 1
  },
  { id: "proofOfNI", label: "National Insurance", required: true, formats: "PDF, JPG, PNG", isArray: true },
  { id: "immigrationDocument", label: "Immigration Details / Work Permit", required: false, formats: "PDF, JPG, PNG", isArray: true },
  { id: "rtwDocument", label: "Right to Work Document", required: false, formats: "PDF, JPG, PNG", maxFiles: 1 },
  { id: "shareCodeDocument", label: "Share Code Document", required: false, formats: "PDF, JPG, PNG", maxFiles: 1 }
]

interface DocumentsTabProps {
  application: any
  userId?: string
  onUpdate?: () => void
}

export function DocumentsTab({ application, userId, onUpdate }: DocumentsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [selectedProofType, setSelectedProofType] = useState<{ value: string; label: string } | null>(null)
  const [proofTypeError, setProofTypeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getDocumentValue = (fieldId: string): string | string[] => {
    const value = application?.[fieldId]
    if (value === undefined || value === null) return ""
    return value
  }

  const isDocumentUploaded = (fieldId: string): boolean => {
    const value = getDocumentValue(fieldId)
    if (typeof value === "string") return !!value
    return Array.isArray(value) && value.length > 0
  }

  const hasUploadedDocuments = documentFields.some((doc) => isDocumentUploaded(doc.id))

  const getProofTypeLabel = (fieldId: string): string | null => {
    if (fieldId === "proofOfAddress1" && application?.proofOfAddress1Type) {
      return PROOF_TYPE_LABELS[application.proofOfAddress1Type] || application.proofOfAddress1Type
    }
    if (fieldId === "proofOfAddress2" && application?.proofOfAddress2Type) {
      return PROOF_TYPE_LABELS[application.proofOfAddress2Type] || application.proofOfAddress2Type
    }
    return null
  }

  const handleOpenDialog = (fieldId: string) => {
    const field = documentFields.find(f => f.id === fieldId)
    setSelectedField(fieldId)
    setFileToUpload(null)
    setUploadedFileUrl(null)
    setUploadError(null)
    setProofTypeError(null)
    
    // Set initial proof type if it exists
    if (field?.subtypeField && application?.[field.subtypeField]) {
      const currentValue = application[field.subtypeField]
      const option = PROOF_TYPE_OPTIONS.find(opt => opt.value === currentValue)
      setSelectedProofType(option || null)
    } else {
      setSelectedProofType(null)
    }
    
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedField(null)
      setFileToUpload(null)
      setUploadedFileUrl(null)
      setUploadError(null)
      setSelectedProofType(null)
      setProofTypeError(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const validateFile = (file: File): boolean => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be less than 5MB.")
      return false
    }
    return true
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedField || !userId) return

    if (!validateFile(file)) return

    // Validate proof type selection for address documents
    const field = documentFields.find(f => f.id === selectedField)
    if (field?.subtypeField && !selectedProofType?.value) {
      setProofTypeError("Please select a proof type first")
      return
    }

    setFileToUpload(file)
    setUploadError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append("entityId", userId)
    formData.append("file_type", "careerDoc")
    formData.append("file", file)

    try {
      const res = await axiosInstance.post("/documents", formData)
      const fileUrl = res.data?.data?.fileUrl
      if (!fileUrl) throw new Error("No file URL returned")
      setUploadedFileUrl(fileUrl)
    } catch (err) {
      console.error("Upload failed:", err)
      setUploadError("Failed to upload document. Please try again.")
      setFileToUpload(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitDocument = async () => {
    if (!uploadedFileUrl || !selectedField || !userId) return

    // Validate proof type selection for address documents
    const field = documentFields.find(f => f.id === selectedField)
    if (field?.subtypeField && !selectedProofType?.value) {
      setProofTypeError("Please select a proof type first")
      return
    }

    try {
      const payload: Record<string, any> = { jobApplicationId: application?._id }

      if (field?.isArray) {
        // For array fields, replace the entire array with just the new file
        payload[selectedField] = [uploadedFileUrl]
      } else {
        // For single file fields, update the value
        payload[selectedField] = uploadedFileUrl
      }

      // Add proof type if applicable
      if (field?.subtypeField && selectedProofType?.value) {
        payload[field.subtypeField] = selectedProofType.value
      }

      await axiosInstance.patch(`/users/${userId}`, payload)
      toast.success("Document uploaded successfully")
      handleDialogClose(false)
      onUpdate?.()
    } catch (err) {
      console.error("Save failed:", err)
      toast.error("Failed to save document. Please try again.")
    }
  }

  const handleRemoveFile = async (fieldId: string, fileUrl?: string) => {
    if (!userId) return

    try {
      const field = documentFields.find((f) => f.id === fieldId)
      const payload: Record<string, any> = { jobApplicationId: application?._id }

      if (field?.isArray) {
        const currentValue = getDocumentValue(fieldId)
        const newArray = Array.isArray(currentValue)
          ? currentValue.filter((url: string) => url !== fileUrl)
          : []
        payload[fieldId] = newArray
      } else {
        payload[fieldId] = ""
        // Clear proof type if removing address document
        if (field?.subtypeField) {
          payload[field.subtypeField] = ""
        }
      }

      await axiosInstance.patch(`/users/${userId}`, payload)
      toast.success("Document removed successfully")
      onUpdate?.()
    } catch (err) {
      console.error("Remove failed:", err)
      toast.error("Failed to remove document. Please try again.")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDropZoneClick = () => {
    // Validate proof type before allowing file selection
    if (selectedFieldData?.subtypeField && !selectedProofType?.value) {
      setProofTypeError("Please select a proof type first")
      return
    }
    triggerFileInput()
  }

  const renderDocumentFiles = (fieldId: string) => {
    const value = getDocumentValue(fieldId)
    if (!value) return null

    const files = Array.isArray(value) ? value : [value]

    return (
      <div className="mt-2 space-y-2">
        {files.map((fileUrl: string, index: number) => {
          const fileName = decodeURIComponent(fileUrl.split("/").pop() || `File-${index}`)
          return (
            <div
              key={`${fileUrl}-${index}`}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{fileName}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const selectedFieldData = documentFields.find((f) => f.id === selectedField)

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: proofTypeError ? '#ef4444' : state.isFocused ? '#6b7280' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #6b7280' : 'none',
      '&:hover': {
        borderColor: proofTypeError ? '#ef4444' : '#9ca3af'
      },
      minHeight: '40px',
      borderRadius: '0.375rem'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#1a56db' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af'
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-base font-bold text-black">Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {hasUploadedDocuments ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black">Document Type</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black">Status</TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentFields.map((doc, i) => {
                  const uploaded = isDocumentUploaded(doc.id)
                  const proofLabel = getProofTypeLabel(doc.id)
                  const value = getDocumentValue(doc.id)
                  const files = value ? (Array.isArray(value) ? value : [value]) : []

                  return (
                    <TableRow
                      key={doc.id}
                      className={`${i !== documentFields.length - 1 ? "border-b border-gray-200" : ""}`}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-black">
                              {doc.label}
                              {proofLabel && doc.id.startsWith("proofOfAddress") && (
                                <span className="ml-1 text-xs text-gray-500">({proofLabel})</span>
                              )}
                            </span>
                            {doc.required && <span className="ml-1 text-red-500">*</span>}
                            <p className="text-xs text-gray-500">{doc.formats}</p>
                          </div>
                        </div>
                        {/* {uploaded && renderDocumentFiles(doc.id)} */}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {uploaded ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 px-2.5 py-1 rounded">
                            <CheckCircle className="h-3.5 w-3.5" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Not uploaded</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {uploaded ? (
                            <>
                              {/* View Button */}
                              {files.map((fileUrl: string, index: number) => (
                                <Button
                                  key={`view-${index}`}
                                  size="sm"
                                  className="h-8 px-3 text-xs font-medium"
                                  onClick={() => window.open(fileUrl, "_blank")}
                                  title="View Document"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-2" />View
                                </Button>
                              ))}
                              
                              {/* Update Button */}
                              <Button
                                size="sm"
                                variant={'outline'}
                                onClick={() => handleOpenDialog(doc.id)}
                                title="Update Document"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              
                              {/* Delete Button */}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-3 text-xs font-medium"
                                onClick={() => {
                                  if (doc.isArray) {
                                    // For array fields, delete all files
                                    files.forEach((fileUrl: string) => handleRemoveFile(doc.id, fileUrl))
                                  } else {
                                    handleRemoveFile(doc.id)
                                  }
                                }}
                                title="Delete Document"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-watney text-white hover:bg-watney/90 h-8 px-4 text-xs font-medium rounded"
                              onClick={() => handleOpenDialog(doc.id)}
                            >
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">Upload documents to complete the application.</p>
              <Button
                className="mt-4 bg-watney text-white hover:bg-watney/90"
                onClick={() => handleOpenDialog("cvResume")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isDocumentUploaded(selectedField || "") ? "Update" : "Upload"} {selectedFieldData?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedFieldData?.required && (
              <p className="text-sm text-gray-600">
                Accepted formats: {selectedFieldData.formats} (Max 5MB)
              </p>
            )}

            {/* Proof Type Selector for Address Documents */}
            {selectedFieldData?.subtypeField && (
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Proof Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  options={PROOF_TYPE_OPTIONS}
                  value={selectedProofType}
                  onChange={(option) => {
                    setSelectedProofType(option as { value: string; label: string } | null)
                    setProofTypeError(null)
                  }}
                  placeholder="Select proof type..."
                  isClearable
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {proofTypeError && (
                  <p className="mt-1 text-sm text-red-500">{proofTypeError}</p>
                )}
              </div>
            )}

            <div>
              <Label className="mb-2 block text-sm font-medium">Select File</Label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              <div
                onClick={handleDropZoneClick}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                  isUploading
                    ? "border-blue-300 bg-blue-50"
                    : uploadedFileUrl
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:border-watney hover:bg-watney/5"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-gray-900">Uploading...</p>
                    <p className="mt-1 text-xs text-gray-600">Please wait</p>
                  </div>
                ) : uploadedFileUrl ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="mb-2 h-8 w-8 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">File Uploaded Successfully!</p>
                    <p className="mt-1 max-w-full truncate text-xs text-gray-600">
                      {fileToUpload?.name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFileToUpload(null)
                        setUploadedFileUrl(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="mt-2"
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">Click to select file</p>
                    <p className="mt-1 text-xs text-gray-600">Max file size: 5MB</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mt-2 flex items-center rounded bg-red-50 p-2 text-sm text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDocument}
              disabled={!uploadedFileUrl || isUploading}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {isDocumentUploaded(selectedField || "") ? "Update Document" : "Submit Document"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}