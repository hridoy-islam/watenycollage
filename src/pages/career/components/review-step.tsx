"use client"

import { useState } from "react"
import moment from "moment"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import type { TCareer } from "@/types/career"

interface ReviewStepProps {
  formData: Partial<TCareer>
  onSubmit: () => void
  onBack: () => void
}

export function ReviewStep({ formData, onSubmit, onBack }: ReviewStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Not provided"
    return moment(date).format("DD/MM/YYYY")
  }

  const renderSection = (title: string, data: any, showTitle = true) => {
    if (!data) return null;
  
    return (
      <div>
        {showTitle && (
          <h3 className="text-lg font-medium text-black mb-2">{title}</h3>
        )}
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {Object.entries(data).map(([key, value]) => {
            if (typeof value === "object" && value !== null && !(value instanceof Date)) {
              return null;
            }
  
            if (value instanceof Date || moment(value, moment.ISO_8601, true).isValid()) {
              value = formatDate(value);
            }
  
            if (typeof value === "boolean") {
              value = value ? "Yes" : "No";
            }
  
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  
            return (
              <div key={key} className="mb-2 grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-sm">
                  {value === undefined || value === null || value === ""
                    ? "Not provided"
                    : String(value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAddress = (address: any) => {
    if (!address) return "Not provided";
    return `${address.line1}${address.line2 ? `, ${address.line2}` : ''}, ${address.city}, ${address.postCode}, ${address.country}`;
  };

  const sections = (
    <div className="space-y-6">
      {renderSection("Personal Details", {
        title: formData.title,
        firstName: formData.firstName,
        initial: formData.initial,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        isBritishCitizen: formData.isBritishCitizen,
        shareCode:formData.shareCode
      })}

      {renderSection("Contact Information", {
        email: formData.email,
        phone: formData.phone,
        postalAddress: formData.postalAddress ? renderAddress(formData.postalAddress) : null,
        countryOfResidence: formData.countryOfResidence,
      })}

      {renderSection("Official Numbers", {
        nationalInsuranceNumber: formData.nationalInsuranceNumber,
        nhsNumber: formData.nhsNumber,
        shareCode: formData.shareCode,
      })}

      {renderSection("Application Details", {
        position: formData.position,
        applicationDate: formData.applicationDate,
        availableFromDate: formData.availableFromDate,
        employmentType: formData.employmentType,
        source: formData.source,
        carTravelAllowance: formData.carTravelAllowance,
        isFullTime: formData.isFullTime,
      })}

      {renderSection("Demographics", {
        ethnicOrigin: formData.ethnicOrigin,
        isStudent: formData.isStudent,
        isUnderStatePensionAge: formData.isUnderStatePensionAge,
      })}

      {renderSection("Disability Information", {
        hasDisability: formData.hasDisability,
        disabilityDetails: formData.disabilityDetails,
        needsReasonableAdjustment: formData.needsReasonableAdjustment,
        reasonableAdjustmentDetails: formData.reasonableAdjustmentDetails,
      })}

      {renderSection("Current Employment", formData.currentEmployment)}

      {formData.previousEmployments && formData.previousEmployments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-black mb-2">Previous Employment</h3>
          {formData.previousEmployments.map((employment, index) => (
            <div key={index} className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              {renderSection("", employment, false)}
            </div>
          ))}
        </div>
      )}

      {renderSection("Employment Gaps", {
        hasEmploymentGaps: formData.hasEmploymentGaps,
        employmentGapsExplanation: formData.employmentGapsExplanation,
      })}

      {renderSection("Right to Work", {
        hasExpiry: formData.rightToWork?.hasExpiry,
        expiryDate: formData.rightToWork?.expiryDate,
      })}

      {formData.referees && formData.referees.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-black mb-2">Referees</h3>
          {formData.referees.map((referee, index) => (
            <div key={index} className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              {renderSection("", referee, false)}
            </div>
          ))}
        </div>
      )}

      {renderSection("Declaration", {
        declarationCorrectUpload: formData.declarationCorrectUpload,
        declarationContactReferee: formData.declarationContactReferee,
        criminalConviction: formData.criminalConviction,
        criminalConvictionDetails: formData.criminalConvictionDetails,
        appliedBefore: formData.appliedBefore,
      })}
    </div>
  )

  return (
    <Card>
      <CardHeader />
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Terms and Conditions</h3>
          <div className="max-h-40 overflow-y-auto rounded-md bg-gray-50 p-4 text-sm">
            <p className="mb-2">
              I confirm that the information given on this form is true, complete and accurate and that none of the
              information requested or other material information has been omitted. I accept that if it is discovered
              that I have supplied false, inaccurate or misleading information, the company reserves the right to
              cancel my application, withdraw its offer of a position or terminate my employment and I shall have no
              claim against the company in relation thereto.
            </p>
            <p className="mb-2">
              I understand that the information provided will be used for recruitment and employment purposes and may
              be shared with relevant departments within the organization.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm font-medium">
              I accept the terms and conditions
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="data-processing"
              checked={dataProcessingAccepted}
              onCheckedChange={(checked) => setDataProcessingAccepted(checked as boolean)}
            />
            <label htmlFor="data-processing" className="text-sm font-medium">
              I consent to the processing of my data as outlined above
            </label>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
            Back
          </Button>
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant='outline'>Preview Application</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto min-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Application Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {sections}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-watney text-white hover:bg-watney/90">
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={onSubmit} 
              disabled={!termsAccepted || !dataProcessingAccepted} 
              className="bg-watney text-white hover:bg-watney/90"
            >
              Submit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}