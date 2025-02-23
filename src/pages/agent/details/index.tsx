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

// Mock course details (replace with actual data from your API)
const courses = [
  {
    id: 1,
    name: 'Course 1',
    sessions: [
      { id: 1, name: 'Session 1', invoiceDate: '2023-10-01' },
      { id: 2, name: 'Session 2', invoiceDate: '2023-11-01' }
    ]
  },
  {
    id: 2,
    name: 'Course 2',
    sessions: [
      { id: 3, name: 'Session 1', invoiceDate: '2024-01-01' },
      { id: 4, name: 'Session 2', invoiceDate: '2024-02-01' }
    ]
  }
];

export default function AgentDetailsPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [year, setYear] = useState({
    year: 'Year 1', // Only one year
    sessions: []
  });
  const [assignedCourses, setAssignedCourses] = useState([]); // Track assigned courses

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    const course = courses.find((c) => c.id === Number(courseId));
    if (course) {
      setSelectedCourse(course);
      setYear({
        year: 'Year 1',
        sessions: course.sessions.map((session) => ({
          ...session,
          rate: '',
          type: 'flat' // Default type
        }))
      });
    }
  };

  // Update session details
  const updateSession = (sessionIndex, field, value) => {
    const updatedSessions = [...year.sessions];
    updatedSessions[sessionIndex][field] = value;
    setYear({ ...year, sessions: updatedSessions });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedCourse) {
      alert('Please select a course first.');
      return;
    }

    try {
      // Perform a PATCH request to update the data on the server
      const response = await fetch(
        'https://your-api-endpoint.com/assign-course',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            ...year
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to assign course');
      }

      const result = await response.json();
      console.log('PATCH Response:', result);

      // Add the assigned course to the list
      setAssignedCourses([...assignedCourses, selectedCourse]);
      alert('Course assigned successfully!');
    } catch (error) {
      console.error('Error assigning course:', error);
      alert('Failed to assign course. Please try again.');
    }
  };

  return (
    <div className="mx-auto p-6">
      <div className="mb-6">
        <Select onValueChange={handleCourseSelect}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display assigned courses */}
      {assignedCourses.length > 0 && (
        <Card className="mb-6 rounded-lg p-4">
          <h2 className="mb-4 text-lg font-semibold">Assigned Courses</h2>
          <ul>
            {assignedCourses.map((course) => (
              <li key={course.id} className="mb-2">
                {course.name}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {selectedCourse && (
        <>
          <div className="flex gap-4">
            <Button
              className="bg-black text-white hover:bg-black"
              onClick={handleSubmit}
            >
              Assign Course
            </Button>
          </div>

          <Card className="my-6 rounded-lg p-4">
            <div className="mb-4 flex items-center gap-4">
              <span className="font-medium">{year.year}</span>
            </div>

            {year.sessions.map((session, sessionIndex) => (
              <Card key={session.id} className="mb-4 rounded-lg p-4">
                <div className="mb-4 flex items-center gap-4">
                  <span className="font-medium">{session.name}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    type="date"
                    value={session.invoiceDate}
                    disabled // Invoice date is pulled from course details and cannot be edited
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={session.rate}
                    onChange={(e) =>
                      updateSession(sessionIndex, 'rate', e.target.value)
                    }
                  />
                  <Select
                    value={session.type}
                    onValueChange={(value) =>
                      updateSession(sessionIndex, 'type', value)
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
        </>
      )}
    </div>
  );
}
