import { useState, useEffect } from "react"
import { Plus, Pen, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { EmailDraftDialog } from "../components/email-draft-dialog"
import { BlinkingDots } from "@/components/shared/blinking-dots"

// Simulated API calls
const fetchDrafts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "1", subject: "Meeting tomorrow", body: "Let's discuss the project progress.", createdAt: new Date(), updatedAt: new Date() },
        { id: "2", subject: "Quarterly report", body: "Please find attached the quarterly report.", createdAt: new Date(), updatedAt: new Date() },
      ])
    }, 1000)
  })
}

const createDraft = async (draft)=> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...draft,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }, 500)
  })
}

const updateDraft = async (draft) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...draft,
        updatedAt: new Date(),
      })
    }, 500)
  })
}

const deleteDraft = async (id) => {
  
}

export function DraftsManager() {
  const [drafts, setDrafts] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [draftDialogOpen, setDraftDialogOpen] = useState(false)
  const [editingDraft, setEditingDraft] = useState()
  const { toast } = useToast()

  useEffect(() => {
    fetchDrafts().then((data) => {
      setDrafts(data)
      setLoading(false)
    })
  }, [])

  const handleCreateDraft = async (draft) => {
    try {
      const newDraft = await createDraft(draft)
      setDrafts([...drafts, newDraft])
      toast({ title: "Draft created successfully", className: "bg-supperagent border-none text-white" })
    } catch (error) {
      console.error("Error creating draft:", error)
      toast({ title: "Failed to create draft", variant: "destructive" })
    }
  }

  const handleUpdateDraft = async (updatedDraft) => {
    try {
      const result = await updateDraft(updatedDraft)
      setDrafts(drafts.map(draft => draft.id === result.id ? result : draft))
      toast({ title: "Draft updated successfully", className: "bg-supperagent border-none text-white" })
    } catch (error) {
      console.error("Error updating draft:", error)
      toast({ title: "Failed to update draft", variant: "destructive" })
    }
  }

  const handleDeleteDraft = async (id) => {
    try {
      await deleteDraft(id)
      setDrafts(drafts.filter(draft => draft.id !== id))
      toast({ title: "Draft deleted successfully", className: "bg-supperagent border-none text-white" })
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({ title: "Failed to delete draft", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Drafts</h2>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setDraftDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No drafts found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((draft) => (
                <TableRow key={draft.id}>
                  <TableCell>{draft.subject}</TableCell>
                  <TableCell>{draft.updatedAt.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingDraft(draft)
                        setDraftDialogOpen(true)
                      }}
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDraft(draft.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <EmailDraftDialog
        open={draftDialogOpen}
        onOpenChange={setDraftDialogOpen}
        onSubmit={editingDraft ? handleUpdateDraft : handleCreateDraft}
        initialData={editingDraft}
      />
    </div>
  )
}

