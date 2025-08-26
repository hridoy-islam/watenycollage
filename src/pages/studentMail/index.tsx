'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { useNavigate } from 'react-router-dom';
import { MoveLeft, Plus } from 'lucide-react';

// Example templates
const emailTemplates = [
  {
    value: 'leaveApproval',
    label: 'Leave Approval',
    subject: 'Leave Approved',
    body: 'Dear [name], your leave request has been approved.'
  },
  {
    value: 'reminder',
    label: 'Reminder Email',
    subject: 'Reminder',
    body: 'Dear [name], this is a gentle reminder for your pending tasks.'
  }
];

// Example email logs
const emailLogs = [
  {
    id: 1,
    subject: 'Leave Approved',
    issuedBy: 'Admin',
    sent: '2025-08-26',
    status: 'Sent'
  },
  {
    id: 2,
    subject: 'Reminder',
    issuedBy: 'Admin',
    sent: '2025-08-25',
    status: 'Sent'
  }
];

function StudentMailPage() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleTemplateChange = (template: any) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSendEmail = () => {
    // You can integrate your send email API here
    console.log('Sending email:', { subject, body });
    setOpen(false);
  };

  const navigate = useNavigate()
const AVAILABLE_VARIABLES = [
  'name',
  'dob',
  'email',
  'countryOfBirth',
  'countryOfDomicile',
  'nationality',
  'dateOfBirth',
  'niNumber',
  'admin',
  'adminEmail'
];


  return (
    <div className="">
      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-semibold">Email Logs</h2>

        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            size={'sm'}
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
          onClick={() => setOpen(true)}
          size={'sm'}
          className="bg-watney text-white hover:bg-watney/90"
        >
                      <Plus className="mr-2 h-4 w-4" />

          Send Email
        </Button>
        </div>
        
      </div>
      <div className="rounded-lg bg-white p-4 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Issued By</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.subject}</TableCell>
                <TableCell>{log.issuedBy}</TableCell>
                <TableCell>{log.sent}</TableCell>
                <TableCell className="text-right">{log.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Send Email Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-max overflow-y-auto" >
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <Select
              options={emailTemplates}
              value={selectedTemplate}
              onChange={handleTemplateChange}
              placeholder="Select Template"
            />

            <div>
              <label className="mb-1 block font-medium">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
 {/* Variable Reference */}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Available Variables:
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {AVAILABLE_VARIABLES.map((v) => (
                  <span key={v} className="rounded bg-gray-100 px-2 py-1">
                    {`[${v}]`}
                  </span>
                ))}
              </div>
            </div>

            <div className='pb-8'>
              <label className="mb-1 block font-medium">Body</label>
              <ReactQuill value={body} onChange={setBody}  className="h-[250px]" theme='snow'/>
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end">
            <Button onClick={handleSendEmail}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentMailPage;
