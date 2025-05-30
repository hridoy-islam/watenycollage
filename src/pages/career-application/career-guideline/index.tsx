'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const steps: React.ReactNode[] = [
  <p>
    👋 <strong>Welcome to the dashboard!</strong> Here’s how to get started.
  </p>,
  <div>
    <p>
      You can submit new applications using the{' '}
      <strong>“New Application”</strong> button.
    </p>
    <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
      <li>Fill in your personal info</li>
      <li>Select your course</li>
      <li>Submit for review</li>
    </ul>
  </div>,
  <div>
    <p>
      Check out the <strong>Courses</strong> and <strong>Terms</strong> in the
      sidebar for more information.
    </p>
    <img
      src="/images/sidebar-guide.png"
      alt="Sidebar"
      className="mt-4 w-1/2 rounded border"
    />
  </div>,
  <div className="text-center">
    <p className="mb-2 text-lg font-semibold">You’re all set! 🎉</p>
    <p>Let’s get started and make the most of your journey.</p>
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
 <Dialog open={open} >
  <DialogContent
    onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
    className="p-0 w-[95vw] h-[95vh] max-w-none "
  >
    <Card className="flex h-full w-full flex-col border-none shadow-none">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold">Guidelines</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-6 py-6 text-base text-gray-700">
        {steps[step]}
      </CardContent>

      <CardFooter className="px-6 py-4  flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-watney text-white hover:bg-watney/90"
        >
          {step === steps.length - 1 ? 'Continue Application' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  </DialogContent>
</Dialog>

  );
}
