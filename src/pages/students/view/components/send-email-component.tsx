"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { EmailSendDialog } from "./email-send-dialog"
import { EmailLogTable } from "./email-log-table"

export function SendEmailComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [emailLogs, setEmailLogs] = useState<any>([])

  const handleSendEmail = (to: string, subject: string, body: string, attachments: File[]) => {
    // In a real application, you would send the email here
    console.log("Sending email:", { to, subject, body, attachments })

    // Add to email logs
    const newLog = {
      id: Date.now().toString(),
      to,
      subject,
      sentAt: new Date(),
      status: 'sent', // You might want to handle failures in a real application
    }
    setEmailLogs([newLog, ...emailLogs])

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 rounded-md shadow-md p-4">
       <div className='flex justify-between'>
       <h2 className="text-xl font-semibold mb-4">Email Logs</h2>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="bg-supperagent text-white hover:bg-supperagent/90 flex justify-end"
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
  )
}

