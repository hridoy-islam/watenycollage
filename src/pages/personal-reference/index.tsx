import { useEffect, useState } from "react";
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
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import axiosInstance from "@/lib/axios";
import { useLocation } from "react-router-dom";
import { BlinkingDots } from "@/components/shared/blinking-dots";

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
});

type CharacterReferenceFormData = z.infer<typeof characterReferenceSchema>;

export default function CharacterReferencePage() {
  const [wasAlreadyUsed, setWasAlreadyUsed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [id, setId] = useState<string | null>(null);

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const segments = Array.from(params.keys());

  const applicantNameParam = segments[0] || "";
  const email = segments[1] || "";
  const refName = segments[2] || "";
  const relation = segments[3] || "";
  const position = segments[4] || "";
  const job = segments[5] || "";
  const refParam = segments[6] || "";

  // Formatting helpers
  const formatText = (text = "") => text.replace(/-/g, " ");
  const capitalizeWords = (str = "") =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formattedApplicantName = capitalizeWords(formatText(applicantNameParam));
  const formattedRelation = capitalizeWords(formatText(relation));
  const formattedPosition = capitalizeWords(formatText(position));
  const formattedRefName = capitalizeWords(formatText(refName));
  const formattedJob = capitalizeWords(formatText(job));

  const form = useForm<CharacterReferenceFormData>({
    resolver: zodResolver(characterReferenceSchema),
    defaultValues: {
      applicantName: formattedApplicantName,
      positionApplied: formattedJob,
      relationship: formattedRelation,
      refereePosition: formattedPosition,
      refereeName: formattedRefName,
    },
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!email || !refParam) {
          setLoading(false);
          return;
        }

        // Get user by email
        const userRes = await axiosInstance.get(`/users?email=${encodeURIComponent(email)}&fields=name`);
        const user = userRes.data.data?.result?.[0];
        if (!user?._id) {
          setLoading(false);
          return;
        }

        setId(user._id);

        // Check if already submitted
        const statusRes = await axiosInstance.get(`/users/${user._id}?fields=ref3Submit`);
        const userData = statusRes.data.data;

        const alreadyUsed = refParam === "ref3" && userData.ref3Submit;
        setWasAlreadyUsed(alreadyUsed);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [email, refParam]);

  const onSubmit = async (data: CharacterReferenceFormData) => {
    if (!id || !refParam) return;

    try {
      setSubmitting(true);

      const payload = {
        ...data,
        applicantId: id,
        referenceType: refParam,
      };

      await axiosInstance.post("/reference", payload);

      // Update user flags
      const refFlagPayload = refParam === "ref3" ? { ref3Submit: true } : {};
      await axiosInstance.patch(`/users/${id}`, refFlagPayload);

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("❌ Error submitting form:", error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // === Render: Loading
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  // === Render: Already Submitted
  if (wasAlreadyUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card className="text-center shadow-none rounded-xl p-8 bg-white border-2 border-gray-300">
            <CardHeader className="mb-6">
              <div className="mx-auto flex items-center justify-center h-32 w-32 mb-4">
                <img src="/logo.png" alt="" />
              </div>
              <CardTitle className="text-4xl font-bold mb-2 text-watney">Form Already Submitted</CardTitle>
              <CardDescription className="text-xl font-medium text-black">
                This form has already been submitted and cannot be submitted again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // === Render: Thank You
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card className="text-center shadow-none rounded-xl p-8 bg-white border-2 border-gray-300">
            <CardHeader className="mb-6">
              <div className="mx-auto flex items-center justify-center h-36 w-36 mb-4">
                <img src="/logo.png" alt="" />
              </div>
              <CardTitle className="text-4xl text-watney font-bold mb-2">Thank You!</CardTitle>
              <CardDescription className="text-xl font-semibold text-black">
                Your reference has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-lg font-medium">
              <p>
                Thank you for taking the time to complete this personal reference form. Your feedback is valuable and
                will be carefully reviewed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // === Render: Form
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
                          <FormLabel>How long have you known the applicant?</FormLabel>
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
                          <FormLabel>Does the applicant suffer from any serious or recurring illness?</FormLabel>
                          <div className="flex items-center gap-6 mt-2">
                            {["yes", "no"].map((option) => (
                              <div key={option} className="flex items-center gap-2">
                                <Checkbox
                                  id={`seriousIllness-${option}`}
                                  checked={field.value === option}
                                  onCheckedChange={(checked) => checked && field.onChange(option)}
                                />
                                <Label htmlFor={`seriousIllness-${option}`} className="font-normal capitalize">
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
                            Was the applicant, to your personal knowledge, dependent upon drugs or medication?
                          </FormLabel>
                          <div className="flex items-center gap-6 mt-2">
                            {["yes", "no"].map((option) => (
                              <div key={option} className="flex items-center gap-2">
                                <Checkbox
                                  id={`drugsDependency-${option}`}
                                  checked={field.value === option}
                                  onCheckedChange={(checked) => checked && field.onChange(option)}
                                />
                                <Label htmlFor={`drugsDependency-${option}`} className="font-normal capitalize">
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
                  <h3 className="font-semibold text-lg">From what you know of the applicant, would you consider them to be:</h3>

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
                            <FormLabel>{trait.label}</FormLabel>
                            <FormMessage />
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                            {["yes", "no"].map((option) => (
                              <div key={option} className="flex items-center gap-2">
                                <Checkbox
                                  id={`${trait.name}-${option}`}
                                  checked={field.value === option}
                                  onCheckedChange={(checked) => checked && field.onChange(option)}
                                />
                                <Label htmlFor={`${trait.name}-${option}`} className="font-normal capitalize">
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
                    Bearing in mind that the applicant will deal with a variety of situations, how would you rate their level of:
                  </h3>

                  {[
                    { name: "competency", label: "Competency" },
                    { name: "commonSense", label: "Common Sense" },
                  ].map((fieldName) => {
                    const labelToValue: Record<string, string> = {
                      "Very Good": "very_good",
                      Good: "good",
                      Satisfactory: "satisfactory",
                      Poor: "poor",
                    };

                    return (
                      <FormField
                        key={fieldName.name}
                        control={form.control}
                        name={fieldName.name as keyof CharacterReferenceFormData}
                        render={({ field }) => (
                          <FormItem className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                            <div className="flex-1">
                              <FormLabel>{fieldName.label}</FormLabel>
                              <FormMessage />
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                              {["Very Good", "Good", "Satisfactory", "Poor"].map((option) => (
                                <div key={option} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`${fieldName.name}-${option}`}
                                    checked={field.value === labelToValue[option]}
                                    onCheckedChange={(checked) => checked && field.onChange(labelToValue[option])}
                                  />
                                  <Label htmlFor={`${fieldName.name}-${option}`} className="font-normal">
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
                            Do you consider that the applicant relates well with / would relate well with service users in their care?
                          </FormLabel>
                          <FormMessage />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {["yes", "no", "unsure"].map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`relatesWellWithUsers-${option}`}
                                checked={field.value === option}
                                onCheckedChange={(checked) => checked && field.onChange(option)}
                              />
                              <Label htmlFor={`relatesWellWithUsers-${option}`} className="font-normal capitalize">
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
                          This position is exempted from the Rehabilitation of Offenders Act 1974, and any convictions
                          must be declared. Are you aware of any cautions, convictions or pending prosecutions held by
                          the applicant?
                        </FormLabel>
                        <div className="flex items-center gap-6 mt-2">
                          {["yes", "no"].map((option) => (
                            <div key={option} className="flex items-center gap-2">
                              <Checkbox
                                id={`cautionsConvictions-${option}`}
                                checked={field.value === option}
                                onCheckedChange={(checked) => checked && field.onChange(option)}
                              />
                              <Label htmlFor={`cautionsConvictions-${option}`} className="font-normal capitalize">
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
                  <div>
                    <h3 className="font-semibold text-lg">Reference Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Please review your details below. If any information is incorrect, you can edit it before submitting.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="refereeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
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
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* === Submit Button === */}
                <div className="flex w-full justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-watney text-white hover:bg-watney/90 max-md:w-full"
                  >
                    {submitting ? "Submitting..." : "Complete"}
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