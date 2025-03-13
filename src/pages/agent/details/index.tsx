import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";
;
import CourseDetailsDialog from "./components/CourseDetailsDialog";
import axiosInstance from "@/lib/axios";
import { useParams } from "react-router-dom";
import AddCourseDialog from "./components/AddCourseDialog ";

const AgentDetailsPage = () => {
  // State for managing courses
  const [agentCourses, setAgentCourses] = useState([]);
  const [courses, setCourses] = useState([]);

  // State for dialog
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const [coursesUpdated, setCoursesUpdated] = useState(false);
  
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/course-relations");
      setCourses(response.data?.data?.result || []);

      const agentCourse = await axiosInstance.get(`/agents/${id}`);
      setAgentCourses(agentCourse?.data?.data?.agentCourseRelations|| []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setAgentCourses([]); // Ensure it's always an array
    }
  };
 
  const handleCoursesAdded = (newCourses) => {
    // setAgentCourses((prevCourses) => [...prevCourses, ...newCourses]);
    setCoursesUpdated((prev) => !prev); 
  };


  useEffect(() => {
    fetchData();
 }, [id,coursesUpdated]);


  // Handle row click
  const handleRowClick = (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
    setIsEditing(false);
  };

  // Handle edit button click
  const handleEditClick = (e, course) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedCourse(course);
    setDialogOpen(true);
    setIsEditing(true);
  };

  // Handle course update
  const handleUpdateCourse = (updatedCourse) => {
    setAgentCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  };
 

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCourse(null);
    setIsEditing(false);
  };
  


  
  return (
    <div className="p-6">
      <div className="flex flex-row w-full justify-between pb-4">
        <h1 className="text-2xl font-bold">Agent Details</h1>
        <AddCourseDialog coursesList={courses}  onAddCourses={handleCoursesAdded}  />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institution</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(agentCourses) && agentCourses.length > 0 ? (
            agentCourses.map((course) => (
              <TableRow
                key={course.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(course)}
              >
                <TableCell>
                  {course.institute?.name || "N/A"}
                </TableCell>
                <TableCell>{course.course?.name || "N/A"}</TableCell>
                <TableCell>{course.term?.term || "N/A"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="border-none bg-supperagent text-white hover:bg-supperagent/90"
                    size="icon"
                    onClick={(e) => handleEditClick(e, course)}
                  >
                    <Pen className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No courses available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Details/Edit Dialog */}
      {selectedCourse && (
        <CourseDetailsDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          courseData={selectedCourse}
          isEditing={isEditing}
          onSave={handleUpdateCourse}
        />
      )}
    </div>
  );
};

export default AgentDetailsPage;
