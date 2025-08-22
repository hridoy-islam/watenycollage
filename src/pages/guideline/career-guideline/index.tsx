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
  // Step 1: Welcome to Care Square
  <div key="step-1" className="space-y-4">
    <p className="text-2xl font-medium">
      👋 <strong>Welcome to Careers at Care Square</strong> — a leading
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
    <h3 className="text-2xl font-semibold">🔹 What You'll Need</h3>
    <p className="text-xl">
      To complete your application successfully, make sure you have the
      following ready:
    </p>
    <ul className="mt-4 list-disc space-y-2 pl-8 text-xl text-gray-700">
      <li>
        <strong>Personal Details:</strong> Title, First Name, Middle
        Name(Initial), Last Name, Date of birth, Gender, Country Of Residence
        and also your current residential address, including Address Line1,
        Address Line 2, City, Post code, Country.
      </li>
      <li>
        <strong>Application Details:</strong> Provide the of your availablility
        to start work, your weekly availablility.
      </li>
      <li>
        <strong>Education History:</strong> Previous Institution Name,
        qualification, grade, award date and certificate.
      </li>
      <li>
        <strong>Employment Details:</strong> If applicable, provide your current
        or most recent employer's name, job title, and employment start date and
        your responsibilities.
      </li>

      <li>
        <strong>Disability Details:</strong> If you have a disability, please
        provide details so we can make necessary accommodations during the
        application process.
      </li>
      <li>
        <strong>Reference Details:</strong> You will need to provide two
        professional references, including their full name, relationship to you,
        and contact number, email, address.
      </li>
      <li>
        <strong>Documents:</strong> You have to upload your CV , Cover Letter
        and Proof of address (e.g., utility bill, bank statement) dated within
        the last 3 months.
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
      Care Square handles your data securely in compliance with UK GDPR. Your
      personal information will only be used for application purposes.
    </p>

    <p className="mb-2 mt-6 text-3xl font-bold">🎓 Ready to Apply?</p>
    <p className="text-xl text-gray-700">
      By clicking "Continue Application” you agree to provide honest and
      accurate information.
    </p>
  </div>
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
        className="h-[95vh] w-[95vw] max-w-5xl p-0 sm:h-auto sm:max-h-[90vh] overflow-auto"
      >
       <Card className="flex h-full flex-col border-none shadow-none">
  {/* Header */}
  <CardHeader className="px-4 py-4 sm:px-8 sm:py-6 text-center sm:text-left">
    <CardTitle className="text-2xl sm:text-3xl font-bold">
      Career Application Guidelines
    </CardTitle>
  </CardHeader>

  {/* Content */}
  <CardContent className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6 text-gray-700 text-sm sm:text-base leading-relaxed">
    {steps[step]}
  </CardContent>

  {/* Footer */}
  <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between px-4 py-4 sm:px-8 sm:py-6">
    {step > 0 ? (
      <Button
        variant="outline"
        onClick={() => setStep(step - 1)}
        className="w-full sm:w-auto bg-watney px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-xl text-white hover:bg-watney/90"
      >
        Back
      </Button>
    ) : (
      <div />
    )}

    <Button
      onClick={handleNext}
      className="w-full sm:w-auto bg-watney px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-xl text-white hover:bg-watney/90"
    >
      {step === steps.length - 1 ? 'Continue Application' : 'Next'}
    </Button>
  </CardFooter>
</Card>

      </DialogContent>
    </Dialog>
  );
}
