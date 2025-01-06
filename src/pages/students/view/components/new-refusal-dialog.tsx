import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import moment from "moment"
import { mockData } from "@/types"

const formSchema = z.object({
  refusalType: z.string().min(1, "Refusal Type is required"),
  refusalDate: z.string().min(1, "Refusal Date is required"),
  details: z.string().min(1, "Details are required"),
  country: z.string().min(1, "Country is required"),
  visaType: z.string().min(1, "Visa Type is required"),
})

export function NewRefusalDialog({ open, onOpenChange, onSubmit, initialData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      refusalType: "",
      refusalDate: initialData?.refusalDate ? moment(initialData.refusalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      details: "",
      country: "",
      visaType: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        refusalDate: initialData?.refusalDate ? moment(initialData.refusalDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      })
    } else {
      form.reset()
    }
  }, [initialData, form])

  const handleSubmit = (values) => {
    const transformedData = {
      ...values,
    };
    onSubmit(transformedData)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Refusal History" : "Add New Refusal History"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Refusal Type</Label>
            <Select
              value={form.watch("refusalType")}
              onValueChange={(value) => form.setValue("refusalType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refusal type" />
              </SelectTrigger>
              <SelectContent>
                {mockData.refusalTypes.map((title, index) => (
                  <SelectItem key={index} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refusalDate">Refusal Date</Label>
            <Input
              id="refusalDate"
              type="date"
              {...form.register("refusalDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              {...form.register("details")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...form.register("country")}
            />
          </div>
          <div className="space-y-2">
            <Label>Visa Type</Label>
            <Select
              value={form.watch("visaType")}
              onValueChange={(value) => form.setValue("visaType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                {mockData.visaTypes.map((title, index) => (
                  <SelectItem key={index} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="bg-supperagent hover:bg-supperagent/90 text-white" type="submit">{initialData ? "Update Refusal" : "Add Refusal"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
