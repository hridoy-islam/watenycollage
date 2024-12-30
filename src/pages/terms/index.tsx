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
import { TermDialog } from "./components/term-dialog"
import { useToast } from "@/components/ui/use-toast"
import axiosInstance from '../../lib/axios';
import { BlinkingDots } from "@/components/shared/blinking-dots";


export default function TermsPage() {
  const [terms, setTerms] = useState<any>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<any>()
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/terms`);
      setTerms(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {
    if (editingTerm) {
      await axiosInstance.patch(`/terms/${editingTerm?.id}`, data);
      toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
      setEditingTerm(undefined)
    } else {
      await axiosInstance.post(`/terms`, data);
      toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
      fetchData()
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/terms/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (term) => {
    setEditingTerm(term)
    setDialogOpen(true)
  }

  useEffect(() => {
    fetchData();
  }, []);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Terms</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Term
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : terms.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#ID</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell>{term.id}</TableCell>
                  <TableCell>{term.term}</TableCell>
                  <TableCell>{term.academic_year}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={term.status == 1}
                      onCheckedChange={(checked) => handleStatusChange(term.id, checked)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-supperagent text-white hover:bg-supperagent/90"
                      onClick={() => handleEdit(term)}
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
      <TermDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingTerm(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingTerm}
      />
    </div>
  )
}
