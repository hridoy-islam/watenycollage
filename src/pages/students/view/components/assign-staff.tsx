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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import axiosInstance from "../../../../lib/axios";
import { Switch } from "@/components/ui/switch"

export function AssignStaff({ student, onSave }) {
  const [staffs, setStaffs] = useState<any>(student.assignStaff || [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  const handleDelete = async (id) => {

    // try {
    //   await axiosInstance.delete(`/student/${id}`);
    //   if (onDocumentUpdate) {
    //     onDocumentUpdate();
    //   }
    //   // Close the delete confirmation dialog
    //   setDeleteDialog(null);
    // } catch (error) {
    //   console.error("Error deleting the document:", error);
    //   // Optionally, you can show an error message to the user
    // }
  }

  const handleStatusChange = (id, currentStatus) => {
    // Toggle the status
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Persist the change using onSave
    const updatedStaff = staffs.find((staff) => staff.id === id);
    if (updatedStaff) {
      const updatedStaffWithStatus = { ...updatedStaff, status: newStatus };
      onSave({ assignStaff: [updatedStaffWithStatus] });
    }
  };

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
    <div className="space-y-4 rounded-md shadow-md p-4">
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
              <TableHead>Email</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
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

                  <TableCell>{staff.staff.firstName} {staff.staff.lastName}</TableCell>
                  <TableCell>{staff.staff.email} </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={parseInt(staff.status) === 1}
                      onCheckedChange={(checked) => handleStatusChange(staff.id, checked ? 0 : 1)}
                      className="mx-auto"
                    />

                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog(staff.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button> */}
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
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-supperagent text-white hover:bg-supperagent" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

