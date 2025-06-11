import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';

const steps: React.ReactNode[] = [
  // Step 1: Welcome to Watney College
  <div key="step-1" className="space-y-4">
    <p className="text-2xl font-medium">
      👋 <strong>Welcome to Watney College</strong> — a proud UK-based
      institution committed to helping students like you achieve their academic
      goals and career ambitions.
    </p>
    <p className="text-xl">
      Before you start your course application, please take a few moments to
      read through this important guideline.
    </p>
    <ul className="mt-4 list-disc pl-8 text-xl text-gray-700">
      <li>You must be at least 16 years of age</li>
      <li>
        You must meet the entry requirements for the course you’re applying for
      </li>
      <li>You must be ready to provide accurate and complete information</li>
    </ul>
  </div>,

  // Step 2: What You’ll Need
  <div key="step-2" className="space-y-4">
    <h3 className="text-2xl font-semibold">🔹 What You'll Need</h3>
    <p className="text-xl">
      To complete your application successfully, make sure you have the
      following ready:
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        <strong>Personal Details:</strong> Title, First Name, Middle
        Name(Initial), Last Name, Date of birth, Gender, Country Of Birth.
      </li>
      <li>
        <strong>Address Information:</strong> Your current residential address,
        including Address Line1, Address Line 2, City, Post code, Country.
      </li>
      <li>
        <strong>Emergency Contact:</strong> Provide your emergency contact
        details, including their full name, relationship to you, and contact
        number, email, address.
      </li>
      <li>
        <strong>Education History:</strong> Previous Institution Name,
        qualification, grade, award date and certificate.
      </li>
      <li>
        <strong>English Language Proficiency:</strong>{' '}
        <li>
          <strong>English Language Proficiency:</strong> Required for
          non-British citizens (e.g., IELTS, TOEFL, etc.).
        </li>
      </li>
      <li>
        <strong>Employment Details:</strong> If applicable, provide your current
        or most recent employer's name, job title, and employment start date and
        your responsibilities.
      </li>

      <li>
        <strong>Miscellaneous:</strong> Any additional information that may
        support your application, such as personal statement.
      </li>
    </ul>
  </div>,

  // Step 4: Important Reminders
  <div key="step-3" className="space-y-4">
    <h3 className="text-2xl font-semibold">✅ Important Reminders</h3>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        <strong>Accuracy matters:</strong> Double-check all details before
        submission.
      </li>
      <li>
        <strong>Be honest:</strong> This is a legal and binding record. False
        info may result in rejection.
      </li>
      <li>
        <strong>Support & Accessibility:</strong> Let us know if you need
        assistance or accommodations.
      </li>
    </ul>
    <p className="mt-4 text-xl text-gray-700">
      We are here to help you succeed — make sure to reach out if you need any
      clarification.
    </p>
  </div>,

  // Step 5: Data & Support + Final Call to Action
  <div key="step-4" className="space-y-6 text-start">
    <h3 className="text-2xl font-semibold">🔐 Data Privacy & Support</h3>
    <p className="text-xl text-gray-700">
      Watney College handles your data securely in compliance with UK GDPR. Your
      personal information will only be used for admissions purposes.
    </p>

    <p className="mb-2 mt-6 text-3xl font-bold">🎓 Ready to Apply?</p>
    <p className="text-xl text-gray-700">
      By clicking "Continue Application” you agree to provide honest and
      accurate information.
    </p>
  </div>
];

export default function StudentGuideline() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const courseId = localStorage.getItem('courseId');

  const [studentType, setStudentType] = useState<string | null>(null);

  useEffect(() => {
    const getStudentType = async () => {
      try {
        const response = await axiosInstance.get(`/users/${user._id}`);
        const fetchedType = response.data.data?.studentType;
        console.log('Fetched student type:', fetchedType);

        if (fetchedType) {
          setStudentType(fetchedType);
          localStorage.setItem('studentType', fetchedType);
        } else {
          // Fallback to localStorage
          const storedType = localStorage.getItem('studentType');
          if (storedType) {
            setStudentType(storedType);
          }
        }
      } catch (err) {
        // Fallback to localStorage if error occurs
        const storedType = localStorage.getItem('studentType');
        if (storedType) {
          setStudentType(storedType);
        }
      }
    };

    if (user?._id) {
      getStudentType();
    }
  }, [user]);
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (!studentType) {
        console.warn('Student type is not set yet!');
        return;
      }

      setOpen(false);
      if (user?.isCompleted && user?.role === 'student') {
        navigate(`/dashboard/course-application/${courseId}`);
      } else {
        if (studentType === 'international') {
          navigate('/dashboard/international/student-form');
        } else {
          navigate('/dashboard/eu/student-form');
        }
      }
    }
  };

  
  
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="h-[95vh] w-[95vw] max-w-none p-0"
      >
        <Card className="flex h-full flex-col border-none shadow-none">
          <CardHeader className="px-8 py-6">
            <CardTitle className="text-3xl font-bold">
              Application Guidelines
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto px-8 py-6 text-gray-700">
            {steps[step]}
          </CardContent>

          <CardFooter className="justify-end px-8 py-6">
            <Button
              onClick={handleNext}
              className="bg-watney px-8 py-4 text-xl text-white hover:bg-watney/90"
            >
              {step === steps.length - 1 ? 'Continue Application' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
