import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { Link } from 'react-router-dom';
import { AlertModal } from '@/components/shared/alert-modal';

export default function CreatorFollowupsPage() {
  const { user } = useSelector((state: any) => state.auth);
  // const [term, setTerm] = useState('all');
  const [status, setStatus] = useState('done');
  const [followups, setFollowups] = useState([]);

  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = async () => {
    if (!selectedNote) return;

    const isCreator = user.email === selectedNote?.createdBy?.email;
    const status = isCreator ? "complete" : "done";
    const commentText = isCreator ? "Marked as Completed" : "Marked as Done";

    try {
      // **Update note status**
      await axiosInstance.patch(`/notes/${selectedNote.id}`, { status });

      // **Add a comment about the status change**
      await axiosInstance.post(`/notes/comments`, { comment: commentText, noteId: selectedNote.id });

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
    setIsModalOpen(false);
  };

  const handleFilter = () => {
    // In a real app, this would call an API with the filters
    fetchData();
  };

  const handleReset = () => {
    setStatus('done');
    setFollowups([]);
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `/notes?where=with:createdBy,email,${user.email}&status=${status}`
      ); // Update with your API endpoint
      setFollowups(response.data.data.result);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="py-1">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Completed Followups</h1>
        <Button
          variant="default"
          className="bg-supperagent text-white hover:bg-supperagent/90"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-6 flex items-end gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>

            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-supperagent text-white hover:bg-supperagent/90"
          onClick={handleFilter}
        >
          Go
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Note</th>
              <th className="p-4 text-left">Followed Up</th>
              <th className="p-4 text-left">Created By</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((followup) => (
              <tr key={followup.id} className="border-b">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* <Avatar>
                      <AvatarImage src={followup.student.avatar} />
                      <AvatarFallback>
                        {followup.student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar> */}
                    <div>
                      <div className="font-medium">{followup.student.name}</div>
                      <div className="text-sm text-gray-500">
                        {followup.student.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-600">{followup.note}</p>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-yellow-500">
                      {followup.status}
                    </Badge>
                    {followup?.followUpBy?.map((staff) => (
                      <Badge
                        key={staff.id}
                        variant="secondary"
                        className="bg-blue-500"
                      >
                        {staff.firstName} {staff.lastName}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-500">
                    {format(followup.createdAt, 'do MMMM, yyyy')}
                  </div>
                  <div className="font-medium">{followup.createdBy.name}</div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link to={`/admin/students/${followup.student.id}/note/${followup.id}/comments`}>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-600"
                      onClick={() => {
                        setSelectedNote(followup); // Store the selected note
                        setIsModalOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        loading={false}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
      />
    </div>
  );
}
