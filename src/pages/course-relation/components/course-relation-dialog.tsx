import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const CourseRelationDialog = ({ open, onOpenChange, onSubmit, initialData, institutions, courses, terms, courseAvailableTo }) => {
  const [formData, setFormData] = useState(initialData || {
    institution: "",
    course: "",
    term: "",
    courseAvailableTo: "",
    active: true, // Default to active status for new entries
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      institution: "",
      course: "",
      term: "",
      courseAvailableTo: "",
      active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Course Relation" : "New Course Relation"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Institution Field */}
          <div>
            <label className="block">Institution</label>
            <Select value={formData.institution} onValueChange={(value) => handleSelectChange("institution", value)}>
              <SelectTrigger>
                <span>{formData.institution || "Select Institution"}</span>
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution, index) => (
                  <SelectItem key={index} value={institution}>{institution}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Field */}
          <div>
            <label className="block">Course</label>
            <Select value={formData.course} onValueChange={(value) => handleSelectChange("course", value)}>
              <SelectTrigger>
                <span>{formData.course || "Select Course"}</span>
              </SelectTrigger>
              <SelectContent>
                {courses.map((course, index) => (
                  <SelectItem key={index} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Term Field */}
          <div>
            <label className="block">Term</label>
            <Select value={formData.term} onValueChange={(value) => handleSelectChange("term", value)}>
              <SelectTrigger>
                <span>{formData.term || "Select Term"}</span>
              </SelectTrigger>
              <SelectContent>
                {terms.map((term, index) => (
                  <SelectItem key={index} value={term}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Available to Field */}
          <div>
            <label className="block">Course Available to</label>
            <Select value={formData.courseAvailableTo} onValueChange={(value) => handleSelectChange("courseAvailableTo", value)}>
              <SelectTrigger>
                <span>{formData.courseAvailableTo || "Select Available To"}</span>
              </SelectTrigger>
              <SelectContent>
                {courseAvailableTo.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Status Field */}
          <div className="flex items-center space-x-2">
            <label className="block">Active Status</label>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => handleSelectChange("active", checked)}
              className="mx-auto"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{initialData ? "Save Changes" : "Create Course Relation"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
