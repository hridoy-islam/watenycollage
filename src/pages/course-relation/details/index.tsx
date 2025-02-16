// import { useEffect, useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Plus, Trash2 } from "lucide-react";
// import axiosInstance from '@/lib/axios';
// import { useParams } from "react-router-dom";
// import { Label } from "@/components/ui/label";
// import moment from "moment";
// import { useToast } from "@/components/ui/use-toast";

// const yearSessionSchema = z.object({
//     years: z
//         .array(
//             z.object({
//                 id: z.string().optional(),
//                 year: z.string().min(1, "Year name is required"),
//                 sessions: z
//                     .array(
//                         z.object({
//                             id: z.string().optional(),
//                             invoiceDate: z.date(),
//                             rate: z.number().min(0, "Rate must be positive"),
//                             type: z.enum(["flat", "percentage"]),
//                         }),
//                     )
//                     .length(3, "Each year must have exactly 3 fees"),
//             }),
//         )
//         .min(1, "At least one year is required")
//         .max(4, "Maximum 4 years allowed"),
// });

// export default function CourseRelationDetails() {
//     const { id } = useParams();
//     const [course, setCourse] = useState();
//     const [initialLoading, setInitialLoading] = useState(true);
//     const { toast } = useToast();
//     const yearForm = useForm<z.infer<typeof yearSessionSchema>>({
//         resolver: zodResolver(yearSessionSchema),
//         defaultValues: {
//             years: [],
//         },
//     });

//     const { fields: years, append: appendYear, remove: removeYear } = useFieldArray({
//         control: yearForm.control,
//         name: "years",
//     });

//     const fetchData = async () => {
//         try {
//             if (initialLoading) setInitialLoading(true);
//             const response = await axiosInstance.get(`/course-relations/${id}`);
//             const courseData = response.data.data;
//             setCourse(courseData);
//             const formattedYears = courseData.years.map((year) => ({
//                 id: year.id || `year-${Date.now()}`,
//                 year: year.year,
//                 sessions: year.sessions.map((session) => ({
//                     id: session.id || `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Use existing ID or generate a temporary one
//                     invoiceDate: new Date(session.invoice_date),
//                     rate: Number(session.rate),
//                     type: session.type as "flat" | "percentage",
//                 })),
//             }));

//             console.log(formattedYears)
//             yearForm.reset({ years: formattedYears });
//         } catch (error) {
//             console.error("Error fetching institutions:", error);
//         } finally {
//             setInitialLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const onSubmit = async (data) => {
//         console.log(data)
//         const formattedYears = data.years.map((year, yearIndex) => {
//             // Include the year's ID only if it exists and is not a temporary ID (starts with 'year-')
//             const yearData = {
//                 ...(year.id && !year.id.startsWith('year-') ? { id: year.id } : {}),
//                 year: `Year ${yearIndex + 1}`,
//                 sessions: year.sessions.map((session, sessionIndex) => {
//                     // Include the session's ID only if it exists and is not a temporary ID (starts with 'session-')
//                     const sessionData = {
//                         ...(session.id && !session.id.startsWith('session-') ? { id: session.id } : {}),
//                         session: `Session ${sessionIndex + 1}`,
//                         invoice_date: moment(session.invoiceDate).format('YYYY-MM-DD'),
//                         rate: session.rate,
//                         type: session.type,
//                     };
//                     return sessionData;
//                 }),
//             };
//             return yearData;
//         });

        

//         const payload = {
//             years: formattedYears,
//         };

//         console.log(payload)

//         try {
//             const response = await axiosInstance.patch(`/course-relations/${id}`, payload);
//             if (response.data && response.data.success === true) {
//                 toast({
//                     title: "Record updated successfully",
//                     className: "bg-green-500 border-none text-white",
//                 });
//             } else if (response.data && response.data.success === false) {
//                 toast({
//                     title: "Operation failed",
//                     className: "bg-red-500 border-none text-white",
//                 });
//             }
//         } catch (error) {
//             console.error("Error updating course relation:", error);
//         }
//     };

//     const handleAddYear = () => {
//         if (years.length < 4) {
//             appendYear({
//                 id: `year-${Date.now()}`, // Generate a unique ID using timestamp
//                 year: `Year ${years.length + 1}`,
//                 sessions: Array(3).fill(null).map(() => ({
//                     id: `session-${Date.now()}`,
//                     invoiceDate: new Date(),
//                     rate: 0,
//                     type: "flat",
//                 })),
//             });
//         }
//     };

//     return (
//         <div className="mx-auto py-2">
//             <div className="grid md:grid-cols-1 gap-6">
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Course Details</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-2">
//                         <p>
//                             <strong>Institute:</strong> {course?.institute?.name}
//                         </p>
//                         <p>
//                             <strong>Course:</strong> {course?.course?.name}
//                         </p>
//                         <p>
//                             <strong>Term:</strong> {course?.term?.term}
//                         </p>
//                         <p>
//                             <strong>Academic Year:</strong> {course?.term?.academic_year}
//                         </p>
//                         {course?.international_amount !== null && (
//                             <p>
//                                 <strong>International Amount:</strong> {course?.international_amount}
//                             </p>
//                         )}
//                         {course?.local_amount !== null && (
//                             <p>
//                                 <strong>Local Amount:</strong> {course?.local_amount}
//                             </p>
//                         )}
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Year Sessions</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <Form {...yearForm}>
//                             <Button
//                                 type="button"
//                                 onClick={handleAddYear}
//                                 disabled={years.length >= 4}
//                                 className="bg-supperagent text-white hover:bg-supperagent"
//                             >
//                                 <Plus className="h-4 w-4 mr-2" />
//                                 Add Year
//                             </Button>
//                             <form onSubmit={yearForm.handleSubmit(onSubmit)} className="space-y-2">
//                                 <div className="flex justify-end gap-4">

