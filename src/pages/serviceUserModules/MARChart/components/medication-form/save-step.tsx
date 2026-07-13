
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Calendar, Pill } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SaveStepProps {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function SaveStep({ formData }: SaveStepProps) {
  const navigate = useNavigate()

  const handleSave = () => {
    // Here you would typically save to a database
    console.log("Saving medication:", formData)

    // Simulate save and redirect
    setTimeout(() => {
      navigate("/admin/people-planner/mar-chart")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Review & Save Medication
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Please review all the information below before saving this medication.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Medication Name */}
          <div className="flex items-start gap-3">
            <Pill className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium">Medication</h3>
              <p className="text-sm text-muted-foreground">{formData.name || "Not specified"}</p>
            </div>
          </div>

          {/* Schedule Type */}
          <div className="flex items-start gap-3">
            {formData.scheduleType === "scheduled" ? (
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
            )}
            <div>
              <h3 className="font-medium">Schedule Type</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={formData.scheduleType === "scheduled" ? "default" : "secondary"}>
                  {formData.scheduleType === "scheduled" ? "Scheduled" : "PRN (As Needed)"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          {formData.scheduleType === "scheduled" && formData.scheduledTimes?.length > 0 && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium">Scheduled Times</h3>
                <div className="space-y-1 mt-1">
                  {formData.scheduledTimes.map((slot: any, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {slot.time} - {slot.dose || "No dose specified"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRN Instructions */}
          {formData.scheduleType === "prn" && formData.prnInstructions && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h3 className="font-medium">PRN Instructions</h3>
                <p className="text-sm text-muted-foreground mt-1">{formData.prnInstructions}</p>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(formData.route || formData.frequency || formData.startDate) && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formData.route && (
                  <div>
                    <span className="font-medium">Route:</span> {formData.route}
                  </div>
                )}
                {formData.frequency && (
                  <div>
                    <span className="font-medium">Frequency:</span> {formData.frequency}
                  </div>
                )}
                {formData.startDate && (
                  <div>
                    <span className="font-medium">Start Date:</span> {formData.startDate}
                  </div>
                )}
                {formData.endDate && (
                  <div>
                    <span className="font-medium">End Date:</span> {formData.endDate}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

     
    </div>
  )
}
