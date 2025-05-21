import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JobDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData 
}) {
  const [jobTitle, setJobTitle] = useState("")
  const [applicationDeadline, setApplicationDeadline] = useState("")
useEffect(() => {
  setJobTitle(initialData?.jobTitle || "")
  setApplicationDeadline(initialData?.applicationDeadline?.split("T")[0] || "")
}, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ jobTitle, applicationDeadline })
    onOpenChange(false)
    setJobTitle("")
    setApplicationDeadline("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="JobTitle">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="JobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicationDeadline">
              Application Deadline <span className="text-red-500">*</span>
            </Label>
            <Input
              id="applicationDeadline"
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-watney text-white hover:bg-watney/90 border-none">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
