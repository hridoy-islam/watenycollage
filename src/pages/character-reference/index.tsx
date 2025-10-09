import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { Step1ApplicantInfo } from "./components/step1-applicant-info";
import { Step2HealthCharacteristics } from "./components/step2-health-characteristics";
import { Step3CompetencyAssessment } from "./components/step3-competency-assessment";
import { Step4FinalAssessment } from "./components/step4-final-assessment";
import axiosInstance from "@/lib/axios";

const characterFormSteps = [
  { id: 1, label: "Applicant Information" },
  { id: 2, label: "Health & Personal Characteristics" },
  { id: 3, label: "Competency Assessment" },
  { id: 4, label: "Final Assessment" },
];

export default function CharacterReferencePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  const isUsed = false

  const handleStep1SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  // ✅ Updated: Submit via axiosInstance
  const handleStep4Submit = async (data: any) => {
    const finalData = { ...formData, ...data };
    try {
      // const response = await axiosInstance.post("/reference", finalData);
      console.log("✅ Character reference submitted:", finalData);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("❌ Submission error:", error.response?.data || error.message);
      alert("Failed to submit the character reference. Please try again.");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };


   if (isUsed) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="mx-auto max-w-3xl w-full">
          <Card className="text-center border border-gray-400">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <Check className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Form Already Submitted</CardTitle>
              <CardDescription className="text-lg">
                This character reference form has already been submitted and cannot be submitted again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you believe this is an error or need to update your submission, please contact the administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="mx-auto max-w-3xl w-full">
          <Card className="text-center border border-gray-400">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Thank You!</CardTitle>
              <CardDescription className="text-lg">
                Your character reference has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for taking the time to complete this character reference questionnaire. Your feedback is
                valuable and will be carefully reviewed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="">
        <div className="mb-8">
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-2xl font-bold mb-2">Reference Questionnaire</h1>
            <img src="/logo.png" alt="everycare logo" className="h-16" />
          </div>
          <p>
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-4" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{characterFormSteps[currentStep - 1].label}</CardTitle>
            <CardDescription className="text-lg">
              {currentStep === 1 && "Basic information about the applicant"}
              {currentStep === 2 && "Health status and personal characteristics"}
              {currentStep === 3 && "Competency and suitability evaluation"}
              {currentStep === 4 && "Additional information and referee details"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <Step1ApplicantInfo defaultValues={formData} onSaveAndContinue={handleStep1SaveAndContinue} handleBack={handleBack}/>
            )}
            {currentStep === 2 && (
              <Step2HealthCharacteristics defaultValues={formData} onSaveAndContinue={handleStep2SaveAndContinue} handleBack={handleBack}/>
            )}
            {currentStep === 3 && (
              <Step3CompetencyAssessment defaultValues={formData} onSaveAndContinue={handleStep3SaveAndContinue} handleBack={handleBack}/>
            )}
            {currentStep === 4 && (
              <Step4FinalAssessment defaultValues={formData} onSubmit={handleStep4Submit} handleBack={handleBack}/>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
