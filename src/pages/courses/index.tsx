import { useState } from "react"
import { Plus, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CourseDialog } from "./components/course-dialog"

const initialCourses = [
  { id: 1, name: "Demo Course", active: true },
  { id: 2, name: "Mathematics 101", active: true },
  { id: 3, name: "Physics Advanced", active: true },
  { id: 4, name: "Computer Science Basics", active: true },
  { id: 5, name: "Economics Principles", active: true },
]

export default function CoursesPage() {
  const [courses, setCourses] = useState(initialCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState()

  const handleSubmit = (data) => {
    if (editingCourse) {
      setCourses(courses.map(course => 
        course.id === editingCourse?.id
          ? { ...course, ...data }
          : course
      ))
      setEditingCourse(undefined)
    } else {
      const newId = Math.max(...courses.map(c => c.id)) + 1
      setCourses([...courses, { id: newId, ...data }])
    }
  }

  const handleStatusChange = (id: number, active: boolean) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, active } : course
    ))
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Courses</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">#ID</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="w-32 text-center">Status</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>{course.id}</TableCell>
              <TableCell>{course.name}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={course.active}
                  onCheckedChange={(checked) => handleStatusChange(course.id, checked)}
                  className="mx-auto"
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(course)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CourseDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingCourse(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingCourse}
      />
    </div>
  )
}
