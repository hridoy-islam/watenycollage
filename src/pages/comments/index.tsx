import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from '@/lib/axios'
import moment from 'moment-timezone';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

export default function CommentsPage() {
  const { noteid } = useParams();
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const [note, setNote] = useState();
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    await axiosInstance.post(`/notes/comments`, { comment: data.comment, noteId: noteid });
    fetchData();
    reset(); // Reset the input field after submission
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/notes/${noteid}`); // Update with your API endpoint
      setNote(response.data.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // **Handle Status Change**
  const handleStatusChange = async () => {
    const isCreator = user.email === note?.createdBy?.email;
    const status = isCreator ? "complete" : "done";
    const commentText = isCreator ? "Marked as Completed" : "Marked as Done";

    try {
      // **Update note status**
      await axiosInstance.patch(`/notes/${noteid}`, { status });

      // **Add a comment about the status change**
      await axiosInstance.post(`/notes/comments`, { comment: commentText, noteId: noteid });

      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="py-1">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Followup Comments</h1>
        <Button
          variant="default"
          className="bg-supperagent text-white hover:bg-supperagent/90"
          onClick={() => navigate(-1)} // Goes back one step in history
        >
          Back
        </Button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow my-3 flex justify-between">
        <div className='space-y-3'>
          <h2><b>Description: </b>{note?.note}</h2>
          <h3><b>Created By</b> : {note?.createdBy?.name}</h3>
          <h3><b>Created At</b> : {moment(note?.createdAt).format('DD-MM-YYYY')}</h3>

          {note?.followUpBy && note?.followUpBy.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {note?.followUpBy.map((staff) => (
                <Badge
                  key={staff.id}
                  className="bg-blue-500 text-white hover:bg-blue-500"
                >
                  {staff.firstName} {staff.lastName}
                </Badge>
              ))}
            </div>
          ) : (
            ' '
          )}
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">
            {note?.status}{' '}
          </Badge>
        </div>
        {note?.status != 'complete' &&
          <Button
            onClick={handleStatusChange}
            variant="default"
            className="bg-supperagent text-white hover:bg-supperagent/90"
          >
            {user.email === note?.createdBy?.email ? "Complete" : "Done"}
          </Button>
        }

      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 space-y-6">
          {note?.comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-supperagent">
                    {comment.user.name}
                  </div>
                  <div className="text-sm text-supperagent">
                    {moment(comment?.createdAt).tz("Europe/London").format("MMM D, YYYY, h:mm A")}
                  </div>
                </div>
                <p className="mt-1 text-gray-600">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <Input
            {...register("comment", { required: true })}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">Add Comment</Button>
        </form>
      </div>
    </div>
  );
}
