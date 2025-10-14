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
import { Check } from "lucide-react";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { useLocation } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { BlinkingDots } from "@/components/shared/blinking-dots";

const employmentReferenceSchema = z.object({
    applicantName: z.string().min(1, "Required"),
    positionApplied: z.string().min(1, "Required"),
    relationship: z.string().min(1, "Required"),
    howLongKnown: z.string().min(1, "This field is required"),
    employmentFrom: z
        .date({ required_error: "Employment start date is required" })
        .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" }),
    employmentTill: z
        .date({ required_error: "Employment end date is required" })
        .refine((date) => !isNaN(date.getTime()), { message: "Invalid date" }),
    reasonForLeaving: z.string().optional(),
    qualityOfWork: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    courteousPolite: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    followPolicies: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    integrityTrust: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    equalOpportunities: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    emotionalControl: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    proactiveApproach: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    respectTeam: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    empathyServiceUser: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    attitudeCriticism: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    groomingAppearance: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    attendancePunctuality: z.enum(["very_good", "good", "poor"], {
        required_error: "Please select an option",
    }),
    unsuitableReasons: z.string().optional(),
    wouldReemploy: z.enum(["yes", "no"], {
        required_error: "Please select an option",
    }),
    reemployReason: z.string().optional(),
    suitabilityOpinion: z.string().min(1, "This field is required"),
    refereePosition: z.string().min(1, "This field is required"),
    refereeName: z.string().min(1, "This field is required"),

}).refine((data) => data.wouldReemploy !== "no" || (data.reemployReason && data.reemployReason.length > 0), {
    message: "Please provide a reason",
    path: ["reemployReason"],
});

type EmploymentReferenceFormData = z.infer<typeof employmentReferenceSchema>;

export default function ProfessionalReferencePage() {
    const [wasAlreadyUsed, setWasAlreadyUsed] = useState(false); // ✅ Only set on initial load
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

    const form = useForm<EmploymentReferenceFormData>({
        resolver: zodResolver(employmentReferenceSchema),
        defaultValues: {
            applicantName: formattedApplicantName,
            positionApplied: formattedJob,
            relationship: formattedRelation,
            refereePosition: formattedPosition,
            refereeName: formattedRefName
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
                const statusRes = await axiosInstance.get(`/users/${user._id}?fields=ref1Submit,ref2Submit`);
                const userData = statusRes.data.data;

                const alreadyUsed = (refParam === "ref1" && userData.ref1Submit) || (refParam === "ref2" && userData.ref2Submit);
                setWasAlreadyUsed(alreadyUsed);
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [email, refParam]);

    const onSubmit = async (data: EmploymentReferenceFormData) => {
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
            const refFlagPayload = refParam === "ref1" ? { ref1Submit: true } : { ref2Submit: true };
            await axiosInstance.patch(`/users/${id}`, refFlagPayload);

            setIsSubmitted(true);
            // Note: We do NOT set wasAlreadyUsed here — it stays false if it was false initially
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

    // ✅ Priority: If already used BEFORE this session → show "Already Submitted"
    if (wasAlreadyUsed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-4xl">
                    <Card className="text-center shadow-none rounded-xl p-8 bg-white  border-2 border-gray-300">
                        <CardHeader className="mb-6">
                            <div className="mx-auto flex items-center justify-center h-32 w-32  mb-4">
                                <img src="/logo.png" alt="" />                            </div>
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

    // ✅ If user just submitted → show "Thank You"
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
                                Thank you for taking the time to complete this employment reference form. Your feedback is valuable and
                                will be carefully reviewed.
                            </p>

                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // ✅ Otherwise, show the form
    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto">
                <div className="flex flex-row items-center justify-between mb-6">
                    <img src="/logo.png" alt="Everycare logo" className="h-16" />
                </div>

                <Card className="border border-gray-300">
                    <CardHeader>
                        <CardTitle className="text-xl">Professional Reference Questionnaire</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="howLongKnown"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>How long have you known the applicant?</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., 2 years" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4 border-t pt-4">
                                        <h3 className="font-semibold">Employment Period</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="employmentFrom"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>When did the applicant start the job?</FormLabel>
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
                                            <FormField
                                                control={form.control}
                                                name="employmentTill"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>When did the applicant leave the job?</FormLabel>
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
                                        <FormField
                                            control={form.control}
                                            name="reasonForLeaving"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reason for leaving</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} rows={3} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* === Applicant's General Ability / Characteristics === */}
                                <div className="space-y-6 border-t pt-6">
                                    <h3 className="font-semibold text-lg">Applicant's general ability / Characteristics</h3>

                                    {[
                                        { name: "qualityOfWork", label: "1. Quality and organization of work" },
                                        { name: "courteousPolite", label: "2. Courteous and polite" },
                                        { name: "followPolicies", label: "3. Willingness to follow policies" },
                                        { name: "integrityTrust", label: "4. Integrity and trust" },
                                        {
                                            name: "equalOpportunities",
                                            label: "5. Attitude towards equal opportunities i.e. sex, race, religion, age",
                                        },
                                        { name: "emotionalControl", label: "6. Emotional Control" },
                                        { name: "proactiveApproach", label: "7. Pro-active approach to work" },
                                        { name: "respectTeam", label: "8. Respect to and from team" },
                                        { name: "empathyServiceUser", label: "9. Empathy towards service user / clients" },
                                        { name: "attitudeCriticism", label: "10. Attitudes towards criticism" },
                                        { name: "groomingAppearance", label: "11. Grooming and Appearance" },
                                        { name: "attendancePunctuality", label: "12. Attendance / Punctuality" },
                                    ].map((characteristic) => (
                                        <FormField
                                            key={characteristic.name}
                                            control={form.control}
                                            name={characteristic.name as keyof EmploymentReferenceFormData}
                                            render={({ field }) => {
                                                const labelToValue: Record<string, string> = {
                                                    "Very Good": "very_good",
                                                    Good: "good",
                                                    Poor: "poor",
                                                };

                                                return (
                                                    <FormItem className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                                                        <div className="flex-1">
                                                            <FormLabel>{characteristic.label}</FormLabel>
                                                            <FormMessage />
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-4">
                                                            {["Very Good", "Good", "Poor"].map((option) => (
                                                                <div key={option} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`${characteristic.name}-${option}`}
                                                                        checked={field.value === labelToValue[option]}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) field.onChange(labelToValue[option]);
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`${characteristic.name}-${option}`} className="font-normal">
                                                                        {option}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* === Final Questions === */}
                                <div className="space-y-4 border-t pt-6">
                                    <FormField
                                        control={form.control}
                                        name="unsuitableReasons"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Do you know any reason(s) why, including health, which would make this applicant unsuitable for
                                                    employment?
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={3} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="wouldReemploy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Would you re-employ this applicant?</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="reemploy-yes"
                                                                checked={field.value === "yes"}
                                                                onCheckedChange={(checked) => checked && field.onChange("yes")}
                                                            />
                                                            <Label htmlFor="reemploy-yes">Yes</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="reemploy-no"
                                                                checked={field.value === "no"}
                                                                onCheckedChange={(checked) => checked && field.onChange("no")}
                                                            />
                                                            <Label htmlFor="reemploy-no">No</Label>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("wouldReemploy") === "no" && (
                                        <FormField
                                            control={form.control}
                                            name="reemployReason"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>If 'No' please state the reason</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} rows={3} />
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
                                                <FormLabel>Please give your opinion of the applicant's suitability for the post applied for</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={4} />
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