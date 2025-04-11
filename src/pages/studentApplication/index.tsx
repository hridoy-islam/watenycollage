import { useState } from 'react';
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface FormData {
  personalDetails?: any;
  address?: any;
  courseDetails?: any;
  contact?: any;
  education?: any;
  employment?: any;
  compliance?: any;
  documents?: any;
  termsAndSubmit?: any;
}

export default function StudentApplication() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();

  // Allow navigation to any step regardless of completion status
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
    console.log('Saving personal details:', data);
  };

  const handlePersonalDetailsSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, personalDetails: data }));
    markStepAsCompleted(1);
    setCurrentStep(2);
  };

  const handleAddressSave = (data: any) => {
    setFormData((prev) => ({ ...prev, address: data }));
    console.log('Saving address:', data);
  };

  const handleAddressSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, address: data }));
    markStepAsCompleted(2);
    setCurrentStep(3);
  };

  const handleCourseDetailsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, courseDetails: data }));
    console.log('Saving course details:', data);
  };

  const handleCourseDetailsSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, courseDetails: data }));
    markStepAsCompleted(3);
    setCurrentStep(4);
  };

  const handleContactSave = (data: any) => {
    setFormData((prev) => ({ ...prev, contact: data }));
    console.log('Saving contact details:', data);
  };

  const handleContactSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, contact: data }));
    markStepAsCompleted(4);
    setCurrentStep(5);
  };

  const handleEducationSave = (data: any) => {
    setFormData((prev) => ({ ...prev, education: data }));
    console.log('Saving education details:', data);
  };

  const handleEducationSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, education: data }));
    markStepAsCompleted(5);
    setCurrentStep(6);
  };

  const handleEmploymentSave = (data: any) => {
    setFormData((prev) => ({ ...prev, employment: data }));
    console.log('Saving employment details:', data);
  };

  const handleEmploymentSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, employment: data }));
    markStepAsCompleted(6);
    setCurrentStep(7);
  };

  const handleComplianceSave = (data: any) => {
    setFormData((prev) => ({ ...prev, compliance: data }));
    console.log('Saving compliance details:', data);
  };

  const handleComplianceSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, compliance: data }));
    markStepAsCompleted(7);
    setCurrentStep(8);
  };

  const handleDocumentsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, documents: data }));
    console.log('Saving documents:', data);
  };

  const handleDocumentsSaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, documents: data }));
    markStepAsCompleted(8);
    setCurrentStep(9);
  };

  const handleTermsSave = (data: any) => {
    setFormData((prev) => ({ ...prev, termsAndSubmit: data }));
    console.log('Saving terms acceptance:', data);
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

  const handleSubmit = () => {
    // Check if all required steps are completed before final submission
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

    // All steps are complete, proceed with submission
    console.log('Submitting form data:', formData);
    setFormSubmitted(true);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsStep
            defaultValues={formData.personalDetails}
            onSaveAndContinue={handlePersonalDetailsSaveAndContinue}
            onSave={handlePersonalDetailsSave}
          />
        );
      case 2:
        return (
          <AddressStep
            defaultValues={formData.address}
            onSaveAndContinue={handleAddressSaveAndContinue}
            onSave={handleAddressSave}
          />
        );
      case 3:
        return (
          <CourseDetailsStep
            defaultValues={formData.courseDetails}
            onSaveAndContinue={handleCourseDetailsSaveAndContinue}
            onSave={handleCourseDetailsSave}
          />
        );
      case 4:
        return (
          <ContactStep
            defaultValues={formData.contact}
            onSaveAndContinue={handleContactSaveAndContinue}
            onSave={handleContactSave}
          />
        );
      case 5:
        return (
          <EducationStep
            defaultValues={formData.education}
            onSaveAndContinue={handleEducationSaveAndContinue}
            onSave={handleEducationSave}
          />
        );
      case 6:
        return (
          <EmploymentStep
            defaultValues={formData.employment}
            onSaveAndContinue={handleEmploymentSaveAndContinue}
            onSave={handleEmploymentSave}
          />
        );
      case 7:
        return (
          <ComplianceStep
            defaultValues={formData.compliance}
            onSaveAndContinue={handleComplianceSaveAndContinue}
            onSave={handleComplianceSave}
          />
        );
      case 8:
        return (
          <DocumentsStep
            defaultValues={formData.documents}
            onSaveAndContinue={handleDocumentsSaveAndContinue}
            onSave={handleDocumentsSave}
          />
        );
      case 9:
        return (
          <TermsSubmitStep
            defaultValues={formData.termsAndSubmit}
            onSave={handleTermsSave}
            onReview={handleReviewClick}
            onSubmit={handleSubmit}
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
      <Alert className="border-green-200 bg-green-50">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Success!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your application has been submitted successfully. We will contact you
          shortly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Student Application Form
      </h1>

      <StepsIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        steps={formSteps}
        onStepClick={handleStepClick}
      />

      {renderStep()}

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        formData={formData}
      />
    </div>
  );
}
