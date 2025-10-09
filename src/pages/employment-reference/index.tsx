import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Check } from "lucide-react"
import { Step1ApplicantInfo } from "./components/step1-applicant-info"
import { Step2EmploymentDetails } from "./components/step2-employment-details"
import { Step3PerformanceAssessment } from "./components/step3-performance-assessment"
import { Step4FinalAssessment } from "./components/step4-final-assessment"
import axiosInstance from "@/lib/axios"

const employmentFormSteps = [
  { id: 1, label: "Applicant Information" },
  { id: 2, label: "Employment Details" },
  { id: 3, label: "Performance Assessment" },
  { id: 4, label: "Final Assessment" },
]

export default function EmploymentReferencePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleStep1SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  const handleStep2SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(3)
  }

  const handleStep3SaveAndContinue = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(4)
  }

  const handleStep4Submit = async (data: any) => {
    const finalData = { ...formData, ...data }

    try {
      // const response = await axiosInstance.post("/reference", finalData)
      console.log("✅ Form submitted successfully:", finalData)
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("❌ Error submitting form:", error.response?.data || error.message)
      alert("Failed to submit the reference form. Please try again.")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
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
                Your employment reference has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for taking the time to complete this employment reference form. Your feedback is valuable and
                will be carefully reviewed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl">{employmentFormSteps[currentStep - 1].label}</CardTitle>
            <CardDescription className="text-lg">
              {currentStep === 1 && "Basic information about the applicant"}
              {currentStep === 2 && "Employment period and relationship"}
              {currentStep === 3 && "Please rate the applicant on the following characteristics:"}
              {currentStep === 4 && "Overall assessment and recommendation"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <Step1ApplicantInfo
                defaultValues={formData}
                onSaveAndContinue={handleStep1SaveAndContinue}
                handleBack={handleBack}
              />
            )}
            {currentStep === 2 && (
              <Step2EmploymentDetails
                defaultValues={formData}
                onSaveAndContinue={handleStep2SaveAndContinue}
                handleBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <Step3PerformanceAssessment
                defaultValues={formData}
                onSaveAndContinue={handleStep3SaveAndContinue}
                handleBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <Step4FinalAssessment defaultValues={formData} onSubmit={handleStep4Submit} handleBack={handleBack} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
