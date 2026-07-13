
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface InstructionsStepProps {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function InstructionsStep({ formData, updateFormData }: InstructionsStepProps) {
  const [timeSlots, setTimeSlots] = useState(formData.scheduledTimes || [{ time: "08:00", dose: "" }])

  const addTimeSlot = () => {
    const newSlots = [...timeSlots, { time: "", dose: "" }]
    setTimeSlots(newSlots)
    updateFormData({ scheduledTimes: newSlots })
  }

  const removeTimeSlot = (index: number) => {
    const newSlots = timeSlots.filter((_, i) => i !== index)
    setTimeSlots(newSlots)
    updateFormData({ scheduledTimes: newSlots })
  }

  const updateTimeSlot = (index: number, field: string, value: string) => {
    const newSlots = [...timeSlots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setTimeSlots(newSlots)
    updateFormData({ scheduledTimes: newSlots })
  }

  if (formData.scheduleType === "scheduled") {
    return (
      <div className="space-y-6">
       <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Clock className="w-5 h-5" />
      Medication Rounds and Dose
    </CardTitle>
    <p className="text-sm text-muted-foreground">
      Set the times and doses for when this medication should be administered. Dose units are taken from the NHS database.
    </p>
  </CardHeader>

  <CardContent className="space-y-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Time</TableHead>
          <TableHead className="w-1/3">Dose</TableHead>
          <TableHead className="w-1/3 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {timeSlots.map((slot, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Checkbox checked />
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) => updateTimeSlot(index, "time", e.target.value)}
                  className="w-full"
                />
              </div>
            </TableCell>
            <TableCell>
              <Input
                placeholder="Enter dose"
                value={slot.dose}
                onChange={(e) => updateTimeSlot(index, "dose", e.target.value)}
                className="w-full"
              />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTimeSlot(index)}
                disabled={timeSlots.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    <Button
      variant="default"
      onClick={addTimeSlot}
      className="w-full bg-theme text-white hover:bg-theme/90 flex items-center justify-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Add medication round time
    </Button>
  </CardContent>
</Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="start-date">
              Start <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">The medication will appear in the app from this date</p>
            <Input
              id="start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateFormData({ startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <p className="text-xs text-muted-foreground">How often does this medication need to be administered?</p>
            <Input
              id="frequency"
              placeholder="e.g., Daily, Twice daily"
              value={formData.frequency}
              onChange={(e) => updateFormData({ frequency: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>End</Label>
          <p className="text-xs text-muted-foreground">
            If this medication has an end date, it will automatically be taken off the Care App and Care Office on this
            date.
          </p>
          <RadioGroup
            value={formData.endType || "ongoing"}
            onValueChange={(value) => updateFormData({ endType: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ongoing" id="ongoing" />
              <Label htmlFor="ongoing">No - Ongoing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific">Yes - On specific date</Label>
            </div>
          </RadioGroup>

          {formData.endType === "specific" && (
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => updateFormData({ endDate: e.target.value })}
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cautionary-instructions">Cautionary Instructions</Label>
          <p className="text-xs text-muted-foreground">
            Written on the pharmacy label. This will be shown to carers whilst they are administering medication.
          </p>
          <Textarea
            id="cautionary-instructions"
            placeholder="Enter cautionary instructions..."
            value={formData.cautionaryInstructions}
            onChange={(e) => updateFormData({ cautionaryInstructions: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    )
  }

  // PRN Instructions
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PRN (As Needed) Instructions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Provide instructions for when and how this medication should be administered as needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prn-instructions">
              When should this medication be given? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="prn-instructions"
              placeholder="e.g., When blood glucose is above 15 mmol/L, When experiencing pain..."
              value={formData.prnInstructions}
              onChange={(e) => updateFormData({ prnInstructions: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prn-dose">Maximum dose per administration</Label>
            <Input
              id="prn-dose"
              placeholder="Enter maximum dose"
              value={formData.prnDose}
              onChange={(e) => updateFormData({ prnDose: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prn-frequency">Maximum frequency</Label>
            <Input
              id="prn-frequency"
              placeholder="e.g., Every 4 hours, Maximum 3 times daily"
              value={formData.prnFrequency}
              onChange={(e) => updateFormData({ prnFrequency: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
