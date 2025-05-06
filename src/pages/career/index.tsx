

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

export default function CareerApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<TCareer>>({
    status: "applied",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [personalDetailsStep, setPersonalDetailsStep] = useState(1);
  const [contactDetailsStep, setContactDetailsStep] = useState(1);
  const totalSteps = 12

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
    setCurrentStep(3); 
    setContactDetailsStep(2); 
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
            initialStep={personalDetailsStep}
            onStepChange={setPersonalDetailsStep}          />
        )
      case 3:
        return (
          <ContactInfoStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBackFromContact}
            initialStep={contactDetailsStep}
            onStepChange={setContactDetailsStep}        
          />
        )
      case 4:
        return (
          <ApplicationDetailsStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBackFromApplication}
          />
        )
      case 5:
        return (
          <EmploymentDetailsStep
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
          <DemographicInfoStep
            value={formData}
            onNext={(data) => {
              updateFormData(data)
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 7:
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
      case 8:
        return (
          <RightToWorkStep
            value={formData.rightToWork}
            onNext={(rightToWork) => {
              updateFormData({ rightToWork })
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 9:
        return (
          <PayrollStep
            value={formData.payroll}
            onNext={(payroll) => {
              updateFormData({ payroll })
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 10:
        return (
          <EqualityInfoStep
            value={formData.equalityInformation}
            onNext={(equalityInformation) => {
              updateFormData({ equalityInformation })
              handleNext()
            }}
            onBack={handleBack}
          />
        )
      case 11:
        return (
          <BeneficiaryStep
            value={formData.beneficiary}
            onNext={(beneficiary) => {
              updateFormData({ beneficiary })
              handleNext()
            }}
            applicantAddress={{
              line1: formData?.address,
              city: formData?.cityOrTown,
              state: formData?.stateOrProvince,
              postCode: formData?.postCode,
              country: formData?.address,
            }}
            onBack={handleBack}
          />
        )
        
      case 12:
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
