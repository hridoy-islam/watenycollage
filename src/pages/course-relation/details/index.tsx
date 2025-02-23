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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function CourseRelationDetails() {
  const [years, setYears] = useState([]);

  const addYear = () => {
    if (years.length >= 4) {
      alert('You can add a maximum of 4 years.');
      return;
    }

    // Automatically name the year (e.g., "Year 1", "Year 2", etc.)
    const yearName = `Year ${years.length + 1}`;
    setYears([...years, { year: yearName, sessions: [] }]);
  };

  const deleteYear = (yearIndex) => {
    const updatedYears = years.filter((_, index) => index !== yearIndex);
    setYears(updatedYears);
  };

  const addSession = (yearIndex) => {
    if (years[yearIndex].sessions.length >= 3) {
      alert('You can add a maximum of 3 sessions per year.');
      return;
    }

    // Automatically name the session (e.g., "Session 1", "Session 2", etc.)
    const sessionName = `Session ${years[yearIndex].sessions.length + 1}`;
    const updatedYears = [...years];
    updatedYears[yearIndex].sessions.push({
      name: sessionName, // Add a name field for the session
      invoiceDate: '',
      rate: '',
      type: 'flat'
    });
    setYears(updatedYears);
  };

  const deleteSession = (yearIndex, sessionIndex) => {
    const updatedYears = [...years];
    updatedYears[yearIndex].sessions = updatedYears[yearIndex].sessions.filter(
      (_, index) => index !== sessionIndex
    );
    setYears(updatedYears);
  };

  const updateSession = (yearIndex, sessionIndex, field, value) => {
    const updatedYears = [...years];
    updatedYears[yearIndex].sessions[sessionIndex][field] = value;
    setYears(updatedYears);
  };

  const handleSubmit = async () => {
    try {
      // Perform a PATCH request to update the data on the server
      const response = await fetch('https://your-api-endpoint.com/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(years)
      });

      if (!response.ok) {
        throw new Error('Failed to update data');
      }

      const result = await response.json();
      console.log('PATCH Response:', result);
      alert('Data updated successfully!');
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Failed to update data. Please try again.');
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex gap-4">
        <Button
          className="bg-supperagent text-white hover:bg-supperagent"
          onClick={addYear}
        >
          Add Year
        </Button>
        <Button
          className="bg-black text-white hover:bg-black"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>

      {years.map((yearData, yearIndex) => (
        <Card key={yearIndex} className="my-6 rounded-lg p-4">
          <div className="mb-4 flex items-center gap-4">
            <span className="font-medium">{yearData.year}</span>
            <Button
              className="bg-supperagent text-white hover:bg-supperagent"
              onClick={() => addSession(yearIndex)}
            >
              Add Session
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => deleteYear(yearIndex)}
            >
              Delete Year
            </Button>
          </div>

          {yearData.sessions.map((session, sessionIndex) => (
            <Card key={sessionIndex} className="mb-4 rounded-lg p-4">
              <div className="mb-4 flex items-center gap-4">
                <span className="font-medium">{session.name}</span>
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  onClick={() => deleteSession(yearIndex, sessionIndex)}
                >
                  Delete Session
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  type="date"
                  value={session.invoiceDate}
                  onChange={(e) =>
                    updateSession(
                      yearIndex,
                      sessionIndex,
                      'invoiceDate',
                      e.target.value
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Rate"
                  value={session.rate}
                  onChange={(e) =>
                    updateSession(
                      yearIndex,
                      sessionIndex,
                      'rate',
                      e.target.value
                    )
                  }
                />
                <Select
                  value={session.type}
                  onValueChange={(value) =>
                    updateSession(yearIndex, sessionIndex, 'type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </Card>
      ))}
    </div>
  );
}
