import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const academicYearOptions = [
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025"
]

export function TermDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData 
}) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [active, setActive] = useState(initialData?.active ?? true)
  const [academicYear, setAcademicYear] = useState(initialData?.academicYear ?? academicYearOptions[0])

  useEffect(() => {
    setName(initialData?.name ?? "")
    setActive(initialData?.active ?? true)
    setAcademicYear(initialData?.academicYear ?? academicYearOptions[0])
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, active, academicYear })
    onOpenChange(false)
    setName("")
    setActive(true)
    setAcademicYear(academicYearOptions[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Term</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Term Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="academicYear">
              Academic Year <span className="text-red-500">*</span>
            </Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger id="academicYear">
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
