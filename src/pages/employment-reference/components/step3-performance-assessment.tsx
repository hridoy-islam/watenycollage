

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"

// Define schema with separate fields
const step3Schema = z.object({
  qualityOrganization: z.string().min(1, "Please select a rating for Quality and organization of work"),
  courteousPolite: z.string().min(1, "Please select a rating for Courteous and polite"),
  willingnessFollowPolicies: z.string().min(1, "Please select a rating for Willingness to follow policies"),
  integrityTrust: z.string().min(1, "Please select a rating for Integrity and trust"),
  attitudeEqualOpportunities: z
    .string()
    .min(1, "Please select a rating for Attitude towards equal opportunities"),
  emotionalControl: z.string().min(1, "Please select a rating for Emotional Control"),
  proactiveApproach: z.string().min(1, "Please select a rating for Pro-active approach to work"),
  respectTeam: z.string().min(1, "Please select a rating for Respect to and from team"),
  empathyClients: z.string().min(1, "Please select a rating for Empathy towards service user / clients"),
  attitudesCriticism: z.string().min(1, "Please select a rating for Attitudes towards criticism"),
  groomingAppearance: z.string().min(1, "Please select a rating for Grooming and Appearance"),
  attendancePunctuality: z.string().min(1, "Please select a rating for Attendance / Punctuality"),
})

type Step3Data = z.infer<typeof step3Schema>

interface Step3Props {
  defaultValues?: Partial<Step3Data>
  onSaveAndContinue: (data: Step3Data) => void
  handleBack: () => void
}

// Array to map labels and field keys
const characteristics = [
  { label: "Quality and organization of work", key: "qualityOrganization" },
  { label: "Courteous and polite", key: "courteousPolite" },
  { label: "Willingness to follow policies", key: "willingnessFollowPolicies" },
  { label: "Integrity and trust", key: "integrityTrust" },
  { label: "Attitude towards equal opportunities i.e. sex, race, religion, age", key: "attitudeEqualOpportunities" },
  { label: "Emotional Control", key: "emotionalControl" },
  { label: "Pro-active approach to work", key: "proactiveApproach" },
  { label: "Respect to and from team", key: "respectTeam" },
  { label: "Empathy towards service user / clients", key: "empathyClients" },
  { label: "Attitudes towards criticism", key: "attitudesCriticism" },
  { label: "Grooming and Appearance", key: "groomingAppearance" },
  { label: "Attendance / Punctuality", key: "attendancePunctuality" },
]

export function Step3PerformanceAssessment({ defaultValues, onSaveAndContinue, handleBack }: Step3Props) {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: defaultValues || {},
  })

  const onSubmit = (data: Step3Data) => {
    onSaveAndContinue(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        

     {characteristics.map(({ label, key }) => (
  <FormField
    key={key}
    control={form.control}
    name={key as any}
    render={({ field }) => (
      <FormItem className="flex items-center justify-between  py-3 ">
        {/* Label on the left */}
        <FormLabel className="text-base font-medium whitespace-nowrap">
          {label} <span className="text-red-500">*</span>
          <FormMessage />
        </FormLabel>

        {/* Inline options on the right */}
        <div className="flex items-center gap-6">
          {["Very Good", "Good", "Poor"].map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={`${key}-${option}`}
                checked={field.value === option}
                onCheckedChange={(checked) => checked && field.onChange(option)}
              />
              <Label htmlFor={`${key}-${option}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </div>

        
      </FormItem>
    )}
  />
))}



        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={handleBack} className="bg-watney text-white hover:bg-watney/90">
            Back
          </Button>
          <Button type="submit" className="bg-watney text-white hover:bg-watney/90">
            Save And Next
          </Button>
        </div>
      </form>
    </Form>
  )
}
