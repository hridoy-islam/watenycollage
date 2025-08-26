import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"

export function TermDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData 
}) {
  const [termName, setTermName] = useState("")
  
  useEffect(() => {
      setTermName(initialData?.termName || "");
    }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ termName })
    onOpenChange(false)
    setTermName("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Term</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="termName">
              Term Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="termName"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-watney text-white hover:bg-watney/90 border-none">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
