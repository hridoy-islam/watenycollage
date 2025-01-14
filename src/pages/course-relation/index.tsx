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
import { CourseRelationDialog } from "./components/course-relation-dialog";
import axiosInstance from '../../lib/axios';

// Example initial course relation data



import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge";

export default function CourseRelationPage() {
  const [courseRelations, setCourseRelations] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourseRelation, setEditingCourseRelation] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/course-relations`);
      setCourseRelations(response.data.data.result);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  const handleSubmit = async (data) => {

    try {
      if (editingCourseRelation) {
        // Update institution
        await axiosInstance.patch(`/course-relations/${editingCourseRelation?.id}`, data);
        toast({ title: "Record Updated successfully", className: "bg-supperagent border-none text-white", });
        fetchData();
        setEditingCourseRelation(null);
      } else {
        await axiosInstance.post(`/course-relations`, data);
        toast({ title: "Record Created successfully", className: "bg-supperagent border-none text-white", });
        fetchData()
      }
    } catch (error) {
      console.error("Error saving Course Relation:", error);
    }

  };

  const handleEdit = (relation) => {
    setEditingCourseRelation(relation);
    setDialogOpen(true);
  };

  const handleStatusChange = async (id, status) => {

    try {
      const updatedStatus = status ? "1" : "0";
      await axiosInstance.patch(`/course-relations/${id}`, { status: updatedStatus });
      toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Course Relations</h1>
        <Button
          className="bg-supperagent text-white hover:bg-supperagent/90" size={'sm'}
          onClick={() => {
            setEditingCourseRelation(null);  // Clear editing course relation when creating a new one
            setDialogOpen(true);
          }}>
          <Plus className="w-4 h-4 mr-2" />
          New Course
        </Button>
      </div>
      <div className="rounded-md bg-white shadow-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Institution</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Course Available To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseRelations.map((relation) => (
              <TableRow key={relation?.id}>
                
                <TableCell>{relation?.institute?.name}</TableCell>
                <TableCell>{relation?.course?.name}</TableCell>
                <TableCell>{relation?.term?.term}</TableCell>
                <TableCell>
                  {relation?.local && <Badge className="bg-green-300 hover:bg-green-300">{relation?.local ? 'Local' : ''} £ {relation?.local_amount}</Badge>}
                   <br /><br /> 
                   {relation?.international && <Badge className="bg-blue-300 hover:bg-blue-300">{relation?.international ? 'International' : ''}  £ {relation?.international_amount}</Badge> }
                </TableCell>
                <TableCell>
                  <Switch
                    checked={relation?.status == 1}
                    onCheckedChange={(checked) => handleStatusChange(relation?.id, checked)}
                    className="mx-auto"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    className="bg-supperagent text-white hover:bg-supperagent/90 border-none"
                    size="icon"
                    onClick={() => handleEdit(relation)}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CourseRelationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingCourseRelation}
      />
    </div>
  );
}
