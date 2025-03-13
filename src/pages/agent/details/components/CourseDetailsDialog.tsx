import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import axiosInstance from "@/lib/axios"
import { useParams } from 'react-router-dom';

const CourseDetailsDialog = ({ isOpen, onClose, courseData, isEditing, onSave }) => {
  const [editedData, setEditedData] = useState({
    session: [],
    term: {}
  });
const {id} = useParams();
  useEffect(() => {
    if (courseData) {
      setEditedData({
        ...courseData,
        sessions: courseData.sessions || [],  // Ensure sessions is always an array
        
      });
    }
  }, [courseData]);

  const handleSessionChange = (sessionId, field, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      session: prevData.session.map((s) =>
        s.id === sessionId ? { ...s, [field]: value } : s
      ),
    }));
  };
  
  
// console.log(editedData)

  const handleSave = async () => {
    try {
      
      const response = await axiosInstance.patch(`/agents/${id}`, {
        
          sessions: editedData.session
      
      });

      // console.log(editedData.session)
  
      if (response.status === 200) {
        onSave(editedData);
        onClose();
      } else {
        console.error('Failed to update sessions');
      }
    } catch (error) {
      console.error('Error updating sessions:', error);
    }
  };
  
  
  if (!courseData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {courseData.course?.name || 'Unknown Course'} - {courseData?.institute?.name || 'Unknown Institution'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Term details section */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Term Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Term</label>
                <p className="text-gray-800">{editedData?.term?.term || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Academic Year</label>
                <p className="text-gray-800">{editedData?.term?.academic_year || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Sessions table */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Sessions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Agent Rate</TableHead>
                  <TableHead>Rate Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedData?.session?.length > 0 ? (
                  editedData.session.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session?.session || 'N/A'}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type="date"
                            value={session?.invoice_date?.split('T')[0] || ''}
                            onChange={(e) => handleSessionChange(session.id, 'invoice_date', e.target.value + 'T00:00:00.000000Z')}
                          />
                        ) : (
                          session?.invoice_date ? format(new Date(session.invoice_date), 'dd MMM yyyy') : 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={session?.agent_rate || ''}
                            onChange={(e) => handleSessionChange(session.id, 'agent_rate', e.target.value)}
                          />
                        ) : (
                          session?.agent_rate || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select 
                            value={session?.agent_rate_type || ''}
                            onValueChange={(value) => handleSessionChange(session.id, 'agent_rate_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat</SelectItem>
                              <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="capitalize">{session?.agent_rate_type || 'N/A'}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No sessions available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isEditing ? 'Cancel' : 'Close'}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} className='border-none bg-supperagent text-white hover:bg-supperagent/90'>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailsDialog;
