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
  groupId: z.string().optional(),
});

const AddCourseDialog = ({ onAddCourses, editCourse = null }) => {
  const [courses, setCourses] = useState([]);
  const [courseGroups, setCourseGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams(); 
  const { toast } = useToast();

  const isEditMode = Boolean(editCourse);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      groupId: "",
    },
  });

  const selectedCourseId = form.watch("courseId");

  // Reset form every time dialog opens or editCourse changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editCourse) {
        const prefillForm = async () => {
          try {
            const response = await axiosInstance.get(`/teacher-courses/${editCourse._id}`);
            const teacherCourse = response?.data?.data;
            
            form.reset({
              courseId: teacherCourse?.courseId?._id || editCourse.courseId || "",
              groupId: teacherCourse?.groupId?._id || teacherCourse?.groupId || "",
            });
          } catch (error) {
            console.error("Error fetching teacher course details:", error);
            form.reset({
              courseId: editCourse.courseId || "",
              groupId: "",
            });
          }
        };

        prefillForm();
      } else {
        form.reset({
          courseId: "",
          groupId: "",
        });
      }
    }
  }, [isOpen, form, isEditMode, editCourse]);

  // Fetch courses when dialog opens
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/courses?limit=all&status=1");
        const courseOptions = response?.data?.data?.result?.map((course) => ({
          value: course._id,
          label: `${course.name} (${course.courseCode})`,
        })) || [];
        setCourses(courseOptions);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to fetch courses",
          className: "bg-red-500 border-none text-white",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) fetchCourses();
  }, [isOpen, toast]);

  // Fetch course groups when selectedCourseId changes
  useEffect(() => {
    const fetchCourseGroups = async () => {
      if (!selectedCourseId) {
        setCourseGroups([]);
        form.setValue("groupId", "");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/course-group?limit=all&courseId=${selectedCourseId}`);
        const groupOptions = response?.data?.data?.result?.map((group) => ({
          value: group._id,
          label: group.groupName || group.name || group._id,
        })) || [];
        setCourseGroups(groupOptions);
      } catch (error) {
        console.error("Error fetching course groups:", error);
        setCourseGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseGroups();
  }, [selectedCourseId, form]);

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);

      if (isEditMode) {
        await axiosInstance.patch(`/teacher-courses/${editCourse._id}`, {
          teacherId: id,
          courseId: values.courseId,
          groupId: values.groupId,
        });

        toast({
          title: "Success",
          description: "Course updated successfully",
          className: "bg-watney border-none text-white",
        });
      } else {
        await axiosInstance.post(`/teacher-courses`, {
          teacherId: id,
          courseId: values.courseId,
          groupId: values.groupId,
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

  const getCurrentCourseValue = () => {
    const courseId = form.watch("courseId");
    return courses.find((c) => c.value === courseId) || null;
  };

  const getCurrentGroupValue = () => {
    const groupId = form.watch("groupId");
    return courseGroups.find((g) => g.value === groupId) || null;
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
                        onChange={(selected) => {
                          onChange(selected ? selected.value : "");
                          form.setValue("groupId", "");
                        }}
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

            {/* Group Selection (depends on selected course) */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Group</FormLabel>
                  <Controller
                    control={form.control}
                    name="groupId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        isLoading={isLoading}
                        options={courseGroups}
                        value={getCurrentGroupValue()}
                        onChange={(selected) =>
                          onChange(selected ? selected.value : "")
                        }
                        placeholder={selectedCourseId ? "Select a group..." : "Select a course first"}
                        isClearable
                        isDisabled={!selectedCourseId}
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
