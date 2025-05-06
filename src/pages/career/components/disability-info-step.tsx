"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import type { TCareer } from "@/types/career"
import { Checkbox } from "@/components/ui/checkbox"

const disabilityInfoSchema = z.object({
  hasDisability: z.boolean(),
  disabilityDetails: z.string().optional(),
  needsReasonableAdjustment: z.boolean(),
  reasonableAdjustmentDetails: z.string().optional(),
})

type DisabilityInfoFormValues = z.infer<typeof disabilityInfoSchema>

interface DisabilityInfoStepProps {
  value: Partial<TCareer>
  onNext: (data: Partial<TCareer>) => void
  onBack: () => void
}

export function DisabilityInfoStep({ value, onNext, onBack }: DisabilityInfoStepProps) {
  const form = useForm<DisabilityInfoFormValues>({
    resolver: zodResolver(disabilityInfoSchema),
    defaultValues: {
      hasDisability: value.hasDisability || false,
      disabilityDetails: value.disabilityDetails || "",
      needsReasonableAdjustment: value.needsReasonableAdjustment || false,
      reasonableAdjustmentDetails: value.reasonableAdjustmentDetails || "",
    },
  })

  function onSubmit(data: DisabilityInfoFormValues) {
    onNext(data)
  }

  return (
    <Card>
      <CardHeader>
        {/* <CardTitle>Disability Information</CardTitle>
        <CardDescription>
          Please provide information about any disabilities or adjustments needed. This information helps us ensure we
          can provide appropriate support.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hasDisability"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Do you have a disability?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Under the Equality Act 2010, a disability is defined as a physical or mental impairment which has
                      a substantial and long-term adverse effect on a person's ability to carry out normal day-to-day
                      activities.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("hasDisability") && (
              <FormField
                control={form.control}
                name="disabilityDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please provide details about your disability</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please describe your disability and how it affects you"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="needsReasonableAdjustment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Do you require any reasonable adjustments?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This could include adjustments to the workplace, equipment, or working arrangements.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("needsReasonableAdjustment") && (
              <FormField
                control={form.control}
                name="reasonableAdjustmentDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please provide details about the adjustments needed</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Please describe the adjustments you require"
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
                Back
              </Button>
              <Button type="submit" className="bg-watney text-white hover:bg-watney/90">Next</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
