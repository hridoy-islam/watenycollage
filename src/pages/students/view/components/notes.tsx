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
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';

export function NotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddNote = async (data) => {
    try {
      const formattedValues = {
        ...data,
        studentId: id
      };
      const response = await axiosInstance.post('/notes', formattedValues);
      console.log('Note added successfully:', response.data);
      // Handle success (e.g., show a success message or refresh data)

      // Close the dialog after successful submission
      setDialogOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      // Handle error (e.g., show an error message)
    }
  };

  // Fetch data when the component mounts
  const fetchNotes = async () => {
    try {
      const response = await axiosInstance.get(`/notes?where=student_id,${id}`); // Update with your API endpoint
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

      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Notes</TableHead>
              <TableHead>Follow Up</TableHead>
              <TableHead>Follow Up By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Staus</TableHead>
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
                  <TableCell>
                    {note.isFollowUp === true ? 'Yes' : 'No'}
                  </TableCell>

                  <TableCell>
                    {note.followUpBy && note.followUpBy.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {note.followUpBy.map((staff) => (
                          <Badge
                            key={staff.id}
                            className="bg-blue-500 text-white hover:bg-blue-500"
                          >
                            {staff.firstName} {staff.lastName}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className="bg-green-500 text-white hover:bg-green-500">
                        {note.createdBy.name}
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        {moment(note.createdAt).format('DD-MM-YYYY')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {' '}
                    <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">
                      {note.status}{' '}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
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
      />
    </div>
  );
}
