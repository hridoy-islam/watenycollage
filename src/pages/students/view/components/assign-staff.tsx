import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Pen, Trash2 } from 'lucide-react'
import { StaffDialog } from "./assign-staff-dialog"



export function AssignStaff({ student , onSave}) {
  const [staffs, setStaffs] = useState<any>(student.assignStaff || [])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (Array.isArray(student.assignStaff)) {
      setStaffs(student.assignStaff);
    }
  }, [student.workDetails]);

  const handleSubmit = (data) => {
    console.log(data)
      onSave({ assignStaff: [data] });
  }




  // const handleStatusChange = (id, currentStatus) => {
  //   // Toggle the status
  //   const newStatus = currentStatus === 1 ? 0 : 1;
  //   // Persist the change using onSave
  //   const updatedContact = workExperiences.find(contact => contact.id === id);
  //   if (updatedContact) {
  //     const updatedContactWithStatus = { ...updatedContact, status: newStatus };
  //     onSave({ workDetails: [updatedContactWithStatus] });
  //   }
  // };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assigned Staffs</h2>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-supperagent text-white hover:bg-supperagent"
        >
          Add Staff
        </Button>
      </div>

      <div className="rounded-md ">
        <Table>
          <TableHeader>
            <TableRow>

              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No matching records found
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff) => (
                <TableRow key={staff.id}>

                  <TableCell>{staff.staff.firstName}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log("Edit", staff.id)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

