'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

const courseDetailsSchema = z.object({
  course: z.string().min(1, { message: 'Please select a course' }),
  intake: z.string().min(1, { message: 'Please select an intake' })
});

type CourseDetailsData = z.infer<typeof courseDetailsSchema>;



const allCourses = [
  { value: 'course1', label: 'BSc Computer Science' },
  { value: 'course2', label: 'BA Business Management' },
  { value: 'course3', label: 'BSc Data Science' },
  { value: 'course4', label: 'BA International Relations' },
  { value: 'course5', label: 'BSc Artificial Intelligence' },
  { value: 'course6', label: 'BA Economics' },
  { value: 'course7', label: 'MBA Business Administration' },
  { value: 'course8', label: 'MSc Finance' },
  { value: 'course9', label: 'BSc Mathematics' },
  { value: 'course10', label: 'BA English Literature' },
  { value: 'course11', label: 'BSc Physics' },
  { value: 'course12', label: 'BA History' },
  { value: 'course13', label: 'BSc Chemistry' },
  { value: 'course14', label: 'BA Philosophy' },
  { value: 'course15', label: 'BSc Biology' },
  { value: 'course16', label: 'BA Modern Languages' }
];

const intakes = [
  { value: 'jan2024', label: 'January 2024' },
  { value: 'apr2024', label: 'April 2024' },
  { value: 'sep2024', label: 'September 2024' },
  { value: 'jan2025', label: 'January 2025' }
];

export function CourseDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave,
  setCurrentStep
}) {
  
  const form = useForm<CourseDetailsData>({
    resolver: zodResolver(courseDetailsSchema),
    defaultValues: {
      course: defaultValues?.course || '',
      intake: defaultValues?.intake || ''
    }
  });

  function onSubmit(data: CourseDetailsData) {
    onSaveAndContinue(data);
  }

  function handleBack() {
    setCurrentStep(3);
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <h2 className="mb-6 text-2xl font-semibold">Course Details</h2>
          <div className="grid  gap-6 grid-cols-2">
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Course *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    {...field}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allCourses.map((course) => (
                        <SelectItem key={course.value} value={course.value}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    {...field}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intakes.map((intake) => (
                        <SelectItem key={intake.value} value={intake.value}>
                          {intake.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <div className="px-6 flex justify-between mt-6">
        <Button type="button" variant="outline" className='bg-watney text-white hover:bg-watney/90'  onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" className='bg-watney text-white hover:bg-watney/90'>Next</Button>
        </div>
      </form>
    </Form>
  );
}
