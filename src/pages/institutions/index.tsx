import { useEffect, useState } from "react";
import { Pen, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InstitutionDialog } from "./components/institution-dialog";
import axiosInstance from '../../lib/axios';
import { useToast } from "@/components/ui/use-toast";
import { BlinkingDots } from "@/components/shared/blinking-dots";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<any>();
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/institutions?limit=100`);
      setInstitutions(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingInstitution) {
        // Update institution
        await axiosInstance.put(`/institutions/${editingInstitution?.id}`, data);
        toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
        fetchData();
        setEditingInstitution(undefined);
      } else {
        data.status = "1"
        await axiosInstance.post(`/institutions`, data);
        toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
        fetchData()
      }
    } catch (error) {
      console.error("Error saving institution:", error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/institutions/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (institution) => {
    setEditingInstitution(institution);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Institutions</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'} onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Institution
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-supperagent" />
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#ID</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>{institution.id}</TableCell>
                  <TableCell>{institution.name}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={institution.status == 1}
                      onCheckedChange={(checked) => handleStatusChange(institution.id, checked)}
                      className="mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
                      size="icon"
                      onClick={() => handleEdit(institution)}
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
      <InstitutionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingInstitution(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingInstitution}
      />
    </div>
  );
}
