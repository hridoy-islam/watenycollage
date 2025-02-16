import { useEffect, useState } from "react"
import { Eye, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DocumentDialog } from "./document-dialog"
import { Link } from "react-router-dom"
import axios from "axios"

export function DocumentsSection({ student, setHasRequiredDocuments }) {
  const [documents, setDocuments] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  // Fetch documents data
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `https://core.qualitees.co.uk/api/documents?where=entity_id,${student.id}&exclude=file_type,profile`,
        {
          headers: {
            "x-company-token": "admissionhubz-0123", // Add the custom header
          },
        }
      );

      setDocuments(response.data.result); // Assuming the API returns an array of documents
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };
   // Check if at least one required document exists
   useEffect(() => {
    const hasRequiredDocuments = ["work experience", "qualification"].some((type) =>
      documents.some((doc) => doc.file_type === type)
    );
    setHasRequiredDocuments(hasRequiredDocuments);
  }, [documents, setHasRequiredDocuments]);

  // Handle document upload
  const handleUpload = () => {
    setDialogOpen(false); // Close the dialog
    fetchData(); // Refresh the documents list
  };

  // Handle document delete
  const handleDelete = async(docid) => {
    try {
      await axios.delete(
        `https://core.qualitees.co.uk/api/documents/${docid}`,
        {
          headers: {
            "x-company-token": "admissionhubz-0123", // Add the custom header
          },
        }
      );
      setDeleteDialog(null); // Close the delete confirmation dialog
      fetchData(); // Refresh the documents list
    } catch (error) {
      console.error("Error deleting the document:", error);
    }
  };



  useEffect(() => {
    fetchData();
  }, [student.id]); // Re-fetch data if student.id changes

  return (
    <div className="space-y-4 rounded-md shadow-md p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Button className="bg-supperagent text-white hover:bg-supperagent" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </Button>
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
                      <Link to={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-supperagent text-white hover:bg-supperagent" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}