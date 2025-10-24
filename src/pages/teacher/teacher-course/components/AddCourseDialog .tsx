import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { Pencil } from "lucide-react";

const formSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  termId: z.string().min(1, "Term is required"),
});

const AddCourseDialog = ({ onAddCourses, editCourse = null }) => {
  const [courses, setCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams(); 
  const { toast } = useToast();

  const isEditMode = Boolean(editCourse);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      termId: "",
    },
  });

  // Reset form every time dialog opens or editCourse changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editCourse) {
        // Pre-fill form with existing data for editing
        // We need to fetch the actual termId since editCourse only has termName
        const prefillForm = async () => {
          try {
            // Fetch the specific teacher-course to get termId
            const response = await axiosInstance.get(`/teacher-courses/${editCourse._id}`);
            const teacherCourse = response?.data?.data;
            
            form.reset({
              courseId: teacherCourse?.courseId?._id || editCourse.courseId || "",
              termId: teacherCourse?.termId?._id ||  teacherCourse?.termId|| "",
            });
          } catch (error) {
            console.error("Error fetching teacher course details:", error);
            // Fallback: try to find termId by termName
            const foundTerm = terms.find(term => term.label === editCourse.termName);
            form.reset({
              courseId: editCourse.courseId || "",
              termId: foundTerm?.value || "",
            });
          }
        };

        prefillForm();
      } else {
        // Reset form for adding new course
        form.reset({
          courseId: "",
          termId: "",
        });
      }
    }
  }, [isOpen, form, isEditMode, editCourse, terms]);

  // Fetch all available courses and terms when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch courses
        const coursesResponse = await axiosInstance.get("/courses?limit=all");
        const courseOptions = coursesResponse?.data?.data?.result?.map((course) => ({
          value: course._id,
          label: `${course.name} (${course.courseCode})`,
        })) || [];
        setCourses(courseOptions);

        // Fetch terms
        const termsResponse = await axiosInstance.get("/terms?limit=all");
        const termOptions = termsResponse?.data?.data?.result?.map((term) => ({
          value: term._id,
          label: term.termName,
        })) || [];
        setTerms(termOptions);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to fetch data",
          className: "bg-red-500 border-none text-white",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) fetchData();
  }, [isOpen, toast]);

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      if (isEditMode) {
        // Update existing course assignment
        const response = await axiosInstance.patch(`/teacher-courses/${editCourse._id}`, {
          teacherId: id,
          courseId: values.courseId,
          termId: values.termId,
        });

        toast({
          title: "Success",
          description: "Course updated successfully",
          className: "bg-watney border-none text-white",
        });
      } else {
        // Add new course assignment
        const response = await axiosInstance.post(`/teacher-courses`, {
          teacherId: id,
          courseId: values.courseId,
          termId: values.termId,
        });

        toast({
          title: "Success",
          description: "Course added successfully",
          className: "bg-watney border-none text-white",
        });
      }

      if (onAddCourses) {
        onAddCourses();
      }
      
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} course`,
        className: "bg-red-500 border-none text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find current term value for display
  const getCurrentTermValue = () => {
    const termId = form.watch("termId");
    return terms.find((t) => t.value === termId) || null;
  };

  // Helper function to find current course value for display
  const getCurrentCourseValue = () => {
    const courseId = form.watch("courseId");
    return courses.find((c) => c.value === courseId) || null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button
            variant="ghost"
            size="icon"
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            className="border-none bg-watney text-white hover:bg-watney/90"
          >
            + Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:min-w-[680px]">
        <h2 className="text-lg font-semibold mb-4">
          {isEditMode ? "Edit Course Assignment" : "Add Course"}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Course</FormLabel>
                  <Controller
                    control={form.control}
                    name="courseId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        isLoading={isLoading}
                        options={courses}
                        value={getCurrentCourseValue()}
                        onChange={(selected) =>
                          onChange(selected ? selected.value : "")
                        }
                        placeholder="Select a course..."
                        isClearable
                        className="text-gray-900"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#D1D5DB",
                            boxShadow: "none",
                            "&:hover": { borderColor: "#9CA3AF" },
                          }),
                        }}
                      />
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term Selection */}
            <FormField
              control={form.control}
              name="termId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Term</FormLabel>
                  <Controller
                    control={form.control}
                    name="termId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        isLoading={isLoading}
                        options={terms}
                        value={getCurrentTermValue()}
                        onChange={(selected) =>
                          onChange(selected ? selected.value : "")
                        }
                        placeholder="Select a term..."
                        isClearable
                        className="text-gray-900"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#D1D5DB",
                            boxShadow: "none",
                            "&:hover": { borderColor: "#9CA3AF" },
                          }),
                        }}
                      />
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-watney text-white hover:bg-watney/90"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isEditMode ? "Updating..." : "Adding...") 
                  : (isEditMode ? "Update Course" : "Add Course")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;