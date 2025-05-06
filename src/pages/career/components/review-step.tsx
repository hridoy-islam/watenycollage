"use client"

import { useState } from "react"
import moment from "moment"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
    return moment(date).format("MMMM D, YYYY")
  }

  const renderSection = (title: string, data: any) => {
    if (!data) return null

    return (
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          {Object.entries(data).map(([key, value]) => {
            if (typeof value === "object" && value !== null && !(value instanceof Date)) {
              return null
            }

            if (value instanceof Date || moment(value, moment.ISO_8601, true).isValid()) {
              value = formatDate(value)
            }

            if (typeof value === "boolean") {
              value = value ? "Yes" : "No"
            }

            return (
              <div key={key} className="mb-2 grid grid-cols-2 gap-2">
                <div className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="text-sm">
                  {value === undefined || value === null || value === ""
                    ? "Not provided"
                    : String(value)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const sections = (
    <>
      {renderSection("Personal Details", {
        title: formData.title,
        firstName: formData.firstName,
        initial: formData.initial,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        nationalInsuranceNumber: formData.nationalInsuranceNumber,
        nhsNumber: formData.nhsNumber,
      })}

      {renderSection("Contact Information", {
        email: formData.email,
        mobilePhone: formData.mobilePhone,
        homePhone: formData.homePhone,
        otherPhone: formData.otherPhone,
        address: formData.address,
        cityOrTown: formData.cityOrTown,
        stateOrProvince: formData.stateOrProvince,
        postCode: formData.postCode,
        country: formData.country,
      })}

      {renderSection("Application Details", {
        applicationDate: formData.applicationDate,
        availableFromDate: formData.availableFromDate,
        position: formData.position,
        source: formData.source,
        branch: formData.branch,
        area: formData.area,
      })}

      {renderSection("Employment Details", {
        employmentType: formData.employmentType,
        isFullTime: formData.isFullTime,
        carTravelAllowance: formData.carTravelAllowance,
      })}

      {renderSection("Demographic Information", {
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        ethnicOrigin: formData.ethnicOrigin,
      })}

      {renderSection("Disability Information", {
        hasDisability: formData.hasDisability,
        disabilityDetails: formData.disabilityDetails,
        needsReasonableAdjustment: formData.needsReasonableAdjustment,
        reasonableAdjustmentDetails: formData.reasonableAdjustmentDetails,
      })}

      {formData.rightToWork &&
        renderSection("Right to Work", {
          hasExpiry: formData.rightToWork.hasExpiry,
          expiryDate: formData.rightToWork.expiryDate,
        })}

      {formData.payroll &&
        renderSection("Payroll Information", {
          payrollNumber: formData.payroll.payrollNumber,
          paymentMethod: formData.payroll.paymentMethod,
        })}

      {formData.equalityInformation &&
        renderSection("Equality Information", {
          nationality: formData.equalityInformation.nationality,
          religion: formData.equalityInformation.religion,
          hasDisability: formData.equalityInformation.hasDisability,
          disabilityDetails: formData.equalityInformation.disabilityDetails,
        })}

      {formData.beneficiary &&
        renderSection("Beneficiary Information", {
          fullName: formData.beneficiary.fullName,
          relationship: formData.beneficiary.relationship,
          email: formData.beneficiary.email,
          mobile: formData.beneficiary.mobile,
          sameAddress: formData.beneficiary.sameAddress,
        })}
    </>
  )

  return (
    <>
      <Card>
        <CardHeader>
          {/* <CardTitle>Review Your Application</CardTitle>
          <CardDescription>
            Please review your information before submitting. You can go back to make changes if needed.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="max-h-[400px] overflow-y-auto pr-2">{sections}</div> */}

          {/* <Separator /> */}

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
            <Button type="button" variant="outline" onClick={onBack}>
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
                  <div className="space-y-6">{sections}</div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={onSubmit} disabled={!termsAccepted || !dataProcessingAccepted} className="bg-watney text-white hover:bg-watney/90">
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
