import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

export function JobDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialData 
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDetail, setJobDetail] = useState("");
  const [applicationDeadline, setApplicationDeadline] = useState("");

  useEffect(() => {
    setJobTitle(initialData?.jobTitle || "");
    setJobDetail(initialData?.jobDetail || "");
    setApplicationDeadline(initialData?.applicationDeadline?.split("T")[0] || "");
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ jobTitle, jobDetail, applicationDeadline });
    onOpenChange(false);
    setJobTitle("");
    setJobDetail("");
    setApplicationDeadline("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Job</DialogTitle>
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

          <div className="space-y-2 pb-10">
            <Label htmlFor="jobDetail">
              Job Detail <span className="text-red-500">*</span>
            </Label>
            <ReactQuill
              theme="snow"
              value={jobDetail}
              onChange={setJobDetail}
              style={{ height: "250px" }}
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
  );
}
