import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { GraduationCap, BookOpen } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  name: string;
}

interface Application {
  _id: string;
  courseId: Course;
  intakeId?: {
    termName: string;
  };
  status: string;
}

interface StudentDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const appRes = await axiosInstance.get(`/application-course?studentId=${user._id}`);
      const appData = appRes.data.data || {};
      const applicationsList = Array.isArray(appData.result)
        ? appData.result
        : [];

      const courseRes = await axiosInstance.get('/courses', {
        params: { page, limit }
      });
      const courseData = courseRes.data.data || {};
      const coursesList = Array.isArray(courseData.result)
        ? courseData.result
        : [];

      setTotalPages(appData.meta?.totalPage || 1);

      const appliedCourseIds = new Set(
        applicationsList.map((app: Application) => app.courseId?._id)
      );

      const filteredCourses = coursesList.filter(
        (course: Course) => !appliedCourseIds.has(course._id)
      );

      setAllCourses(filteredCourses);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);
  const navigate = useNavigate();

  const handleApply = async (courseId: string) => {
    navigate(`/dashboard/course-application/${courseId}`);
  };

  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>Browse and apply to new courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCourses.length > 0 ? (
                allCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-watney text-white hover:bg-watney/90"
                        onClick={() => handleApply(course._id)}
                      >
                        Take This Course
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No available courses at the moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DataTablePagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
