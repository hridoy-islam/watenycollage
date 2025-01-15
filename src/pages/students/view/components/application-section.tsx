import { useState, useEffect } from "react"
import { Eye, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApplicationDialog } from "./application-dialog"
import moment from "moment"



export function ApplicationsSection({ student, onSave }) {
  const [applications, setApplications] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = (data) => {
      onSave({ applications: [data] });
  };

  // Get the status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500'
      case 'Rejected':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  // Fetch applications when the component mounts or when student.applications changes
  useEffect(() => {
    if (student.applications) {
      setApplications(student.applications || []);
    }
  }, [student.applications]);

  return (
    <div className="space-y-4 p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Interested Courses</h2>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>

            <TableHead>Institution</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            applications.map((course) => (
              <TableRow key={course.id}>

                <TableCell>{course.institution.name}</TableCell>
                <TableCell>{course.course.name}</TableCell>
                <TableCell>{course.term.term}</TableCell>
                <TableCell>
                  {course.choice === 'Local' && (
                    <Badge variant="secondary" className="bg-green-500">
                      Local
                    </Badge>
                  )}
                  {course.choice === 'International' && (
                    <Badge variant="secondary" className="bg-blue-500">
                      International
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{course.amount}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant="secondary"
                      className={getStatusBadgeColor(course.status)}
                    >
                      {course.status}
                    </Badge>
                    {course.created_at && (
                      <span className="text-xs text-muted-foreground">
                        
                        {moment(course.created_at).format("DD-MM-YYYY")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
