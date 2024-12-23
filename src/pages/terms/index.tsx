import { useState } from "react"
import { Plus, Pen } from 'lucide-react'
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
import { TermDialog } from "./components/term-dialog"

const initialTerms = [
  { id: 1, name: "Term 1", academicYear: "2021-2022", active: true },
  { id: 2, name: "Term 2", academicYear: "2021-2022", active: true },
  { id: 3, name: "Term 3", academicYear: "2021-2022", active: true },
  { id: 4, name: "Term 4", academicYear: "2022-2023", active: true },
  { id: 5, name: "Term 5", academicYear: "2022-2023", active: true },
]

export default function TermsPage() {
  const [terms, setTerms] = useState(initialTerms)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState()

  const handleSubmit = (data) => {
    if (editingTerm) {
      setTerms(terms.map(term => 
        term.id === editingTerm?.id
          ? { ...term, ...data }
          : term
      ))
      setEditingTerm(undefined)
    } else {
      const newId = Math.max(...terms.map(t => t.id)) + 1
      setTerms([...terms, { id: newId, ...data }])
    }
  }

  const handleStatusChange = (id, active) => {
    setTerms(terms.map(term => 
      term.id === id ? { ...term, active } : term
    ))
  }

  const handleEdit = (term) => {
    setEditingTerm(term)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Terms</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Term
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#ID</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((term) => (
            <TableRow key={term.id}>
              <TableCell>{term.id}</TableCell>
              <TableCell>{term.name}</TableCell>
              <TableCell>{term.academicYear}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={term.active}
                  onCheckedChange={(checked) => handleStatusChange(term.id, checked)}
                  className="mx-auto"
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-supperagent text-white hover:bg-supperagent/90"
                  onClick={() => handleEdit(term)}
                >
                  <Pen className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      <TermDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingTerm(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingTerm}
      />
    </div>
  )
}
