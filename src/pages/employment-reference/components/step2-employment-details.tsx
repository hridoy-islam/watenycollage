

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CustomDatePicker } from "@/components/shared/CustomDatePicker"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"

const step2Schema = z.object({
    employmentFrom: z
    .date({ required_error: "Employment start date is required" })
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" }),
  employmentTill: z
    .date({ required_error: "Employment end date is required" })
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" }),

  reasonLeaving: z.string().min(1, "Reason for leaving is required"),
})

type Step2Data = z.infer<typeof step2Schema>

interface Step2Props {
  defaultValues?: Partial<Step2Data>
  onSaveAndContinue: (data: Step2Data) => void
  handleBack: () => void
}

export function Step2EmploymentDetails({ defaultValues, onSaveAndContinue, handleBack }: Step2Props) {
  const form = useForm<Step2Data>({
  resolver: zodResolver(step2Schema),
  defaultValues: {
    employmentFrom: defaultValues?.employmentFrom
      ? new Date(defaultValues.employmentFrom)
      : undefined,
    employmentTill: defaultValues?.employmentTill
      ? new Date(defaultValues.employmentTill)
      : undefined,
    reasonLeaving: defaultValues?.reasonLeaving || "",
  },
})


  const onSubmit = (data: Step2Data) => {
    onSaveAndContinue(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employmentFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Employment From <span className="text-red-500">*</span>
                </FormLabel>
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
          <FormField
            control={form.control}
            name="employmentTill"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Employment Till <span className="text-red-500">*</span>
                </FormLabel>
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
        <FormField
          control={form.control}
          name="reasonLeaving"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Reason for leaving <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Please provide the reason" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleBack()}
            className="bg-watney text-white hover:bg-watney/90"
          >
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
