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
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { AppDispatch } from '@/redux/store';
import { updateAuthIsAuthorized } from '@/redux/features/authSlice';

const steps: React.ReactNode[] = [
  // Step 1: Welcome to Cyberpeers
  <div key="step-1" className="space-y-4">
    <h2 className="text-3xl font-semibold">Welcome to Careers at Cyberpeers</h2>
    <p className="text-lg">
      Welcome to <strong>Careers at Cyberpeers</strong> — a forward-thinking UK-based digital agency that brings together 
      creative minds, developers, and marketing strategists to build innovative online experiences. 
      At Cyberpeers, we believe that great ideas come from diverse perspectives. Whether you’re a developer, designer, 
      marketer, or creative thinker, your skills can make a real impact here.
    </p>
    <p className="text-lg">
      Before you begin your application, please take a moment to read this guide carefully to ensure a smooth and successful process.
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-lg text-gray-700">
      <li>We are an Equal Opportunities Employer committed to fairness and inclusion.</li>
      <li>We welcome candidates from all backgrounds and experience levels.</li>
      <li>All applications are handled in line with UK employment and equality legislation.</li>
    </ul>
  </div>,

  // Step 2: What You’ll Need
  <div key="step-2" className="space-y-4">
    <h3 className="text-2xl font-semibold">🔹 What You’ll Need</h3>
    <p className="text-lg">
      To complete your application efficiently, please prepare the following information and documents in advance:
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-lg text-gray-700">
      <li>
        <strong>Personal Details:</strong> Your title, full name, date of birth, gender, country of residence, and current address 
        (including Address Line 1, Address Line 2, Town/City, Postcode, and Country).
      </li>
      <li>
        <strong>Application Details:</strong> The date you are available to start and your preferred working hours or flexibility 
        (e.g., hybrid or remote availability).
      </li>
      <li>
        <strong>Education Background:</strong> Institution name, qualification obtained, grade, and date awarded 
        (attach certificates if available).
      </li>
      <li>
        <strong>Employment History:</strong> Current or most recent employer’s name, your job title, start date, and a brief 
        overview of your main responsibilities or key projects.
      </li>
      <li>
        <strong>Disability Information (if applicable):</strong> Let us know if you have a disability or health condition 
        that requires reasonable adjustments during the recruitment process.
      </li>
      <li>
        <strong>References:</strong> Provide details for two professional referees — including their full names, positions, 
        relationship to you, contact numbers, and email addresses.
      </li>
      <li>
        <strong>Documents:</strong> Upload your updated CV, Cover Letter, and proof of address 
        (such as a utility bill or bank statement dated within the last three months).
      </li>
    </ul>
  </div>,

  // Step 3: Important Reminders
  <div key="step-3" className="space-y-4">
    <h3 className="text-2xl font-semibold">Important Reminders</h3>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-lg text-gray-700">
      <li>
        <strong>Be accurate:</strong> Double-check your details before submission. Small errors can delay the process.
      </li>
      <li>
        <strong>Be honest:</strong> All information must be truthful and complete. Providing false or misleading information 
        may result in disqualification.
      </li>
      <li>
        <strong>Ask for help:</strong> If you need assistance or any adjustments during the recruitment process, we’re here to support you.
      </li>
    </ul>
    <p className="mt-4 text-lg text-gray-700">
      Our team values transparency and communication — don’t hesitate to reach out if you have questions about your application 
      or the next steps.
    </p>
  </div>,

  // Step 4: Data Privacy & Support
  <div key="step-4" className="space-y-6 text-start">
    <h3 className="text-2xl font-semibold">Data Privacy & Support</h3>
    <p className="text-lg text-gray-700">
      At Cyberpeers, your privacy and security matter. We handle all personal information in full compliance with UK GDPR. 
      Your data will be used solely for recruitment and onboarding purposes and will never be shared with third parties 
      without your consent.
    </p>
    <p className="text-lg text-gray-700">
      For queries or technical support during your application, contact our recruitment team at 
      <a href="mailto:contact@cyberpeers.co.uk" className="text-theme underline ml-1">contact@cyberpeers.co.uk</a>.
    </p>
  </div>,

  // Step 5: Ready to Apply
  <div key="step-5" className="space-y-4">
    <h3 className="text-2xl font-semibold">Ready to Apply?</h3>
    <p className="text-lg text-gray-700">
      Please ensure you’ve reviewed the guidelines and have all required details and documents ready. 
      When you’re ready, click <strong>“Continue to Application”</strong> to begin your journey with Cyberpeers — 
      let’s build something exceptional together.
    </p>
  </div>,
];


export default function CareerGuideline() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const applicationId = localStorage.getItem('applicationId');

  const dispatch = useDispatch<AppDispatch>();

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await axiosInstance.patch(`/users/${user._id}`, {
        authorized: true
      });
      dispatch(updateAuthIsAuthorized(true));
      setOpen(false);
      if (user?.isCompleted && user?.role === 'applicant') {
        navigate(`/dashboard/job-application/${applicationId}`);
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
        className="h-[95vh] w-[95vw] max-w-5xl overflow-auto p-0 sm:h-auto sm:max-h-[90vh]"
      >
        <Card className="flex h-full flex-col border-none shadow-none">
          {/* Header */}
          <CardHeader className="px-4 py-4 text-center sm:px-8 sm:py-6 sm:text-left">
            <CardTitle className="text-2xl font-bold sm:text-3xl">
              Career Application Guidelines
            </CardTitle>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-gray-700 sm:px-8 sm:py-6 sm:text-base">
            {steps[step]}
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-8 sm:py-6">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="w-full bg-watney px-6 py-3 text-base text-white hover:bg-watney/90 sm:w-auto sm:px-8 sm:py-4 sm:text-xl"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              className="w-full bg-watney px-6 py-3 text-base text-white hover:bg-watney/90 sm:w-auto sm:px-8 sm:py-4 sm:text-xl"
            >
              {step === steps.length - 1 ? 'Continue Application' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
