'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

const courseDetailsSchema = z.object({
  course: z.string().optional(),
  intake: z.string().optional()
});

type CourseDetailsData = z.infer<typeof courseDetailsSchema>;

export interface TCourse {
  _id: string;
  name: string;
  status: 0 | 1;
}

export interface TTerm {
  _id: string;
  termName: string;
  status?: 0 | 1;
}

export function CourseDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}) {
  const [courses, setCourses] = useState<{ value: string; label: string }[]>(
    []
  );
  const [intakes, setIntakes] = useState<{ value: string; label: string }[]>(
    []
  );

  const [courseId, setCourseId] = useState<string | null>(null);
    const [termId, setTermId] = useState<string | null>(null);
  

  const form = useForm<CourseDetailsData>({
    resolver: zodResolver(courseDetailsSchema),
    defaultValues: {
      course: defaultValues?.course || '',
      intake: defaultValues?.intake || ''
    }
  });

  useEffect(() => {
    const cId = localStorage.getItem('courseId');
    const tId = localStorage.getItem('termId');

    setCourseId(cId);
      setTermId(tId);

    const fetchData = async () => {
      try {
      
        if (cId) {
          const courseRes = await axiosInstance.get<TCourse>(
            `/courses/${cId}`
          );
          const course = courseRes.data.data;
          if (course.status === 1) {
            const courseOption = { value: course._id, label: course.name };
            setCourses([courseOption]);
            form.setValue('course', course._id);
          }
        }

        // Fetch term if termId exists
        if (tId) {
          const termRes = await axiosInstance.get<TTerm>(`/terms/${tId}`);
          const term = termRes.data.data;
          if (term.status === 1) {
            const termOption = { value: term._id, label: term.termName };
            setIntakes([termOption]);
            form.setValue('intake', term._id);
          }
        }

        // If no IDs found in localStorage, fallback to fetching all active courses/terms
        if (!tId && !cId) {
          const [courseRes, termRes] = await Promise.all([
            axiosInstance.get<TCourse[]>('/courses'),
            axiosInstance.get<TTerm[]>('/terms')
          ]);

          const activeCourses = courseRes.data.data.result
            .filter((course) => course.status === 1)
            .map((course) => ({
              value: course._id,
              label: course.name
            }));

          const activeTerms = termRes.data.data.result
            .filter((term) => term.status === 1)
            .map((term) => ({
              value: term._id,
              label: term.termName
            }));

          setCourses(activeCourses);
          setIntakes(activeTerms);
        }
      } catch (err) {
        console.error('Failed to fetch course or term details:', err);
      }
    };

    fetchData();
  }, [defaultValues]);

  function onSubmit(data: CourseDetailsData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(2);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardContent>
        <h2 className="mb-6 text-2xl font-semibold">Course Details</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Course select */}
          <div>
            <label className="mb-2 block font-medium">Select Course *</label>
            <Controller
              name="course"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={courses}
                  placeholder="Select course"
                  onChange={(option) => field.onChange(option?.value)}
                  value={courses.find((c) => c.value === field.value) || null}
                  isDisabled={!!courseId}
                />
              )}
            />
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.course?.message}
            </p>
          </div>

          {/* Intake select */}
          <div>
            <label className="mb-2 block font-medium">Intake *</label>
            <Controller
              name="intake"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={intakes}
                  placeholder="Select intake"
                  onChange={(option) => field.onChange(option?.value)}
                  value={intakes.find((i) => i.value === field.value) || null}
                  isDisabled={!!termId}
                />
              )}
            />
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.intake?.message}
            </p>
          </div>
        </div>
      </CardContent>

      <div className="mt-6 flex justify-between px-6">
        <Button
          type="button"
          variant="outline"
          className="bg-watney text-white hover:bg-watney/90"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="bg-watney text-white hover:bg-watney/90"
        >
          Next
        </Button>
      </div>
    </form>
  );
}
