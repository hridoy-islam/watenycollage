import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
const formSchema = z.object({
  course: z.string().min(1, "Course is required"),
  notes: z.string().min(1, "Note is required"),
  followUp: z.boolean().default(false),
  followUpBy: z.string().optional(),
})


export function AddNoteDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  staffMembers,
}) {
  const [isFollowUp, setIsFollowUp] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course: "",
      notes: "",
      followUp: false,
      followUpBy: undefined,
    },
  })

  const handleSubmit = (values) => {
    const staffMember = values.followUpBy 
      ? staffMembers.find(staff => staff.id === values.followUpBy)
      : undefined

    onSubmit({
      course: values.course,
      notes: values.notes,
      followUp: values.followUp,
      followUpBy: staffMember,
    })

    form.reset()
    setIsFollowUp(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your note here" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="followUp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Is Follow Up
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        setIsFollowUp(checked)
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isFollowUp && (
              <FormField
                control={form.control}
                name="followUpBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow Up By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} - {staff.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

