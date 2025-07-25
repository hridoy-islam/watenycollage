// import { useEffect, useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import { GraduationCap, BookOpen } from 'lucide-react';
// import axiosInstance from '@/lib/axios';
// import { DataTablePagination } from '@/components/shared/data-table-pagination';
// import { useToast } from '@/components/ui/use-toast';
// import { useNavigate } from 'react-router-dom';
// import Loader from '@/components/shared/loader';

// interface Course {
//   _id: string;
//   name: string;
// }

// interface Application {
//   _id: string;
//   courseId: Course;
//   intakeId?: {
//     termName: string;
//   };
//   status: string;
// }

// interface StudentDashboardProps {
//   user: {
//     _id: string;
//     name: string;
//     role: string;
//   };
// }

// export function StudentDashboard({ user }: StudentDashboardProps) {
//   const [allCourses, setAllCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);

//   const fetchData = async (page = 1, limit = 10) => {
//     try {
//       const appRes = await axiosInstance.get(
//         `/application-course?studentId=${user._id}`
//       );
//       const appData = appRes.data.data || {};
//       const applicationsList = Array.isArray(appData.result)
//         ? appData.result
//         : [];

//       const courseRes = await axiosInstance.get('/courses', {
//         params: { page, limit }
//       });
//       const courseData = courseRes.data.data || {};
//       const coursesList = Array.isArray(courseData.result)
//         ? courseData.result
//         : [];

//       setTotalPages(appData.meta?.totalPage || 1);

//       const appliedCourseIds = new Set(
//         applicationsList.map((app: Application) => app.courseId?._id)
//       );

//       const filteredCourses = coursesList.filter(
//         (course: Course) => !appliedCourseIds.has(course._id)
//       );

//       setAllCourses(filteredCourses);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData(currentPage, entriesPerPage);
//   }, [currentPage, entriesPerPage]);
//   const navigate = useNavigate();

//   const handleApply = async (courseId: string) => {
//     navigate(`/dashboard/course-application/${courseId}`);
//   };

//   return (
//     <div className="flex-1 space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Available Courses</CardTitle>
//           <CardDescription>Browse and apply to new courses</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex justify-center py-6">
//               <Loader />
//             </div>
//           ) : allCourses.length > 0 ? (
//             <>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Course Title</TableHead>
//                     <TableHead className="text-right">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {allCourses.map((course) => (
//                     <TableRow key={course._id}>
//                       <TableCell className="font-medium">
//                         {course.name}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button
//                           size="sm"
//                           className="bg-watney text-white hover:bg-watney/90"
//                           onClick={() => handleApply(course._id)}
//                         >
//                           Take This Course
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {/* Pagination only shown if there are courses */}
//               <DataTablePagination
//                 pageSize={entriesPerPage}
//                 setPageSize={setEntriesPerPage}
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </>
//           ) : (
//             <div className="py-6 text-center">
//               No more courses available to apply. Please check again later.
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }







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
          <CardDescription>
            Track the status of your course applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
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
                        <TableCell>
                          {moment(application?.createAt).format('MM-DD-YYYY')}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`text-white ${
                              application.status === 'applied'
                                ? 'bg-blue-500'
                                : application.status === 'cancelled'
                                  ? 'bg-red-500'
                                  : application.status === 'approved'
                                    ? 'bg-green-500'
                                    : 'bg-green-500'
                            }`}
                          >
                            {application.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {application.status !== 'cancelled' &&
                            application.status !== 'approved' && (
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
                      <TableCell colSpan={5} className="py-6 text-center">
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
