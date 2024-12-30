import { useEffect, useState } from "react"
import { Pen, Plus } from 'lucide-react'
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
import { AcademicYearDialog } from "./components/academic-year-dialog"
import { useToast } from "@/components/ui/use-toast"
import axiosInstance from '../../lib/axios';
import { BlinkingDots } from "@/components/shared/blinking-dots"

export default function AcademicYearPage() {

  const [academicYears, setAcademicYears] = useState<any>([])
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAcademicYear, setEditingAcademicYear] = useState<any>()
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/academic-years`);
      setAcademicYears(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    if (editingAcademicYear) {
      await axiosInstance.put(`/academic-years/${editingAcademicYear?.id}`, data);
      toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
      setEditingAcademicYear(undefined)
    } else {
      await axiosInstance.post(`/academic-years`, data);
      toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
      fetchData()
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/academic-years/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (academicYear) => {
    setEditingAcademicYear(academicYear)
    setDialogOpen(true)
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Academic Years</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Academic Year
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : academicYears.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#ID</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>{year.id}</TableCell>
                  <TableCell>{year.academic_year}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={year.status == 1}
                      onCheckedChange={(checked) => handleStatusChange(year.id, checked)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-supperagent text-white hover:bg-supperagent/90"
                      onClick={() => handleEdit(year)}
                    >
                      <Pen className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <AcademicYearDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingAcademicYear(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingAcademicYear}
      />
    </div>
  )
}
