

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"

const step1Schema = z.object({
  applicantName: z.string().min(1, "Applicant name is required"),
  positionApplied: z.string().min(1, "Position applied for is required"),
  howLongKnown: z.string().min(1, "This field is required"),
  relationship: z.string().min(1, "Relationship is required"),
})

type Step1Data = z.infer<typeof step1Schema>

interface Step1Props {
  defaultValues?: Partial<Step1Data>
  onSaveAndContinue: (data: Step1Data) => void
  handleBack: () => void
}

export function Step1ApplicantInfo({ defaultValues, onSaveAndContinue, handleBack }: Step1Props) {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      applicantName: defaultValues?.applicantName || "",
      positionApplied: defaultValues?.positionApplied || "",
      howLongKnown: defaultValues?.howLongKnown || "",
      relationship: defaultValues?.relationship || "",
    },
  })

  const onSubmit = (data: Step1Data) => {
    onSaveAndContinue(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="applicantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name of applicant <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter applicant's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="positionApplied"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Position applied for <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter position title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="howLongKnown"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  How long have you known the applicant? <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 3 years" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Relationship to applicant <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Direct supervisor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            disabled
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
