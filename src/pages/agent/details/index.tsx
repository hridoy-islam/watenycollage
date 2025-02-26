import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'; // Import shadcn table components
import { Button } from '@/components/ui/button'; // Import shadcn button
import { Input } from '@/components/ui/input'; // Import shadcn input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'; // Import shadcn select

const AgentDetailsPage = () => {
  // State for managing courses
  const [courses, setCourses] = useState([
    {
      id: 1,
      institution: 'AUG',
      course: 'CSE',
      terms: [
        {
          term: 'First Term',
          invoiceDate: '2023-10-01',
          rate: 5500.0,
          type: 'Flat'
        },
        {
          term: 'Second Term',
          invoiceDate: '2024-02-01',
          rate: 6000.0,
          type: 'Percentage'
        },
        {
          term: 'Third Term',
          invoiceDate: '2024-06-01',
          rate: 6500.0,
          type: 'Flat'
        }
      ],
      status: 'Enrolled'
    }
  ]);

  // State for managing inline editing
  const [editingField, setEditingField] = useState<{
    courseId: number;
    termIndex: number;
    field: string;
  } | null>(null);

  // Handle inline edit
  const handleInlineEdit = (
    courseId: number,
    termIndex: number,
    field: string
  ) => {
    setEditingField({ courseId, termIndex, field });
  };

  // Save inline edit
  const saveInlineEdit = (
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (editingField) {
      const { courseId, termIndex, field } = editingField;
      const updatedCourses = courses.map((course) => {
        if (course.id === courseId) {
          const updatedTerms = course.terms.map((term, index) => {
            if (index === termIndex) {
              return { ...term, [field]: e.currentTarget.value };
            }
            return term;
          });
          return { ...course, terms: updatedTerms };
        }
        return course;
      });
      setCourses(updatedCourses);
      setEditingField(null);
    }
  };

  // Handle key press (e.g., Enter to save)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveInlineEdit(e);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Assigned Courses</h2>
        <Button>+ Add Course</Button>
      </div>

      {/* Table to display courses */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institution</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Invoice Date</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <React.Fragment key={course.id}>
              {course.terms.map((term, termIndex) => (
                <TableRow key={termIndex}>
                  {termIndex === 0 && (
                    <>
                      <TableCell
                        rowSpan={course.terms.length}
                        className="border-r"
                      >
                        {course.institution}
                      </TableCell>
                      <TableCell
                        rowSpan={course.terms.length}
                        className="border-r"
                      >
                        {course.course}
                      </TableCell>
                    </>
                  )}
                  <TableCell
                    onClick={() =>
                      handleInlineEdit(course.id, termIndex, 'term')
                    }
                  >
                    {editingField?.courseId === course.id &&
                    editingField.termIndex === termIndex &&
                    editingField.field === 'term' ? (
                      <Input
                        autoFocus
                        defaultValue={term.term}
                        onBlur={saveInlineEdit}
                        onKeyPress={handleKeyPress}
                      />
                    ) : (
                      term.term
                    )}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      handleInlineEdit(course.id, termIndex, 'invoiceDate')
                    }
                  >
                    {editingField?.courseId === course.id &&
                    editingField.termIndex === termIndex &&
                    editingField.field === 'invoiceDate' ? (
                      <Input
                        type="date"
                        autoFocus
                        defaultValue={term.invoiceDate}
                        onBlur={saveInlineEdit}
                        onKeyPress={handleKeyPress}
                      />
                    ) : (
                      term.invoiceDate
                    )}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      handleInlineEdit(course.id, termIndex, 'rate')
                    }
                  >
                    {editingField?.courseId === course.id &&
                    editingField.termIndex === termIndex &&
                    editingField.field === 'rate' ? (
                      <Input
                        type="number"
                        autoFocus
                        defaultValue={term.rate}
                        onBlur={saveInlineEdit}
                        onKeyPress={handleKeyPress}
                      />
                    ) : (
                      `$${term.rate.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      handleInlineEdit(course.id, termIndex, 'type')
                    }
                  >
                    {editingField?.courseId === course.id &&
                    editingField.termIndex === termIndex &&
                    editingField.field === 'type' ? (
                      <Select
                        defaultValue={term.type}
                        onValueChange={(value) => {
                          const updatedCourses = courses.map((c) => {
                            if (c.id === course.id) {
                              const updatedTerms = c.terms.map((t, idx) => {
                                if (idx === termIndex) {
                                  return { ...t, type: value };
                                }
                                return t;
                              });
                              return { ...c, terms: updatedTerms };
                            }
                            return c;
                          });
                          setCourses(updatedCourses);
                          setEditingField(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flat">Flat</SelectItem>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      term.type
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentDetailsPage;