//                                     <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">Save</Button>
//                                 </div>

//                                 {years.map((year, yearIndex) => (
//                                     <div key={year.id} className="mb-4 p-4 border rounded">
//                                         <h3 className="text-lg font-bold">{year.year} </h3>
//                                         <input type="text" value={year.id} />
//                                         {year.sessions.map((session, sessionIndex) => (
//                                             <div key={sessionIndex} className="mb-4 gap-3 grid grid-cols-3">
//                                                 <div className="space-y-2">
//                                                     <Label>Session {sessionIndex + 1} - Invoice Date</Label>
//                                                     <Input
//                                                         type="date"
//                                                         value={moment(session.invoiceDate).format('YYYY-MM-DD')}
//                                                         onChange={(e) => yearForm.setValue(`years.${yearIndex}.sessions.${sessionIndex}.invoiceDate`, new Date(e.target.value))}
//                                                     />
//                                                 </div>

//                                                 <FormField
//                                                     control={yearForm.control}
//                                                     name={`years.${yearIndex}.sessions.${sessionIndex}.rate`}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel>Rate</FormLabel>
//                                                             <FormControl>
//                                                                 <Input
//                                                                     type="number"
//                                                                     {...field}
//                                                                     onChange={(e) => field.onChange(Number(e.target.value))}
//                                                                 />
//                                                             </FormControl>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />

//                                                 <FormField
//                                                     control={yearForm.control}
//                                                     name={`years.${yearIndex}.sessions.${sessionIndex}.type`}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel>Type</FormLabel>
//                                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                                 <FormControl>
//                                                                     <SelectTrigger>
//                                                                         <SelectValue placeholder="Select fee type" />
//                                                                     </SelectTrigger>
//                                                                 </FormControl>
//                                                                 <SelectContent>
//                                                                     <SelectItem value="flat">Flat</SelectItem>
//                                                                     <SelectItem value="percentage">Percentage</SelectItem>
//                                                                 </SelectContent>
//                                                             </Select>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             </div>
//                                         ))}
//                                         <Button
//                                             type="button"
//                                             onClick={() => removeYear(yearIndex)}
//                                             className="mt-2 bg-red-500 text-white hover:bg-red-600"
//                                         >
//                                             <Trash2 className="h-4 w-4 mr-2" />
//                                             Remove Year
//                                         </Button>
//                                     </div>
//                                 ))}
//                             </form>
//                         </Form>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// }

import { useForm, useFieldArray } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DynamicForm() {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      years: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "years",
  });

  // Fetch existing data and prefill the form
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/course-relations/${id}`);
      const yearsData = response.data.map((year, index) => ({
        id: year.id, // Keep existing ID
        year: `Year ${index + 1}`, // Automatically set the year
        sessions: year.sessions.map((session) => ({
          id: session.id, // Keep session ID
          session: session.sessionName,
          invoice_date: session.invoiceDate,
          rate: session.rate,
          type: session.type,
        })),
      }));

      yearForm.reset({ years: formattedYears });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Form: Patch if ID exists, otherwise ignore ID
  const onSubmit = async (data) => {
    const formattedYears = data.years.map((year, index) => ({
      ...(year.id ? { id: year.id } : {}), // Include ID only if it exists
      year: `Year ${index + 1}`, // Ensure year is correctly formatted
      sessions: year.sessions.map((session) => ({
        ...(session.id ? { id: session.id } : {}), // Include ID only if it exists
        session: session.sessionName,
        invoice_date: session.invoiceDate,
        rate: session.rate,
        type: session.type,
      })),
    }));

    try {
      await axiosInstance.patch(`/course-relations/${id}`, { years: formattedYears });
      alert("Data updated successfully!");
      fetchData(); // Refetch to update IDs
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  // Add new year dynamically
  const handleAddYear = () => {
    if (fields.length < 4) {
      append({
        id: "", // New year (No ID until saved)
        year: `Year ${fields.length + 1}`, // Auto-generate year name
        sessions: [
          { sessionName: "Session 1", invoiceDate: "", rate: "", type: "flat" },
          { sessionName: "Session 2", invoiceDate: "", rate: "", type: "flat" },
          { sessionName: "Session 3", invoiceDate: "", rate: "", type: "flat" },
        ],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      {loading ? <p>Loading...</p> : fields.map((year, yearIndex) => (
        <div key={year.id || yearIndex} className="border p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{`Year ${yearIndex + 1}`}</h2>
            <button type="button" onClick={() => remove(yearIndex)} className="text-red-500">
              Remove
            </button>
          </div>

          {/* Sessions */}
          {year.sessions.map((session, sessionIndex) => (
            <div key={sessionIndex} className="p-2 border rounded my-2">
              <h3 className="font-semibold">{session.sessionName}</h3>
              <input
                {...register(`years.${yearIndex}.sessions.${sessionIndex}.invoiceDate`, { required: "Date is required" })}
                type="date"
                className="border p-2 w-full"
              />
              <input
                {...register(`years.${yearIndex}.sessions.${sessionIndex}.rate`, { required: "Rate is required" })}
                type="number"
                placeholder="Enter Rate"
                className="border p-2 w-full my-2"
              />
              <select {...register(`years.${yearIndex}.sessions.${sessionIndex}.type`)} className="border p-2 w-full">
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          ))}
        </div>
      ))}

      <button type="button" onClick={handleAddYear} className="bg-blue-500 text-white p-2 rounded">
        Add Year
      </button>

      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Submit
      </button>
    </form>
  );
}
