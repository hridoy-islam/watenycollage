
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertCircle } from "lucide-react"

interface ScheduleStepProps {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function ScheduleStep({ formData, updateFormData }: ScheduleStepProps) {
  const handleScheduleTypeChange = (value: string) => {
    updateFormData({ scheduleType: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">
            Has this medication been prescribed as a scheduled medication or a not scheduled (PRN) medication?{" "}
            <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Scheduled medications will need to be signed at specific times. Not scheduled (when required/PRN)
            medications can be signed at any time.
          </p>
        </div>

        <RadioGroup value={formData.scheduleType} onValueChange={handleScheduleTypeChange} className="space-y-4">
          <Card
            className={`cursor-pointer transition-colors ${formData.scheduleType === "scheduled" ? "border-theme bg-blue-50" : "hover:bg-gray-50"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <div className="flex-1">
                  <Label htmlFor="scheduled" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Scheduled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Medication must be taken at specific times throughout the day
                    </p>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${formData.scheduleType === "prn" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="prn" id="prn" />
                <div className="flex-1">
                  <Label htmlFor="prn" className="cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Not Scheduled (PRN)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Medication taken as needed, when required</p>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>

        {formData.scheduleType && (
          <div className="p-4 bg-white rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-theme rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">
                  {formData.scheduleType === "scheduled" ? "Scheduled Medication Selected" : "PRN Medication Selected"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.scheduleType === "scheduled"
                    ? "You'll set specific times in the next step"
                    : "This medication can be administered as needed"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
