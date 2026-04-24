import type React from 'react';
import { motion } from 'framer-motion';
import { BookAIcon, Calendar, MapPin, MoveLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import your logo here (adjust the path as needed)
import logo from '@/assets/imges/home/logo.png';

export interface Course {
  _id: string;
  name: string;
}

export interface Term {
  _id: string;
  termName: string;
}

const studentTypes = [
  { label: 'Overseas', value: 'international' },
  // { label: 'Home Student', value: 'eu' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

interface CourseSelectionFormProps {
  formData: {
    studentType: string;
    termName: string;
    courseName: string;
    courseId: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      studentType: string;
      termName: string;
      courseName: string;
      courseId: string;
    }>
  >;
  courses: Course[];
  startDates: Term[];
  handleCourseChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  courseIdFromUrl?: string;
  isPreselectedCourse: boolean;
}

export default function CourseSelectionForm({
  formData,
  setFormData,
  courses,
  startDates,
  handleCourseChange,
  handleSubmit,
  courseIdFromUrl,
  isPreselectedCourse
}: CourseSelectionFormProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-2">
      
      {/* --- Top Right Back Button --- */}
      <Button
        onClick={() => window.location.href = 'https://www.watneycollege.co.uk/'}
        variant={'default'}
        className={cn(
          'absolute right-4 top-4 md:right-8 md:top-8 bg-watney text-white hover:bg-watney/90 transition-colors'
        )}
      >
        <MoveLeft className="mr-2 w-5 h-5" /> Back To Website
      </Button>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container flex w-full flex-col items-center justify-center text-center mt-12 md:mt-0"
      >
        {/* --- Logo and Title --- */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-row items-center justify-center gap-4">
          <img src={logo} alt="Watney College Logo" className="w-12 md:w-16" />
          <div className="border-l-2 border-gray-300 h-12"></div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Watney College
          </h1>
        </motion.div>

        {/* Conditional Heading */}
        <motion.div variants={itemVariants} className="mb-3">
          {isPreselectedCourse ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                Apply for
                <span className="mt-1 block bg-gradient-to-r from-watney to-blue-700 bg-clip-text text-transparent">
                  {formData.courseName}
                </span>
              </h2>
            </>
          ) : (
            <>
              {/* Optional generic heading space */}
            </>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full max-w-xl rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-md md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Course Name - Conditional rendering */}
              {!isPreselectedCourse && (
                <motion.div className="group" whileHover={{ scale: 1.01 }}>
                  <label
                    htmlFor="courseName"
                    className="mb-1 block text-left text-sm font-semibold text-gray-700"
                  >
                    I would like to study for
                  </label>
                  <Select
                    value={formData.courseName}
                    onValueChange={handleCourseChange}
                  >
                    <SelectTrigger className="relative flex w-full items-center rounded-lg border border-gray-300 bg-white py-4 pl-10 pr-3 text-sm text-gray-800 focus:ring-2 focus:ring-watney">
                      <BookAIcon
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-watney"
                        size={16}
                      />
                      <SelectValue placeholder="Select your course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course.name}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              {/* Term Name */}
              <motion.div className="group" whileHover={{ scale: 1.01 }}>
                <label
                  htmlFor="termName"
                  className="mb-1 block text-left text-sm font-semibold text-gray-700"
                >
                  I am interested to start in
                </label>
                <Select
                  value={formData.termName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, termName: value })
                  }
                >
                  <SelectTrigger className="relative flex w-full items-center rounded-lg border border-gray-300 bg-white py-4 pl-10 pr-3 text-sm text-gray-800 focus:ring-2 focus:ring-watney">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-watney"
                      size={16}
                    />
                    <SelectValue placeholder="Select Your Intake" />
                  </SelectTrigger>
                  <SelectContent>
                    {startDates?.map((term) => (
                      <SelectItem key={term._id} value={term.termName}>
                        {term.termName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Student Type */}
              <motion.div className="group" whileHover={{ scale: 1.01 }}>
                <label
                  htmlFor="studentType"
                  className="mb-1 block text-left text-sm font-semibold text-gray-700"
                >
                  My location
                </label>
                <Select
                  value={formData.studentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentType: value })
                  }
                >
                  <SelectTrigger className="relative flex w-full items-center rounded-lg border border-gray-300 bg-white py-4 pl-10 pr-3 text-sm text-gray-800 focus:ring-2 focus:ring-watney">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-watney"
                      size={16}
                    />
                    <SelectValue placeholder="Select your Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentTypes.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-gradient-to-r from-watney to-blue-800 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !formData.studentType ||
                !formData.termName ||
                !formData.courseName
              }
              type="submit"
            >
              APPLY
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}