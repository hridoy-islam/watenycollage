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
import { ArrowLeft, FileText, Pen, Trash2, File, Plus } from 'lucide-react';
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
  const [allTeacherCourses, setAllTeacherCourses] = useState([]);
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
        termName: item.courseTermId?.name,
        courseTermId: item.courseTermId?._id || item.courseTermId || '',
        groupName: item.groupId?.groupName || item.groupId?.name || '-',
        groupId: item.groupId?._id || item.groupId || '',
        teacherId: item.teacherId
      }));

      setAllTeacherCourses(formattedCourses);
      setTeacherCourses(formattedCourses);
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

  const searchAndActions = (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Search courses by name..."
        value={searchTerm}
        onChange={handleSearch}
        className="h-8 max-w-[250px]"
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {user.role === 'admin' && !initialLoading && (
          <AddCourseDialog onAddCourses={handleCoursesAdded} />
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="text-xs">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div>
              <CardTitle className="text-2xl font-bold">
                {teacher?.name || 'Teacher'}'s Courses
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="pb-4">
              {searchAndActions}
            </div>
            {initialLoading ? (
              <div className="flex items-center justify-center py-12">
                <BlinkingDots />
              </div>
            ) : teacherCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  No courses assigned
                </h3>
                <p className="mb-4 text-gray-500">
                  No courses have been assigned to this teacher yet.
                </p>
              </div>
            ) : (
              <>
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Course Code</TableHead>
                    <TableHead className="text-xs">Course Name</TableHead>
                    <TableHead className="text-xs">Course Term</TableHead>
                    <TableHead className="text-xs">Group</TableHead>
                    <TableHead className="w-32 text-right text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherCourses.map((course) => (
                    <TableRow key={course._id} className="hover:bg-gray-50">
                      <TableCell className="text-xs font-medium">
                        {course?.courseCode || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
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
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {course?.termName || course?.courseTermId?.name || '-'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {course?.groupName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-row items-center justify-end gap-2">
                          <TooltipProvider>
                            {user.role === 'teacher' && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="flex items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
                                      onClick={() =>
                                        handleDocument(course.courseId)
                                      }
                                    >
                                      <File className="h-4 w-4" />
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
                                      variant="default"
                                      size="sm"
                                      className="flex items-center gap-2 bg-watney text-xs text-white hover:bg-watney/90"
                                      onClick={() => handleUnit(course.courseId)}
                                    >
                                      <FileText className="h-4 w-4" />
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
                                          variant="destructive"
                                          size="sm"
                                          className="flex items-center gap-2 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteCourse(course);
                                            setAlertOpen(true);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
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
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-2">
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
    </>
  );
};

export default TeacherDetailsPage;
