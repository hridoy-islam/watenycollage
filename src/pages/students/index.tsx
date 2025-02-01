import StudentFilter from "@/components/shared/student-filter";
import { StudentsTable } from "@/components/shared/students-table";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from '../../lib/axios'
import { useToast } from "@/components/ui/use-toast";
import { DataTablePagination } from "./view/components/data-table-pagination";
import { BlinkingDots } from "@/components/shared/blinking-dots";

export default function StudentsPage() {
  const [students, setStudents] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [filters, setFilters] = useState({ searchTerm: "", status: "", agent: "", staffId: "" });


  const fetchData = async (page, entriesPerPage, filters) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const { searchTerm, status, dob, agent, staffId, institute } = filters;
      // Conditionally build the where parameter
      const params = {
        page,
        limit: entriesPerPage,
        searchTerm,
        ...(status ? { status } : {}),
        ...(agent ? { "agent.id": agent } : {}),
        ...(dob ? { dob } : {}), // Add dob to the params if it exists
      };

      // Only include 'where' if staffId exists
      if (staffId) {
        params.where = `with:assignStaffs,with:staff,id,${staffId}`;
      }
      // if (institute) {
      //   params.where = `with:applications,with:institution,id,${institute}`;
      // }
      const response = await axiosInstance.get(`/students`, { params });
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
      <StudentFilter onSubmit={handleFilterSubmit} />
      {initialLoading ? (
        <div className="flex justify-center py-6">
          <BlinkingDots size="large" color="bg-supperagent" />
        </div>
      ) : students.length === 0 ? (
        <div className="flex justify-center py-6 text-gray-500">
          No records found.
        </div>
      ) : (
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
      )}
    </>
  )
}