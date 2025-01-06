import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Eye, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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

const documentTypes = [
  {
    id: 'passport',
    label: 'Passport',
    description: 'Valid passport document',
    acceptedFiles: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'bank-statement',
    label: 'Bank Statement / Proof of Address',
    description: 'Recent bank statement or proof of address',
    acceptedFiles: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'qualification',
    label: 'Qualification',
    description: 'Educational certificates and transcripts',
    acceptedFiles: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'work-experience',
    label: 'Work Experience',
    description: 'Work experience letters and certificates',
    acceptedFiles: '.pdf,.jpg,.jpeg,.png',
  },
  {
    id: 'cv',
    label: 'CV',
    description: 'Current CV',
    acceptedFiles: '.pdf,.doc,.docx',
  },
]


export function DocumentsSection({ student, onDocumentUpdate }) {
  const [documents, setDocuments] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)

  const handleUpload = () => {
    setDialogOpen(false); // Close the dialog
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
    setDeleteDialog(null)
  }

  const handleStatusChange = async (id: string, status: boolean) => {
    setLoadingStatus(id)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setDocuments(documents.map(doc =>
      doc.id === id ? { ...doc, status } : doc
    ))
    setLoadingStatus(null)
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
            <TableHead>File Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No documents uploaded
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => {
              const documentType = documentTypes?.find(t => t.id === doc.type)
              return (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {/* {documentType} */}
                  </TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>
                    {format(new Date(doc.uploadDate), "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell className="text-center">
                    {loadingStatus === doc.id ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      <Switch
                        checked={doc.status}
                        onCheckedChange={(checked) => handleStatusChange(doc.id, checked)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"

                      >
                        <Eye className="w-4 h-4" />
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
              )
            })
          )}
        </TableBody>
      </Table>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleUpload}
        inititalData={student.id}
      />



      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
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
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

