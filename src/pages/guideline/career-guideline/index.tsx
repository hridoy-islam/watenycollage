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
  // Step 1: Welcome & Introduction
  <div key="step-1" className="space-y-4 text-start">
    <h2 className="text-2xl font-semibold">Welcome to Everycare Romford</h2>
    <p className="text-lg text-gray-700">
      We are part of <strong>Everycare UK</strong>, a trusted home care provider established in 1993 
      with over 20 branches nationwide. Everycare Romford delivers CQC-registered domiciliary care across 
      Havering, Romford, Hornchurch, Rainham, and Upminster. We are rated 
      <strong> Good </strong> by the Care Quality Commission.
    </p>
    <h3 className="text-xl font-semibold">What you’ll discover here:</h3>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li><strong>Who we are</strong> – A leading UK home care provider committed to dignity, independence, and person-centred care.</li>
      <li><strong>What we expect from applicants</strong> – Caring, reliable, and professional people who share our values. Training and support are provided.</li>
      <li><strong>How your data is handled</strong> – Your information is securely stored and managed in line with UK GDPR.</li>
    </ul>
    <p className="text-gray-700">
      We are an equal opportunity employer. All applications are considered fairly under UK employment and equality law.
    </p>
  </div>,

  // Step 2: What You’ll Need
  <div key="step-2" className="space-y-4 text-start">
    <h3 className="text-2xl font-semibold">📋 What You’ll Need</h3>
    <p className="text-lg text-gray-700">To complete your application successfully, please prepare the following:</p>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li><strong>Personal & Background:</strong> Full name, date of birth, gender, address, right-to-work code (if applicable), phone, and email.</li>
      <li><strong>Availability:</strong> Earliest start date, weekly availability, and preferred shifts.</li>
      <li><strong>Education & Training:</strong> Qualifications, awarding body, grades, dates, and care-related training.</li>
      <li><strong>Employment History:</strong> Most recent employer details and responsibilities.</li>
      <li><strong>References:</strong> Two Professional and one charecter refeeres with their contact details.</li>
      <li><strong>Documents:</strong> CV (required), Cover letter (optional), Proof of address, Certificates, DBS certificate (if available).</li>
      <li><strong>Checks:</strong> Disabilities/support needs, immunisation details, unspent convictions.</li>

    </ul>
  </div>,

  // Step 3: Important Reminders
  <div key="step-3" className="space-y-4 text-start">
    <h3 className="text-2xl font-semibold">✅ Important Reminders</h3>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li><strong>Accuracy matters:</strong> Review all information carefully before submission.</li>
      <li><strong>Be truthful:</strong> False or misleading details may lead to rejection or withdrawal of an offer.</li>
      <li><strong>Accessibility:</strong> Tell us if you need adjustments — we want the process to be fair.</li>
      <li><strong>Commitment to standards:</strong> Care roles require safeguarding, confidentiality, and CQC compliance.</li>
    </ul>
  </div>,

  // Step 4: Privacy & Consent
  <div key="step-4" className="space-y-6 text-start">
  <h3 className="text-2xl font-semibold">🔒 Privacy & Consent</h3>

  <p className="text-lg text-gray-700">
    Everycare Romford handles your information securely and in line with UK GDPR. 
    Your data will only be used for recruitment, onboarding, and statutory checks 
    such as references, DBS, and right-to-work verification.
  </p>

  <h4 className="text-xl font-semibold">📄 Declaration</h4>
  <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
    <li>All information you provide is accurate and complete.</li>
    <li>You consent to reference, DBS, and qualification checks.</li>
    <li>You understand that misrepresentation may lead to rejection or termination.</li>
                <li>You Must make sure.</li>

  </ul>
</div>,


  // Step 5: Final Review
  <div key="step-5" className="space-y-4 text-start">
    <h3 className="text-2xl font-semibold">📑 Final Review</h3>
    <p className="text-lg text-gray-700">Here’s a summary of what you’ll complete in the form:</p>
    <ol className="list-decimal pl-6 space-y-1 text-gray-700">
      <li>Personal & Contact Information</li>
      <li>Education & Training</li>
      <li>Employment History</li>
      <li>References</li>
      <li>Document Uploads</li>
      <li>Declarations</li>
    </ol>
        <p className="text-xl font-medium">  When Ready Please Click <strong>Continue Application</strong> button to start with your application process.</p>

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
        navigate('/dashboard/career-application');
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
      Guidelines
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
