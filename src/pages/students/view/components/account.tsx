import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// Demo data
const studentData = {
  id: "S12345",
  name: "Alice Johnson",
  email: "alice.johnson@example.com",
  enrolledCourses: [
    {
      id: "C1",
      name: "Advanced Web Development",
      code: "CS301",
      duration: "3 years",
      years: [
        {
          year: 1,
          sessions: [
            { invoiceDate: new Date("2023-09-01"), paymentStatus: "Paid" },
            { invoiceDate: new Date("2024-01-01"), paymentStatus: "Pending" },
            { invoiceDate: new Date("2024-05-01"), paymentStatus: "Unpaid" },
          ],
        },
        {
          year: 2,
          sessions: [
            { invoiceDate: new Date("2024-09-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2025-01-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2025-05-01"), paymentStatus: "Unpaid" },
          ],
        },
        {
          year: 3,
          sessions: [
            { invoiceDate: new Date("2025-09-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2026-01-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2026-05-01"), paymentStatus: "Unpaid" },
          ],
        },
      ],
    },
    {
      id: "C2",
      name: "Data Science Fundamentals",
      code: "DS101",
      duration: "2 years",
      years: [
        {
          year: 1,
          sessions: [
            { invoiceDate: new Date("2023-09-01"), paymentStatus: "Paid" },
            { invoiceDate: new Date("2024-01-01"), paymentStatus: "Paid" },
            { invoiceDate: new Date("2024-05-01"), paymentStatus: "Pending" },
          ],
        },
        {
          year: 2,
          sessions: [
            { invoiceDate: new Date("2024-09-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2025-01-01"), paymentStatus: "Unpaid" },
            { invoiceDate: new Date("2025-05-01"), paymentStatus: "Unpaid" },
          ],
        },
      ],
    },
  ],
}

export default function AccountPage({student}) {
  return (
    <div className="mx-auto py-1">
      

      <h2 className="text-xl font-bold mb-4">Enrolled Courses</h2>

      {studentData.enrolledCourses.map((course) => (
        <Card key={course.id} className="mb-6">
          <CardHeader>
            <CardTitle>{course.name}</CardTitle>
            <div className="text-sm text-gray-500">
              Code: {course.code} | Duration: {course.duration}
            </div>
          </CardHeader>
          <CardContent>
            {course.years.map((year) => (
              <div key={year.year} className="mb-4">
                <h3 className="font-semibold mb-2">Year {year.year}</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2">Session</th>
                      <th className="pb-2">Invoice Date</th>
                      <th className="pb-2">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {year.sessions.map((session, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2">Session {index + 1}</td>
                        <td className="py-2">{format(session.invoiceDate, "MMM d, yyyy")}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              session.paymentStatus === "Paid"
                                ? "success"
                                : session.paymentStatus === "Pending"
                                  ? "warning"
                                  : "destructive"
                            }
                          >
                            {session.paymentStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

