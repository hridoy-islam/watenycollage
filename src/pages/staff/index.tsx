import { useEffect, useState } from "react"
import { Plus, Pen } from 'lucide-react'
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
import { StaffDialog } from "./components/staff-dialog"
import axiosInstance from '../../lib/axios';
import { toast } from "@/components/ui/use-toast"

export default function StaffPage() {
  const [staff, setStaff] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(true);


  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/staffs`);
      setStaff(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingStaff) {
        // Update institution
        await axiosInstance.put(`/staffs/${editingStaff?.id}`, data);
        toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
        fetchData();
        setEditingStaff(null);
      } else {
        await axiosInstance.post(`/staffs`, data);
        toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
        fetchData()
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
    finally {
      setEditingStaff(null);
    }
  };



  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/staffs/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setDialogOpen(true)
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!dialogOpen) {
      setEditingStaff(null);
    }
  }, [dialogOpen]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Staff</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Staff
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>

              <TableHead>Staff Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-32 text-center">Status</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell>{`${staffMember.firstName} ${staffMember.lastName}`}</TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>{staffMember.phone}</TableCell>
                <TableCell className="text-center">

                  <Switch
                    checked={staffMember.status == 1}
                    onCheckedChange={(checked) => handleStatusChange(staffMember.id, checked)}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-supperagent text-white hover:bg-supperagent/90"
                    onClick={() => handleEdit(staffMember)}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <StaffDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingStaff(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingStaff}
      />
    </div>
  )
}
