import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// Demo data
const demoAgent = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "901920910290"
}

const demoAssignedCourses = [
    {
        id: "1",
        name: "Advanced Web Development",
        code: "CS301",
        duration: "3 years",
        sessions: [
            { invoiceDate: new Date("2024-09-01"), rate: 1000, type: "flat" },
            { invoiceDate: new Date("2025-01-01"), rate: 15, type: "percentage" },
            { invoiceDate: new Date("2025-05-01"), rate: 1200, type: "flat" },
        ],
    },
    {
        id: "2",
        name: "Data Science Fundamentals",
        code: "DS101",
        duration: "2 years",
        sessions: [
            { invoiceDate: new Date("2024-09-01"), rate: 800, type: "flat" },
            { invoiceDate: new Date("2025-01-01"), rate: 10, type: "percentage" },
            { invoiceDate: new Date("2025-05-01"), rate: 900, type: "flat" },
        ],
    },
]

const demoAvailableCourses = [
    {
        id: "3",
        name: "Mobile App Development",
        code: "MD201",
        duration: "2 years",
        description: "Comprehensive mobile app development course covering iOS and Android.",
    },
    {
        id: "4",
        name: "Cloud Computing",
        code: "CC401",
        duration: "1 year",
        description: "Advanced cloud computing and distributed systems.",
    },
]

const sessionSchema = z.object({
    courseId: z.string(),
    sessions: z
        .array(
            z.object({
                invoiceDate: z.date(),
                rate: z.number().min(0, "Rate must be positive"),
                type: z.enum(["flat", "percentage"]),
            }),
        )
        .length(3, "Must have exactly 3 sessions"),
})

export default function AgentDetailsPage() {
    const [assignedCourses, setAssignedCourses] = useState(demoAssignedCourses)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<(typeof demoAvailableCourses)[0] | null>(null)

    const form = useForm<z.infer<typeof sessionSchema>>({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            sessions: Array(3)
                .fill(null)
                .map(() => ({
                    invoiceDate: new Date(),
                    rate: 0,
                    type: "flat",
                })),
        },
    })

    const handleCourseSelect = (course: (typeof demoAvailableCourses)[0]) => {
        setSelectedCourse(course)
        form.setValue("courseId", course.id)
    }

    const onSubmit = (data: z.infer<typeof sessionSchema>) => {
        if (!selectedCourse) return

        setAssignedCourses((prev) => [
            ...prev,
            {
                ...selectedCourse,
                sessions: data.sessions,
            },
        ])
        setDialogOpen(false)
        setSelectedCourse(null)
        form.reset()
    }

    return (
        <div className="mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{demoAgent.name} Agent</h1>
                    <p className="text-muted-foreground">{demoAgent.email}</p>
                    <p className="text-muted-foreground">{demoAgent.phone}</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-supperagent text-white hover:bg-supperagent">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{selectedCourse ? "Set Commission Structure" : "Select Course"}</DialogTitle>
                        </DialogHeader>
                        {!selectedCourse ? (
                            <div className="grid gap-4">

                                <select
                                    className="p-2 border rounded"
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                >
                                    <option value="">Select a Course</option>
                                    {demoAvailableCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>


                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-2">{selectedCourse.name}</h3>
                                        <p className="text-sm text-muted-foreground">Set the commission structure for this course</p>
                                    </div>

                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`sessions.${index}.invoiceDate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Session {index + 1} - Invoice Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal",
                                                                            !field.value && "text-muted-foreground",
                                                                        )}
                                                                    >
                                                                        {field.value ? format(field.value, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`sessions.${index}.rate`}
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
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`sessions.${index}.type`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="flat">Flat</SelectItem>
                                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}

                                    <div className="flex justify-end space-x-4">
                                        <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)}>
                                            Back
                                        </Button>
                                        <Button type="submit">Save Commission Structure</Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {assignedCourses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-3">

                                <div>
                                    <dt className="font-medium">Commission Structure</dt>
                                    <dd className="mt-2">
                                        <div className="grid gap-2">
                                            {course.sessions.map((session, index) => (
                                                <div key={index} className="grid grid-cols-3 text-sm">
                                                    <span>Session {index + 1}</span>
                                                    <span>{format(session.invoiceDate, "MM/dd/yyyy")}</span>
                                                    <span>
                                                        {session.rate} ({session.type})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

