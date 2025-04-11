import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const courseDetailsSchema = z.object({
  university: z.string().min(1, { message: 'Please select a university' }),
  campus: z.string().min(1, { message: 'Please select a college/campus' }),
  course: z.string().min(1, { message: 'Please select a course' }),
  intake: z.string().min(1, { message: 'Please select an intake' })
});

type CourseDetailsData = z.infer<typeof courseDetailsSchema>;

interface CourseDetailsStepProps {
  defaultValues?: Partial<CourseDetailsData>;
  onSaveAndContinue: (data: CourseDetailsData) => void;
  onSave: (data: CourseDetailsData) => void;
}

// Sample data for dropdowns
const universities = [
  { value: 'uni1', label: 'University of London' },
  { value: 'uni2', label: 'University of Manchester' },
  { value: 'uni3', label: 'University of Birmingham' },
  { value: 'uni4', label: 'University of Edinburgh' }
];

const campuses = {
  uni1: [
    { value: 'campus1', label: 'Central London Campus' },
    { value: 'campus2', label: 'East London Campus' }
  ],
  uni2: [
    { value: 'campus3', label: 'Main Campus' },
    { value: 'campus4', label: 'Business School Campus' }
  ],
  uni3: [
    { value: 'campus5', label: 'City Centre Campus' },
    { value: 'campus6', label: 'Edgbaston Campus' }
  ],
  uni4: [
    { value: 'campus7', label: 'Central Campus' },
    { value: 'campus8', label: "King's Buildings Campus" }
  ]
};

const courses = {
  campus1: [
    { value: 'course1', label: 'BSc Computer Science' },
    { value: 'course2', label: 'BA Business Management' }
  ],
  campus2: [
    { value: 'course3', label: 'BSc Data Science' },
    { value: 'course4', label: 'BA International Relations' }
  ],
  campus3: [
    { value: 'course5', label: 'BSc Artificial Intelligence' },
    { value: 'course6', label: 'BA Economics' }
  ],
  campus4: [
    { value: 'course7', label: 'MBA Business Administration' },
    { value: 'course8', label: 'MSc Finance' }
  ],
  campus5: [
    { value: 'course9', label: 'BSc Mathematics' },
    { value: 'course10', label: 'BA English Literature' }
  ],
  campus6: [
    { value: 'course11', label: 'BSc Physics' },
    { value: 'course12', label: 'BA History' }
  ],
  campus7: [
    { value: 'course13', label: 'BSc Chemistry' },
    { value: 'course14', label: 'BA Philosophy' }
  ],
  campus8: [
    { value: 'course15', label: 'BSc Biology' },
    { value: 'course16', label: 'BA Modern Languages' }
  ]
};

const intakes = [
  { value: 'jan2024', label: 'January 2024' },
  { value: 'apr2024', label: 'April 2024' },
  { value: 'sep2024', label: 'September 2024' },
  { value: 'jan2025', label: 'January 2025' }
];

export function CourseDetailsStep({
  defaultValues,
  onSaveAndContinue,
  onSave
}: CourseDetailsStepProps) {
  const [selectedUniversity, setSelectedUniversity] = useState<string>(
    defaultValues?.university || ''
  );
  const [selectedCampus, setSelectedCampus] = useState<string>(
    defaultValues?.campus || ''
  );

  const form = useForm<CourseDetailsData>({
    resolver: zodResolver(courseDetailsSchema),
    defaultValues: {
      university: defaultValues?.university || '',
      campus: defaultValues?.campus || '',
      course: defaultValues?.course || '',
      intake: defaultValues?.intake || ''
    }
  });

  function onSubmit(data: CourseDetailsData) {
    onSaveAndContinue(data);
  }

  function handleSave() {
    const data = form.getValues();
    onSave(data);
  }

  const handleUniversityChange = (value: string) => {
    setSelectedUniversity(value);
    form.setValue('university', value);
    form.setValue('campus', '');
    form.setValue('course', '');
    setSelectedCampus('');
  };

  const handleCampusChange = (value: string) => {
    setSelectedCampus(value);
    form.setValue('campus', value);
    form.setValue('course', '');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-6 text-2xl font-semibold">Course Details</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select University</FormLabel>
                    <Select
                      onValueChange={(value) => handleUniversityChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {universities.map((university) => (
                          <SelectItem
                            key={university.value}
                            value={university.value}
                          >
                            {university.label}
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
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select College/Campus</FormLabel>
                    <Select
                      onValueChange={(value) => handleCampusChange(value)}
                      defaultValue={field.value}
                      disabled={!selectedUniversity}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedUniversity &&
                          campuses[
                            selectedUniversity as keyof typeof campuses
                          ]?.map((campus) => (
                            <SelectItem key={campus.value} value={campus.value}>
                              {campus.label}
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
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Course *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedCampus}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCampus &&
                          courses[selectedCampus as keyof typeof courses]?.map(
                            (course) => (
                              <SelectItem
                                key={course.value}
                                value={course.value}
                              >
                                {course.label}
                              </SelectItem>
                            )
                          )}
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
                      defaultValue={field.value}
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
        </Card>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={handleSave}>
            Save
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
}
