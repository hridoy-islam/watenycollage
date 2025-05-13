

import { StepIndicator } from "./components/step-indicator"
import { ProfilePictureStep } from "./components/profile-picture-step"
import { PersonalDetailsStep } from "./components/personal-details-step"
import { ContactInfoStep } from "./components/contact-info-step"
import { EmploymentDetailsStep } from "./components/employment-details-step"
import { DemographicInfoStep } from "./components/demographic-info-step"
import { DisabilityInfoStep } from "./components/disability-info-step"
import { ApplicationDetailsStep } from "./components/application-details-step"
import { BeneficiaryStep } from "./components/beneficiary-step"
import { PayrollStep } from "./components/payroll-step"
import { RightToWorkStep } from "./components/right-to-work-step"
import { EqualityInfoStep } from "./components/equality-info-step"
import { ReviewStep } from "./components/review-step"
import { SuccessMessage } from "./components/success-message"
import type { TCareer } from "@/types/career"
import { useState } from "react"
import { set } from "date-fns"
import { RefereeDetailsStep } from "./components/referee-details-step"
import { DeclarationStep } from "./components/DeclarationStep"
import { EducationStep } from "./components/education-step"
import { EmploymentStep } from "./components/employment-step"

export default function CareerApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<TCareer>>({
    status: "applied",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [personalDetailsStep, setPersonalDetailsStep] = useState(1);
  const [contactDetailsStep, setContactDetailsStep] = useState(2);
  const totalSteps = 9

  const updateFormData = (data: Partial<TCareer>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    setIsSubmitted(true)
  }


  const handleBackFromContact = () => {
    setCurrentStep(2); // Go back to personal details
    setPersonalDetailsStep(2); // Set personal details to step 4
    window.scrollTo(0, 0);
  };
  const handleBackFromApplication = () => {
    setCurrentStep(1); 
    setPersonalDetailsStep(1); 
    window.scrollTo(0, 0);
  };


  if (isSubmitted) {
    return (<div className="h-[calc(100vh)] flex items-center jusify-center">
      
      <SuccessMessage />
      </div>)
  }
  console.log(formData)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfilePictureStep
            value={formData.profilePictureUrl}
            onNext={(profilePictureUrl) => {
              updateFormData({ profilePictureUrl })
              handleNext()
            }}
          />
        )
      case 2:
        return (
          <PersonalDetailsStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
             />
        )
      case 3:
        return (
          <EducationStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <EmploymentStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <ApplicationDetailsStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
     
      case 6:
        return (
          <DisabilityInfoStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      // case 7:
      //   return (
      //     <RightToWorkStep
      //       value={formData.rightToWork}
      //       onNext={(rightToWork) => {
      //         updateFormData({ rightToWork })
      //         handleNext()
      //       }}
      //       onBack={handleBack}
      //     />
      //   )
      
      
      case 7:
        return (
          <RefereeDetailsStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 8:
        return (
          <DeclarationStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
  
      case 9:
        return <ReviewStep formData={formData} onSubmit={handleSubmit} onBack={handleBack} />
      default:
        return null
    }
  }

  return (
    <div className=" mx-auto p-6">
      {/* <h1 className="text-2xl font-bold text-center mb-8">Career Application</h1> */}
      {/* <StepIndicator currentStep={currentStep} totalSteps={totalSteps} /> */}
      <div className="">{renderStep()}</div>
    </div>
  )
}
