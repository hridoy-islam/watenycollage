"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const rightToWorkSchema = z.object({
  hasExpiry: z.boolean(),
  expiryDate: z.date().optional().or(z.literal("")),
})

type RightToWorkFormValues = z.infer<typeof rightToWorkSchema>

interface RightToWorkStepProps {
  value?: {
    hasExpiry: boolean
    expiryDate?: Date
  }
  onNext: (data: {
    hasExpiry: boolean
    expiryDate?: Date
  }) => void
  onBack: () => void
}

export function RightToWorkStep({ value, onNext, onBack }: RightToWorkStepProps) {
  const form = useForm<RightToWorkFormValues>({
    resolver: zodResolver(rightToWorkSchema),
    defaultValues: {
      hasExpiry: value?.hasExpiry || false,
      expiryDate: value?.expiryDate ? new Date(value.expiryDate) : undefined,
    },
  })

  function onSubmit(data: RightToWorkFormValues) {
    onNext({
      hasExpiry: data.hasExpiry,
      expiryDate: data.hasExpiry && data.expiryDate ? new Date(data.expiryDate) : undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Right to Work</CardTitle>
        <CardDescription>Please provide information about your right to work in the country.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hasExpiry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Does your right to work have an expiry date?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if your visa, work permit, or other right to work documentation has an expiry date.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("hasExpiry") && (
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                      />
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
