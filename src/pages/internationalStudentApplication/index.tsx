import { useEffect, useState } from 'react';
import { StepsIndicator } from './components/steps-indicator';
import { formSteps } from './components/form-steps';
import { PersonalDetailsStep } from './components/personal-details-step';
import { AddressStep } from './components/address-step';
import { CourseDetailsStep } from './components/course-details-step';
import { EducationStep } from './components/education-step';
import { EmploymentStep } from './components/employment-step';
import { ComplianceStep } from './components/compliance-step';
import { DocumentsStep } from './components/documents-step';
import { TermsSubmitStep } from './components/terms-submit-step';
import { ReviewModal } from './components/review-modal';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmergencyContact } from './components/emergencyContact';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';

import {
  validateStep,
  findFirstIncompleteStep
} from '@/utils/form-validation-utils';
import { updateUserProfile } from '@/redux/features/profileSlice';
import { updateAuthIsCompleted } from '@/redux/features/authSlice';
import { FundingInformation } from './components/fundingInformation';

export default function InternationalStudentApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [fetchData, setFetchData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const [parsedResume, setParsedResume] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  let stepContent;
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();
  const [courseSubmitted, setCourseSubmitted] = useState(false);

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
  const { user } = useSelector((state: any) => state.auth);

  const personalDetailsData = {
    passportNumber: passportIdMatch ? passportIdMatch[0] : '',
    expiryDate: expiryDateMatch ? expiryDateMatch[0] : '',
    maritalStatus: maritalStatusMatch ? maritalStatusMatch[0] : '',
    nationality: nationalityMatch ? nationalityMatch[0] : '',
    ethnicity: ethnicityMatch ? ethnicityMatch[0] : '',
    countryOfBirth: countryOfBirthMatch ? countryOfBirthMatch[1] : ''
  };

  const addressData = {
    residentialAddressLine1: addressLine1,
    residentialAddressLine2: addressLine2,
    residentialCity: city,
    residentialPostCode: postCode,
    residentialCountry: country
  };

  const savedStudentType = localStorage.getItem('studentType');
  const savedCourseId = localStorage.getItem('courseId');
  const savedTermId = localStorage.getItem('termId');

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,

      studentType: savedStudentType
    }));
  }, [savedCourseId, savedStudentType, savedTermId]);

  const fetchedData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/${user._id}`);
      const userData = response.data.data;
      setFetchData((prev) => ({
        ...prev,
        ...userData,
        studentType: userData.studentType || savedStudentType
      }));
      setFormData((prev) => ({
        ...prev,
        studentType: userData.studentType || savedStudentType,
        courseDetailsData: {
          ...(prev.courseDetailsData || {}),
          course: savedCourseId || '',
          intake: savedTermId || ''
        }
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchedData();
  }, []);

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

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const markStepAsCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  const handlePersonalDetailsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  const isStepValid = validateStep(1, fetchData);

  const handlePersonalDetailsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(1);
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleAddressSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(2);
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleEmergencySaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(3);
      setCurrentStep(4);
    } catch (error) {
      console.error('Failed to update emergency contact:', error);
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

  const handleComplianceSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(6);
      setCurrentStep(7);
    } catch (error) {
      console.error('Failed to update compliance details:', error);
    }
  };

  const handleDocumentsSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(7);
      setCurrentStep(8);
    } catch (error) {
      console.error('Failed to update documents:', error);
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

  const handleFundingInformationSaveAndContinue = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(8);
      setCurrentStep(9);
    } catch (error) {
      console.error('Failed to update documents:', error);
    }
  };

  const handleTermsSave = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, ...data }));
      await axiosInstance.patch(`/users/${user._id}`, data);
      markStepAsCompleted(9);
      handleSubmit();
      // toast({
      //   description: 'Terms acceptance saved successfully.'
      // });
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Something went wrong.',
        className: 'destructive border-none text-white'
      });
    }
  };

  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else if (user?.role === 'student') {
      navigate('/dashboard');
    }
  };

  const handleReviewClick = () => {
    // Check if all required steps are completed before showing the review
    // const requiredSteps = [1, 2, 3, 4, 5, 6, 7]; // All steps except the final Terms & Submit
    // const missingSteps = requiredSteps.filter(
    //   (step) => !completedSteps.includes(step)
    // );

    // if (missingSteps.length > 0) {
    //   // Get the names of the missing steps
    //   const missingStepNames = missingSteps.map(
    //     (stepId) =>
    //       formSteps.find((step) => step.id === stepId)?.label ||
    //       `Step ${stepId}`
    //   );

    //   toast({
    //     title: 'Incomplete Application',
    //     description: `Please complete the following sections before reviewing: ${missingStepNames.join(', ')}`,
    //     variant: 'destructive'
    //   });

    //   // Navigate to the first incomplete step
    //   setCurrentStep(missingSteps[0]);
    //   return;
    // }

    setReviewModalOpen(true);
  };

  const submitApplicationCourse = async () => {
    if (savedCourseId && savedTermId && user?._id) {
      try {
        await axiosInstance.post('/application-course', {
          courseId: savedCourseId,
          intakeId: savedTermId,
          studentId: user._id
        });

        localStorage.removeItem('termId');
        localStorage.removeItem('courseId');
        setCourseSubmitted(true);
      } catch (err: any) {
        console.error('Error submitting application course:', err);
        toast({
          title: err.response?.data?.message || 'Application failed.',
          className: 'bg-destructive text-white border-none'
        });
        localStorage.removeItem('termId');
        localStorage.removeItem('courseId');
      }
    }
  };

  useEffect(() => {
    submitApplicationCourse();
  }, []);

  const handleSubmit = async () => {
    // const requiredSteps = [1, 2, 3, 4, 5, 6, 7];
    // const missingSteps = requiredSteps.filter(
    //   (step) => !completedSteps.includes(step)
    // );

    // if (missingSteps.length > 0) {
    //   // Get the names of the missing steps
    //   const missingStepNames = missingSteps.map(
    //     (stepId) =>
    //       formSteps.find((step) => step.id === stepId)?.label ||
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
      dispatch(
        updateUserProfile({
          userId: user._id,
          profileData: {
            ...formData,
            studentId: user._id,
            isCompleted: true
          }
        })
      );

      dispatch(updateAuthIsCompleted(true));

      localStorage.removeItem('studentType');

      toast({
        description: 'Applicaiton saved successfully.'
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
    // Normalize currentStep value to handle both number and { step, subStep }
    const stepValue =
      typeof currentStep === 'object' ? currentStep.step : currentStep;
    const subStep = typeof currentStep === 'object' ? currentStep.subStep : 1;

    switch (stepValue) {
      case 1:
        return (
          <PersonalDetailsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handlePersonalDetailsSaveAndContinue}
            onSave={handlePersonalDetailsSave}
            setCurrentStep={setCurrentStep}
            loading={loading}
          />
        );

      case 2:
        return (
          <AddressStep
            defaultValues={{
              ...fetchData,
              ...formData
            }}
            onSaveAndContinue={handleAddressSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );

      case 3:
        return (
          <EmergencyContact
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleEmergencySaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );

      case 4:
        return (
          <EducationStep
            defaultValues={{
              ...fetchData,
              ...formData
            }}
            onSaveAndContinue={handleEducationSaveAndContinue}
            setCurrentStep={setCurrentStep}
            setCurrentSubStep={subStep}
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
          <ComplianceStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleComplianceSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );

      case 7:
        return (
          <DocumentsStep
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleDocumentsSaveAndContinue}
            setCurrentStep={setCurrentStep}
            onSave={handleDocumentSave}
          />
        );
      case 8:
        return (
          <FundingInformation
            defaultValues={{ ...fetchData, ...formData }}
            onSaveAndContinue={handleFundingInformationSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );

      case 9:
        return (
          <TermsSubmitStep
            defaultValues={{ ...fetchData, ...formData }}
            onSave={handleTermsSave}
            onReview={handleReviewClick}
            onSubmit={handleSubmit}
            setCurrentStep={setCurrentStep}
            onSaveAndContinue={handleTermsSave}
          />
        );

      default:
        return (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <h2 className="mb-4 text-xl font-semibold">Step Not Found</h2>
            <p className="mb-4 text-gray-600">
              This step is not implemented yet.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentStep((prev) =>
                    typeof prev === 'object'
                      ? prev.step - 1
                      : Math.max(1, prev - 1)
                  )
                }
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  markStepAsCompleted(stepValue);
                  setCurrentStep((prev) =>
                    typeof prev === 'object'
                      ? { step: prev.step + 1, subStep: 1 }
                      : Math.min(formSteps.length, prev + 1)
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
    const isCourseSubmission = courseSubmitted;

    return (
      <div className="flex items-center justify-center px-4">
        <Card className="rounded-lg border bg-watney/90 p-14 md:p-24 shadow-lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-white p-8">
              <Check size={84} className="text-watney" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-2xl font-semibold text-white">
                {isCourseSubmission
                  ? 'Application Submitted Successfully'
                  : 'Great job! You’ve completed your profile.'}
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-relaxed text-white">
                {isCourseSubmission ? (
                  <div className="mt-2 w-full rounded-md text-center text-base text-white">
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
                ) : (
                  <div className="mt-2 w-full rounded-md text-center text-base text-white">
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
                )}
              </CardDescription>
            </div>
            <Button
              onClick={handleDashboardRedirect}
              className="mt-4 w-full rounded-sm bg-white px-12 py-3 text-lg font-semibold text-watney transition hover:bg-white sm:w-auto"
            >
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className=" w-full ">
      <Card className="md:p-4">
        {/* <h1 className="mb-8 text-center text-3xl font-semibold">
          Student Application Form
        </h1> */}
        {/* 
        <StepsIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          steps={formSteps}
          onStepClick={handleStepClick}
        /> */}

        {renderStep()}

        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          formData={formData}
        />
      </Card>
    </div>
  );
}
