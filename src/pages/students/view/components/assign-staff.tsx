"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Pen, Trash2 } from 'lucide-react'
import { StaffDialog } from "./assign-staff-dialog"

// Demo data
const demoStaff = [
  { id: "1", name: "John Doe", role: "Academic Advisor" },
  { id: "2", name: "Jane Smith", role: "Course Coordinator" },
  { id: "3", name: "Mike Johnson", role: "Student Counselor" },
]

export function AssignStaff() {
  const [notes, setNotes] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddNote = (note) => {
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      created: new Date(),
      ...note,
    }
    setNotes([newNote, ...notes])
    setDialogOpen(false)
  }

  const handleDelete = (id) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notes</h2>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-supperagent text-white hover:bg-supperagent"
        >
          Add Note
        </Button>
      </div>

      <div className="rounded-md ">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => (
                <TableRow key={note.id}>
                  
                  <TableCell>{note.course}</TableCell>
                  
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log("Edit", note.id)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddNote}
        staffMembers={demoStaff}
      />
    </div>
  )
}

