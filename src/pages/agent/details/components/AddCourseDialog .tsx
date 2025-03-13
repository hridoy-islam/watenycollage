import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios"
const AddCourseDialog = ({ coursesList = [] ,onAddCourses}) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
    const {id} = useParams()
    const [isOpen, setIsOpen] = useState(false);
  //  console.log(coursesList)
  const courseOptions = (coursesList ).map((course) => ({
    value: course?.id,
    label: `${course?.institute?.name    } - ${course?.course?.name}`,
  }));

  // Handle course selection change
  const handleSelectChange = (selected) => {
    setSelectedCourses(selected || []);
  };

  // Submit selected courses
  const handleAddCourses = async () => {
    try {
      const selectedCourseIds = selectedCourses.map((course) => course.value);
      
      // Use axiosInstance for the PATCH request
      await axiosInstance.patch(`/agents/${id}`, {
        courseRelationIds: selectedCourseIds,
      });
  
      // Pass selected course objects to the parent component
      if (onAddCourses) {
        onAddCourses(selectedCourses);
      }
      setSelectedCourses([]); // Clear selection after adding
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add courses:", error);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        
        <Button  onClick={() => setIsOpen(true)} className="border-none bg-supperagent text-white hover:bg-supperagent/90">+ Add Course</Button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add Courses</h2>

        <Select
          isMulti
          name="courses"
          options={courseOptions}
          className="mb-4"
          classNamePrefix="select"
          placeholder="Search and select courses..."
          value={selectedCourses}
          onChange={handleSelectChange}
          isClearable
          isSearchable
        />

        {selectedCourses.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            {selectedCourses.length} course{selectedCourses.length !== 1 ? "s" : ""} selected
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleAddCourses} disabled={selectedCourses.length === 0} className="border-none bg-supperagent text-white hover:bg-supperagent/90">
            Add Course
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
