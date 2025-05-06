"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const equalityInfoSchema = z.object({
  nationality: z.string().min(1, { message: "Nationality is required" }),
  religion: z.string().optional(),
  hasDisability: z.boolean(),
  disabilityDetails: z.string().optional(),
})

type EqualityInfoFormValues = z.infer<typeof equalityInfoSchema>

interface EqualityInfoStepProps {
  value?: {
    nationality: string
    religion: string
    hasDisability: boolean
    disabilityDetails?: string
  }
  onNext: (data: {
    nationality: string
    religion: string
    hasDisability: boolean
    disabilityDetails?: string
  }) => void
  onBack: () => void
}

export function EqualityInfoStep({ value, onNext, onBack }: EqualityInfoStepProps) {
  const form = useForm<EqualityInfoFormValues>({
    resolver: zodResolver(equalityInfoSchema),
    defaultValues: {
      nationality: value?.nationality || "",
      religion: value?.religion || "",
      hasDisability: value?.hasDisability || false,
      disabilityDetails: value?.disabilityDetails || "",
    },
  })

  function onSubmit(data: EqualityInfoFormValues) {
    onNext({
      nationality: data.nationality,
      religion: data.religion || "",
      hasDisability: data.hasDisability,
      disabilityDetails: data.hasDisability ? data.disabilityDetails : undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equality Information</CardTitle>
        <CardDescription>
          Please provide information for equality monitoring purposes. This information is used to ensure equal
          opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your nationality" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />

            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Religion (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your religion" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />
              </div>

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
                      This information helps us ensure we can provide appropriate support.
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
                      <Textarea {...field} placeholder="Please describe your disability" className="min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
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
