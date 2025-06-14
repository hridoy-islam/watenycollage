
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { motion } from 'framer-motion';
import { MoveLeft } from 'lucide-react';

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
          axiosInstance.get('/terms?status=1&limit=all')
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
      toast({ title: err.response?.data?.message || 'Application failed.', className: 'bg-destructive text-white border-none' });
      localStorage.removeItem('termId');
      localStorage.removeItem('courseId');
      localStorage.removeItem('studentType');
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

  // Format options for react-select
  const termOptions = terms.map((term) => ({
    value: term._id,
    label: term.termName
  }));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="mx-auto p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className=" flex flex-col items-center justify-center text-center"
      >
        <div className="flex w-full justify-start">
          <Button className="bg-watney text-white hover:bg-watney/90" onClick={()=> navigate("/dashboard")}>
            {' '}
            <MoveLeft /> Back
          </Button>
        </div>
        {user.role !== "admin" && <motion.div variants={itemVariants} className="mb-3">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Enroll the Course
            <span className="mt-1 block bg-gradient-to-r from-watney to-blue-700 bg-clip-text text-transparent">
              Unlock Your Potential with Expert-Led Learning
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium text-gray-600">
            Take the next step in your learning journey. Enroll the course today
            and gain skills that make a difference.
          </p>
        </motion.div>
}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-md md:p-8"
        >
          {error && (
            <p className="mb-4 text-left text-sm text-red-500">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Course Display */}
            <motion.div className="group" whileHover={{ scale: 1.01 }}>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Course
              </label>
              {course ? (
                <h1 className="text-base font-medium text-gray-800">
                  {course.name}
                </h1>
              ) : (
                <h1 className="italic text-gray-500">
                  Course information not available
                </h1>
              )}
            </motion.div>

            {/* Term Selection */}
            <motion.div className="group" whileHover={{ scale: 1.01 }}>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Intake / Term
              </label>
              <Select
                options={termOptions}
                value={termOptions.find(
                  (option) => option.value === selectedTerm
                )}
                onChange={(selectedOption) =>
                  setSelectedTerm(selectedOption?.value || '')
                }
                isDisabled={!!localStorage.getItem('termId')}
                placeholder="Select an intake"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-watney to-blue-800 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Apply'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
