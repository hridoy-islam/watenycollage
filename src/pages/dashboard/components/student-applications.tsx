'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MoveLeft, Search } from 'lucide-react';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';

interface StudentApplication {
  _id: string;
  studentId?: {
    name?: string;
    email?: string;
    title?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
  };
  courseId?: { name?: string };
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const res = await axiosInstance.get('/application-course', {
        params: { page, limit }
      });
      const data = res.data.data.result || [];
      setApplications(data);
      setFilteredApplications(data); // Initially show all
      setTotalPages(res.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Error fetching student applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  // Combine full name parts into one searchable string
  const getStudentName = (student: StudentApplication['studentId']) => {
    return `${student?.title || ''} ${student?.firstName || ''} ${
      student?.initial || ''
    } ${student?.lastName || ''}`.toLowerCase();
  };

  // Handle Search Button Click
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredApplications(applications); // Reset if empty
      return;
    }

    const query = searchQuery.toLowerCase();

    const results = applications.filter((app) => {
      const studentName = getStudentName(app.studentId);
      const email = app.studentId?.email?.toLowerCase() || '';
      const course = app.courseId?.name?.toLowerCase() || '';

      return (
        studentName.includes(query) ||
        email.includes(query) ||
        course.includes(query)
      );
    });

    setFilteredApplications(results);
  };

 return (
    <div className="space-y-6">
      {/* Header with Search & Back Button */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row flex-nowrap items-center gap-4">
          <h2 className="text-xl font-bold whitespace-nowrap">Student Applications</h2>
          <div className="flex flex-row items-center gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px] h-8"
              placeholder="Search by Student name, email, course"
            />
            <Button
              size="sm"
              className="bg-watney w-[100px] text-white hover:bg-watney"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Unified Table Container */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-medium">
                      {app.studentId?.title} {app.studentId?.firstName}{' '}
                      {app.studentId?.initial} {app.studentId?.lastName}
                    </TableCell>
                    <TableCell>{app.studentId?.email ?? 'N/A'}</TableCell>
                    <TableCell>{app.courseId?.name ?? 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        className="bg-watney hover:bg-watney/90 text-white border-none"
                        size="icon"
                        onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <DataTablePagination
              pageSize={entriesPerPage}
              setPageSize={setEntriesPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}