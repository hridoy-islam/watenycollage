import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
})

// Mock data for email drafts
const mockDrafts = [
  { id: "1", subject: "Meeting Tomorrow", body: "Let's discuss the project progress." },
  { id: "2", subject: "Quarterly Report", body: "Please find attached the quarterly report." },
]



export function EmailSendDialog({ open, onOpenChange, onSend }) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [selectedDraft, setSelectedDraft] = useState<any>(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: "",
      subject: "",
      body: "",
    },
  })

  useEffect(() => {
    if (selectedDraft) {
      form.setValue("subject", selectedDraft.subject)
      form.setValue("body", selectedDraft.body)
    }
  }, [selectedDraft, form])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSend(values.to, values.subject, values.body, attachments)
    form.reset()
    setAttachments([])
    setSelectedDraft(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Fill in the details below to send your email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Draft</FormLabel>
              <Select onValueChange={(value) => setSelectedDraft(mockDrafts.find(draft => draft.id === value) || null)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a draft" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockDrafts.map((draft) => (
                    <SelectItem key={draft.id} value={draft.id}>
                      {draft.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter email body"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <Input type="file" multiple onChange={handleFileChange} />
              </FormControl>
            </FormItem>
            <DialogFooter>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
                Send Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

