import type React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FileUpload } from './file-upload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

const documentsSchema = z.object({
  idDocument: z.any().optional(),
  qualificationCertificates: z.any().optional(),
  cvResume: z.any().optional(),
  proofOfAddress: z.any().optional(),
  otherDocuments: z.any().optional()
});

type DocumentsData = z.infer<typeof documentsSchema>;

interface DocumentsStepProps {
  defaultValues?: Partial<DocumentsData>;
  onSaveAndContinue: (data: DocumentsData) => void;
  onSave: (data: DocumentsData) => void;
}

export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: DocumentsStepProps) {
  const [idDocuments, setIdDocuments] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [cvResume, setCvResume] = useState<File[]>([]);
  const [proofOfAddress, setProofOfAddress] = useState<File[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);

  const form = useForm<DocumentsData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      // Default values would be handled differently for files
    }
  });

  function onSubmit(data: DocumentsData) {
    // In a real app, you would handle file uploads differently
    data.idDocument = idDocuments;
    data.qualificationCertificates = certificates;
    data.cvResume = cvResume;
    data.proofOfAddress = proofOfAddress;
    data.otherDocuments = otherDocuments;

    onSaveAndContinue(data);
  }

  function handleSave() {
    const data = form.getValues() as DocumentsData;
    data.idDocument = idDocuments;
    data.qualificationCertificates = certificates;
    data.cvResume = cvResume;
    data.proofOfAddress = proofOfAddress;
    data.otherDocuments = otherDocuments;

    onSave(data);
  }

  const removeFile = (
    fileList: File[],
    setFileList: React.Dispatch<React.SetStateAction<File[]>>,
    index: number
  ) => {
    const newFiles = [...fileList];
    newFiles.splice(index, 1);
    setFileList(newFiles);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <h2 className="mb-4 text-xl font-semibold">Required Documents</h2>
            <p className="mb-4 text-sm text-gray-600">
              Please upload the following documents. Accepted formats are PDF,
              JPG, PNG, and DOC/DOCX.
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="idDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ID Document (Passport/National ID){' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        id="id-document"
                        onFilesSelected={setIdDocuments}
                        accept=".pdf,.jpg,.jpeg,.png"
                        buttonLabel="Upload ID Document"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualificationCertificates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Qualification Certificates{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        id="certificates"
                        onFilesSelected={setCertificates}
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        buttonLabel="Upload Certificates"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvResume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV/Resume</FormLabel>
                    <FormControl>
                      <FileUpload
                        id="cv-resume"
                        onFilesSelected={setCvResume}
                        accept=".pdf,.doc,.docx"
                        buttonLabel="Upload CV/Resume"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proofOfAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Proof of Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        id="proof-of-address"
                        onFilesSelected={setProofOfAddress}
                        accept=".pdf,.jpg,.jpeg,.png"
                        buttonLabel="Upload Proof of Address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otherDocuments"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Other Supporting Documents</FormLabel>
                    <FormControl>
                      <FileUpload
                        id="other-documents"
                        onFilesSelected={setOtherDocuments}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        multiple
                        buttonLabel="Upload Other Documents"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(idDocuments.length > 0 ||
              certificates.length > 0 ||
              cvResume.length > 0 ||
              proofOfAddress.length > 0 ||
              otherDocuments.length > 0) && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium">Uploaded Documents</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idDocuments.map((file, index) => (
                      <TableRow key={`id-${index}`}>
                        <TableCell>ID Document</TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(idDocuments, setIdDocuments, index)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {certificates.map((file, index) => (
                      <TableRow key={`cert-${index}`}>
                        <TableCell>Certificate</TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(certificates, setCertificates, index)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Similar rows for other document types */}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
}
