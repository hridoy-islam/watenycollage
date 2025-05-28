"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Form, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "./file-upload"

// Define document types
const DOCUMENT_TYPES = ["ID", "CV", "Proof of Address", "Qualification", "Reference", "Cover Letter", "Other"] as const

// Extend schema to handle custom documents
const documentSchema = z.object({
  documents: z.array(
    z.object({
      type: z.enum(DOCUMENT_TYPES),
      file: z.any().optional(),
      customTitle: z.string().optional(),
    }),
  ),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentsStepProps {
  defaultValues?: any
  onSaveAndContinue: (data: any) => void
  setCurrentStep: (step: number) => void
}

export function DocumentsStep({ defaultValues, onSaveAndContinue, setCurrentStep }: DocumentsStepProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("")
  const [customTitle, setCustomTitle] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documents: [],
      ...defaultValues,
    },
  })

  const onSubmit = (data: DocumentFormValues) => {
    onSaveAndContinue(data)
  }

  function handleBack() {
    setCurrentStep(6)
  }

  const addDocument = () => {
    if (!selectedFile) return

    const currentDocuments = form.getValues("documents") || []
    form.setValue("documents", [
      ...currentDocuments,
      {
        type: selectedDocumentType as any,
        file: selectedFile,
        customTitle: selectedDocumentType === "Other" ? customTitle : undefined,
      },
    ])

    setOpenDialog(false)
    setSelectedDocumentType("")
    setCustomTitle("")
    setSelectedFile(null)
  }

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues("documents") || []
    form.setValue(
      "documents",
      currentDocuments.filter((_, i) => i !== index),
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Please upload all required documents. You can add multiple documents as needed.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Add Document Dialog */}
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="mb-4 bg-watney hover:bg-watney/90 text-white">
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="hover:bg-gray-800 hover:text-white">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>

                    {selectedDocumentType && (
                      <>
                        <FormItem>
                          <FormLabel>File</FormLabel>
                          <FileUpload
                            id="document-upload"
                            onFilesSelected={(files) => {
                              if (files && files.length > 0) {
                                setSelectedFile(files[0])
                              }
                            }}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            multiple={false}
                            buttonLabel="Upload Document"
                          />
                        </FormItem>

                        {selectedDocumentType === "Other" && (
                          <FormItem>
                            <FormLabel>Document Title</FormLabel>
                            <Textarea
                              className="border-gray-300"
                              placeholder="Enter document title"
                              value={customTitle}
                              onChange={(e) => setCustomTitle(e.target.value)}
                            />
                          </FormItem>
                        )}

                        {/* Additional fields based on document type */}
                        {selectedDocumentType === "ID" && (
                          <div className="space-y-4">
                            <FormItem>
                              <FormLabel>ID Type</FormLabel>
                              <Select defaultValue="passport">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="passport">Passport</SelectItem>
                                  <SelectItem value="nationalID">National ID</SelectItem>
                                  <SelectItem value="drivingLicense">Driving License</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                            <FormItem>
                              <FormLabel>ID Number</FormLabel>
                              <Input placeholder="Enter ID number" />
                            </FormItem>
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <Input type="date" />
                            </FormItem>
                          </div>
                        )}

                        {selectedDocumentType === "Proof of Address" && (
                          <div className="space-y-4">
                            <FormItem>
                              <FormLabel>Document Type</FormLabel>
                              <Select defaultValue="utility">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="utility">Utility Bill</SelectItem>
                                  <SelectItem value="bankStatement">Bank Statement</SelectItem>
                                  <SelectItem value="councilTax">Council Tax</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                            <FormItem>
                              <FormLabel>Issue Date</FormLabel>
                              <Input type="date" />
                            </FormItem>
                          </div>
                        )}

                        {selectedDocumentType === "Qualification" && (
                          <div className="space-y-4">
                            <FormItem>
                              <FormLabel>Qualification Title</FormLabel>
                              <Input placeholder="e.g., BSc Computer Science" />
                            </FormItem>
                            <FormItem>
                              <FormLabel>Institution</FormLabel>
                              <Input placeholder="e.g., University of Example" />
                            </FormItem>
                            <FormItem>
                              <FormLabel>Year Completed</FormLabel>
                              <Input type="number" placeholder="e.g., 2020" />
                            </FormItem>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={addDocument}
                            disabled={!selectedFile}
                            className="bg-watney text-white hover:bg-watney/90"
                          >
                            Save
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Documents Table */}
              {form.watch("documents")?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch("documents").map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {doc.customTitle || doc?.type} ({doc?.file?.name})
                        </TableCell>
                        <TableCell>{doc?.type}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(index)}
                            className="hover:bg-red-500 text-red-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No documents uploaded yet.
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                className="bg-watney text-white hover:bg-watney/90"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-watney text-white hover:bg-watney/90"
                disabled={form.watch("documents")?.length === 0}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
