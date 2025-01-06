import StudentFilter from "@/components/shared/student-filter";
import { StudentsTable } from "@/components/shared/students-table";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from '../../lib/axios'
import { useToast } from "@/components/ui/use-toast";
import { DataTablePagination } from "./view/components/data-table-pagination";

export default function StudentsPage() {
  const [students, setStudents] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [filters, setFilters] = useState({ searchTerm: "", status: "" });

  const fetchData = async (page, entriesPerPage, filters) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const { searchTerm, status } = filters;
      const response = await axiosInstance.get(`/students`, {
        params: {
          page,
          limit: entriesPerPage,
          searchTerm,
          ...(status ? { status } : {}),
        },
      });
      setStudents(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
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
      fetchData(currentPage, entriesPerPage, filters); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleFilterSubmit = (filters) => {
    setFilters(filters);
    setCurrentPage(1); // Reset to the first page on filter change
    fetchData(1, entriesPerPage, filters);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, filters); // Refresh data
  }, [currentPage, entriesPerPage]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Students</h1>
        <Button className="bg-supperagent text-white hover:bg-supperagent/90"><Link to='new'>New Student</Link></Button>
      </div>
      <StudentFilter onSubmit={handleFilterSubmit}/>
      <div className="rounded-md bg-white shadow-2xl p-4 space-y-2">
        <StudentsTable students={students} handleStatusChange={handleStatusChange} />

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )
}