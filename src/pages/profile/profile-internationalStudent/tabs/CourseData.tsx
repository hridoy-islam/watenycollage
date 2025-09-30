import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Trash } from 'lucide-react';
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

export default function CourseData() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const { toast } = useToast();
  const [totalApplication, setTotalApplication] = useState(0);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      // Fetch applications
      const appRes = await axiosInstance.get(
        `/application-course?studentId=${user._id}&status=approved`,
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


  return (
    <div className="flex-1 space-y-2">
      {/* Applied Courses Tab */}
      <Card className="shadow-none ">
        <CardHeader>
          <CardTitle>Your Courses </CardTitle>
          
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Intake</TableHead>
                    <TableHead>Application Date</TableHead>
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
                        <TableCell>
                          {moment(application?.createAt).format('MM-DD-YYYY')}
                        </TableCell>
                        
                        <TableCell className="text-right">
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/courses/${application.courseId._id}/unit`
                                  )
                                }
                                className="flex w-full flex-row items-center justify-center gap-2 bg-watney text-white hover:bg-watney/90"
                              >
                                <FileText className="h-4 w-4" />
                                View Details
                              </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {applications.length > 10 && (
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      
    </div>
  );
}
