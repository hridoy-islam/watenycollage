'use client';

import React, { useState } from 'react';
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
        <strong>Personal Details:</strong> Full name, date of birth, gender,
        nationality, residency status, contact info.
      </li>
      <li>
        <strong>Address & Emergency Contact:</strong> Your current address and
        emergency contact (e.g., guardian).
      </li>
      <li>
        <strong>Education History:</strong> Previous schools attended,
        transcripts or certificates.
      </li>
      <li>
        <strong>Identification:</strong> Passport, driving licence, birth
        certificate, or BRP.
      </li>
      <li>
        <strong>English Language Proficiency:</strong> Required for non-native
        speakers (IELTS, TOEFL, etc.).
      </li>
      <li>
        <strong>Personal Statement:</strong> For selected courses — explain your
        motivation, goals, and experience.
      </li>
    </ul>
  </div>,

  // Step 3: Choosing Your Course
  <div key="step-3" className="space-y-4">
    <h3 className="text-2xl font-semibold">📘 Choosing Your Course</h3>
    <p className="text-xl">
      We offer a wide range of courses across various disciplines. As you
      prepare to apply:
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        You may apply for one course per application (multiple applications
        allowed).
      </li>
      <li>Ensure you meet the entry criteria listed under each course.</li>
      <li>Choose your preferred intake period (e.g., September or January).</li>
      <li>
        Review course pages carefully for modules, duration, and career paths.
      </li>
    </ul>
  </div>,

  // Step 4: Important Reminders
  <div key="step-4" className="space-y-4">
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
      If you need help during the process, our admissions team is available via
      email, phone, or live chat.
    </p>
  </div>,

  // Step 5: Data & Support + Final Call to Action
  <div key="step-5" className="space-y-6 text-center">
    <h3 className="text-2xl font-semibold">🔐 Data Privacy & Support</h3>
    <p className="text-xl text-gray-700">
      Watney College handles your data securely in compliance with UK GDPR. Your
      personal information will only be used for admissions purposes.
    </p>

    <h4 className="text-xl font-medium">📞 Need Help?</h4>
    <ul className="mt-2 inline-block space-y-1 text-left text-xl text-gray-700">
      <li>
        Email:{' '}
        <a
          href="mailto:admissions@watneycollege.ac.uk"
          className="text-blue-600 underline"
        >
          admissions@watneycollege.ac.uk
        </a>
      </li>
      <li>Phone: +44 (0)20 1234 5678</li>
      <li>Live Chat: Mon–Fri, 9am–5pm (UK time)</li>
    </ul>

    <p className="mb-2 mt-6 text-3xl font-bold">🎓 Ready to Apply?</p>
    <p className="text-xl text-gray-700">
      By clicking "Continue Application” you agree to provide honest and accurate
      information.
    </p>
  </div>
];

export default function StudentGuideline() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const courseId = localStorage.getItem('courseId');

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
      if (user?.isCompleted && user?.role === 'student') {
        navigate(`/dashboard/course-application/${courseId}`);
      } else {
        navigate('/dashboard/student-form');
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
