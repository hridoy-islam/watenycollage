import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Pen, Trash2, File } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useSelector } from 'react-redux';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import AddCourseDialog from './components/AddCourseDialog ';

const TeacherDetailsPage = () => {
  const { id } = useParams();
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [allTeacherCourses, setAllTeacherCourses] = useState([]); // ✅ For local search
  const [teacher, setTeacher] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const [editingCourse, setEditingCourse] = useState(null);

  // Fetch teacher details
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await axiosInstance.get(`/users/${id}`);
        setTeacher(response?.data?.data || {});
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        toast({
          title: 'Failed to fetch teacher details',
          description: error?.response?.data?.message || 'Something went wrong',
          className: 'bg-red-500 border-none text-white'
        });
      }
    };
    fetchTeacherData();
  }, [id]);

  // Fetch teacher courses
  const fetchData = async (page, limit) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/teacher-courses`, {
        params: {
          teacherId: id,
          page,
          limit
        }
      });

      const result = response?.data?.data?.result || [];
      const formattedCourses = result.map((item) => ({
        _id: item._id,
        courseId: item.courseId?._id,
        name: item.courseId?.name || 'N/A',
        courseCode: item.courseId?.courseCode || '—',
        status: item.courseId?.status,
        termName: item.termId?.termName,
        teacherId: item.teacherId
      }));

      setAllTeacherCourses(formattedCourses); // ✅ Store full list
      setTeacherCourses(formattedCourses); // Initial display
      setTotalPages(response?.data?.data?.meta?.totalPage || 1);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Failed to fetch courses',
        description: error?.response?.data?.message || 'Something went wrong',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [id, currentPage, entriesPerPage]);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
  };

  // ✅ Local search by course name
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setTeacherCourses(allTeacherCourses);
    } else {
      const filtered = allTeacherCourses.filter((course) =>
        course.name.toLowerCase().includes(value.toLowerCase())
      );
      setTeacherCourses(filtered);
    }
  };

  // ✅ Local add with correct _id
  const handleCoursesAdded = () => {
    setEditingCourse(null);
    fetchData(currentPage, entriesPerPage);
  };
  const handleDelete = async () => {
    if (!deleteCourse) return;

    try {
      await axiosInstance.delete(`/teacher-courses/${deleteCourse._id}`);

      setTeacherCourses((prev) =>
        prev.filter((item) => item._id !== deleteCourse._id)
      );
      setAllTeacherCourses((prev) =>
        prev.filter((item) => item._id !== deleteCourse._id)
      );

      toast({
        title: `"${deleteCourse.name}" has been unassigned.`,
        className: 'bg-watney border-none text-white'
      });
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to delete course',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setDeleteCourse(null);
      setAlertOpen(false);
    }
  };

  const handleUnit = (course) => {
    navigate(`/dashboard/courses/${course}/unit`);
  };

  const handleDocument = (course) => {
    navigate(`/dashboard/courses/course-document/${course}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'URL copied to clipboard',
          className: 'bg-watney border-none text-white'
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Failed to copy URL',
          className: 'bg-red-500 border-none text-white'
        });
      }
    );
  };

  return (
    <div className="rounded-lg bg-white p-6">
      {/* Teacher Info */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {teacher?.name || ''}'s Course List
        </h1>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {/* Search & Add Course */}
      <div className="my-4 flex w-full flex-row items-center justify-between pb-4">
        <Input
          placeholder="Search courses by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-xs"
        />
        {user.role === 'admin' && (
          <AddCourseDialog onAddCourses={handleCoursesAdded} />
        )}
      </div>

      {/* Courses Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Term Name</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {initialLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <BlinkingDots size="large" color="bg-watney" />
                </TableCell>
              </TableRow>
            ) : teacherCourses.length > 0 ? (
              teacherCourses.map((course) => (
                <TableRow key={course._id} className="hover:bg-gray-50">
                  {/* Course Code */}
                  <TableCell className="items-center font-medium">
                    <div className="flex items-center">
                      {course?.courseCode ? (
                        <span className="text-md">{course.courseCode}</span>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>

                  {/* Course Name + Copy Link */}
                  <TableCell className="flex items-center gap-2">
                    <span>{course.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border-none bg-blue-100 text-blue-600 hover:bg-blue-200"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/courses/apply/${course.courseId}`
                        )
                      }
                      title="Copy application link"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </Button>
                  </TableCell>

                  <TableCell className=" items-center ">
                    {course?.termName}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-row items-center justify-end gap-2">
                      <TooltipProvider>
                        {user.role === 'teacher' && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex border-none bg-watney text-white hover:bg-watney/90"
                                  size="sm"
                                  onClick={() =>
                                    handleDocument(course.courseId)
                                  }
                                >
                                  <File className="mr-2 h-4 w-4" />
                                  Document
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Course Document</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex border-none bg-watney text-white hover:bg-watney/90"
                                  size="sm"
                                  onClick={() => handleUnit(course.courseId)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Units
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Units</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}

                        {user.role === 'admin' && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AddCourseDialog
                                  onAddCourses={handleCoursesAdded}
                                  editCourse={course}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit course assignment</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialog
                                  open={
                                    alertOpen &&
                                    deleteCourse?._id === course._id
                                  }
                                  onOpenChange={(open) => {
                                    if (!open) setDeleteCourse(null);
                                    setAlertOpen(open);
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="border-none bg-destructive text-white hover:bg-destructive/90"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteCourse(course);
                                        setAlertOpen(true);
                                      }}
                                    >
                                      <Trash2 className=" h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. Delete "
                                        {deleteCourse?.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-white hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete course</p>
                              </TooltipContent>
                            </Tooltip>
                          </>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No courses assigned
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (only shown when not searching) */}
      {!searchTerm && teacherCourses.length > 10 && (
        <div className="mt-4">
          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherDetailsPage;
