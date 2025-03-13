import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export default function AccountPage({ student }) {
  const [enrolledCourses, setEnrolledCourses] = useState<any>(
    student?.accounts?.courses || []
  );

  useEffect(() => {
    if (Array.isArray(student?.accounts?.courses)) {
      setEnrolledCourses(student?.accounts?.courses);
    }
  }, [student?.accounts?.courses]);
console.log(enrolledCourses)
  return (
    <div className="mx-auto py-1">
      <h2 className="mb-4 text-xl font-bold">Enrolled Courses</h2>

      {enrolledCourses.map((course, idx) => (
        <Card key={idx} className="mb-6">
          <CardHeader>
            <CardTitle><span className='text-3xl'>{course.institute.name}</span></CardTitle>
            <CardTitle><span className='text-xl'>{course.name.name}</span></CardTitle>
            <CardTitle>{course.term.term}</CardTitle>
            {/* <div className="text-sm text-gray-500">
              Code: {course.code} | Duration: {course.duration}
            </div> */}
          </CardHeader>
          <CardContent>
            {course.years.map((year) => (
              <div key={year.id} className="mb-4">
                <h3 className="mb-2 font-semibold">{year.name}</h3>
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
                        <td className="py-2">{session.name}</td>
                        <td className="py-2">
                          {format(session.invoiceDate, 'MMM d, yyyy')}
                        </td>
                        <td className="py-2">
                          <Badge
                            className={
                              session.status === 'paid'
                                ? 'bg-green-500 text-white'
                                : session.status === 'due'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-red-500 text-white'
                            }
                          >
                            {session.status}
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
  );
}
