import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Form, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { FileUpload } from './file-upload';

// Schema for validation
const documentSchema = z.object({
  documents: z.array(
    z.object({
      title: z.string(),
      file: z.any().optional()
    })
  )
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface DocumentsStepProps {
  defaultValues?: any;
  onSaveAndContinue: (data: any) => void;
  setCurrentStep: (step: number) => void;
}

const guidelines: Record<string, string> = {
  'Passport / ID': "Make sure it's clear and both sides are visible.",
  'CV (Curriculum Vitae)':
    'PDF format preferred. Include work experience and education.',
  'Proof of Address':
    'Must be recent (within last 3 months). Utility bill or bank statement only.',
  'Photograph': 'Recent passport-sized photo (white background recommended).'
};


export function DocumentsStep({
  defaultValues,
  onSaveAndContinue,
  setCurrentStep
}: DocumentsStepProps) {
  const [documents, setDocuments] = useState<
    Array<{ title: string; file: File | null }>
  >([
    { title: 'Passport / ID', file: null },
    { title: 'CV (Curriculum Vitae)', file: null },
    { title: 'Proof of Address', file: null },
    { title: 'Photograph', file: null },
    { title: 'Signature', file: null }
  ]);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: defaultValues || {
      documents: []
    }
  });

  const onSubmit = (data: DocumentFormValues) => {
    onSaveAndContinue({
      ...data,
      documents: documents.filter((doc) => doc.file)
    });
  };

  const handleBack = () => {
    setCurrentStep(6);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updatedDocs = [...documents];
    updatedDocs[index].file = file;
    setDocuments(updatedDocs);
  };

  const removeDocument = (index: number) => {
    const updatedDocs = [...documents];
    updatedDocs.splice(index, 1);
    setDocuments(updatedDocs);
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <h2 className="text-xl font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Please upload all required documents. You can add multiple documents
          as needed.
        </p>
        <div className="mt-4 text-sm">
          <p className="font-medium">Required Documents:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Passport / ID</strong>
            </li>
            <li>
              <strong>CV</strong> (Curriculum Vitae)
            </li>
            <li>
              <strong>Proof of Address</strong> (e.g., utility bill, bank
              statement)
            </li>
            <li>
              <strong>Photograph</strong> (Recent passport-sized photo)
            </li>
          </ul>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
            {/* Document Upload Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {documents.map((doc, index) => (
                <FormItem key={index}>
                  <FormLabel>{doc.title}</FormLabel>
                  <FileUpload
                    id={`document-upload-${index}`}
                    onFilesSelected={(files) =>
                      handleFileChange(index, files[0] || null)
                    }
                    accept={
                      doc.title.includes('Photograph')
                        ? '.jpg,.jpeg,.png'
                        : '.pdf,.jpg,.jpeg,.png,.doc,.docx'
                    }
                    buttonLabel={`Upload ${doc.title}`}
                  />
                  {doc.file && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {doc.file.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {guidelines[doc.title]}
                  </p>
                </FormItem>
              ))}
            </div>
            <div>
              {/* Uploaded Documents Table */}
              {documents.filter((doc) => doc.file).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents
                      .filter((doc) => doc.file)
                      .map((doc, index) => (
                        <TableRow key={index}>
                          <TableCell>{doc.title}</TableCell>
                          <TableCell>{doc.file?.name}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:bg-red-500 hover:text-white"
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

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="bg-watney text-white hover:bg-watney/90"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-watney text-white hover:bg-watney/90"
                disabled={documents.every((doc) => !doc.file)}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
