import { useState } from "react"
import { Plus, Settings } from 'lucide-react'
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
import { DataTablePagination } from "./data-table-pagination"
import { ApplicationDialog } from "./application-dialog"
import type { Application } from "@/types/index"

const initialApplications: Application[] = [
  {
    id: 1,
    institution: "GBS (UOS)",
    course: "BA (Hons) Global Business (Business)",
    term: "October 2021",
    type: "International",
    amount: 0,
    status: "Rejected",
    statusDate: "27-09-2022"
  },
  {
    id: 2,
    institution: "London Churchill College (Weekday)",
    course: "HND in Business (ESBM)",
    term: "April 2022",
    type: "Local",
    amount: 6000,
    status: "Rejected",
    statusDate: "13-06-2022"
  }
]

export function ApplicationsSection({ student, onSave }) {
  const [applications, setApplications] = useState()
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddCourse = (data) => {
    const newApplication: Application = {
      id: Math.max(...applications.map(c => c.id)) + 1,
      ...data,
      status: "Pending",
      statusDate: new Date().toLocaleDateString("en-GB")
    }
    setApplications([...applications, newApplication])
  }

  const getStatusBadgeColor = (status: Application['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500'
      case 'Rejected':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

 

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
            <TableHead className="w-[100px]">#ID</TableHead>
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
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.institution}</TableCell>
                <TableCell>{course.course}</TableCell>
                <TableCell>{course.term}</TableCell>
                <TableCell>
                  {course.type === 'Local' && (
                    <Badge variant="secondary" className="bg-green-500">
                      Local
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
                    {course.statusDate && (
                      <span className="text-xs text-muted-foreground">
                        {course.statusDate}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      

      {/* <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddCourse}
      /> */}
    </div>
  )
}

