import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

// Demo data - in a real app, this would come from an API
const demoComments = [
  {
    id: '1',
    text: 'Called the student and informed about the address mismatch. They will update it in the portal.',
    createdAt: new Date('2025-01-06T14:30:00'),
    createdBy: {
      id: '1',
      name: 'MOTASEM BILLAH BHUIYAN'
    }
  },
  {
    id: '2',
    text: 'Followed up with student. Address has been updated in SLC portal.',
    createdAt: new Date('2025-01-07T10:15:00'),
    createdBy: {
      id: '2',
      name: 'CORINA MIHAELA BRATOSIN'
    }
  }
];

export default function CommentsPage() {
  const [comments, setComments] = useState(demoComments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: crypto.randomUUID(),
      text: newComment,
      createdAt: new Date(),
      createdBy: {
        id: '3',
        name: 'A T M ASHFIQUR RAHMAN' // In a real app, this would be the logged-in user
      }
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="py-1">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Followup Comments</h1>
        <Button
          variant="default"
          className="bg-[#1B4965] hover:bg-[#1B4965]/90"
        >
          Back to Followups
        </Button>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="font-medium text-supperagent">
                    {comment.createdBy.name}
                  </div>
                  <div className="text-sm text-supperagent">
                    {format(comment.createdAt, 'PPp')}
                  </div>
                </div>
                <p className="mt-1 text-gray-600">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button onClick={handleAddComment}>Add Comment</Button>
        </div>
      </div>
    </div>
  );
}
