import { useState } from "react"
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
import type { RefusalHistory } from "@/types/index"

interface NewRefusalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<RefusalHistory, "id">) => void
}

export function NewRefusalDialog({ open, onOpenChange, onSubmit }: NewRefusalDialogProps) {
  const [formData, setFormData] = useState({
    refusalType: "",
    refusalDate: "",
    details: "",
    country: "",
    visaType: "",
    status: "Refused"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Refusal History</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refusalType">Refusal Type</Label>
            <Select
              value={formData.refusalType}
              onValueChange={(value) => setFormData({ ...formData, refusalType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select refusal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa Refusal</SelectItem>
                <SelectItem value="permission">Permission to Stay</SelectItem>
                <SelectItem value="asylum">Asylum</SelectItem>
                <SelectItem value="deportation">Deportation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refusalDate">Refusal Date</Label>
            <Input
              id="refusalDate"
              type="date"
              value={formData.refusalDate}
              onChange={(e) => setFormData({ ...formData, refusalDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visaType">Visa Type</Label>
            <Select
              value={formData.visaType}
              onValueChange={(value) => setFormData({ ...formData, visaType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="tourist">Tourist</SelectItem>
                <SelectItem value="family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Refusal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

