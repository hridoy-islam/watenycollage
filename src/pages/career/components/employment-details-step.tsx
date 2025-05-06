"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TCareer } from "@/types/career"
import { Checkbox } from "@/components/ui/checkbox"

const employmentDetailsSchema = z.object({
  employmentType: z.enum(["full-time", "part-time", "contractor", "temporary", "intern"], {
    required_error: "Employment type is required",
  }),
  isFullTime: z.boolean(),
})

type EmploymentDetailsFormValues = z.infer<typeof employmentDetailsSchema>

interface EmploymentDetailsStepProps {
  value: Partial<TCareer>
  onNext: (data: Partial<TCareer>) => void
  onBack: () => void
}

export function EmploymentDetailsStep({ value, onNext, onBack }: EmploymentDetailsStepProps) {
  const form = useForm<EmploymentDetailsFormValues>({
    resolver: zodResolver(employmentDetailsSchema),
    defaultValues: {
      employmentType: value.employmentType || "full-time",
      isFullTime: value.isFullTime !== undefined ? value.isFullTime : false,
    },
  })

  function onSubmit(data: EmploymentDetailsFormValues) {
    // Update isFullTime based on employmentType if not explicitly set
    if (data.employmentType === "full-time" && data.isFullTime === undefined) {
      data.isFullTime = true
    }
    onNext(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment Details</CardTitle>
        <CardDescription>Please provide details about your employment preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFullTime"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={
                        form.watch("employmentType") !== "full-time" && form.watch("employmentType") !== "part-time"
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Full-time Availability</FormLabel>
                    <p className="text-sm text-muted-foreground">Check this if you are available for full-time work</p>
                  </div>
                </FormItem>
              )}
            />

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
