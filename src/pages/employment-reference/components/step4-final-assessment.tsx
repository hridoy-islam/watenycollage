
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CustomDatePicker } from "@/components/shared/CustomDatePicker"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form"

const step4Schema = z
  .object({
    unsuitableReason: z.string().optional(),
    wouldReemploy: z.enum(["yes", "no"], { required_error: "Please select an option" }),
    noReemployReason: z.string().optional(),
    suitabilityOpinion: z.string().min(1, "Opinion is required"),
    refereeName: z.string().min(1, "Name is required"),
    refereePosition: z.string().min(1, "Position is required"),
  refereeDate: z
  .any()
  .refine((val) => {
    if (val === null || val === undefined || val === '') return false;
    const date = val instanceof Date ? val : new Date(val);
    return date instanceof Date && !isNaN(date.getTime());
  }, {
    message: "Date is required",
  })
  .transform((val) => {
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }),
        
  })
  .refine((data) => data.wouldReemploy !== "no" || (data.noReemployReason && data.noReemployReason.length > 0), {
    message: "Please provide a reason",
    path: ["noReemployReason"],
  })

type Step4Data = z.infer<typeof step4Schema>

interface Step4Props {
  defaultValues?: Partial<Step4Data>
  onSubmit: (data: Step4Data) => void
  handleBack: () => void
}


const parseDate = (value?: string | Date) => {
  if (!value) return undefined
  if (value instanceof Date && !isNaN(value.getTime())) return value
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? undefined : parsed
}



export function Step4FinalAssessment({ defaultValues, onSubmit, handleBack }: Step4Props) {
 const form = useForm<Step4Data>({
  resolver: zodResolver(step4Schema),
  defaultValues: {
    unsuitableReason: defaultValues?.unsuitableReason || "",
    wouldReemploy: defaultValues?.wouldReemploy || undefined,
    noReemployReason: defaultValues?.noReemployReason || "",
    suitabilityOpinion: defaultValues?.suitabilityOpinion || "",
    refereeName: defaultValues?.refereeName || "",
    refereePosition: defaultValues?.refereePosition || "",
    refereeDate: parseDate(defaultValues?.refereeDate),
  },
})


  const wouldReemployValue = form.watch("wouldReemploy")

  const handleSubmit = (data: Step4Data) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="unsuitableReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you know any reason(s) that would make this applicant unsuitable?</FormLabel>
              <FormControl>
                <Textarea placeholder="Please provide details or leave blank if none" rows={3} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wouldReemploy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Would you re-employ this applicant? <span className="text-red-500">*</span>
              </FormLabel>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wouldReemploy-yes"
                    checked={field.value === "yes"}
                    onCheckedChange={(checked) => field.onChange(checked ? "yes" : undefined)}
                  />
                  <Label htmlFor="wouldReemploy-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wouldReemploy-no"
                    checked={field.value === "no"}
                    onCheckedChange={(checked) => field.onChange(checked ? "no" : undefined)}
                  />
                  <Label htmlFor="wouldReemploy-no">No</Label>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {wouldReemployValue === "no" && (
          <FormField
            control={form.control}
            name="noReemployReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  If 'No' please state the reason <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Please provide the reason" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="suitabilityOpinion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Opinion of applicant's suitability <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Your professional opinion" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 border-t space-y-4">
          <h3 className="font-semibold">Referee Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="refereeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refereePosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Position <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your position/title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
  control={form.control}
  name="refereeDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Date <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        <CustomDatePicker
          selected={field.value instanceof Date ? field.value : undefined}
          onChange={(date: Date) => field.onChange(date)}
          placeholder="MM/DD/YYYY"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

          </div>
        </div>

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
            Submit Form
          </Button>
        </div>
      </form>
    </Form>
  )
}
