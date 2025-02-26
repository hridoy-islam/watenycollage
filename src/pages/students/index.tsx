import StudentFilter from '@/components/shared/student-filter';
import { StudentsTable } from '@/components/shared/students-table';
import { Button } from '@/components/ui/button';
// import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from './view/components/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';

export default function StudentsPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [students, setStudents] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    agent: '',
    staffId: ''
  });

  // const fetchData = async (page, entriesPerPage, filters) => {
  //   try {
  //     if (initialLoading) setInitialLoading(true);
  //     const {
  //       searchTerm,
  //       status,
  //       dob,
  //       agent,
  //       staffId,
  //       institute,
  //       term,
  //       academic_year_id
  //     } = filters;
  //     // Conditionally build the where parameter
  //     const params = {
  //       page,
  //       limit: entriesPerPage,
  //       searchTerm,

  //       ...(dob ? { dob } : {}) // Add dob to the params if it exists
  //     };
  //     // Apply status filter using `where`
  //     if (status !== null) {
  //       params.where = `with:applications,status,${status}`;
  //     }
  //     // If the user is an agent, force their ID in the filter
  //     if (user.role === 'agent') {
  //       params['agent.id'] = user.agent_id; // Assuming `user.id` is the agent’s ID
  //     } else {
  //       if (agent) params['agent.id'] = agent; // Admins can search any agent’s students
  //       if (staffId)
  //         params.where = `with:assignStaffs,with:staff,id,${staffId}`;
  //       if (institute)
  //         params.where = `with:applications,with:institute,id,${institute}`;
  //       if (term) params.where = `with:applications,with:term,id,${term}`;
  //       if (academic_year_id)
  //         params.where = `with:applications,with:term,with:academicYear,id,${academic_year_id}`;
  //     }

  //     // // Only include 'where' if staffId exists
  //     // if (staffId) {
  //     //   params.where = `with:assignStaffs,with:staff,id,${staffId}`;
  //     // }
  //     // if (institute) {
  //     //   params.where = `with:applications,with:institute,id,${institute}`;
  //     // }
  //     // if (term) {
  //     //   params.where = `with:applications,with:term,id,${term}`;
  //     // }
  //     // if (academic_year_id) {
  //     //   params.where = `with:applications,with:term,with:academicYear,id,${academic_year_id}`;
  //     // }
  //     const response = await axiosInstance.get(`/students`, { params });
  //     setStudents(response.data.data.result);
  //     setTotalPages(response.data.data.meta.totalPage);
  //   } catch (error) {
  //     console.error('Error fetching institutions:', error);
  //   } finally {
  //     setInitialLoading(false); // Disable initial loading after the first fetch
  //   }
  // };

  const fetchData = async (page, entriesPerPage, filters) => {
    try {
      if (initialLoading) setInitialLoading(true);

      const {
        searchTerm,
        status,
        dob,
        agent,
        staffId,
        institute,
        term,
        academic_year_id
      } = filters;

      // Initialize params object
      const params = {
        page,
        limit: entriesPerPage,
        ...(searchTerm ? { searchTerm } : {}),
        ...(dob ? { dob } : {})
      };

      // Initialize an array for 'where' conditions
      let whereConditions = [];

      if (status) whereConditions.push(`with:applications,status,${status}`);
      if (staffId)
        whereConditions.push(`with:assignStaffs,with:staff,id,${staffId}`);
      if (institute)
        whereConditions.push(
          `with:applications,with:institute,id,${institute}`
        );
      if (term) whereConditions.push(`with:applications,with:term,id,${term}`);
      if (academic_year_id)
        whereConditions.push(
          `with:applications,with:term,with:academicYear,id,${academic_year_id}`
        );

      // Only include 'agent' filter based on user role
      if (user.role === 'agent') {
        params['agent.id'] = user.agent_id;
      } else if (agent) {
        params['agent.id'] = agent;
      }

      // Construct query parameters
      let queryParams = new URLSearchParams();

      if (whereConditions.length === 1) {
        queryParams.append('where', whereConditions[0]);
      } else if (whereConditions.length > 1) {
        whereConditions.forEach((condition) =>
          queryParams.append('orWhere', condition)
        );
      }

      // If user is 'staff', search by email
      // if (user.role === 'staff') {
      //   queryParams.append('q', `createdBy.email=${user.email}`);
      // }

      let qConditions = [];

      // If user is 'staff', search by email
      if (user.role === 'staff') {
        qConditions.push(`createdBy.email=${user.email}`);
      }

      // Add 'assignStaff.staff.email' condition if staffId is provided
      // if (user.role === 'staff') {
      //   qConditions.push(`assignStaff.staff.email=${user.email}`);
      // }

      // Append 'q' only if there are conditions
      if (qConditions.length > 0) {
        queryParams.append('q', qConditions.join('|')); // Join conditions using "|"
      }

      // Convert the query params to a string
      const queryString = queryParams.toString();

      const response = await axiosInstance.get(`/students?${queryString}`, {
        params
      });
      setStudents(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updatedStatus = status ? '1' : '0';
      await axiosInstance.patch(`/students/${id}`, { status: updatedStatus });
      toast({
        title: 'Record updated successfully',
        className: 'bg-supperagent border-none text-white'
      });
      fetchData(currentPage, entriesPerPage, filters); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
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
        <Button className="bg-supperagent text-white hover:bg-supperagent/90">
          <Link to="new">New Student</Link>
        </Button>
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
        <div className="space-y-2 rounded-md bg-white p-4 shadow-2xl">
          <StudentsTable
            students={students}
            handleStatusChange={handleStatusChange}
          />

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
  );
}
