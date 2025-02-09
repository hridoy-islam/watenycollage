import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const invoiceSchema = z.object({
  logo: z.string().url().optional(),
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessEmail: z.string().email("Invalid email address"),
  businessPhone: z.string().min(1, "Business phone is required"),
})

const demoStudents = [
  { id: "S001", name: "John Doe", email: "john@example.com" },
  { id: "S002", name: "Jane Smith", email: "jane@example.com" },
  { id: "S003", name: "Alice Johnson", email: "alice@example.com" },
  // Add more demo students as needed
]

export default function GenerateInvoicePage() {
  const [selectedStudents, setSelectedStudents] = useState<typeof demoStudents>([])

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      businessName: "Your Business Name",
      businessAddress: "123 Business St, City, Country",
      businessEmail: "contact@yourbusiness.com",
      businessPhone: "+1 234 567 8900",
    },
  })

  useEffect(() => {
    // const studentIds = searchParams.get("students")?.split(",") || []
    setSelectedStudents(demoStudents)
  }, [])

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    const invoiceData = {
      ...data,
      students: selectedStudents,
      totalAmount: selectedStudents.length * 100, // 100 GBP per student
    }
    console.log("Invoice generated:", invoiceData)
    // In a real application, you would send this data to the server
    // router.push("/invoices")
  }

  const removeStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.filter((student) => student.id !== studentId))
  }

  const addStudent = () => {
    // In a real application, you would open a dialog to select a student
    const newStudent = { id: "S004", name: "New Student", email: "new@example.com" }
    setSelectedStudents((prev) => [...prev, newStudent])
  }

  return (
    <div className="mx-auto py-1">
      <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Students</CardTitle>
              <Button className="bg-supperagent text-white bg-supperagent" type="button" onClick={addStudent}>
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>100 GBP</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removeStudent(student.id)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-right">
                <strong>Total Amount: {selectedStudents.length * 100} GBP</strong>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-supperagent text-white bg-supperagent">Generate Invoice</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

