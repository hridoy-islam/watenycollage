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
import axiosInstance from "../../../../lib/axios"; 

export function DocumentsSection({ student, onDocumentUpdate }) {
  const [documents, setDocuments] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const handleUpload = () => {
    setDialogOpen(false); // Close the dialog
    if (onDocumentUpdate) {
      onDocumentUpdate();
    }
  };

  const handleDelete = async(id) => {
    
    try {
      await axiosInstance.delete(`/documents/${id}`);
      if (onDocumentUpdate) {
        onDocumentUpdate();
      }
      // Close the delete confirmation dialog
      setDeleteDialog(null);
    } catch (error) {
      console.error("Error deleting the document:", error);
      // Optionally, you can show an error message to the user
    }
  }



  useEffect(() => {
    if (Array.isArray(student.documents)) {
      setDocuments(student.documents);
    }
  }, [student.documents]);

  return (
        <div className="space-y-4">
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
              {documents.length === 0 ? (
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

