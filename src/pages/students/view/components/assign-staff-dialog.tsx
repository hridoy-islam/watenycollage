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


export function StaffDialog({ 
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
          <DialogTitle>Add Staff</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="followUpBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Staff</FormLabel>
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
           
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

