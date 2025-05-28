'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function CourseApplicationPage() {
  const [course, setCourse] = useState<{ id: string; name: string } | null>();
  const [terms, setTerms] = useState<{ id: string; termName: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { id } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, termsRes] = await Promise.all([
          axiosInstance.get(`/courses/${id}`),
          axiosInstance.get('/terms')
        ]);

        setCourse(courseRes.data?.data || null);
        setSelectedCourse(courseRes.data?.data?._id || '');

        const termsData = termsRes.data?.data.result || [];
        setTerms(termsData);

        const termIdFromStorage = localStorage.getItem('termId');
        if (termIdFromStorage) {
          const matchingTerm = termsData.find(
            (term: any) => term._id === termIdFromStorage
          );
          if (matchingTerm) {
            setSelectedTerm(matchingTerm._id);
          }
        }
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

      // Clear the relevant data from localStorage after successful submission
      localStorage.removeItem('termId');
      localStorage.removeItem('courseId');
      localStorage.removeItem('studentType');
      
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

  console.log(course);
  if (loading)
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );

  // Format options for react-select
  const termOptions = terms.map(term => ({
    value: term._id,
    label: term.termName
  }));

  return (
    <div className="mx-auto p-6">
      <h2 className="mb-4 text-2xl font-semibold">Apply for a Course</h2>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Display (read-only since it's selected via URL param) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Course
          </label>
          {course ? (
            <h1>{course.name}</h1>
          ) : (
            <h1 className="italic text-gray-500">
              Course information not available
            </h1>
          )}
        </div>

        {/* Term Selection with react-select */}
        <div className='w-[40vw]'>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Intake / Term
          </label>
          <Select
            options={termOptions}
            value={termOptions.find(option => option.value === selectedTerm)}
            onChange={selectedOption => setSelectedTerm(selectedOption?.value || '')}
            isDisabled={!!localStorage.getItem('termId')}
            placeholder="Select an intake"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-[200px] bg-watney text-white hover:bg-watney/90"
        >
          {submitting ? 'Submitting...' : 'Apply'}
        </Button>
      </form>
    </div>
  );
}
