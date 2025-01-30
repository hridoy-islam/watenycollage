import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';

// Demo data - in a real app, this would come from an API
const demoFollowups = [
  {
    id: '1',
    student: {
      id: 'LCC20240852',
      name: 'Romeo-Marius Lacatus',
      avatar:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-wCIfl4SUIxsuPAbKhLnlbhlZ2lv92n.png'
    },
    note: "'65 EMMANUEL CLOSE' SLC Address Does not Match with SMS. In SMS its 68. Please contact the student and ask him to change the address in SLC portal.",
    status: 'Pending',
    assignedTo: [
      { id: '1', name: 'MOTASEM BILLAH BHUIYAN' },
      { id: '2', name: 'CORINA MIHAELA BRATOSIN' },
      { id: '3', name: 'A T M ASHFIQUR RAHMAN' }
    ],
    createdBy: { id: '3', name: 'A T M ASHFIQUR RAHMAN' },
    createdAt: new Date('2025-01-06'),
    comments: []
  }
  // Add more demo followups here
];

export default function FollowupsPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [term, setTerm] = useState('all');
  const [status, setStatus] = useState('pending');
  const [followups, setFollowups] = useState(demoFollowups);

  const handleFilter = () => {
    // In a real app, this would call an API with the filters
    console.log('Filtering with:', { term, status });
  };

  const handleReset = () => {
    setTerm('all');
    setStatus('pending');
    setFollowups(demoFollowups);
  };

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `/notes?where=with:followUpStaffs,with:user,email,${user.email}`
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
        <h1 className="text-2xl font-bold">Pending Followups</h1>
        <Button
          variant="default"
          className="bg-supperagent text-white hover:bg-supperagent/90"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-6 flex items-end gap-4">
        {/* <div className="space-y-2">
          <label className="text-sm font-medium">Terms</label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              <SelectItem value="current">Current Term</SelectItem>
              <SelectItem value="previous">Previous Term</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    {/* <div>
                      <div className="font-medium">{followup.student.id}</div>
                      <div className="text-sm text-gray-500">
                        {followup.student.name}
                      </div>
                    </div> */}
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
                    <Button variant="ghost" size="icon">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-600"
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
    </div>
  );
}
