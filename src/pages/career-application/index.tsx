'use client';

import { useEffect, useState } from 'react';
import { ProfilePictureStep } from './components/profile-picture-step';
import { PersonalDetailsStep } from './components/personal-details-step';
import { DisabilityInfoStep } from './components/disability-info-step';
import { ApplicationDetailsStep } from './components/application-details-step';
import { ReviewStep } from './components/review-step';
import { RefereeDetailsStep } from './components/referee-details-step';
import { DocumentStep } from './components/DocumentStep';
import { EducationStep } from './components/education-step';
import { EmploymentStep } from './components/employment-step';
// import { ReviewModal } from "./components/review-modal"
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import type { TCareer } from '@/types/career';
import {
  validateStep,
  findFirstIncompleteStep
} from '@/utils/careerform-validation-utils';
import { updateAuthIsCompleted } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useLocation } from 'react-router-dom';

// Define form steps for career application
const careerFormSteps = [
  { id: 1, label: 'Profile Picture' },
  { id: 2, label: 'Personal Details' },
  { id: 3, label: 'Application Details' },
  { id: 4, label: 'Education' },
  { id: 5, label: 'Employment' },
  { id: 6, label: 'Disability Info' },
  { id: 7, label: 'Referee Details' },
  { id: 8, label: 'Documents' },
  { id: 9, label: 'Review & Submit' }
];

