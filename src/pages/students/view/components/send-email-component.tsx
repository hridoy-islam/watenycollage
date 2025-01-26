import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailSendDialog } from './email-send-dialog';
import { EmailLogTable } from './email-log-table';
import axiosInstance from '@/lib/axios';

export function SendEmailComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any>([]);

  const handleSendEmail = (
    to: string,
    subject: string,
    body: string,
    attachments: File[]
  ) => {
    // In a real application, you would send the email here

    // Add to email logs
    const newLog = {
      id: Date.now().toString(),
      to,
      subject,
      sentAt: new Date(),
      status: 'sent' // You might want to handle failures in a real application
    };
    setEmailLogs([newLog, ...emailLogs]);

    setIsDialogOpen(false);
  };

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
