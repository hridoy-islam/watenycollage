import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function CourseDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(initialData?.name || "");
    setCourseCode(initialData?.courseCode || "");
    setDescription(initialData?.description || "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, courseCode, description }); // include description
    onOpenChange(false);
    setName("");
    setCourseCode("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Course Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseCode">
              Course Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 pb-8">
            <Label htmlFor="description">Description</Label>
            <ReactQuill
              theme="snow"
              value={description}
              onChange={setDescription}
              className=" h-[250px]"
            />
          </div>

          <div className="flex justify-end space-x-2 ">
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
  );
}
