import { z } from "zod"

// Step 1: Applicant Information
export const step1Schema = z.object({
  positionApplied: z.string().min(1, "Position applied for is required"),
  basedIn: z.string(),
  applicantName: z.string().min(1, "Applicant name is required"),
  relationship: z.string().min(1, "Relationship is required"),
})

export type Step1Data = z.infer<typeof step1Schema>

// Step 2: Health & Personal Characteristics
export const step2Schema = z.object({
  howLongKnown: z.string().min(1, "How long known is required"),
  seriousIllness: z.boolean({ required_error: "Required" }),
  drugDependency: z.boolean({ required_error: "Required" }),
  knowAboutApplicant: z.boolean({ required_error: "Required" }),
  reliable: z.boolean({ required_error: "Required" }),
  punctual: z.boolean({ required_error: "Required" }),
  trustworthy: z.boolean({ required_error: "Required" }),
  approachable: z.boolean({ required_error: "Required" }),
  tactful: z.boolean({ required_error: "Required" }),
  discreet: z.boolean({ required_error: "Required" }),
  selfMotivated: z.boolean({ required_error: "Required" }),
  ableToWorkAlone: z.boolean({ required_error: "Required" }),
})

export type Step2Data = z.infer<typeof step2Schema>

// Step 3: Competency Assessment
export const step3Schema = z.object({
  competencyLevel: z.enum(["very-good", "good", "satisfactory", "poor"], {
    required_error: "Required",
  }),
  commonSenseLevel: z.enum(["very-good", "good", "satisfactory", "poor"], {
    required_error: "Required",
  }),
  relatesWell: z.enum(["yes", "no", "unsure"], {
    required_error: "Required",
  }),
})

export type Step3Data = z.infer<typeof step3Schema>

// Step 4: Final Assessment
export const step4Schema = z.object({
  cautionsConvictions: z.boolean({ required_error: "Required" }),
  additionalComments: z.string(),
  refereeName: z.string().min(1, "Referee name is required"),
  refereePosition: z.string().min(1, "Referee position is required"),
  refereeDate: z.date({ required_error: "Date is required" }),
})

export type Step4Data = z.infer<typeof step4Schema>

// Combined schema for final submission
export const characterReferenceSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
})

export type CharacterReferenceFormData = z.infer<typeof characterReferenceSchema>
