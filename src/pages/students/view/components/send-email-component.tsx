import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailSendDialog } from './email-send-dialog';
import { EmailLogTable } from './email-log-table';
import axiosInstance from '@/lib/axios';

export function SendEmailComponent({ student}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any>([]);

  const handleSendEmail = async (payload) => {
      try {
        const data = {...payload, studentId: student.id, emails: [student.email]};
        
        await axiosInstance.post(`/email-send`, data);
        fetchData(); // Refresh data
      } catch (error) {
        console.error("Error updating status:", error);
      }
    setIsDialogOpen(false);
  };

  const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/email-logs?where=student_id,${student.id}`
        ); // Update with your API endpoint
        setEmailLogs(response.data.data.result);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
  
    useEffect(() => {
      fetchData();
    }, [student]);

  return (
    <div className="space-y-4 rounded-md p-4 shadow-md">
      <div className="flex justify-between">
        <h2 className="mb-4 text-xl font-semibold">Email Logs</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex justify-end bg-supperagent text-white hover:bg-supperagent/90"
        >
          Send Email
        </Button>
      </div>
      <EmailSendDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSend={handleSendEmail}
      />
      <EmailLogTable logs={emailLogs} />
    </div>
  );
}
