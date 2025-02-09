import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import axiosInstance from '@/lib/axios'
import { useParams } from "react-router-dom"


// Demo data
const demoCourse = {
    id: "1",
    name: "Advanced Web Development",
    code: "CS301",
    duration: 3,
    description: "A comprehensive course covering modern web development techniques and frameworks.",
    years: [
        {
            id: "y1",
            name: "Year 1",
            fees: [
                { id: "f1", invoiceDate: new Date("2023-09-01"), rate: 3000, type: "flat" },
                { id: "f2", invoiceDate: new Date("2024-01-01"), rate: 3000, type: "flat" },
                { id: "f3", invoiceDate: new Date("2024-05-01"), rate: 3000, type: "flat" },
            ],
        },
    ],
}

// const demoAgents: Agent[] = [
//   { id: "a1", name: "John Doe", email: "john@example.com" },
//   { id: "a2", name: "Jane Smith", email: "jane@example.com" },
// ]

const demoAssignments = {
    courseId: "1",
    assignments: [{ agentId: "a1", rate: 10, type: "percentage" }],
}

const yearSessionSchema = z.object({
    years: z
        .array(
            z.object({
                name: z.string().min(1, "Year name is required"),
                fees: z
                    .array(
                        z.object({
                            invoiceDate: z.date(),
                            rate: z.number().min(0, "Rate must be positive"),
                            type: z.enum(["flat", "percentage"]),
                        }),
                    )
                    .length(3, "Each year must have exactly 3 fees"),
            }),
        )
        .min(1, "At least one year is required")
        .max(4, "Maximum 4 years allowed"),
})

const agentAssignmentSchema = z.object({
    agentId: z.string().min(1, "Agent is required"),
    rate: z.number().min(0, "Rate must be positive"),
    type: z.enum(["flat", "percentage"]),
})

export default function CourseRelationDetails() {
    const { id } = useParams();
    const [course, setCourse] = useState(demoCourse)
    const [assignments, setAssignments] = useState(demoAssignments)
    const [initialLoading, setInitialLoading] = useState(true);

    const yearForm = useForm<z.infer<typeof yearSessionSchema>>({
        resolver: zodResolver(yearSessionSchema),
        defaultValues: {
            years: [
                {
                    name: `Year 1`,
                    fees: Array(3)
                        .fill(null)
                        .map(() => ({ invoiceDate: new Date(), rate: 0, type: "flat" as const })),
                },
            ],
        },
    })

    const {
        fields: yearFields,
        append: appendYear,
        remove: removeYear,
    } = useFieldArray({
        name: "years",
        control: yearForm.control,
    })

    

    const onYearSubmit = (data: z.infer<typeof yearSessionSchema>) => {
        setCourse((prevCourse) => ({
            ...prevCourse,
            years: data.years.map((year) => ({ id: crypto.randomUUID(), ...year })),
        }))
    }

    


    const fetchData = async () => {
        try {
            if (initialLoading) setInitialLoading(true);
            const response = await axiosInstance.get(`/course-relations/${id}`);
            setCourse(response.data.data);
        } catch (error) {
            console.error("Error fetching institutions:", error);
        } finally {
            setInitialLoading(false); // Disable initial loading after the first fetch
        }
    };


    useEffect(() => {
        fetchData(); // Refresh data
    }, []);



    return (
        <div className="mx-auto py-2">

            <div className="grid md:grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>
                            <strong>Institute:</strong> {course.institute?.name}
                        </p>
                        <p>
                            <strong>Course:</strong> {course.course?.name}
                        </p>
                        <p>
                            <strong>Term:</strong> {course.term?.term}
                        </p>
                        <p>
                            <strong>Academic Year:</strong> {course.term?.academic_year}
                        </p>
                        {course.international_amount !== null && (
                            <p>
                                <strong>International Ammount:</strong> {course.international_amount}
                            </p>
                        )}
                        {course.local_amount !== null && (
                            <p>
                                <strong>Local Ammount :</strong> {course.local_amount}
                            </p>)}


                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Year Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...yearForm}>
                            <form onSubmit={yearForm.handleSubmit(onYearSubmit)} className="space-y-2">
                                <div className="flex justify-end gap-4">
                                    <Button

                                        onClick={() =>
                                            appendYear({
                                                name: `Year ${yearFields.length + 1}`,
                                                fees: Array(3)
                                                    .fill(null)
                                                    .map(() => ({ invoiceDate: new Date(), rate: 0, type: "flat" as const })),
                                            })
                                        }
                                        disabled={yearFields.length >= 4}
                                        className="bg-supperagent text-white hover:bg-supperagent"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Year
                                    </Button>
                                    <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">Save</Button>
                                </div>
                                {yearFields.map((yearField, yearIndex) => (
                                    <Card key={yearField.id} className="border border-gray-300">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>Year {yearIndex + 1}</CardTitle>
                                            {yearIndex > 0 && (
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeYear(yearIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {[0, 1, 2].map((sessionIndex) => (
                                                <div key={sessionIndex} className="gap-3 grid grid-cols-3">

                                                    <div>

                                                        <div className="space-y-2">
                                                            <Label>Session {sessionIndex + 1} - Invoice Date</Label>
                                                            <Input type="date" />
                                                        </div>
                                                    </div>

                                                    <FormField
                                                        control={yearForm.control}
                                                        name={`years.${yearIndex}.fees.${sessionIndex}.rate`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Rate</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={yearForm.control}
                                                        name={`years.${yearIndex}.fees.${sessionIndex}.type`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Type</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select fee type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="flat">Flat</SelectItem>
                                                                        <SelectItem value="percentage">Percentage</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}

                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* <Card>
          <CardHeader>
            <CardTitle>Agent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="mb-4">
              {assignments.assignments.map((assignment, index) => (
                <li key={index} className="mb-2">
                  {demoAgents.find((a) => a.id === assignment.agentId)?.name} - {assignment.rate} ({assignment.type})
                </li>
              ))}
            </ul>

            <Form {...agentForm}>
              <form onSubmit={agentForm.handleSubmit(onAgentSubmit)} className="space-y-4">
                <FormField
                  control={agentForm.control}
                  name="agentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {demoAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={agentForm.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={agentForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rate type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Assign Agent</Button>
              </form>
            </Form>
          </CardContent>
        </Card> */}
            </div>
        </div>
    )
}

