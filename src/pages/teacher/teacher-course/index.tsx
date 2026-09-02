import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft,
  FileText,
  File,
  Copy
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

const TeacherDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state: any) => state.auth);

  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [allTeacherCourses, setAllTeacherCourses] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  /**
   * Fetch teacher information
   */
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);

        setTeacher(response?.data?.data || {});
      } catch (error: any) {
        console.error('Error fetching teacher data:', error);

        toast({
          title: 'Failed to fetch teacher details',
          description:
            error?.response?.data?.message ||
            'Something went wrong',
          className: 'border-none bg-red-500 text-white'
        });
      }
    };

    if (id) {
      fetchTeacherData();
    }
  }, [id]);

  /**
   * Fetch teacher courses
   */
  const fetchData = async (page: number, limit: number) => {
    try {
      setInitialLoading(true);

      const response = await axiosInstance.get('/teacher-courses', {
        params: {
          teacherId: id,
          page,
          limit
        }
      });

      const result = response?.data?.data?.result || [];

    
      const formattedCourses = result.map((item: any) => ({
        _id: item?._id || '',

        // Course
        courseId: item?.courseId?._id || '',
        name: item?.courseId?.name || 'N/A',
        courseCode: item?.courseId?.courseCode || '—',
        status: item?.courseId?.status || 'inactive',

        // Intake
        intakeId: item?.courseId?.intakeId?._id || '',
        intakeName: item?.courseId?.intakeId?.termName || '-',

        // Course Term
        courseTermId: item?.courseTermId?._id || '',
        termName: item?.courseTermId?.name || '-',
        termYear: item?.courseTermId?.year || '-',

        // Group
        groupId: item?.groupId?._id || '',
        groupName: item?.groupId?.name || '-',

        // Teacher
        teacherId: item?.teacherId?._id || '',
        teacherName: item?.teacherId?.name || '',
        teacherEmail: item?.teacherId?.email || ''
      }));

      setAllTeacherCourses(formattedCourses);
      setTeacherCourses(formattedCourses);

      setTotalPages(
        response?.data?.data?.meta?.totalPage || 1
      );
    } catch (error: any) {
      console.error('Error fetching courses:', error);

      toast({
        title: 'Failed to fetch courses',
        description:
          error?.response?.data?.message ||
          'Something went wrong',
        className: 'border-none bg-red-500 text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Fetch courses whenever pagination changes
   */
  useEffect(() => {
    if (id) {
      fetchData(currentPage, entriesPerPage);
    }
  }, [id, currentPage, entriesPerPage]);

  /**
   * Search courses
   */
  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setSearchTerm(value);

    if (!value.trim()) {
      setTeacherCourses(allTeacherCourses);
      return;
    }

    const searchValue = value.toLowerCase();

    const filtered = allTeacherCourses.filter(
      (course) =>
        course?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        course?.courseCode
          ?.toLowerCase()
          .includes(searchValue) ||
        course?.intakeName
          ?.toLowerCase()
          .includes(searchValue) ||
        course?.termName
          ?.toLowerCase()
          .includes(searchValue) ||
        course?.groupName
          ?.toLowerCase()
          .includes(searchValue)
    );

    setTeacherCourses(filtered);
  };

  /**
   * Copy application URL
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      toast({
        title: 'URL copied to clipboard',
        className: 'border-none bg-watney text-white'
      });
    } catch (error) {
      console.error('Could not copy text:', error);

      toast({
        title: 'Failed to copy URL',
        className: 'border-none bg-red-500 text-white'
      });
    }
  };

  /**
   * Navigate to course units
   *
   * Passing termId and groupId is useful because
   * the same course can have multiple terms/groups.
   */
  const handleUnit = (course: any) => {
    navigate(
      `/dashboard/courses/${course.courseId}/unit?termId=${course.courseTermId}&groupId=${course.groupId}`
    );
  };


  const handleDocument = (course: any) => {
    navigate(
      `/dashboard/courses/course-document/${course.courseId}?termId=${course.courseTermId}&groupId=${course.groupId}`
    );
  };

  const searchAndActions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <Input
        placeholder="Search courses..."
        value={searchTerm}
        onChange={handleSearch}
        className="h-9 w-full sm:max-w-[280px]"
      />

      
    </div>
  );

  return (
    <div className="text-xs">
      <Card>
        {/* Header */}
        <CardHeader className="pb-5">
          <div className="flex flex-col md:flex-row justify-between gap-2">
            <CardTitle className="text-2xl font-bold ">
              {user?.name || 'Teacher'}'s Assigned Courses
            </CardTitle>
 <Button
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
           
          </div>
        </CardHeader>

        <CardContent>
          {/* Search + Back */}
          <div className="pb-4">
            {searchAndActions}
          </div>

          {/* Loading */}
          {initialLoading ? (
            <div className="flex items-center justify-center py-12">
              <BlinkingDots />
            </div>
          ) : teacherCourses.length === 0 ? (
            /**
             * Empty state
             */
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mb-1 text-lg font-semibold ">
                {searchTerm
                  ? 'No courses found'
                  : 'No courses assigned'}
              </h3>

              <p className="max-w-md text-sm ">
                {searchTerm
                  ? 'Try searching with a different course name, code, intake, term, or group.'
                  : 'No courses have been assigned to this teacher yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto ">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="whitespace-nowrap text-xs font-semibold">
                        Course Code
                      </TableHead>

                      <TableHead className="whitespace-nowrap text-xs font-semibold">
                        Course Name
                      </TableHead>

                      <TableHead className="whitespace-nowrap text-xs font-semibold">
                        Intake
                      </TableHead>

                      <TableHead className="whitespace-nowrap text-xs font-semibold">
                        Course Term
                      </TableHead>

                      <TableHead className="whitespace-nowrap text-xs font-semibold">
                        Group
                      </TableHead>

                      {/* <TableHead className="w-44 whitespace-nowrap text-right text-xs font-semibold">
                        Actions
                      </TableHead> */}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {teacherCourses.map((course) => (
                      <TableRow
                        key={course._id}
                        className="hover:bg-gray-50"
                      >
                        {/* Course Code */}
                        <TableCell className="whitespace-nowrap text-xs font-medium ">
                          {course?.courseCode || '-'}
                        </TableCell>

                        {/* Course Name */}
                        <TableCell className="min-w-[220px] text-xs">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium ">
                                {course?.name || '-'}
                              </p>
                            </div>

                            {/* Copy Application Link */}
                            {course?.courseId && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0 border-none bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                      onClick={() =>
                                        copyToClipboard(
                                          `${window.location.origin}/courses/apply/${course.courseId}`
                                        )
                                      }
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    <p>
                                      Copy application link
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>

                        {/* Intake */}
                        <TableCell className="whitespace-nowrap text-xs">
                          <span className="">
                            {course?.intakeName || '-'}
                          </span>
                        </TableCell>

                        {/* Course Term */}
                        <TableCell className="whitespace-nowrap text-xs">
                          <div className="flex flex-col">
                            <span className="font-medium ">
                              {course?.termName || '-'}
                            </span>

                          {course?.termYear && (
  <span className="text-[11px]">
    {course.termYear.charAt(0).toUpperCase() +
      course.termYear.slice(1)}
  </span>
)}
                          </div>
                        </TableCell>

                        {/* Group */}
                        <TableCell className="whitespace-nowrap text-xs">
                          <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-1 font-medium ">
                            {course?.groupName || '-'}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        {/* <TableCell className="text-right">
                          {user?.role === 'teacher' ? (
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="flex items-center gap-1.5 bg-watney text-xs text-white hover:bg-watney/90"
                                      onClick={() =>
                                        handleDocument(course)
                                      }
                                    >
                                      <File className="h-3.5 w-3.5" />
                                      Document
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    <p>
                                      Course Documents
                                    </p>
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="flex items-center gap-1.5 bg-watney text-xs text-white hover:bg-watney/90"
                                      onClick={() =>
                                        handleUnit(course)
                                      }
                                    >
                                      <FileText className="h-3.5 w-3.5" />
                                      Units
                                    </Button>
                                  </TooltipTrigger>

                                  <TooltipContent>
                                    <p>Course Units</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No actions
                            </span>
                          )}
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDetailsPage;