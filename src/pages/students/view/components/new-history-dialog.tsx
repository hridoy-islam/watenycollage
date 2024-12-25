import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { VisaHistory } from "@/types/index"

interface NewHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<VisaHistory, "id">) => void
}

export function NewHistoryDialog({ open, onOpenChange, onSubmit }: NewHistoryDialogProps) {
  const [formData, setFormData] = useState({
    purpose: "",
    arrival: "",
    departure: "",
    visaStart: "",
    visaExpiry: "",
    visaType: "",
    status: "Active"
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
          <DialogTitle>Add New Visa History</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival">Arrival Date</Label>
              <Input
                id="arrival"
                type="date"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure">Departure Date</Label>
              <Input
                id="departure"
                type="date"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visaStart">Visa Start Date</Label>
              <Input
                id="visaStart"
                type="date"
                value={formData.visaStart}
                onChange={(e) => setFormData({ ...formData, visaStart: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaExpiry">Visa Expiry Date</Label>
              <Input
                id="visaExpiry"
                type="date"
                value={formData.visaExpiry}
                onChange={(e) => setFormData({ ...formData, visaExpiry: e.target.value })}
                required
              />
            </div>
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
            <Button type="submit">Add History</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

