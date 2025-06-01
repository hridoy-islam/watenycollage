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
  // Step 1: Welcome to Careers at Watney College
  <div key="step-1" className="space-y-4">
    <p className="text-2xl font-medium">
      👋 <strong>Welcome to Careers at Watney College</strong> — a leading
      UK-based institution that values talent, diversity, and passion for
      education.
    </p>
    <p className="text-xl">
      Thank you for your interest in joining our team. Before you proceed with
      your job application, please read this guide carefully.
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>We are an equal opportunity employer</li>
      <li>
        We welcome applications from all backgrounds and experience levels
      </li>
      <li>
        All applications will be considered in accordance with UK employment and
        equality laws
      </li>
    </ul>
  </div>,

  // Step 2: What You’ll Need
  <div key="step-2" className="space-y-4">
    <h3 className="text-2xl font-semibold">📋 What You'll Need</h3>
    <p className="text-xl">
      To help us assess your application accurately, please ensure you have the
      following ready:
    </p>

    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        <strong>Personal Details:</strong> Full name, date of birth, gender
        (optional), nationality, eligibility to work in the UK.
      </li>
      <li>
        <strong>Contact Information:</strong> Current address, email, and phone
        number.
      </li>
      <li>
        <strong>Employment History:</strong> Previous roles (job titles,
        employers, dates), key responsibilities and achievements.
      </li>
      <li>
        <strong>Education & Qualifications:</strong> Relevant degrees,
        certifications, or training courses.
      </li>
      <li>
        <strong>Supporting Documents:</strong> Updated CV/Resume, cover letter
        (if applicable), proof of right to work in the UK (passport, BRP,
        settled status).
      </li>
      <li>
        <strong>References:</strong> At least two referees (not family members).
      </li>
    </ul>
  </div>,

  // Step 3: Choosing the Right Role
  <div key="step-3" className="space-y-4">
    <h3 className="text-2xl font-semibold">💼 Choosing the Right Role</h3>
    <p className="text-xl">
      Please review the available job listings carefully. Each role includes
      important information such as:
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>Job title and responsibilities</li>
      <li>Contract type (e.g., full-time, part-time, temporary)</li>
      <li>Location (onsite or remote)</li>
      <li>Salary range and benefits</li>
      <li>Required qualifications and experience</li>
    </ul>
    <p className="text-xl text-gray-700">
      ⚠️ You may only apply for one role per submission, but you’re welcome to
      apply again for other roles in the future.
    </p>
  </div>,

  // Step 4: Important Reminders
  <div key="step-4" className="space-y-4">
    <h3 className="text-2xl font-semibold">⚠️ Important Reminders</h3>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        <strong>Be truthful and accurate:</strong> False or misleading
        information may lead to disqualification.
      </li>
      <li>
        <strong>Tailor your application:</strong> Make sure your CV and cover
        letter align with the job you're applying for.
      </li>
      <li>
        <strong>Accessibility and Inclusion:</strong> If you need reasonable
        adjustments during the application or interview process, let us know —
        we are here to support you.
      </li>
    </ul>
    <p className="mt-4 text-xl text-gray-700">
      We are committed to creating a workplace that reflects the diversity of
      the students and community we serve.
    </p>
  </div>,

  // Step 5: Data & Support + Final Call to Action
  <div key="step-5" className="space-y-6 text-center">
    <h3 className="text-2xl font-semibold">🔐 Data Privacy & Support</h3>
    <p className="text-xl text-gray-700">
      We collect and process your personal data in compliance with UK GDPR and
      employment legislation. Your data will be used solely for recruitment
      purposes and stored securely.
    </p>

    <h4 className="text-xl font-medium">📞 Need Help?</h4>
    <ul className="mt-2 inline-block space-y-1 text-left text-xl text-gray-700">
      <li>
        Email:{' '}
        <a
          href="mailto:careers@watneycollege.ac.uk"
          className="text-blue-600 underline"
        >
          careers@watneycollege.ac.uk
        </a>
      </li>
      <li>Phone: +44 (0)20 9876 5432</li>
      <li>Live Chat: Mon–Fri, 9am–5pm (UK time)</li>
    </ul>

    <p className="mb-2 mt-6 text-3xl font-bold">✅ Ready to Apply?</p>
    <p className="text-xl text-gray-700">
      By clicking “Continue Application,” you agree to provide honest and
      accurate information.
    </p>
  </div>
];

export default function CareerGuideline() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
      if (user?.isCompleted && user?.role === 'applicant') {
        navigate('/dashboard/job-application');
      } else {
        navigate('/dashboard/career');
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
              Career Application Guidelines
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
