import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axiosInstance from '@/lib/axios';

const formSchema = z.object({
  term: z.string().min(1, "Term is required"),
  institution: z.string().min(1, "Institution is required"),
  course: z.string().min(1, "Course is required"),
  choice: z.string().min(1, "Choice is required"),
  amount: z.string().min(1, "Amount is required"), // New field for amount
});

export function ApplicationDialog({ open, onOpenChange }) {
  const [data, setData] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      term: "",
      institution: "",
      course: "",
      choice: "",
      amount: "", // Initialize amount
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/course-relations?limit=all');
        setData(response.data.data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleTermChange = (termId) => {
    form.setValue('institution', '');
    form.setValue('course', '');
    form.setValue('choice', '');
    form.setValue('amount', ''); // Reset amount
    setSelectedCourse(null);

    const filteredInstitutions = data
      .filter(item => item.term.id === parseInt(termId))
      .map(item => ({
        value: item.institute.id,
        label: item.institute.name,
      }));
    setInstitutions(filteredInstitutions);
  };

  const handleInstitutionChange = (institutionId) => {
    form.setValue('course', '');
    form.setValue('choice', '');
    form.setValue('amount', ''); // Reset amount
    setSelectedCourse(null);

    const filteredCourses = data
      .filter(item => item.institute.id === parseInt(institutionId))
      .map(item => ({
        value: item.course.id,
        label: item.course.name,
      }));
    setCourses(filteredCourses);
  };

  const handleCourseChange = (courseId) => {
    const courseData = data.find(item => item.course.id === parseInt(courseId));
    setSelectedCourse(courseData);
    form.setValue('choice', '');
    form.setValue('amount', ''); // Reset amount
  };

  const handleChoiceChange = (value) => {
    form.setValue('choice', value);
    const amount = value === 'Local' ? selectedCourse.local_amount : selectedCourse.international_amount;
    form.setValue('amount', amount || ''); // Set amount based on choice
  };

  const onSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post('/submit-course', formData);
      console.log('Form submitted successfully:', response.data);
      form.reset(); // Reset form on successful submit
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      form.reset(); // Reset the form when the dialog is closed
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Interested Course</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Term Selection */}
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleTermChange(e.target.value);
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="">Select term</option>
                    {[...new Set(data.map(item => ({ value: item.term.id, label: item.term.term })))].map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Institution Selection */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleInstitutionChange(e.target.value);
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="">Select institution</option>
                    {institutions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleCourseChange(e.target.value);
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="">Select course</option>
                    {courses.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Choice (Local/International) Selection */}
            {selectedCourse && (
              <FormField
                control={form.control}
                name="choice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose Option</FormLabel>
                    {selectedCourse.local && (
                      <div>
                        <input
                          type="radio"
                          value="Local"
                          id="local"
                          checked={field.value === 'Local'}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleChoiceChange(e.target.value);
                          }}
                        />
                        <label htmlFor="local">Local - {selectedCourse.local_amount}</label>
                      </div>
                    )}
                    {selectedCourse.international && (
                      <div>
                        <input
                          type="radio"
                          value="International"
                          id="international"
                          checked={field.value === 'International'}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleChoiceChange(e.target.value);
                          }}
                        />
                        <label htmlFor="international">International - {selectedCourse.international_amount}</label>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">
                Add Course
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
