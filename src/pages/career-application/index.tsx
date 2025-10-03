import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfilePictureStep } from './components/profile-picture-step';
import { PersonalDetailsStep } from './components/personal-details-step';
import { DisabilityInfoStep } from './components/disability-info-step';
import { ApplicationDetailsStep } from './components/application-details-step';
import { ReviewStep } from './components/review-step';
import { RefereeDetailsStep } from './components/referee-details-step';
import { DocumentStep } from './components/DocumentStep';
import { EducationStep } from './components/education-step';
import { EmploymentStep } from './components/employment-step';
import { TrainingStep } from './components/training-step';
import { ExperienceStep } from './components/ExperienceStep';
import { EthnicityStep } from './components/EthnicityStep';
import { PostEmployementStep } from './components/postEmployementStep';
import { PaymentStep } from './components/paymentStep';
import { AddressStep } from './components/addressStep';
import { NextToKinStep } from './components/nextToKinStep';

// UI Components
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import type { TCareer } from '@/types/career';
import { updateAuthIsCompleted } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useLocation } from 'react-router-dom';

// Circular Progress
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Define form steps (for UI reference)
const careerFormSteps = [
  { id: 1, label: 'Profile Picture' },
  { id: 2, label: 'Personal Details' },
  { id: 3, label: 'Address Details' },
  { id: 4, label: 'Next To Kin' },
  { id: 5, label: 'Application Details' },
  { id: 6, label: 'Education' },
  { id: 7, label: 'Training' },
  { id: 8, label: 'Employment' },
  { id: 9, label: 'Referee Details' },
  { id: 10, label: 'Experience' },
  { id: 11, label: 'Ethnicity' },
  { id: 12, label: 'Disability Info' },
  { id: 13, label: 'Documents' },
  { id: 14, label: 'Post-Employment' },
  { id: 15, label: 'Payment' },
  { id: 16, label: 'Review & Submit' }
];

const TOTAL_FILLABLE_STEPS = 16;

const SUB_STEP_CONFIG: Record<number, number> = {
  14: 9,
  16: 3
};

