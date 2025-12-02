import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EcertDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [title, setTitle] = useState("");
  const isEditing = !!initialData;

  useEffect(() => {
    setTitle(initialData?.title || "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return; // Simple validation check

    onSubmit({ title });
    
    onOpenChange(false);
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Training" : "Add Training"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Training Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 ">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim()} // Disable submit if title is empty
              className="border-none bg-watney text-white hover:bg-watney/90"
            >
              {isEditing ? "Save Changes" : "Create Training"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}