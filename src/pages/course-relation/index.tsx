import { useState } from "react";
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

// Example initial course relation data
const initialCourseRelations = [
  { id: 1, institution: "Harvard University", course: "Computer Science", term: "Fall 2024", courseAvailableTo: "Local", active: true },
  { id: 2, institution: "MIT", course: "Mechanical Engineering", term: "Spring 2024", courseAvailableTo: "International", active: true },
];

// Example options for institutions, courses, terms, and courseAvailableTo
const institutions = ["Harvard University", "MIT", "Stanford University"];
const courses = ["Computer Science", "Mechanical Engineering", "Electrical Engineering"];
const terms = ["Fall 2024", "Spring 2024", "Summer 2024"];
const courseAvailableTo = ["Local", "International"];

export default function CourseRelationPage() {
  const [courseRelations, setCourseRelations] = useState(initialCourseRelations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourseRelation, setEditingCourseRelation] = useState(null);

  const handleSubmit = (data) => {
    if (editingCourseRelation) {
      setCourseRelations(courseRelations.map((relation) =>
        relation.id === editingCourseRelation.id ? { ...relation, ...data } : relation
      ));
      setEditingCourseRelation(null);
    } else {
      const newId = Math.max(...courseRelations.map(r => r.id)) + 1;
      setCourseRelations([...courseRelations, { id: newId, ...data }]);
    }
    setDialogOpen(false); // Close the dialog after submission
  };

  const handleEdit = (relation) => {
    setEditingCourseRelation(relation);
    setDialogOpen(true);
  };

  const handleStatusChange = (id, active) => {
    setCourseRelations(courseRelations.map(relation =>
      relation.id === id ? { ...relation, active } : relation
    ));
  };

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
            <TableHead>#ID</TableHead>
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
            <TableRow key={relation.id}>
              <TableCell>{relation.id}</TableCell>
              <TableCell>{relation.institution}</TableCell>
              <TableCell>{relation.course}</TableCell>
              <TableCell>{relation.term}</TableCell>
              <TableCell>{relation.courseAvailableTo}</TableCell>
              <TableCell>
                <Switch
                  checked={relation.active}
                  onCheckedChange={(checked) => handleStatusChange(relation.id, checked)}
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
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCourseRelation(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingCourseRelation}
        institutions={institutions}
        courses={courses}
        terms={terms}
        courseAvailableTo={courseAvailableTo}
      />
    </div>
  );
}
