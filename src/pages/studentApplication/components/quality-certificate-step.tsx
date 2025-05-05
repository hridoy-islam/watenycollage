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
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';

// Enhanced schema with additional fields for each document type
const documentsSchema = z.object({
  
  hasCertificates: z.boolean().optional(),
  certificatesDetails: z.string().optional(),
  qualificationCertificates: z.any().optional(),

  cvResume: z.any().optional(),

  hasProofOfAddress: z.boolean().optional(),
  proofOfAddressType: z.string().optional(),
  proofOfAddressDate: z.string().optional(),
  proofOfAddress: z.any().optional(),

  otherDocuments: z.any().optional(),
  otherDocumentsDescription: z.string().optional()
});

type DocumentsData = z.infer<typeof documentsSchema>;



export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}: any) {
  const [idDocuments, setIdDocuments] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [cvResume, setCvResume] = useState<File[]>([]);
  const [proofOfAddress, setProofOfAddress] = useState<File[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<File[]>([]);

  const form = useForm<DocumentsData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      hasDocument: false,
      hasCertificates: false,
      hasProofOfAddress: false,
      ...defaultValues
    }
  });

  const hasCertificates = form.watch('hasCertificates');
  const hasProofOfAddress = form.watch('hasProofOfAddress');

  function onSubmit(data: DocumentsData) {
    data.qualificationCertificates = certificates;
    data.cvResume = cvResume;
    data.proofOfAddress = proofOfAddress;
    data.otherDocuments = otherDocuments;

    onSaveAndContinue(data);
  }

  // function handleSave() {
  //   const data = form.getValues() as DocumentsData;
  //   data.idDocument = idDocuments;
  //   data.qualificationCertificates = certificates;
  //   data.cvResume = cvResume;
  //   data.proofOfAddress = proofOfAddress;
  //   data.otherDocuments = otherDocuments;

  //   onSave(data);
  // }


  function handleBack() {
    setCurrentStep(8);
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
        <div>
          <CardContent className="space-y-6">
            <h2 className="mb-4 text-xl font-semibold">Required Documents</h2>
            <p className="mb-4 text-sm text-gray-600">
              Please upload the following documents and provide the required
              information. Accepted formats are PDF, JPG, PNG, and DOC/DOCX.
            </p>
           

            {/* Uploaded Documents Table */}
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
                        <TableCell>
                          {hasDocument ? 'Passport' : 'ID Document'}
                        </TableCell>
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
                    {cvResume.map((file, index) => (
                      <TableRow key={`cv-${index}`}>
                        <TableCell>CV/Resume</TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(cvResume, setCvResume, index)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {proofOfAddress.map((file, index) => (
                      <TableRow key={`address-${index}`}>
                        <TableCell>Proof of Address</TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(
                                proofOfAddress,
                                setProofOfAddress,
                                index
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {otherDocuments.map((file, index) => (
                      <TableRow key={`other-${index}`}>
                        <TableCell>Other Document</TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>
                          {(file.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFile(
                                otherDocuments,
                                setOtherDocuments,
                                index
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </div>

        <div className="flex justify-between px-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
}
