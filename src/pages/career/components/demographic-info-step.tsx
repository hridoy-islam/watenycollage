"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TCareer } from "@/types/career"
import { Input } from "@/components/ui/input"

const demographicInfoSchema = z.object({
  gender: z.string().min(1, { message: "Gender is required" }),
  maritalStatus: z.string().min(1, { message: "Marital status is required" }),
  ethnicOrigin: z.string().optional(),
  ethnicOriginDetails:z.string().optional(),
})

type DemographicInfoFormValues = z.infer<typeof demographicInfoSchema>

interface DemographicInfoStepProps {
  value: Partial<TCareer>
  onNext: (data: Partial<TCareer>) => void
  onBack: () => void
}

export function DemographicInfoStep({ value, onNext, onBack }: DemographicInfoStepProps) {
  const form = useForm<DemographicInfoFormValues>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues: {
      gender: value.gender || "",
      maritalStatus: value.maritalStatus || "",
      ethnicOrigin: value.ethnicOrigin || "",
      ethnicOriginDetails:value.ethnicOriginDetails||"",
    },
  })

  function onSubmit(data: DemographicInfoFormValues) {
    onNext(data)
  }

  const selectedEthnicOrigin = form.watch("ethnicOrigin");

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your sexual orientation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marital Status */}
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Civil Partnership">Civil Partnership</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ethnic Origin */}
              <FormField
                control={form.control}
                name="ethnicOrigin"
                render={({ field }) => (
                  <FormItem >
                    <FormLabel>Ethnic Origin (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ethnic origin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Asian/Asian British">Asian/Asian British</SelectItem>
                        <SelectItem value="Black/African/Caribbean/Black British">
                          Black/African/Caribbean/Black British
                        </SelectItem>
                        <SelectItem value="Mixed/Multiple ethnic groups">
                          Mixed/Multiple ethnic groups
                        </SelectItem>
                        <SelectItem value="Other ethnic group">Other ethnic group</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Field: Ethnic Origin Details */}
              {selectedEthnicOrigin === "Other ethnic group" && (
                <FormField
                  control={form.control}
                  name="ethnicOriginDetails"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Please specify your ethnic origin</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your ethnic group" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="bg-watney text-white hover:bg-watney/90">
                Back
              </Button>
              <Button type="submit" className="bg-watney text-white hover:bg-watney/90">
                Next
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

