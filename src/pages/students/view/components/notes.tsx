import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { AddNoteDialog } from './note-dialog';
import { Eye, Pen, Trash2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import moment from 'moment';

// Demo data
const demoStaff = [
  { id: '1', name: 'John Doe', role: 'Academic Advisor' },
  { id: '2', name: 'Jane Smith', role: 'Course Coordinator' },
  { id: '3', name: 'Mike Johnson', role: 'Student Counselor' }
];

export function NotesPage() {
  const [notes, setNotes] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddNote = (note) => {
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      created: new Date(),
      ...note
    };
    setNotes([newNote, ...notes]);
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };
  // Fetch data when the component mounts
  const fetchNotes = async () => {
    try {
      const response = await axiosInstance.get('/notes?where=student_id,1'); // Update with your API endpoint
      setNotes(response.data.data.result);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="space-y-4 rounded-md p-4 shadow-md">
      <div className="flex items-center justify-between">
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
              <TableHead>Notes</TableHead>
              <TableHead>Follow Up</TableHead>
              <TableHead>Follow Up By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.note}</TableCell>
                  <TableCell>{note.followUp ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{note.followUpBy?.name || '-'}</TableCell>
                  <TableCell>
                    {moment(note.createdAt).format('DD-MM-YYYY')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddNote}
        staffMembers={demoStaff}
      />
    </div>
  );
}
