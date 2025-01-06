import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Eye, Trash2Icon } from 'lucide-react'
import { Link } from "react-router-dom"

export function StudentsTable({students, handleStatusChange, currentPage, rowsPerPage}) {
  
  return (
      <Table>
        <TableHeader>
          <TableRow>
            
            <TableHead>Reference No</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Agent</TableHead>
            {/* <TableHead>Type</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 && students?.map((student, index) => (
            <TableRow key={student.id}>
             
              <TableCell>{student.refId}</TableCell>
              <TableCell>{student.firstName} {student.lastName}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{student.agent}</TableCell>
              {/* <TableCell>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  {student.type}
                </span>
              </TableCell> */}
              <TableCell>
              <Switch
                    checked={student.status == 1}
                    onCheckedChange={(checked) => handleStatusChange(student.id, checked)}
                    className="mx-auto"
                  />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                <Link to={`${student.id}`}>
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  </Link>
                  <Button variant="destructive" size="icon">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}

