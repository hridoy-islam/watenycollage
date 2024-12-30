import StudentFilter from "@/components/shared/student-filter";
import { StudentsTable } from "@/components/shared/students-table";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from '../../lib/axios'
import { useToast } from "@/components/ui/use-toast";

export default function StudentsPage() {
    const [students, setStudents] = useState<any>([]);
    const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
    const { toast } = useToast();
    const fetchData = async () => {
        try {
          if (initialLoading) setInitialLoading(true);
          const response = await axiosInstance.get(`/students`);
          setStudents(response.data.data.result);
        } catch (error) {
          console.error("Error fetching institutions:", error);
        } finally {
          setInitialLoading(false); // Disable initial loading after the first fetch
        }
      };

      const handleStatusChange = async (id, status) => {
          try {
            const updatedStatus = status ? "1" : "0";
            await axiosInstance.patch(`/students/${id}`, { status: updatedStatus });
            toast({ title: "Record updated successfully", className: "bg-supperagent border-none text-white", });
            fetchData();
          } catch (error) {
            console.error("Error updating status:", error);
          }
        };

      useEffect(() => {
          fetchData();
        }, []);

    return (
        <>
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">All Students</h1>
                <Button className="bg-supperagent text-white hover:bg-supperagent/90"><Link to='new'>New Student</Link></Button>
            </div>
            <StudentFilter />
            <StudentsTable students={students} handleStatusChange={handleStatusChange}/>
        </>
    )
}