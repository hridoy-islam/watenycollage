import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useParams } from "react-router-dom";
import moment from "moment";

const sessionSchema = z.object({
    courseId: z.string().min(1, "Course is required"),
});

export default function AgentDetailsPage() {
    const { id } = useParams();
    const [initialLoading, setInitialLoading] = useState(true);
    const [agentDetails, setAgentDetails] = useState();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            courseId: "",
            sessions: Array(3).fill(null).map(() => ({
                invoiceDate: new Date(),
                rate: 0,
                type: "flat",
            })),
        },
    });

    useEffect(() => {
        fetchData()
        fetchCourses();
    }, []);

    const fetchData = async () => {
        try {
            if (initialLoading) setInitialLoading(true);
          const response = await axiosInstance.get(`/agents/${id}`);
          setAgentDetails(response.data.data)
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
            setInitialLoading(false);
        }
      };

    const fetchCourses = async () => {
        try {
            const response = await axiosInstance.get(`/course-relations?limit=all&status=1`);
            setAvailableCourses(response.data.data.result);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const onSubmit = async (data) => {
        try {
            await axiosInstance.patch(`/agents/${id}`, {
                courseRelationId: data.courseId,
            });
            fetchData()
            setDialogOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error assigning course:", error);
        }
    };

    return (
        <div className="mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
        <div>
                    <p>Agent Details</p>
                    <h1 className="text-2xl font-bold">{agentDetails?.agentName} </h1>
                    <p className="text-muted-foreground">{agentDetails?.email}</p>
                    <p className="text-muted-foreground">{agentDetails?.phone}</p>
              </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-supperagent text-white hover:bg-supperagent">
                        <Plus className="h-4 w-4 mr-2" /> Add Course
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Assign Course & Set Commission</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="courseId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Course</FormLabel>
                                    <FormControl>
                                        <select className="p-2 border rounded w-full" {...field}>
                                            <option value="">Select a Course</option>
                                            {availableCourses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.term.term} - {course.course.name} - {course.institute.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                </FormItem>
                            )} />
                            
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            </div>

            <div className="grid gap-4">
                {agentDetails?.agentCourseRelations?.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{course.course.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-3">

                                <div>
                                    <dt className="font-medium">Commission Structure</dt>
                                    <dd className="mt-2">
                                        <div className="grid gap-2">
                                            {course.session.map((item, index) => (
                                                <div key={index} className="grid grid-cols-3 text-sm">
                                                    <span>{item.session}</span>
                                                    <span>
                                                    {moment(item.invoice_date).format('YYYY-MM-DD')}
                                                    </span>
                                                    <span>
                                                        {item.agent_rate} ({item.agent_rate_type})
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
    );
}
