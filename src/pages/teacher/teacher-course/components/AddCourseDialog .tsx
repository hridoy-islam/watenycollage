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

const formSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
});

const AddCourseDialog = ({ onAddCourses }) => {
  const [courses, setCourses] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams(); 
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
    },
  });

  // Reset form every time dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  // Fetch all available courses when dialog opens
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/courses?limit=all");
        const options =
          response?.data?.data?.result?.map((course) => ({
            value: course._id,
            label: `${course.name} (${course.courseCode})`,
          })) || [];
        setCourses(options);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description:
            error?.response?.data?.message || "Failed to fetch courses",
          className: "bg-red-500 border-none text-white",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) fetchCourses();
  }, [isOpen, toast]);

const handleSubmit = async (values) => {
  try {
    setIsLoading(true);

    const response = await axiosInstance.post(`/teacher-courses`, {
      teacherId: id,
      courseId: values.courseId,
    });

    toast({
      title: "Success",
      description: "Course added successfully",
      className: "bg-watney border-none text-white",
    });


   if (onAddCourses) {
        onAddCourses();
      }
    form.reset();
    setIsOpen(false);
  } catch (error) {
    // ... error handling
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="border-none bg-watney text-white hover:bg-watney/90"
        >
          + Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[680px]">
        <h2 className="text-lg font-semibold mb-4">Add Course</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseId"
              render={() => (
                <FormItem>
                  <FormLabel>Select Course</FormLabel>
                  <Controller
                    control={form.control}
                    name="courseId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        isLoading={isLoading}
                        options={courses}
                        value={courses.find((c) => c.value === value) || null}
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
                {isLoading ? "Adding..." : "Add Course"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCourseDialog;
