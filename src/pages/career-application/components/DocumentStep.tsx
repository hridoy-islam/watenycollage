import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define document types
const DOCUMENT_TYPES = [
  'ID',
  'CV',
  'Proof of Address',
  'Qualification',
  'Reference',
  'Cover Letter',
  'Other'
] as const;

// Extend schema to handle custom documents
const documentSchema = z.object({
  documents: z.array(z.object({
    type: z.enum(DOCUMENT_TYPES),
    file: z.instanceof(File).optional(),
    customTitle: z.string().optional(),
  }))
});

type DocumentFormValues = z.infer<typeof documentSchema>;



export function DocumentStep({   defaultValues,
  onSaveAndContinue,
  setCurrentStep }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documents:  [],
      ...defaultValues
    }
  });

  const onSubmit = (data: DocumentFormValues) => {
    onSaveAndContinue(data);
  };

   function handleBack() {
    setCurrentStep(7);
  }
  const handleFileChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      field.onChange(e.target.files[0]);
    }
  };

  const addDocument = (data: { type: string, file: File, customTitle?: string }) => {
    const currentDocuments = form.getValues('documents') || [];
    form.setValue('documents', [...currentDocuments, {
      type: data.type as any,
      file: data.file,
      customTitle: data.customTitle
    }]);
    setOpenDialog(false);
    setSelectedDocumentType('');
  };

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues('documents') || [];
    form.setValue('documents', currentDocuments.filter((_, i) => i !== index));
  };

  return (
    <Card className='border-none shadow-none'>
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
                  <Button type="button" variant="outline" className="mb-4 bg-watney hover:bg-watney/90">
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
                      <Select
                        value={selectedDocumentType}
                        onValueChange={(value) => setSelectedDocumentType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className='hover:bg-gray-800 hover:text-white'>
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
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (selectedDocumentType === 'Other') {
                                  // For "Other" type, we'll handle in the dialog
                                } else {
                                  addDocument({
                                    type: selectedDocumentType,
                                    file: file
                                  });
                                }
                              }
                            }}
                          />
                        </FormItem>

                        {selectedDocumentType === 'Other' && (
                          <FormItem >
                            <FormLabel>Document Title</FormLabel>
                            <Textarea
                            className='border-gray-300'
                              placeholder="Enter document title"
                              onChange={(e) => {
                                // We'll handle this when saving
                              }}
                            />
                          </FormItem>
                        )}

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                              const file = fileInput?.files?.[0];
                              if (file) {
                                addDocument({
                                  type: selectedDocumentType,
                                  file: file,
                                  customTitle: selectedDocumentType === 'Other' 
                                    ? (document.querySelector('textarea')?.value || 'Other Document')
                                    : undefined
                                });
                              }
                            }}
                            className='bg-watney text-white hover:bg-watney/90'
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
              {form.watch('documents')?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch('documents').map((doc, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {doc.customTitle || doc?.type} ({doc?.file?.name})
                        </TableCell>
                        <TableCell>{doc?.type}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            type="button"
                            variant="default"
                            size="icon"
                            onClick={() => removeDocument(index)}
                            className='hover:bg-red-500 text-red-500 hover:text-white'
                          >
                            <Trash2 className="h-4 w-4 " />
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
                disabled={form.watch('documents')?.length === 0}
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