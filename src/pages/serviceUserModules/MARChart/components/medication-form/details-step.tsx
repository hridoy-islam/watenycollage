
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DetailsStepProps {
  formData: any
  updateFormData: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function DetailsStep({ formData, updateFormData }: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please provide additional details about this medication and its administration.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              placeholder="e.g., Oral, Topical, Injection"
              value={formData.route}
              onChange={(e) => updateFormData({ route: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requires-against-signature">
              Requires second signature? <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">Is this a controlled drug (by Controlled Drug Offence)?</p>
            <Select
              value={formData.requiresSecondSignature}
              onValueChange={(value) => updateFormData({ requiresSecondSignature: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pulse-controlled-drug">Pulse controlled drug requirement</Label>
            <p className="text-xs text-muted-foreground">Is this a controlled drug (by Controlled Drug Offence)?</p>
            <Select
              value={formData.pulseControlledDrug}
              onValueChange={(value) => updateFormData({ pulseControlledDrug: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homely-remedy">Homely Remedy</Label>
            <Select value={formData.homelyRemedy} onValueChange={(value) => updateFormData({ homelyRemedy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="over-the-counter">Over the Counter</Label>
            <Select
              value={formData.overTheCounter}
              onValueChange={(value) => updateFormData({ overTheCounter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="part-of-treatment-dosage">Part of a treatment dosage system?</Label>
            <Select
              value={formData.partOfTreatmentDosage}
              onValueChange={(value) => updateFormData({ partOfTreatmentDosage: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (where, nature of medication)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the medication..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-request">What additional request does Ainna need with this medication?</Label>
            <Textarea
              id="additional-request"
              placeholder="Any special requirements or considerations..."
              value={formData.additionalRequest}
              onChange={(e) => updateFormData({ additionalRequest: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gp-sourcing"
              checked={formData.gpSourcing}
              onCheckedChange={(checked) => updateFormData({ gpSourcing: checked })}
            />
            <Label htmlFor="gp-sourcing">GP for sourcing</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-level">Stock level</Label>
            <p className="text-xs text-muted-foreground">
              Please enter the current stock level and when you will next order.
            </p>
            <Input
              id="stock-level"
              placeholder="Enter current stock level"
              value={formData.stockLevel}
              onChange={(e) => updateFormData({ stockLevel: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-order">Next order</Label>
            <p className="text-xs text-muted-foreground">When will this item next be ordered?</p>
            <Input
              id="next-order"
              type="date"
              value={formData.nextOrder}
              onChange={(e) => updateFormData({ nextOrder: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
