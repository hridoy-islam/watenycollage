import { useEffect, useState } from "react"
import { Plus, Pen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CourseDialog } from "./components/course-dialog"
import axiosInstance from '../../lib/axios';
import { useToast } from "@/components/ui/use-toast";
import { BlinkingDots } from "@/components/shared/blinking-dots";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any>([])
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>()
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/courses`);
      setCourses(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    if (editingCourse) {
      await axiosInstance.put(`/courses/${editingCourse?.id}`, data);
      toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
      setEditingCourse(undefined)
    } else {
      await axiosInstance.post(`/courses`, data);
      toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
      fetchData()
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/courses/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course)
    setDialogOpen(true)
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Courses</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90 border-none" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell className="text-center">
                  <Switch
                    checked={course.status == 1}
                    onCheckedChange={(checked) => handleStatusChange(course.id, checked)}
                    className="mx-auto"
                  />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
                      size="icon"
                      onClick={() => handleEdit(course)}
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <CourseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCourse(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingCourse}
      />
    </div>
  )
}
