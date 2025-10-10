"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";

const characterReferenceSchema = z.object({
  applicantName: z.string().min(1, "Required"),
  positionApplied: z.string().min(1, "Required"),
  relationship: z.string().min(1, "Required"),
  howLongKnown: z.string().min(1, "This field is required"),
  seriousIllness: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  drugsDependency: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  reliable: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  punctual: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  trustworthy: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  approachable: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  tactful: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  discreet: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  selfMotivated: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  ableToWorkAlone: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  competency: z.enum(["very_good", "good", "satisfactory", "poor"], {
    required_error: "Please select an option",
  }),
  commonSense: z.enum(["very_good", "good", "satisfactory", "poor"], {
    required_error: "Please select an option",
  }),
  relatesWellWithUsers: z.enum(["yes", "no", "unsure"], {
    required_error: "Please select an option",
  }),
  cautionsConvictions: z.enum(["yes", "no"], { required_error: "Please select an option" }),
  additionalComments: z.string().optional(),
  refereeName: z.string().min(1, "This field is required"),
  refereePosition: z.string().min(1, "This field is required"),
  refereeDate: z.date({ required_error: "Date is required" }).refine((date) => !isNaN(date.getTime()), {
    message: "Invalid date",
  }),
});

type CharacterReferenceFormData = z.infer<typeof characterReferenceSchema>;

