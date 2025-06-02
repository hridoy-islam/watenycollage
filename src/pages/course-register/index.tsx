import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/lib/axios';
import ApplicationForm from './components/application-form';
import CourseSelectionForm from './components/course-selection-form';
import { useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export interface Course {
  _id: string;
  name: string;
}

export interface Term {
  _id: string;
  termName: string;
}

function CourseRegistration() {
  const [formData, setFormData] = useState({
    studentType: '',
    termName: '',
    courseName: '',
    courseId: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [startDates, setStartDates] = useState<Term[]>([]);
  const [showApplication, setShowApplication] = useState(false);
  const { id: courseIdFromUrl } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [termsRes, coursesRes] = await Promise.all([
          axiosInstance.get('/terms?status=1&limit=all'),
          axiosInstance.get('/courses?status=1&limit=all')
        ]);

        setStartDates(termsRes?.data?.data?.result || []);
        const fetchedCourses = coursesRes?.data?.data?.result || [];
        setCourses(fetchedCourses);

        // If there's a course ID in the URL, find and set that course
        if (courseIdFromUrl) {
          const selectedCourse = fetchedCourses.find(
            (course: any) => String(course._id) === String(courseIdFromUrl)
          );
          if (selectedCourse) {
            setFormData((prev) => ({
              ...prev,
              courseName: selectedCourse.name,
              courseId: selectedCourse._id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, [courseIdFromUrl]);

  const handleCourseChange = (value: string) => {
    const selectedCourse = courses.find((course) => course.name === value);
    setFormData((prev) => ({
      ...prev,
      courseName: value,
      courseId: selectedCourse?._id || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTerm = startDates.find(
      (term) => term.termName === formData.termName
    );
    const termId = selectedTerm?._id;

    const selectedCourse = courses.find(
      (course) => course.name === formData.courseName
    );
    const courseId = selectedCourse?._id;

    if (courseId && termId && formData.studentType) {
      localStorage.setItem('courseId', courseId);
      localStorage.setItem('termId', termId);
      localStorage.setItem('studentType', formData.studentType);

      setShowApplication(true);
    }
  };

  // Check if course ID from URL matches any course
  // const isPreselectedCourse = Boolean(
  //   courseIdFromUrl && courses.find((course) => course._id === courseIdFromUrl)
  // );

  const isPreselectedCourse = Boolean(
    !isLoading &&
      courseIdFromUrl &&
      courses.find((course) => course._id === courseIdFromUrl)
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-2">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return showApplication ? (
    <ApplicationForm
      formData={formData}
      onBack={() => setShowApplication(false)}
    />
  ) : (
    <CourseSelectionForm
      formData={formData}
      setFormData={setFormData}
      courses={courses}
      startDates={startDates}
      handleCourseChange={handleCourseChange}
      handleSubmit={handleSubmit}
      courseIdFromUrl={courseIdFromUrl}
      isPreselectedCourse={isPreselectedCourse}
    />
  );
}

export default CourseRegistration;