export default function CareerApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [subStepInfo, setSubStepInfo] = useState<{ current: number; total: number }>({ current: 1, total: 1 });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<TCareer>>({
    status: 'applied'
  });
  const [fetchData, setFetchData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // ✅ For animated feedback
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [parsedResume, setParsedResume] = useState<string | null>(null);
  const location = useLocation();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [subStep, setSubstep] = useState(1);

  const refreshData = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  useEffect(() => {
    if (location.state?.parsedResume) {
      setParsedResume(location.state.parsedResume);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchedData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${user._id}`);
      const userData = response.data.data;
      setFetchData((prev) => ({
        ...prev,
        ...userData
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchedData();
  }, [refreshCounter]);

  const findFirstIncompleteStep = (userData: any): number => {
    if (!userData.image || userData.image.trim() === '') {
      return 1;
    }
    return -1;
  };

  useEffect(() => {
    if (Object.keys(fetchData).length === 0) return;

    const firstIncompleteStep = findFirstIncompleteStep(fetchData);
    if (firstIncompleteStep !== -1 && currentStep !== firstIncompleteStep) {
      setCurrentStep(firstIncompleteStep);
    }
  }, [fetchData]);

useEffect(() => {
  const total = SUB_STEP_CONFIG[currentStep] || 1;
  setSubStepInfo({ current: 1, total }); // always reset to 1
}, [currentStep]);



  const applicationId = localStorage.getItem('applicationId');

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  // ✅ Show animated success message when step is completed
  const markStepAsCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);

      const inspiringMessages: Record<number, string> = {
        1: "Great start! Your profile picture is set.",
        2: "Personal details locked in — looking good!",
        3: "Address saved. One step closer to your new role!",
        4: "Next of kin added. Safety first!",
        5: "Application details submitted — you're on a roll!",
        6: "Education history updated. Your journey matters!",
        7: "Training recorded. Skills are power!",
        8: "Employment info saved. Experience counts!",
        9: "Referees added. Trusted voices in your corner!",
        10: "Work experience logged. Impressive background!",
        11: "Ethnicity info recorded. Diversity strengthens us.",
        12: "Disability info saved. We’re here to support you.",
        13: "Documents uploaded. Almost there!",
        14: "Post-employment plans noted. Forward-thinking!",
        15: "Payment details confirmed. Smooth sailing ahead!",
        16: "Review complete! You’re ready to submit."
      };

      const message = inspiringMessages[stepId] || `✅ Step ${stepId} completed!`;
      setSuccessMessage(`🎉 ${message}`);
      setTimeout(() => setSuccessMessage(null), 3500); // Slightly longer to read
    }
  };

  // === Step Handlers ===
  const handleProfilePictureSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user?._id}`, data);
      markStepAsCompleted(1);
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    }
  };

  const handlePersonalDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(2);
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to update personal details:', error);
    }
  };

  const handleAdsressSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(3);
      setCurrentStep(4);
    } catch (error) {
      console.error('Failed to update address details:', error);
    }
  };

  const handleNextToKinSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(4);
      setCurrentStep(5);
    } catch (error) {
      console.error('Failed to update next to kin details:', error);
    }
  };

  const handleApplicationDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(5);
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to update application details:', error);
    }
  };

  const handleEducationSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(6);
      setCurrentStep(7);
    } catch (error) {
      console.error('Failed to update education details:', error);
    }
  };

  const handleTrainingSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(7);
      setCurrentStep(8);
    } catch (error) {
      console.error('Failed to update training details:', error);
    }
  };

  const handleEmploymentSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(8);
      setCurrentStep(9);
    } catch (error) {
      console.error('Failed to update employment details:', error);
    }
  };

  const handleRefereeDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(9);
      setCurrentStep(10);
    } catch (error) {
      console.error('Failed to update referee details:', error);
    }
  };

  const handleExperianceSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(10);
      setCurrentStep(11);
    } catch (error) {
      console.error('Failed to update experience details:', error);
    }
  };

  const handleEthnicitySaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(11);
      setCurrentStep(12);
    } catch (error) {
      console.error('Failed to update ethnicity info:', error);
    }
  };

  const handleDisabilityInfoSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(12);
      setCurrentStep(13);
    } catch (error) {
      console.error('Failed to update disability info:', error);
    }
  };

  const handleDocumentSave = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Something went wrong.',
        className: 'destructive border-none text-white'
      });
    }
  };

  const handleDocumentsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(13);
      setCurrentStep(14);
      setSubstep(1)
    } catch (error) {
      console.error('Failed to update documents:', error);
    }
  };

  const handlePostEmployementSave = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Something went wrong.',
        className: 'destructive border-none text-white'
      });
    }
  };

  const handlePostEmployementSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(14);
      setCurrentStep(15);
    } catch (error) {
      console.error('Failed to update post-employment info:', error);
    }
  };

  const handlePayrollSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(15);
      setCurrentStep(16);
      setSubstep(1);
    } catch (error) {
      console.error('Failed to update payment info:', error);
    }
  };

  const handleDashboardRedirect = () => {
    navigate('/dashboard');
  };

  const handleReviewClick = () => {
    const requiredSteps = Array.from({ length: TOTAL_FILLABLE_STEPS }, (_, i) => i + 1);
    const missingSteps = requiredSteps.filter((step) => !completedSteps.includes(step));

    if (missingSteps.length > 0) {
      const missingStepNames = missingSteps.map(
        (stepId) =>
          careerFormSteps.find((step) => step.id === stepId)?.label ||
          `Step ${stepId}`
      );

      toast({
        title: 'Incomplete Application',
        description: `Please complete the following sections before reviewing: ${missingStepNames.join(', ')}`,
        variant: 'destructive'
      });

      setCurrentStep(missingSteps[0]);
      return;
    }

    setReviewModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      await axiosInstance.patch(`/users/${user._id}`, {
        ...formData,
        isCompleted: true
      });
      dispatch(updateAuthIsCompleted(true));

      if (applicationId) {
        await axiosInstance.post('/application-job', {
          jobId: applicationId,
          applicantId: user?._id
        });
      }

      localStorage.removeItem('applicationId');

      // toast({
      //   description: 'Career application submitted successfully.'
      // });

      setFormSubmitted(true);
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Something went wrong.',
        className: 'destructive border-none text-white'
      });
    }
  };

  const calculateProgressPercentage = () => {
    let completed = 0;
    for (let step = 1; step <= TOTAL_FILLABLE_STEPS; step++) {
      if (completedSteps.includes(step)) {
        completed += 1;
      } else if (step === currentStep) {
        const { current: currentSub, total: totalSub } = subStepInfo;
        if (totalSub > 1) {
          completed += (currentSub - 1) / totalSub;
        }
        break;
      } else {
        break;
      }
    }
    return Math.min(100, Math.round((completed / TOTAL_FILLABLE_STEPS) * 100));
  };

  const progressPercentage = calculateProgressPercentage();
  const displayStep = subStepInfo.total > 1
    ? `${currentStep}.${subStepInfo.current}`
    : currentStep;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfilePictureStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleProfilePictureSaveAndContinue}
            setCurrentStep={setCurrentStep}
            refreshData={refreshData}
          />
        );
      case 2:
        return (
          <PersonalDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handlePersonalDetailsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 3:
        return (
          <AddressStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleAdsressSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 4:
        return (
          <NextToKinStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleNextToKinSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 5:
        return (
          <ApplicationDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleApplicationDetailsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 6:
        return (
          <EducationStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEducationSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 7:
        return (
          <TrainingStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleTrainingSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 8:
        return (
          <EmploymentStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEmploymentSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 9:
        return (
          <RefereeDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleRefereeDetailsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 10:
        return (
          <ExperienceStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleExperianceSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 11:
        return (
          <EthnicityStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEthnicitySaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 12:
        return (
          <DisabilityInfoStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleDisabilityInfoSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 13:
        return (
          <DocumentStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleDocumentsSaveAndContinue}
            setCurrentStep={setCurrentStep}
            onSave={handleDocumentSave}
            subStepInfo={subStepInfo}
            onSubStepChange={(current) =>
              setSubStepInfo((prev) => ({ ...prev, current }))
            }
          />
        );
      case 14:
        return (
          <PostEmployementStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handlePostEmployementSaveAndContinue}
            setCurrentStep={setCurrentStep}
            onSave={handlePostEmployementSave}
            subStep={subStep}
            subStepInfo={subStepInfo}
            onSubStepChange={(current) =>
              setSubStepInfo((prev) => ({ ...prev, current }))
            }
          />
        );
      case 15:
        return (
          <PaymentStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handlePayrollSaveAndContinue}
            setCurrentStep={setCurrentStep}
            setSubstep={setSubstep}
          />
        );
      case 16:
        return (
          <ReviewStep
            defaultValues={{ ...fetchData, ...formData }}
            formData={formData}
            onReview={handleReviewClick}
            onSubmit={handleSubmit}
            setCurrentStep={setCurrentStep}
            subStep={subStep}
            subStepInfo={subStepInfo}
            onSubStepChange={(current) =>
              setSubStepInfo((prev) => ({ ...prev, current }))
            }
          />
        );
      default:
        return (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <h2 className="mb-4 text-xl font-semibold">Step {currentStep}</h2>
            <p className="mb-4 text-gray-600">
              This step is not implemented yet.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  markStepAsCompleted(currentStep);
                  setCurrentStep((prev) =>
                    Math.min(TOTAL_FILLABLE_STEPS, prev + 1)
                  );
                }}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        );
    }
  };

//   if (formSubmitted) {
//     return (
//       <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4">
//   <Card className="rounded-2xl bg-watney/80 backdrop-blur-sm border border-white/30 shadow-2xl p-16 relative overflow-hidden">
//     {/* Background decorative elements */}
//     <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
//     <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full blur-lg"></div>
    
//     <div className="flex flex-col items-center gap-8 text-center relative z-10">
//       {/* Animated checkmark circle */}
//       <div className="rounded-full bg-white/90 p-8 shadow-lg backdrop-blur-sm border border-white/50 animate-pulse-slow">
//         <Check size={84} className="text-watney drop-shadow-sm" />
//       </div>
      
//       <CardTitle className="text-3xl font-bold text-white drop-shadow-md">
//         Your Application Submitted Successfully
//       </CardTitle>
      
//       <CardDescription className="mt-2 text-lg leading-relaxed text-white/95 backdrop-blur-md rounded-2xl">
//         <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
//           Thank you for your submission. Our team has received your
//           career application and will get back to you shortly. Stay
//           tuned!
          
//           <div className="mt-4 rounded-xl text-center text-lg text-white/95">
//             <p className="font-medium">
//               If you have any questions or need help with your
//               application, please don't hesitate to contact us:
//             </p>
//             <ul className="mt-4 list-none space-y-3 w-auto">
//               <li className="flex items-center justify-center gap-3 rounded-lg py-2 px-4 ">
//                 <span className="text-xl">📧</span>
//                 <strong>Email:</strong>
//                 <a
//                   href="mailto:info@everycare.co.uk"
//                   className="underline hover:text-white transition-colors"
//                 >
//                   info@everycare.co.uk
//                 </a>
//               </li>
//               <li className="flex items-center justify-center gap-3 rounded-lg py-2 px-4 ">
//                 <span className="text-xl">☎</span>
//                 <strong>Phone:</strong>
//                 <span>+442920455300</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </CardDescription>
      
//       <Button
//         onClick={handleDashboardRedirect}
//         className="mt-6  rounded-xl bg-white/90 backdrop-blur-sm px-16 py-6 text-lg font-semibold text-watney transition-all hover:bg-white hover:scale-105 hover:shadow-lg border border-white/50 shadow-md"
//       >
//         Done
//       </Button>
//     </div>
//   </Card>
// </div>
//     );
//   }


if (formSubmitted) {
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4">
  <div className="max-w-7xl w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-12 p-6 md:p-12">
    
    {/* Left Text Content */}
    <div className="flex-1 text-center md:text-left space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
        THANK YOU
      </h1>
      <h2 className="text-xl font-semibold">Your Application Submitted Successfully!</h2>
      <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto md:mx-0">
        Our team has received your career application and will get back to you shortly. Stay tuned!
      </p>

      {/* Contact Info */}
      <ul className="mt-4 space-y-3">
        <li className="flex items-center gap-3 rounded-lg py-2 px-4">
          <span className="text-xl">📧</span>
          <div className="flex gap-1">
            <strong>Email:</strong>
            <a
              href="mailto:info@everycare.co.uk"
              className="underline hover:text-orange-600 transition-colors"
            >
              info@everycare.co.uk
            </a>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-lg py-2 px-4">
          <span className="text-xl">☎</span>
          <div className="flex gap-1">
            <strong>Phone:</strong>
            <span>+44 2920 455300</span>
          </div>
        </li>
      </ul>

      {/* Divider */}
      <div className="w-24 h-1 bg-orange-500 mx-auto md:mx-0 mt-6 rounded-full"></div>

      {/* Action Button */}
      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
        <Button
          onClick={handleDashboardRedirect}
          className="bg-watney text-white hover:bg-watney/90 "
        >
          Done
        </Button>
      </div>
    </div>

    {/* Right: Heart Graphic */}
    <div className="flex-1 flex justify-center mt-8 md:mt-0">
      <div className="relative w-64 h-64 md:w-96 md:h-96">
        {/* Glow layers */}
        <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-10"></div>
        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30"></div>

        {/* Solid heart */}
        {/* <div className="relative w-full h-full flex items-center justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="white"
            className="drop-shadow-md"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
            2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
            C13.09 3.81 14.76 3 16.5 3
            19.58 3 22 5.42 22 8.5
            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div> */}

        <img src="/heart.png" alt="heartimg" />
      </div>
    </div>

  </div>
</div>

  );
}

  return (
    <div className="p-4">
      {/* Header with Progress Circle and Step Counter */}
     <div className="mb-2 flex flex-col items-center justify-between gap-2 sm:flex-row w-full">
  <div>
    <h1 className="text-xl font-semibold text-gray-800">
      Step {displayStep} of {TOTAL_FILLABLE_STEPS}
    </h1>
  </div>

  {/* ✅ Animated Success Message */}
  {/* <AnimatePresence>
    {successMessage && (
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: -10 ,x: 200 }}
        animate={{ opacity: 1, y: -4 ,x: 200 }}
        exit={{ opacity: 0, y: -10,x: 200  }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="rounded-md bg-watney px-5 py-2.5 text-lg font-medium text-white shadow-md">
          {successMessage}
        </div>
      </motion.div>
    )}
  </AnimatePresence> */}

  {/* ✅ Linear Progress Bar with percentage inside */}
<div className="flex flex-col items-center w-full sm:w-1/3">
  <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
    <div
      className="bg-watney h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white font-medium"
      style={{ width: progressPercentage > 0 ? `${progressPercentage}%` : '2rem' }} // min width for text
    >
      {progressPercentage}%
    </div>
  </div>
</div>

</div>



      {/* Form Content */}
      <div className="">{renderStep()}</div>
    </div>
  );
}