export default function CareerApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<TCareer>>({
    status: 'applied'
  });
  const [fetchData, setFetchData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [parsedResume, setParsedResume] = useState<string | null>(null);
const location = useLocation();
const [refreshCounter, setRefreshCounter] = useState(0);


const refreshData = () => {
  setRefreshCounter((prev) => prev + 1);
};


  useEffect(() => {
    if (location.state?.parsedResume) {
      setParsedResume(location.state.parsedResume);
      // Optionally clear the state after reading it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);




  const nameMatch = parsedResume?.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s([A-Z][a-z]+)\b/
  );
  const emailMatch = parsedResume?.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );

  const phoneMatch = parsedResume?.match(
    /\+?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{6,10}/
  );

  const dobMatch = parsedResume?.match(
    /(?:\b(?:[A-Za-z]+\s)?\d{1,2}[,\s]?\s?\d{4}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/
  );
  const passportIdMatch = parsedResume?.match(/\b([A-Za-z0-9]{6,10})\b/);
  const expiryDateMatch = parsedResume?.match(
    /\b(?:[A-Za-z]+\s)?\d{1,2}[,\s]?\s?\d{4}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/
  );
  const maritalStatusMatch = parsedResume?.match(
    /\b(Single|Married|Divorced|Widowed|Separated)\b/
  );
  const ethnicityMatch = parsedResume?.match(
    /\b(Caucasian|Asian|Hispanic|Black|Latino|Middle Eastern|Native American|Pacific Islander|African|European|South Asian|...)\b/
  );
  const nationalityMatch = parsedResume?.match(
    /\b(American|Bangladeshi|Canadian|British|Australian|Indian|Pakistani|Chinese|Japanese|French|German|Spanish|Russian|Brazilian|Mexican|Italian|...)\b/
  );
  const countryOfBirthMatch = parsedResume?.match(/\bBorn\s([A-Za-z\s]+)\b/);
  const addressLine1Match = parsedResume?.match(/^(.*\d{1,5}.*)$/);
  const addressLine2Match = parsedResume?.match(
    /^(.*[A-Za-z0-9\s]*[A-Za-z]{2,})$/
  );
  const cityMatch = parsedResume?.match(
    /\b([A-Za-z\s]+(?:[A-Za-z]+))\b(?:,\s?)/
  );
  const postCodeMatch = parsedResume?.match(/\b\d{5}(?:[-\s]?\d{4})?\b/);
  const countryMatch = parsedResume?.match(/\b([A-Za-z\s]+)\b$/);
  const institutionMatch = parsedResume?.match(
    /(?:University|College|Institute|Academy|School|Campus)[A-Za-z\s]+/i
  );

  const phoneNumber = phoneMatch ? phoneMatch[0] : '';
  const passportId = passportIdMatch ? passportIdMatch[0] : '';
  const email = emailMatch ? emailMatch[0] : null;
  const addressLine1 = addressLine1Match ? addressLine1Match[0] : '';
  const addressLine2 = addressLine2Match ? addressLine2Match[0] : '';
  const city = cityMatch ? cityMatch[1] : '';
  const postCode = postCodeMatch ? postCodeMatch[0] : '';
  const country = countryMatch ? countryMatch[1] : '';
  const academicInstitution = institutionMatch ? institutionMatch[0] : '';

  const passportNumber = passportIdMatch ? passportIdMatch[0] : '';
  const expiryDate = expiryDateMatch ? expiryDateMatch[0] : '';
  const maritalStatus = maritalStatusMatch ? maritalStatusMatch[0] : '';
  const nationality = nationalityMatch ? nationalityMatch[0] : '';
  const ethnicity = ethnicityMatch ? ethnicityMatch[0] : '';
  const countryOfBirth = countryOfBirthMatch ? countryOfBirthMatch[1] : '';
  const dateOfBirth = dobMatch ? dobMatch[0] : '';

  const residentialAddressLine1 = addressLine1 || '';
  const residentialAddressLine2 = addressLine2 || '';
  const residentialCity = city || '';
  const residentialPostCode = postCode || '';
  const residentialCountry = country || '';

  useEffect(() => {
    if (parsedResume) {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        phone: phoneNumber,
        passportNumber,
        
        maritalStatus,
        nationality,
        ethnicity,
        countryOfBirth,

        postalAddressLine1: residentialAddressLine1,
        postalAddressLine2: residentialAddressLine2,
        postalCity: residentialCity,
        postalPostCode: residentialPostCode,
        postalCountry: residentialCountry
      }));
    }
  }, [parsedResume]);

  console.log(formData,'FORM');

  const fetchedData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${user._id}`);
      const userData = response.data.data;
      setFetchData((prev) => ({
        ...prev,
        ...userData
        //  dateOfBirth: new  Date(userData.dateOfBirth),
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

    // You can add more step checks here
    // Example:
    // if (!userData.education || userData.education.length === 0) return 2;
    // if (!userData.experience || userData.experience.length === 0) return 3;

    return -1;
  };

  useEffect(() => {
    if (Object.keys(fetchData).length === 0) return;

    const firstIncompleteStep = findFirstIncompleteStep(fetchData);

    if (firstIncompleteStep !== -1 && currentStep !== firstIncompleteStep) {
      // toast({
      //   title: 'Incomplete Application',
      //   description: `Redirecting to step ${firstIncompleteStep} to complete required information.`
      // });

      setCurrentStep(firstIncompleteStep);
    }
  }, [fetchData]);

  const applicationId = localStorage.getItem('applicationId');

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const markStepAsCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

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

  const handleApplicationDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(3);
      setCurrentStep(4);
    } catch (error) {
      console.error('Failed to update application details:', error);
    }
  };

  const handleEducationSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(4);
      setCurrentStep(5);
    } catch (error) {
      console.error('Failed to update education details:', error);
    }
  };

  const handleEmploymentSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(5);
      setCurrentStep(6);
    } catch (error) {
      console.error('Failed to update employment details:', error);
    }
  };

  const handleDisabilityInfoSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(6);
      setCurrentStep(7);
    } catch (error) {
      console.error('Failed to update disability info:', error);
    }
  };

  const handleRefereeDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(7);
      setCurrentStep(8);
    } catch (error) {
      console.error('Failed to update referee details:', error);
    }
  };

  const handleDocumentsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(8);
      setCurrentStep(9);
    } catch (error) {
      console.error('Failed to update documents:', error);
    }
  };

  const handleDashboardRedirect = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else if (user?.role === 'student') {
      navigate('/dashboard');
    } else if (user?.role === 'applicant') {
      navigate('/dashboard');
    }
  };

  const handleReviewClick = () => {
    // Check if all required steps are completed before showing the review
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8]; // All steps except the final Review & Submit
    const missingSteps = requiredSteps.filter(
      (step) => !completedSteps.includes(step)
    );

    if (missingSteps.length > 0) {
      // Get the names of the missing steps
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

      // Navigate to the first incomplete step
      setCurrentStep(missingSteps[0]);
      return;
    }

    setReviewModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    // const requiredSteps = [2, 3, 4, 5, 6, 7, 8];
    // const missingSteps = requiredSteps.filter(
    //   (step) => !completedSteps.includes(step)
    // );

    // if (missingSteps.length > 0) {
    //   // Get the names of the missing steps
    //   const missingStepNames = missingSteps.map(
    //     (stepId) =>
    //       careerFormSteps.find((step) => step.id === stepId)?.label ||
    //       `Step ${stepId}`
    //   );

    //   toast({
    //     title: 'Incomplete Application',
    //     description: `Please complete the following sections before submitting: ${missingStepNames.join(', ')}`,
    //     variant: 'destructive'
    //   });

    //   // Navigate to the first incomplete step
    //   setCurrentStep(missingSteps[0]);
    //   return;
    // }
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

      dispatch(updateAuthIsCompleted(true));

      localStorage.removeItem('applicationId');

      toast({
        description: 'Career application submitted successfully.'
      });
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Something went wrong.',
        className: 'destructive border-none text-white'
      });
    }

    setFormSubmitted(true);
  };

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
          <ApplicationDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleApplicationDetailsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 4:
        return (
          <EducationStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEducationSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 5:
        return (
          <EmploymentStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEmploymentSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 6:
        return (
          <DisabilityInfoStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleDisabilityInfoSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 7:
        return (
          <RefereeDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleRefereeDetailsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 8:
        return (
          <DocumentStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleDocumentsSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 9:
        return (
          <ReviewStep
            defaultValues={{ ...fetchData, ...formData }}
            formData={formData}
            onReview={handleReviewClick}
            onSubmit={handleSubmit}
            setCurrentStep={setCurrentStep}
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
                    Math.min(careerFormSteps.length, prev + 1)
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

  if (formSubmitted) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] items-center justify-center px-4">
        <Card className="rounded-lg border border-gray-100 bg-watney/90 p-24 shadow-lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-white p-8">
              <Check size={84} className="text-watney" />
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <CardTitle className="text-2xl font-semibold text-white">
                  Career Application Submitted Successfully
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed text-white">
                  Thank you for your submission. Our team has received your
                  career application and will get back to you shortly. Stay
                  tuned!
                  {/* Support Section */}
                  <div className=" mt-2 w-full rounded-md text-left text-base text-white ">
                    <p>
                      If you have any questions or need help with your
                      application, please don’t hesitate to contact us:
                    </p>
                    <ul className="mt-3 list-none space-y-2">
                      <li>
                        📧 <strong>Email:</strong>{' '}
                        <a
                          href="mailto:admissions@watneycollege.ac.uk"
                          className="underline"
                        >
                          admissions@watneycollege.ac.uk
                        </a>
                      </li>
                      <li>
                        ☎ <strong>Phone:</strong> +44 (0)20 1234 5678
                      </li>
                    </ul>
                  </div>
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={handleDashboardRedirect}
              className="mt-4 w-full rounded-sm bg-white px-6 py-3 text-base font-semibold text-watney transition hover:bg-white sm:w-auto"
            >
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6">
      {/* <h1 className="text-2xl font-bold text-center mb-8">Career Application</h1> */}
      {/* <StepIndicator currentStep={currentStep} totalSteps={totalSteps} /> */}
      <div className="">{renderStep()}</div>
    </div>
  );
}
