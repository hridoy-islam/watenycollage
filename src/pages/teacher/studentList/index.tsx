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
import {
  Eye,
  FileIcon,
  FileX2,
  Mail,
  MoveLeft,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import Select from 'react-select';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import clsx from 'clsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useSelector } from 'react-redux';

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
    studentType?: string;
  };
  refId?: string;
  courseId?: {
    _id?: string;
    name?: string;
  };
  status?: 'applied' | 'approved' | 'cancelled';
}

interface CourseOption {
  value: string;
  label: string;
}

interface TeacherCourse {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    status: number;
    courseCode: string;
  };
  teacherId: string;
  termId: {
    _id: string;
    termName: string;
    status: number;
    createdAt: string;
    updatedAt: string;
  };
}

export default function TeacherStudentApplicationListPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    StudentApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [terms, setTerms] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<CourseOption | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const user = useSelector((state: any) => state.auth.user);

  const fetchTeacherCourses = async () => {
    try {
      const res = await axiosInstance.get(`/teacher-courses?teacherId=${user?._id}`);
      const data: TeacherCourse[] = res.data.data.result || [];
      
      // Extract unique courses from teacher's assigned courses
      const courseOptions: CourseOption[] = [];
      const courseIds = new Set();
      
      // Extract unique terms from teacher's assigned courses
      const termOptions: CourseOption[] = [];
      const termIds = new Set();
      
      data.forEach((teacherCourse: TeacherCourse) => {
        // Add course if not already added
        if (teacherCourse.courseId && !courseIds.has(teacherCourse.courseId._id)) {
          courseIds.add(teacherCourse.courseId._id);
          courseOptions.push({
            value: teacherCourse.courseId._id,
            label: teacherCourse.courseId.name
          });
        }
        
        // Add term if not already added
        if (teacherCourse.termId && !termIds.has(teacherCourse.termId._id)) {
          termIds.add(teacherCourse.termId._id);
          termOptions.push({
            value: teacherCourse.termId._id,
            label: teacherCourse.termId.termName
          });
        }
      });
      
      setCourses(courseOptions);
      setTerms(termOptions);
      
      return data;
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      return [];
    }
  };

  const fetchData = async (
    page = 1,
    limit = 10,
    courseId?: string,
    intakeId?: string,
    searchTerm = ''
  ) => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        courseId?: string;
        intakeId?: string;
        searchTerm?: string;
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
      if (searchTerm) {
        params.searchTerm = searchTerm;
      }

      const res = await axiosInstance.get(`/application-course/teacher/${user?._id}`, {
        params
      });
      const data = res.data.data.result || [];
      setApplications(data);
      setFilteredApplications(data);
      setTotalPages(res.data.data.meta.totalPage || 1);
    } catch (error) {
      console.error('Error fetching student applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch without filters
  useEffect(() => {
    const initializeData = async () => {
      await fetchTeacherCourses();
      fetchData(currentPage, entriesPerPage);
    };
    
    initializeData();
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  const handleCourseChange = (selectedOption: CourseOption | null) => {
    setSelectedCourse(selectedOption);
  };

  const handleTermChange = (selectedOption: CourseOption | null) => {
    setSelectedTerm(selectedOption);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(
      1,
      entriesPerPage,
      selectedCourse?.value,
      selectedTerm?.value,
      searchTerm
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'approved' | 'cancelled'
  ) => {
    // 1. Optimistically update UI immediately
    setApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
    );
    setFilteredApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, status } : app))
    );

    setUpdatingStatus(applicationId);

    try {
      // 2. Fire API call in background
      await axiosInstance.patch(`/application-course/${applicationId}`, {
        status
      });

      toast({
        title:
          status === 'approved'
            ? 'Application approved successfully!'
            : 'Application rejected successfully!',
        className: 'bg-watney text-white border-none'
      });
    } catch (error) {
      // 3. Rollback if request fails
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'applied' } : app
        )
      );
      setFilteredApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'applied' } : app
        )
      );
      toast({
        title: 'Failed to update application status.',
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-4 ">
      {/* Header with Search & Back Button */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row flex-nowrap items-center gap-4">
          <h2 className="whitespace-nowrap text-xl font-bold">
            Student Applications
          </h2>
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-row items-center gap-4">
        {/* Search by Student Name/Email */}
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search by student name, email"
            className="h-9 min-w-[400px] rounded-sm bg-white"
          />
        </div>

        {/* Course Filter */}
        <div className="w-[250px]">
          <Select
            options={courses}
            value={selectedCourse}
            onChange={handleCourseChange}
            placeholder="Filter by course"
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                height: '36px',
                minHeight: '36px'
              }),
              valueContainer: (base) => ({
                ...base,
                height: '36px',
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
                height: '36px'
              })
            }}
          />
        </div>

        {/* Term Filter */}
        <div className="w-[250px]">
          <Select
            options={terms}
            value={selectedTerm}
            onChange={handleTermChange}
            placeholder="Filter by term"
            isClearable
            className="text-sm"
            styles={{
              control: (base) => ({
                ...base,
                height: '36px',
                minHeight: '36px'
              }),
              valueContainer: (base) => ({
                ...base,
                height: '36px',
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
                height: '36px'
              })
            }}
          />
        </div>

        <Button
          onClick={handleSearch}
          size="sm"
          className="h-9 min-w-[100px] border-none bg-watney text-white hover:bg-watney/90"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
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
            {searchTerm || selectedCourse || selectedTerm
              ? 'No matching results found.'
              : 'No student applications found.'}
          </div>
        ) : (
          <>
            <Table className='text-xs'>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Type</TableHead>
                  {/* <TableHead>Email</TableHead> */}
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell
                      className="cursor-pointer font-medium"
                    >
                      {app?.refId || '-'}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer font-medium"
                    >
                      <div>

                      {app.studentId?.title} {app.studentId?.firstName}{' '}
                      {app.studentId?.initial} {app.studentId?.lastName}
                      </div>
                      <span className='text-[10px] text-gray-600'>

                       {app.studentId?.email ?? 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                    >
                      <Badge className="bg-watney text-white hover:bg-watney">
                        {app.studentId?.studentType === 'eu'
                          ? 'Home'
                          : app.studentId?.studentType
                              ?.charAt(0)
                              .toUpperCase() +
                            app.studentId?.studentType?.slice(1)}
                      </Badge>
                    </TableCell>
                    {/* <TableCell
                      className="cursor-pointer"
                    >
                      {app.studentId?.email ?? 'N/A'}
                    </TableCell> */}
                    <TableCell
                      className="cursor-pointer"
                    >
                      {app.courseId?.name ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={clsx(
                          'capitalize',
                          app?.status === 'applied' && 'bg-blue-500 text-white',
                          app?.status === 'approved' &&
                            'bg-green-500 text-white',
                          app?.status === 'cancelled' && 'bg-red-500 text-white'
                        )}
                      >
                        {app?.status === 'approved'
                          ? 'Enrolled'
                          : app?.status === 'cancelled'
                            ? 'Rejected'
                            : app?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            disabled={updatingStatus === app._id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="border-gray-300 bg-white text-black"
                        >
                          {/* Assignment */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/student-applications/${app?._id}/assignment/${app.studentId?._id}`
                              )
                            }
                          >
                            <FileIcon className="mr-2 h-4 w-4" />
                            Assignment
                          </DropdownMenuItem>

                          {/* Mail */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/student-application/${app.studentId?._id}/${app?._id}/mails`
                              )
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Mail
                          </DropdownMenuItem>

                          {user.role==='admin' && <>
                            {/* Applicant Details */}
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/dashboard/student-application/${app.studentId?._id}`
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Applicant Details
                            </DropdownMenuItem>

                            {/* Status-based actions */}
                            {app.status === 'applied' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateApplicationStatus(app._id, 'approved')
                                  }
                                  disabled={updatingStatus === app._id}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  Approve Application
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    updateApplicationStatus(app._id, 'cancelled')
                                  }
                                  disabled={updatingStatus === app._id}
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Reject Application
                                </DropdownMenuItem>
                              </>
                            )}

                            {app.status === 'approved' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'cancelled')
                                }
                                disabled={updatingStatus === app._id}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Reject Application
                              </DropdownMenuItem>
                            )}

                            {app.status === 'cancelled' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateApplicationStatus(app._id, 'approved')
                                }
                                disabled={updatingStatus === app._id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Approve Application
                              </DropdownMenuItem>
                            )}
                          </>}
                        </DropdownMenuContent>
                      </DropdownMenu>
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