export default function CharacterReferencePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<CharacterReferenceFormData>({
    resolver: zodResolver(characterReferenceSchema),
    defaultValues: {
      applicantName: "John Doe",
      positionApplied: "Care Assistant",
      relationship: "Friend",
    },
  });

  const onSubmit = ( data) => {
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
   return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-4xl">
                    <Card className="text-center shadow-xl rounded-xl p-8 bg-watney text-white border-none">
                        <CardHeader className="mb-6">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-white/20 mb-4">
                                <Check className="h-10 w-10 text-white" />
                            </div>
                            <CardTitle className="text-4xl font-bold mb-2">
                                Thank You!
                            </CardTitle>
                            <CardDescription className="text-xl text-white">
                                Your professional reference has been submitted successfully.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-lg">
                            <p>
                                Thank you for taking the time to complete this employment reference form.
                                Your feedback is valuable and will be carefully reviewed.
                            </p>
                            <p className="font-medium">
                                We appreciate your contribution and your support in helping us maintain high standards.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
  }

 return (
  <div className="min-h-screen p-6">
    <div className="mx-auto">
      <div className="flex flex-row items-center justify-between mb-6">
        <img src="/logo.png" alt="Everycare logo" className="h-16" />
      </div>

      <Card className="border border-gray-300">
        <CardHeader>
          <CardTitle className="text-xl">Personal Reference Questionnaire</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* === Applicant Info Box === */}
              <div className="space-y-4 p-4 rounded-lg bg-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
                  <div>
                    <h1 className="text-lg font-semibold">Name of applicant</h1>
                    <p className="text-base">{form.getValues("applicantName")}</p>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Position applied for</h1>
                    <p className="text-base">{form.getValues("positionApplied")}</p>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Relationship to applicant</h1>
                    <p className="text-base">{form.getValues("relationship")}</p>
                  </div>
                </div>
              </div>

              {/* === How Long Known === */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="howLongKnown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          1. How long has the applicant been known to you? <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 3 years" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* === Health & Dependency === */}
                <div className="space-y-4 border-t pt-4">
                  <FormField
                    control={form.control}
                    name="seriousIllness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          2. Does the applicant suffer from any serious or recurring illness?{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex items-center gap-6 mt-2">
                          {["Yes", "No"].map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`seriousIllness-${option.toLowerCase()}`}
                                checked={field.value === option.toLowerCase()}
                                onCheckedChange={(checked) =>
                                  checked && field.onChange(option.toLowerCase())
                                }
                              />
                              <Label
                                htmlFor={`seriousIllness-${option.toLowerCase()}`}
                                className="font-normal"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drugsDependency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          3. Was the applicant, to your personal knowledge, dependent upon drugs or medication?{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex items-center gap-6 mt-2">
                          {["Yes", "No"].map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`drugsDependency-${option.toLowerCase()}`}
                                checked={field.value === option.toLowerCase()}
                                onCheckedChange={(checked) =>
                                  checked && field.onChange(option.toLowerCase())
                                }
                              />
                              <Label
                                htmlFor={`drugsDependency-${option.toLowerCase()}`}
                                className="font-normal"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* === Personal Traits (YES/NO) === */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="font-semibold text-lg">
                  4. From what you know of the applicant, would you consider them to be:
                </h3>

                {[
                  { name: "reliable", label: "Reliable" },
                  { name: "punctual", label: "Punctual" },
                  { name: "trustworthy", label: "Trustworthy" },
                  { name: "approachable", label: "Approachable" },
                  { name: "tactful", label: "Tactful" },
                  { name: "discreet", label: "Discreet" },
                  { name: "selfMotivated", label: "Self motivated" },
                  { name: "ableToWorkAlone", label: "Able to work alone" },
                ].map((trait) => (
                  <FormField
                    key={trait.name}
                    control={form.control}
                    name={trait.name as keyof CharacterReferenceFormData}
                    render={({ field }) => (
                      <FormItem className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                        <div className="flex-1">
                          <FormLabel>
                            {trait.label} <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormMessage />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {["Yes", "No"].map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`${trait.name}-${option.toLowerCase()}`}
                                checked={field.value === option.toLowerCase()}
                                onCheckedChange={(checked) =>
                                  checked && field.onChange(option.toLowerCase())
                                }
                              />
                              <Label
                                htmlFor={`${trait.name}-${option.toLowerCase()}`}
                                className="font-normal"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* === Ratings Section === */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="font-semibold text-lg">
                  5. Bearing in mind that the applicant will deal with a variety of situations, how would you rate
                  their level of:
                </h3>

                {["competency", "commonSense"].map((fieldName) => {
                  const labelMap: Record<string, string> = {
                    "Very Good": "very_good",
                    Good: "good",
                    Satisfactory: "satisfactory",
                    Poor: "poor",
                  };
                  return (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName as keyof CharacterReferenceFormData}
                      render={({ field }) => (
                        <FormItem className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                          <div className="flex-1">
                            <FormLabel>
                              {fieldName === "competency" ? "Competency" : "Common Sense"}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormMessage />
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            {["Very Good", "Good", "Satisfactory", "Poor"].map((option) => (
                              <div key={option} className="flex items-center gap-2">
                                <Checkbox
                                  id={`${fieldName}-${option.toLowerCase().replace(" ", "-")}`}
                                  checked={field.value === labelMap[option]}
                                  onCheckedChange={(checked) => checked && field.onChange(labelMap[option])}
                                />
                                <Label
                                  htmlFor={`${fieldName}-${option.toLowerCase().replace(" ", "-")}`}
                                  className="font-normal"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  );
                })}

                <FormField
                  control={form.control}
                  name="relatesWellWithUsers"
                  render={({ field }) => (
                    <FormItem className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                      <div className="flex-1">
                        <FormLabel>
                          6. Do you consider that the applicant relates well with / would relate well with service
                          users in their care: <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        {["Yes", "No", "Unsure"].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <Checkbox
                              id={`relatesWellWithUsers-${option.toLowerCase()}`}
                              checked={field.value === option.toLowerCase()}
                              onCheckedChange={(checked) => checked && field.onChange(option.toLowerCase())}
                            />
                            <Label
                              htmlFor={`relatesWellWithUsers-${option.toLowerCase()}`}
                              className="font-normal"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* === Final Declarations === */}
              <div className="space-y-4 border-t pt-6">
                <FormField
                  control={form.control}
                  name="cautionsConvictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        This position is exempted from the rehabilitation of offenders Act 1974, and any convictions
                        must be declared. Are you aware of any cautions, convictions or pending prosecutions held by
                        the applicant? <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex items-center gap-6 mt-2">
                        {["Yes", "No"].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <Checkbox
                              id={`cautionsConvictions-${option.toLowerCase()}`}
                              checked={field.value === option.toLowerCase()}
                              onCheckedChange={(checked) => checked && field.onChange(option.toLowerCase())}
                            />
                            <Label htmlFor={`cautionsConvictions-${option.toLowerCase()}`} className="font-normal">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Would you like to make any other comments about the suitability of the applicant for this post?
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* === Referee Details === */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-lg">Reference Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="refereeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                            selected={field.value || null}
                            onChange={(date: Date | null) => field.onChange(date)}
                            placeholder="MM/DD/YYYY"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* === Submit Button === */}
              <div className="flex w-full justify-end">
                <Button type="submit" className="bg-watney text-white hover:bg-watney/90 max-md:w-full">
                  Submit Reference
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  </div>
);

}