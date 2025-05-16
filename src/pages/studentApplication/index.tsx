import { useEffect, useState } from 'react';
import { StepsIndicator } from './components/steps-indicator';
import { formSteps } from './components/form-steps';
import { PersonalDetailsStep } from './components/personal-details-step';
import { AddressStep } from './components/address-step';
import { CourseDetailsStep } from './components/course-details-step';
import { ContactStep } from './components/contact-step';
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
import { FormType } from './components/formType';

export default function StudentApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [fetchData, setFetchData] = useState<any>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const [parsedResume, setParsedResume] = useState<string | null>(null);
  const location = useLocation();

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

  const contactData = {
    email: email,
    contactNumber: phoneNumber
  };

  const fetchedData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${user._id}`);
      const userData = response.data.data;
      setFetchData((prev) => ({
        ...prev,
        email: userData?.email,
        phone: userData?.phone,
        personalDetails: userData?.personalDetails,
        addressData: userData?.addressData,
        courseDetailsData: userData?.courseDetailsData,
        contactData: userData?.contactData,
        emergencyContactData: userData?.emergencyContactData,
        educationData: userData?.educationData,
        employmentData: userData?.employmentData,
        complianceData: userData?.complianceData,
        documentsData: userData?.documentsData,
        termsData: userData?.termsData
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchedData();
  }, [currentStep]);

  useEffect(() => {
    const savedStudentType = localStorage.getItem('studentType');
    if (savedStudentType) {
      setFormData((prev) => ({
        ...prev,
        personalDetailsData: {
          ...(prev.personalDetailsData || {}),
          studentType: savedStudentType
        }
      }));
    }
  }, []);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const markStepAsCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  const handlePersonalDetailsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, personalDetails: data }));
  };

  const handlePersonalDetailsSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, personalDetailsData: data }));

    markStepAsCompleted(1);
    setCurrentStep(2);
  };

  const handleAddressSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, addressData: data }));

    markStepAsCompleted(2);
    setCurrentStep(3);
  };

  const handleCourseDetailsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, courseDetailsData: data }));
    console.log('Saving course details:', data);
  };

  const handleCourseDetailsSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, courseDetailsData: data }));

    markStepAsCompleted(3);
    setCurrentStep(4);
  };

  const handleEmergencySaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, emergencyContactData: data }));
    markStepAsCompleted(4);
    setCurrentStep(5);
  };

  const handleEducationSave = (data: any) => {
    setFormData((prev) => ({ ...prev, education: data }));
    console.log('Saving education details:', data);
  };

  const handleEducationSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, educationData: data }));

    markStepAsCompleted(5);
    setCurrentStep(6);
  };

  const handleEmploymentSave = (data: any) => {
    setFormData((prev) => ({ ...prev, employment: data }));
    console.log('Saving employment details:', data);
  };

  const handleEmploymentSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, employmentData: data }));
    markStepAsCompleted(6);
    setCurrentStep(7);
  };

  const handleComplianceSave = (data: any) => {
    setFormData((prev) => ({ ...prev, complianceData: data }));
    console.log('Saving compliance details:', data);
  };

  const handleComplianceSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, complianceData: data }));
    markStepAsCompleted(7);
    setCurrentStep(8);
  };

  const handleDocumentsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, documents: data }));
    console.log('Saving documents:', data);
  };

  const handleDocumentsSaveAndContinue = async (data: any) => {
    setFormData((prev) => ({ ...prev, documentsData: data }));
    markStepAsCompleted(8);
    setCurrentStep(9);
  };

  const handleTermsSave = async (data: any) => {
    try {
      setFormData((prev) => ({ ...prev, termsData: data }));
      await axiosInstance.patch(`/users/${user._id}`, {
        termsAndSubmit: data
      });
      toast({
        description: 'Terms acceptance saved successfully.'
      });
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
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8]; // All steps except the final Terms & Submit
    const missingSteps = requiredSteps.filter(
      (step) => !completedSteps.includes(step)
    );

    if (missingSteps.length > 0) {
      // Get the names of the missing steps
      const missingStepNames = missingSteps.map(
        (stepId) =>
          formSteps.find((step) => step.id === stepId)?.label ||
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

  const handleSubmit = async () => {
    const requiredSteps = [1, 2, 3, 4, 5, 6, 7, 8]; // All steps except the final Terms & Submit
    const missingSteps = requiredSteps.filter(
      (step) => !completedSteps.includes(step)
    );

    if (missingSteps.length > 0) {
      // Get the names of the missing steps
      const missingStepNames = missingSteps.map(
        (stepId) =>
          formSteps.find((step) => step.id === stepId)?.label ||
          `Step ${stepId}`
      );

      toast({
        title: 'Incomplete Application',
        description: `Please complete the following sections before submitting: ${missingStepNames.join(', ')}`,
        variant: 'destructive'
      });

      // Navigate to the first incomplete step
      setCurrentStep(missingSteps[0]);
      return;
    }

    try {
      await axiosInstance.post(`/applications`, {
        ...formData,
        studentId: user._id
      });

      localStorage.removeItem('studentType');
      localStorage.removeItem('termId');
      localStorage.removeItem('courseId');
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
    switch (currentStep) {

      case 1:
        return (
          <PersonalDetailsStep
            defaultValues={{
              email: fetchData.email,
              phone: fetchData.phone,
              ...fetchData.personalDetails,
              ...formData.personalDetailsData,
              ...Object.fromEntries(
                Object.entries(personalDetailsData || {}).filter(
                  ([_, value]) =>
                    value !== '' && value !== undefined && value !== null
                )
              )
            }}
            onSaveAndContinue={handlePersonalDetailsSaveAndContinue}
            onSave={handlePersonalDetailsSave}
            setCurrentStep={setCurrentStep}
          />
        );
      case 2:
        return (
          <AddressStep
            defaultValues={{
              ...formData.addressData,
              ...Object.fromEntries(
                Object.entries(addressData || {}).filter(
                  ([_, value]) =>
                    value !== '' && value !== undefined && value !== null
                )
              )
            }}
            // studentType={formData.personalDetailsData.studentType}
            onSaveAndContinue={handleAddressSaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 3:
        return (
          <CourseDetailsStep
            defaultValues={formData.courseDetailsData}
            onSaveAndContinue={handleCourseDetailsSaveAndContinue}
            onSave={handleCourseDetailsSave}
            setCurrentStep={setCurrentStep}
          />
        );
      // case 4:
      //   return (
      //     <ContactStep
      //       defaultValues={{
      //         ...formData.contactData,
      //         ...Object.fromEntries(
      //           Object.entries(contactData || {}).filter(
      //             ([_, value]) =>
      //               value !== '' && value !== undefined && value !== null
      //           )
      //         )
      //       }}
      //       onSaveAndContinue={handleContactSaveAndContinue}
      //       onSave={handleContactSave}
      //       setCurrentStep={setCurrentStep}
      //     />
      //   );
      case 4:
        return (
          <EmergencyContact
            defaultValues={formData.emergencyContactData}
            onSaveAndContinue={handleEmergencySaveAndContinue}
            setCurrentStep={setCurrentStep}
          />
        );
      case 5:
        return (
          <EducationStep
            defaultValues={formData.educationData}
            onSaveAndContinue={handleEducationSaveAndContinue}
            onSave={handleEducationSave}
            setCurrentStep={setCurrentStep}
            studentType={formData.personalDetailsData.studentType}
          />
        );
      case 6:
        return (
          <EmploymentStep
            defaultValues={formData.employmentData}
            onSaveAndContinue={handleEmploymentSaveAndContinue}
            onSave={handleEmploymentSave}
            setCurrentStep={setCurrentStep}
          />
        );
      case 7:
        return (
          <ComplianceStep
            defaultValues={formData.complianceData}
            onSaveAndContinue={handleComplianceSaveAndContinue}
            onSave={handleComplianceSave}
            setCurrentStep={setCurrentStep}
          />
        );
      case 8:
        return (
          <DocumentsStep
            defaultValues={formData.documentsData}
            onSaveAndContinue={handleDocumentsSaveAndContinue}
            onSave={handleDocumentsSave}
            setCurrentStep={setCurrentStep}
          />
        );
      case 9:
        return (
          <TermsSubmitStep
            defaultValues={formData.termsData}
            onSave={handleTermsSave}
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
                    Math.min(formSteps.length, prev + 1)
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
        <Card className=" rounded-lg border border-gray-100 bg-watney/90 p-24 shadow-lg ">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-white p-8">
              <Check size={84} className="text-watney" />
            </div>
            <div className="flex items-center gap-4 text-center">
              <div>
                <CardTitle className="text-2xl font-semibold text-white">
                  Application Submitted Sucessfull
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed text-white">
                  Thank you for your submission. Our team has received your
                  application and will get back to you shortly. Stay tuned!
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={handleDashboardRedirect}
              className="*: mt-4 w-full rounded-sm bg-white px-6 py-3 text-base font-semibold text-watney transition hover:bg-white sm:w-auto"
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
      <Card className="p-4">
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
