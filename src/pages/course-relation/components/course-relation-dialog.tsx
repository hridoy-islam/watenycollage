import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axiosInstance from '../../../lib/axios'
import { Controller, useForm } from "react-hook-form";

export const CourseRelationDialog = ({ open, onOpenChange, onSubmit, initialData }) => {
  
  const [institutes, setInstitutes] = useState<any>([]);
  const [terms, setTerms] = useState<any>([]);
  const [courses, setCourses] = useState<any>([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      institution: "",
      course: "",
      term: "",
      courseAvailableTo: "",
      active: true, // Default active status
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [institutesResponse, termsResponse, coursesResponse] = await Promise.all([
          axiosInstance.get('/institutions?limit=all'),
          axiosInstance.get('/terms?limit=all'),
          axiosInstance.get('/courses?limit=all'),
        ]);

        const instituteOptions = institutesResponse.data.data.result.map(institute => ({
          value: institute.id,
          label: institute.name,
        }));
        const termOptions = termsResponse.data.data.result.map(term => ({
          value: term.id,
          label: term.name,
        }));
        const courseOptions = coursesResponse.data.data.result.map(course => ({
          value: course.id,
          label: course.name,
        }));

        setInstitutes(instituteOptions);
        setTerms(termOptions);
        setCourses(courseOptions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (open) {
      fetchData();
    }

    return () => {
      if (!open) {
        reset();
      }
    };
  }, [open, reset]);

  useEffect(() => {
    if (initialData) {
      reset({
        institution: initialData.institution ?? "",
        course: initialData.course ?? "",
        term: initialData.term ?? "",
        courseAvailableTo: initialData.courseAvailableTo ?? "",
        active: initialData.active ?? true,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    onSubmit(data);
    onOpenChange(false);
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
            <Controller
              name="institution"
              control={control}
              rules={{ required: "Institution is required" }}
              render={({ field }) => (
                <select {...field} className="w-full rounded-md border bg-white p-2">
                  <option value="" disabled>Select an institution</option>
                  {institutes.map(inst => (
                    <option key={inst.value} value={inst.value}>{inst.label}</option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Course Field */}
          <div>
            <label className="block">Course</label>
            <Controller
              name="course"
              control={control}
              rules={{ required: "Course is required" }}
              render={({ field }) => (
                <select {...field} className="w-full rounded-md border bg-white p-2">
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
                    <option key={course.value} value={course.value}>{course.label}</option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Term Field */}
          <div>
            <label className="block">Term</label>
            <Controller
              name="term"
              control={control}
              rules={{ required: "Term is required" }}
              render={({ field }) => (
                <select {...field} className="w-full rounded-md border bg-white p-2">
                  <option value="" disabled>Select a term</option>
                  {terms.map(term => (
                    <option key={term.value} value={term.value}>{term.label}</option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Course Available to Field */}
          <div>
            <label className="block">Course Available to</label>
            
          </div>

          
        </div>
        <DialogFooter>
          <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={handleSubmit}>{initialData ? "Save Changes" : "Create Course Relation"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
