

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"
import { step3Schema, type Step3Data } from "@/lib/schemas/character-reference-schemas"
import { Button } from "@/components/ui/button"

interface Step3Props {
  onNext: (data: Step3Data) => void
  defaultValues?: Partial<Step3Data>
}

export function Step3CompetencyAssessment({ onSaveAndContinue, defaultValues, handleBack }: Step3Props) {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      competencyLevel: defaultValues?.competencyLevel,
      commonSenseLevel: defaultValues?.commonSenseLevel,
      relatesWell: defaultValues?.relatesWell,
    },
  })

  const onSubmit = (data: Step3Data) => {
    onSaveAndContinue(data)
  }


  return (
    <Form {...form}>
      <form id="step-3-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-muted-foreground mb-4">
          Bearing in mind that the applicant will deal with a variety of situations, how would you rate their level of:
        </p>

        <FormField
          control={form.control}
          name="competencyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Competency <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex flex-wrap gap-4 pt-2">
                {(["very-good", "good", "satisfactory", "poor"] as const).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`competency-${level}`}
                      checked={field.value === level}
                      onCheckedChange={(checked) => checked && field.onChange(level)}
                    />
                    <Label htmlFor={`competency-${level}`} className="capitalize">
                      {level.replace("-", " ")}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commonSenseLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Common sense <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex flex-wrap gap-4 pt-2">
                {(["very-good", "good", "satisfactory", "poor"] as const).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`commonsense-${level}`}
                      checked={field.value === level}
                      onCheckedChange={(checked) => checked && field.onChange(level)}
                    />
                    <Label htmlFor={`commonsense-${level}`} className="capitalize">
                      {level.replace("-", " ")}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relatesWell"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Do you consider that the applicant relates well with / would relate well with service users in their
                care? <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex flex-wrap gap-4 pt-2">
                {(["yes", "no", "unsure"] as const).map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`relates-${option}`}
                      checked={field.value === option}
                      onCheckedChange={(checked) => checked && field.onChange(option)}
                    />
                    <Label htmlFor={`relates-${option}`} className="capitalize">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"

          onClick={() => handleBack()}
            className="bg-watney text-white hover:bg-watney/90">
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
