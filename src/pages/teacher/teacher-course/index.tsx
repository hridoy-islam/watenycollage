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
import { ArrowLeft, Trash2 } from 'lucide-react';
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
import AddCourseDialog from './components/AddCourseDialog ';
import { useSelector } from 'react-redux';

const TeacherDetailsPage = () => {
  const { id } = useParams();
  const [teacherCourses, setTeacherCourses] = useState([]);
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
  const fetchData = async (page, limit, search = '') => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/teacher-courses`, {
        params: {
          teacherId: id,
          page,
          limit,
          ...(search ? { searchTerm: search } : {})
        }
      });

      const result = response?.data?.data?.result || [];
      const formattedCourses = result.map((item) => ({
        _id: item._id,
        courseId: item.courseId?._id,
        name: item.courseId?.name || 'N/A',
        courseCode: item.courseId?.courseCode || '—',
        status: item.courseId?.status,
        teacherId: item.teacherId
      }));

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
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [id, currentPage, entriesPerPage]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // reset to first page on new search
    fetchData(1, entriesPerPage, value);
  };

  // ✅ Local add with correct _id
  const handleCoursesAdded = () => {
    fetchData(currentPage, entriesPerPage);
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;

    try {
      await axiosInstance.delete(`/teacher-courses/${deleteCourse._id}`);

      setTeacherCourses((prev) =>
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

  return (
    <div className="rounded-lg bg-white p-6">
      {/* Teacher Info */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {teacher?.name || 'Teacher Details'}
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
      <div className="my-4 flex w-full flex-row justify-between pb-4">
        {/* <Input
          type="text"
          placeholder="Search by course name..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-1/3"
        /> */}

        {user.role === 'admin' && (
          <AddCourseDialog onAddCourses={handleCoursesAdded} />
        )}
      </div>

      {/* Courses Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Course Code</TableHead>
              {user.role === 'admin' && (
                <TableHead className="text-right">Action</TableHead>
              )}
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
                <TableRow
                  key={course._id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.courseCode}</TableCell>
                  {user.role === 'admin' && (
                    <TableCell className="flex justify-end">
                      <AlertDialog
                        open={alertOpen && deleteCourse?._id === course._id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteCourse(null);
                          setAlertOpen(open);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-none bg-red-500 text-white hover:bg-red-600"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCourse(course);
                              setAlertOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Delete "
                              {deleteCourse?.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
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

      {teacherCourses.length > 10 && (
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
      {/* Pagination */}
    </div>
  );
};

export default TeacherDetailsPage;
