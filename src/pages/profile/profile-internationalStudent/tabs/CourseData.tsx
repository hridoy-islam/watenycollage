import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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

export default function CourseData({ user }: StudentDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const { toast } = useToast();
  const [totalApplication, setTotalApplication] = useState(0);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      // Fetch applications
      const appRes = await axiosInstance.get('/application-course', {
        params: { page, limit }
      });
      const appData = appRes.data?.data || {};
      const applicationsList = Array.isArray(appData.result)
        ? appData.result
        : [];
      setTotalApplication(appData.meta?.total || 0);

      // Fetch courses
      const courseRes = await axiosInstance.get('/courses', {
        params: { page, limit }
      });
      const courseData = courseRes.data?.data || {};
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

      setApplications(applicationsList);
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

  const openDeleteModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplicationId(null);
  };

  const handleDelete = async () => {
    if (!selectedApplicationId) return;

    try {
      const response = await axiosInstance.patch(
        `/application-course/${selectedApplicationId}`,
        {
          status: 'cancelled'
        }
      );

      if (response.status === 200) {
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === selectedApplicationId
              ? { ...app, status: 'cancelled' }
              : app
          )
        );
        toast({
          title: 'Your application has been Cancelled.'
        });
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'There was an error to withdraw the application.',
        className: 'bg-destructive text-white boder-none'
      });
    }
  };

  return (
    <div className="flex-1 space-y-4">
      {/* Applied Courses Tab */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Your Course Applications</CardTitle>
          <CardDescription>
            Track the status of your course applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell className="py-4 font-medium">
                      {application?.courseId?.name || 'Unnamed Course'}
                    </TableCell>
                    <TableCell className="py-4">
                      {application?.intakeId?.termName || 'N/A'}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={`text-white ${
                          application?.status === 'applied'
                            ? 'bg-blue-500'
                            : application?.status === 'cancelled'
                              ? 'bg-red-500'
                              : application?.status === 'approved'
                                ? 'bg-green-500'
                                : 'bg-gray-500'
                        }`}
                      >
                        {application?.status || 'N/A'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {application?.status !== 'cancelled' && (
                        <Button
                          onClick={() => openDeleteModal(application._id)}
                          className="border-none bg-destructive text-white hover:bg-destructive/90"
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {applications.length > 0 && (
            <DataTablePagination
              pageSize={entriesPerPage}
              setPageSize={setEntriesPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Do you want to cancel this application? This action cannot be
            undone.
          </p>
          <div className="mt-4 flex justify-end space-x-4">
            <Button onClick={closeModal} variant="outline">
              Close
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Yes, Cancel Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
