

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicationName: string
}

export function AddStockDialog({ open, onOpenChange, medicationName }: AddStockDialogProps) {
  const [formData, setFormData] = useState({
    date: "15-08-2025",
    time: "19:44",
    title: "Stock Count",
    description: "",
    stockCount: "",
    expectedStockCount: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Stock count added:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      date: "15-08-2025",
      time: "19:44",
      title: "Stock Count",
      description: "",
      stockCount: "",
      expectedStockCount: "",
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setFormData({
      date: "15-08-2025",
      time: "19:44",
      title: "Stock Count",
      description: "",
      stockCount: "",
      expectedStockCount: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add Stock Count</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Required fields are marked with <span className="text-red-500">*</span>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          {/* Stock Count */}
          <div className="space-y-2">
            <Label htmlFor="stockCount">
              Stock Count (ml) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stockCount"
              type="number"
              value={formData.stockCount}
              onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
              required
            />
          </div>

          {/* Expected Stock Count */}
          <div className="space-y-2">
            <Label htmlFor="expectedStockCount">Expected Stock Count (ml)</Label>
            <Input
              id="expectedStockCount"
              type="number"
              value={formData.expectedStockCount}
              onChange={(e) => setFormData({ ...formData, expectedStockCount: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
