'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function CourseApplicationPage() {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, termsRes] = await Promise.all([
          axiosInstance.get('/courses'),
          axiosInstance.get('/terms')
        ]);

        setCourses(coursesRes.data?.data.result || []);
        setTerms(termsRes.data?.data.result || []);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !selectedTerm) {
      setError('Please select both course and term.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axiosInstance.post('/application-course', {
        courseId: selectedCourse,
        intakeId: selectedTerm,
        studentId: user._id
      });
      navigate('/dashboard');
      toast({ title: 'Successfully applied!' });
      setSelectedCourse('');
      setSelectedTerm('');
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Application failed.' });

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-semibold">Apply for a Course</h2>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Selection */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Course
          </label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Term Selection */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Intake / Term
          </label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Select an intake" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term._id} value={term._id}>
                  {term.termName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-watney text-white hover:bg-watney/90"
        >
          {submitting ? 'Submitting...' : 'Apply'}
        </Button>
      </form>
    </div>
  );
}
