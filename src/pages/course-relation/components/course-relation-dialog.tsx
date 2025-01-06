import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { useEffect, useState } from "react";
import axiosInstance from '../../../lib/axios'

export const CourseRelationDialog = ({ open, onOpenChange, onSubmit, initialData }) => {
  
  const [institues, setInstitutes] = useState<any>([]);
  const [terms, setTerms] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);
  
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

  

  const fetchData = async () => {
    try {
      const [institueResponse, termsResponse, coursesResponse] = await Promise.all([
        axiosInstance.get('/institutions?limit=all'),  // Adjust the endpoint as needed
        axiosInstance.get('/terms?limit=all'),
        axiosInstance.get('/courses?limit=all'),
      ]);



      setInstitutes(institueResponse.data.data.result);
      setTerms(termsResponse.data.data.result);
      setCourses(coursesResponse.data.data.result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

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
              {institues.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
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
              {courses.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
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
              {terms.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.term}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Available to Field */}
          <div>
            <label className="block">Course Available to</label>
            <Select value={formData.courseAvailableTo} onValueChange={(value) => handleSelectChange("courseAvailableTo", value)}>
              <SelectTrigger>
                {/* <span>{formData.courseAvailableTo || "Select Available To"}</span> */}
              </SelectTrigger>
              {/* <SelectContent>
                {courseAvailableTo.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent> */}
            </Select>
          </div>

          
        </div>
        <DialogFooter>
          <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={handleSubmit}>{initialData ? "Save Changes" : "Create Course Relation"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
