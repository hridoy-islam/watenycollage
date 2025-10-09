import { useForm } from "react-hook-form"

import { Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CustomDatePicker } from "@/components/shared/CustomDatePicker"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import type { CharacterReferenceFormData } from "@/lib/schemas/character-reference-schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { step4Schema, type Step4Data } from "@/lib/schemas/character-reference-schemas"

interface Step4Props {
  control: Control<CharacterReferenceFormData>
  onSubmit: (data: CharacterReferenceFormData) => void
  setCurrentStep: (step: number) => void
}

export function Step4FinalAssessment({ control, onSubmit, setCurrentStep, handleBack }: Step4Props) {

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {

    },
  })

  const onsubmit = (data: Step4Data) => {
    onSubmit(data)
  }


  return (
    <Form {...form}>
      <form id="step-3-form" onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">

        {/* Cautions / Convictions */}
        <FormField
          control={control}
          name="cautionsConvictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                This position is exempted from the Rehabilitation of Offenders Act 1974. Are you aware of any cautions,
                convictions or pending prosecutions held by the applicant? <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cautionsConvictions-yes"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked ? true : false)}
                  />
                  <Label htmlFor="cautionsConvictions-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cautionsConvictions-no"
                    checked={field.value === false}
                    onCheckedChange={(checked) => field.onChange(checked ? false : true)}
                  />
                  <Label htmlFor="cautionsConvictions-no">No</Label>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Comments */}
        <FormField
          control={control}
          name="additionalComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Would you like to make any other comments?</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Any additional comments" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <h3 className="font-semibold mt-4">Reference Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Referee Name */}
        <FormField
          control={control}
          name="refereeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Referee Position */}
        <FormField
          control={control}
          name="refereePosition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position held <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Your position/title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Referee Date */}
        <FormField
          control={control}
          name="refereeDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <CustomDatePicker
                  selected={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date)}
                  placeholder="MM/DD/YYYY"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>


        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleBack()}
            className="bg-watney text-white hover:bg-watney/90">
            Back
          </Button>
          <Button type="submit" className="bg-watney text-white hover:bg-watney/90">
            Submit Form
          </Button>
        </div>

      </form>
    </Form>
  )
}
