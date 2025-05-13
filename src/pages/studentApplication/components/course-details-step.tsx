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
  course: z.string().min(1, { message: 'Please select a course' }),
  intake: z.string().min(1, { message: 'Please select an intake' })
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
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [intakes, setIntakes] = useState<{ value: string; label: string }[]>([]);

  const form = useForm<CourseDetailsData>({
    resolver: zodResolver(courseDetailsSchema),
    defaultValues: {
      course: defaultValues?.course || '',
      intake: defaultValues?.intake || ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, termRes] = await Promise.all([
          axiosInstance.get<TCourse[]>('/courses'),
          axiosInstance.get<TTerm[]>('/terms')
        ]);

        const activeCourses = courseRes.data.data.result
          .filter(course => course.status === 1)
          .map(course => ({
            value: course._id,
            label: course.name
          }));

        const activeTerms = termRes.data.data.result
          .filter(term => term.status === 1)
          .map(term => ({
            value: term._id,
            label: term.termName
          }));

        setCourses(activeCourses);
        setIntakes(activeTerms);
      } catch (err) {
        console.error('Failed to fetch courses or terms:', err);
      }
    };

    fetchData();
  }, []);

  function onSubmit(data: CourseDetailsData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(3);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardContent>
        <h2 className="mb-6 text-2xl font-semibold">Course Details</h2>
        <div className="grid gap-6 grid-cols-2">
          {/* Course select */}
          <div>
            <label className="block mb-2 font-medium">Select Course *</label>
            <Controller
              name="course"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={courses}
                  placeholder="Select course"
                  onChange={(option) => field.onChange(option?.value)}
                  value={courses.find(c => c.value === field.value) || null}
                />
              )}
            />
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.course?.message}
            </p>
          </div>

          {/* Intake select */}
          <div>
            <label className="block mb-2 font-medium">Intake *</label>
            <Controller
              name="intake"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={intakes}
                  placeholder="Select intake"
                  onChange={(option) => field.onChange(option?.value)}
                  value={intakes.find(i => i.value === field.value) || null}
                />
              )}
            />
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.intake?.message}
            </p>
          </div>
        </div>
      </CardContent>

      <div className="px-6 flex justify-between mt-6">
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
