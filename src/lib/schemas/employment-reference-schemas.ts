import { z } from "zod"

// Step 1: Applicant Information
export const step1Schema = z.object({
  applicantName: z.string().min(1, "Name is required"),
  positionApplied: z.string().min(1, "Position is required"),
  howLongKnown: z.string().min(1, "This field is required"),
  relationship: z.string().min(1, "This field is required"),
})

// Step 2: Employment Details
export const step2Schema = z.object({
  employmentFrom: z.string().min(1, "Required"),
  employmentTill: z.string().min(1, "Required"),
  reasonLeaving: z.string().min(1, "Required"),
})

// Step 3: Performance Assessment
export const step3Schema = z.object({
  ratings: z.record(z.string(), z.enum(["Very Good", "Good", "Poor"]).optional()).refine(
    (ratings) => {
      const characteristics = [
        "Quality and organization of work",
        "Courteous and polite",
        "Willingness to follow policies",
        "Integrity and trust",
        "Attitude towards equal opportunities i.e. sex, race, religion, age",
        "Emotional Control",
        "Pro-active approach to work",
        "Respect to and from team",
        "Empathy towards service user / clients",
        "Attitudes towards criticism",
        "Grooming and Appearance",
        "Attendance / Punctuality",
      ]
      return characteristics.every((_, index) => ratings[`rating_${index}`])
    },
    { message: "Please rate all characteristics" },
  ),
})

// Step 4: Final Assessment
export const step4Schema = z
  .object({
    unsuitableReason: z.string().optional(),
    wouldReemploy: z.string().optional(),
    noReemployReason: z.string().optional(),
    suitabilityOpinion: z.string().min(1, "Required"),
    refereeName: z.string().min(1, "Required"),
    refereePosition: z.string().min(1, "Required"),
    refereeDate: z.date({ required_error: "Date is required" }),
  })
  .refine(
    (data) => {
      if (data.wouldReemploy === "no") {
        return !!data.noReemployReason?.trim()
      }
      return true
    },
    {
      message: "Please provide reason for not re-employing",
      path: ["noReemployReason"],
    },
  )
  .refine(
    (data) => {
      return !!data.wouldReemploy
    },
    {
      message: "Please indicate if you would re-employ the applicant",
      path: ["wouldReemploy"],
    },
  )

// Combined schema for final submission
export const employmentReferenceSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
})

export type EmploymentReferenceFormData = z.infer<typeof employmentReferenceSchema>
