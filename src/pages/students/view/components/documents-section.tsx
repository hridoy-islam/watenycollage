import { useEffect, useState } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { DocumentDialog } from './document-dialog';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Checkbox } from '@/components/ui/checkbox';

export function DocumentsSection({
  student,
  documents,
  setHasRequiredDocuments,
  fetchDocuments,
  onSave
}) {
  // const [documents, setDocuments] = useState<any>([])
  const [noDcouments, setNoDcouments] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  // useEffect(() => {
  //   const hasRequiredDocuments = ['work experience', 'qualification'].some(
  //     (type) => documents.some((doc) => doc.file_type === type)
  //   );
  //   setHasRequiredDocuments(hasRequiredDocuments);
  // }, [documents, setHasRequiredDocuments]);

  useEffect(() => {
    const hasRequiredDocuments = ['work experience', 'qualification'].some(
      (type) => documents.some((doc) => doc.file_type === type)
    );

    setHasRequiredDocuments(hasRequiredDocuments || student?.noDocuments);
  }, [documents, student]);

  // Handle document upload
  const handleUpload = () => {
    setDialogOpen(false); // Close the dialog
    fetchDocuments(); // Refresh the documents list
  };

  // Handle document delete
  const handleDelete = async (docid) => {
    try {
      await axios.delete(
        `https://core.qualitees.co.uk/api/documents/${docid}`,
        {
          headers: {
            'x-company-token': 'admissionhubz-0123' // Add the custom header
          }
        }
      );
      setDeleteDialog(null); // Close the delete confirmation dialog
      fetchDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error deleting the document:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [student.id]); // Re-fetch data if student.id changes

  const handleNoDocument = (checked) => {
    setNoDcouments(checked);
    onSave({ noDcouments: checked });
  };

  return (
    <div className="space-y-4 rounded-md p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button
          className="bg-supperagent text-white hover:bg-supperagent"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="noDcoument"
          checked={noDcouments}
          onCheckedChange={(checked) => handleNoDocument(checked)}
        />
        <label htmlFor="noExperience">No Document Required</label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!Array.isArray(documents) || documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No documents uploaded
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium capitalize">
                  {doc.file_type}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Link
                        to={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleUpload}
        initialData={student.id}
      />

      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-supperagent text-white hover:bg-supperagent"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
