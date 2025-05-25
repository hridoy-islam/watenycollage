'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle
} from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const steps = [
  'Welcome to the dashboard! Here’s how to get started.',
  'You can submit new applications using the “New Application” button.',
  'Check out available courses and terms in the sidebar.',
  'You’re all set! Let’s get started!'
];

export default function CareerGuideline() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
       if (user?.isCompleted && user?.role === 'applicant') {
        navigate('/dashboard/job-application');
      } else {
        navigate('/dashboard/career');
      }
    }
  };

  return (
    <Card className="mx-auto max-w-md border border-gray-200 shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Guidelines</CardTitle>
      </CardHeader>

      <CardContent className="min-h-[100px] py-4 text-gray-700">
        {steps[step]}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-watney text-white hover:bg-watney/90"
        >
          {step === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}
