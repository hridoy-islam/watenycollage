import { useEffect } from "react"
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
import { EmailDraft } from "@/types/email"

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
})

interface EmailDraftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<EmailDraft, 'id' | 'createdAt' | 'updatedAt'> | EmailDraft) => void
  initialData?: EmailDraft
}

export function EmailDraftDialog({ open, onOpenChange, onSubmit, initialData }: EmailDraftDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        subject: initialData.subject,
        body: initialData.body,
      })
    } else {
      form.reset({
        subject: "",
        body: "",
      })
    }
  }, [initialData, form])

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      onSubmit({ ...initialData, ...values })
    } else {
      onSubmit(values)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Email Draft" : "Create New Email Draft"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Edit your email draft below." : "Create a new email draft. You can send it later."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <DialogFooter>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent/90">
                {initialData ? "Update Draft" : "Save Draft"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

