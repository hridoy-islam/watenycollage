
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"
import { step2Schema, type Step2Data } from "@/lib/schemas/character-reference-schemas"
import { Button } from "@/components/ui/button"

interface Step2Props {
  onNext: (data: Step2Data) => void
  defaultValues?: Partial<Step2Data>
}

const personalCharacteristics = [
  { key: "reliable", label: "reliable" },
  { key: "punctual", label: "punctual" },
  { key: "trustworthy", label: "trustworthy" },
  { key: "approachable", label: "approachable" },
  { key: "tactful", label: "tactful" },
  { key: "discreet", label: "discreet" },
  { key: "selfMotivated", label: "selfMotivated" },
  { key: "ableToWorkAlone", label: "ableToWorkAlone" },
] as const

const YesNoQuestion = ({
  control,
  name,
  label,
}: {
  control: any
  name: keyof Step2Data
  label: string
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label} <span className="text-red-500">*</span>
        </FormLabel>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${String(name)}-yes`}
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked ? true : undefined)}
            />
            <Label htmlFor={`${String(name)}-yes`} className="font-normal">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${String(name)}-no`}
              checked={field.value === false}
              onCheckedChange={(checked) => field.onChange(checked ? false : undefined)}
            />
            <Label htmlFor={`${String(name)}-no`} className="font-normal">
              No
            </Label>
          </div>
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
)

export function Step2HealthCharacteristics({ onSaveAndContinue, defaultValues,handleBack }: Step2Props) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      howLongKnown: defaultValues?.howLongKnown || "",
      seriousIllness: defaultValues?.seriousIllness,
      drugDependency: defaultValues?.drugDependency,
      knowAboutApplicant: defaultValues?.knowAboutApplicant,
      reliable: defaultValues?.reliable,
      punctual: defaultValues?.punctual,
      trustworthy: defaultValues?.trustworthy,
      approachable: defaultValues?.approachable,
      tactful: defaultValues?.tactful,
      discreet: defaultValues?.discreet,
      selfMotivated: defaultValues?.selfMotivated,
      ableToWorkAlone: defaultValues?.ableToWorkAlone,
    },
  })

 const onSubmit = (data: Step2Data) => {
    onSaveAndContinue(data)
  }

  return (
    <Form {...form}>
      <form id="step-2-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="howLongKnown"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How long has the applicant been known to you? <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <YesNoQuestion
          control={form.control}
          name="seriousIllness"
          label="Does the applicant suffer from any serious or recurring illness?"
        />
        <YesNoQuestion
          control={form.control}
          name="drugDependency"
          label="Was the applicant to your personal knowledge dependent upon drugs or medication?"
        />
        <YesNoQuestion
          control={form.control}
          name="knowAboutApplicant"
          label="From what you know of the applicant, would you consider them to be suitable?"
        />

        <div className="pt-4 border-t">
          <p className="text-lg text-muted-foreground mb-4">
            From what you know of the applicant, would you consider them to be:
          </p>
          <div className="space-y-4">
            {personalCharacteristics.map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between py-2">
                    <div>
                      <FormLabel>
                        {label} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormMessage />
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-yes`}
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked ? true : undefined)}
                        />
                        <Label htmlFor={`${key}-yes`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-no`}
                          checked={field.value === false}
                          onCheckedChange={(checked) => field.onChange(checked ? false : undefined)}
                        />
                        <Label htmlFor={`${key}-no`}>No</Label>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
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
