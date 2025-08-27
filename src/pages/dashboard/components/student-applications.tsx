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
import { Eye, Mail, MoveLeft, Search } from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Select from 'react-select';
import { Badge } from '@/components/ui/badge';

interface StudentApplication {
  _id: string;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
    title?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
  };
  courseId?: {
    _id?: string;
    name?: string;
  };
}

interface CourseOption {
  value: string;
  label: string;
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    StudentApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [terms, setTerms] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<CourseOption | null>(null);

  const fetchData = async (
    page = 1,
    limit = 10,
    courseId?: string,
    intakeId?: string
  ) => {
    try {
      const params: {
        page: number;
        limit: number;
        courseId?: string;
        intakeId?: string;
      } = {
        page,
        limit
      };

      if (courseId) {
        params.courseId = courseId;
      }
      if (intakeId) {
        params.intakeId = intakeId;
      }

      const res = await axiosInstance.get('/application-course', {
        params
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

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get('/courses?status=1&limit=all');
      const data = res.data.data.result || [];
      const courseOptions = data.map((course: any) => ({
        value: course._id,
        label: course.name
      }));
      setCourses(courseOptions);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchTerms = async () => {
    try {
      const res = await axiosInstance.get('/terms?status=1&limit=all');
      const data = res.data.data.result || [];
      const termOptions = data.map((term: any) => ({
        value: term._id,
        label: term.termName
      }));
      setTerms(termOptions);
    } catch (error) {
      console.error('Error fetching Terms:', error);
    }
  };

  useEffect(() => {
    fetchData(
      currentPage,
      entriesPerPage,
      selectedCourse?.value,
      selectedTerm?.value
    );
    fetchCourses();
    fetchTerms();
  }, [currentPage, entriesPerPage, selectedCourse, selectedTerm]);

  const navigate = useNavigate();

  // Combine full name parts into one searchable string
  const getStudentName = (student: StudentApplication['studentId']) => {
    return `${student?.title || ''} ${student?.firstName || ''} ${
      student?.initial || ''
    } ${student?.lastName || ''}`.toLowerCase();
  };

  // Handle course filter change
  const handleCourseChange = (selectedOption: CourseOption | null) => {
    setSelectedCourse(selectedOption);
    setCurrentPage(1);
  };
  const handleTermChange = (selectedOption: CourseOption | null) => {
    setSelectedTerm(selectedOption);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search & Back Button */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row flex-nowrap items-center gap-4">
          <h2 className="whitespace-nowrap text-xl font-bold">
            Student Applications
          </h2>
          {/* <div className="flex flex-row items-center gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[300px]"
              placeholder="Search by Student name, email, course"
            />
            <Button
              size="sm"
              className="w-[100px] bg-watney text-white hover:bg-watney"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div> */}
          <div className="w-[250px]">
            <Select
              options={courses}
              value={selectedCourse}
              onChange={handleCourseChange}
              placeholder="Filter student by course"
              isClearable
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '32px',
                  minHeight: '32px'
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: '32px',
                  padding: '0 8px'
                }),
                input: (base) => ({
                  ...base,
                  margin: '0px',
                  paddingBottom: '0px',
                  paddingTop: '0px'
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: '32px'
                })
              }}
            />
          </div>
          <div className="w-[250px]">
            <Select
              options={terms}
              value={selectedTerm}
              onChange={handleTermChange}
              placeholder="Filter student by course"
              isClearable
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  height: '32px',
                  minHeight: '32px'
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: '32px',
                  padding: '0 8px'
                }),
                input: (base) => ({
                  ...base,
                  margin: '0px',
                  paddingBottom: '0px',
                  paddingTop: '0px'
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: '32px'
                })
              }}
            />
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
        ) : filteredApplications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Type</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-medium cursor-pointer " onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}`
                          )
                        }>
                      {app.studentId?.title} {app.studentId?.firstName}{' '}
                      {app.studentId?.initial} {app.studentId?.lastName}{' '}
                    </TableCell>
                    <TableCell className='cursor-pointer' onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}`
                          )
                        }>
                      <Badge className="bg-watney text-white hover:bg-watney">
                        {app.studentId?.studentType === 'eu'
                          ? 'Home'
                          : app.studentId?.studentType
                              ?.charAt(0)
                              .toUpperCase() +
                            app.studentId?.studentType?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className='cursor-pointer' onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}`
                          )
                        }>{app.studentId?.email ?? 'N/A'}</TableCell>
                    <TableCell className='cursor-pointer' onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}`
                          )
                        }>{app.courseId?.name ?? 'N/A'}</TableCell>
                    <TableCell className="text-center flex flex-row gap-2">
                      <Button
                        variant="ghost"
                        className="border-none bg-watney text-white hover:bg-watney/90"
                        size="icon"
                        onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId?._id}/${app?.courseId?._id}/mails`
                          )
                        }
                      >
                        <Mail  className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="border-none bg-watney text-white hover:bg-watney/90"
                        size="icon"
                        onClick={() =>
                          navigate(
                            `/dashboard/student-application/${app.studentId}`
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
