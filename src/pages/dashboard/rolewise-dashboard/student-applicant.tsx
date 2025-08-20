
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
import moment from 'moment';
import { useSelector } from 'react-redux';
import Loader from '@/components/shared/loader';

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
    const [applications, setApplications] = useState<Application[]>([]);
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
      const appRes = await axiosInstance.get(
        `/application-course?studentId=${user._id}`,
        {
          params: { page, limit }
        }
      );
      const appData = appRes.data?.data || {};
      const applicationsList = Array.isArray(appData.result)
        ? appData.result
        : [];
      setTotalApplication(appData.meta?.total || 0);

      const appliedCourseIds = new Set(
        applicationsList.map((app: Application) => app.courseId?._id)
      );

      setApplications(applicationsList);
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
      <CardDescription>Track the status of your course applications</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader />
        </div>
      ) : (
        <>
          {/* Desktop/Tablet View: Table */}
          <div className="block max-md:hidden overflow-x-auto rounded-md border md:overflow-x-visible">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell className="py-3 font-medium sm:py-4">
                        {application?.courseId?.name || 'Unnamed Course'}
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        {application?.intakeId?.termName || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        {moment(application.createdAt).format('MM-DD-YYYY')}
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        <Badge
                          className={`text-white ${
                            application.status === 'applied'
                              ? 'bg-blue-500'
                              : application.status === 'cancelled'
                                ? 'bg-red-500'
                                : application.status === 'approved'
                                  ? 'bg-green-500'
                                  : 'bg-yellow-500'
                          }`}
                        >
                          {application.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right sm:py-4">
                        {application.status !== 'cancelled' &&
                          application.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteModal(application._id)}
                              className="text-white hover:bg-destructive/90"
                            >
                              Cancel
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-gray-500">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile-First Stacked Cards (Alternative Layout) */}
          <div className="space-y-4 md:hidden">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Course Name</h3>
                      <p className="text-sm text-gray-600">
                        {application?.courseId?.name || 'Unnamed Course'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Intake</h3>
                      <p className="text-sm text-gray-600">
                        {application?.intakeId?.termName || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Application Date</h3>
                      <p className="text-sm text-gray-600">
                        {moment(application.createdAt).format('MM-DD-YYYY')}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">Status</h3>
                      <Badge
                        className={`text-white text-xs ${
                          application.status === 'applied'
                            ? 'bg-blue-500'
                            : application.status === 'cancelled'
                              ? 'bg-red-500'
                              : application.status === 'approved'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                        }`}
                      >
                        {application.status || 'N/A'}
                      </Badge>
                    </div>

                    {application.status !== 'cancelled' &&
                      application.status !== 'approved' && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full text-white hover:bg-destructive/90"
                            onClick={() => openDeleteModal(application._id)}
                          >
                            Cancel Application
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Pagination */}
          {applications.length > 0 && (
            <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row scale-75" >
             
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

  {/* Confirmation Modal */}
  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you sure?</DialogTitle>
      </DialogHeader>
      <p className="text-gray-600">Do you want to cancel this application? This action cannot be undone.</p>
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
