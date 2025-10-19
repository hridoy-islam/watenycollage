import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import moment from 'moment';
import Loader from '@/components/shared/loader';
import { FileText, MessageSquare, Clock, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface Course {
  _id: string;
  name: string;
}

interface Application {
  _id: string;
  courseId: Course;
  intakeId?: { termName: string };
  status: string;
  createdAt: string;
  assignmentCount?: number;
}

interface UnitMaterial {
  _id: string;
  courseId: string;
  assignments: Array<{
    _id: string;
    type: string;
    title: string;
    fileUrl?: string;
    fileName?: string;
    content?: string;
    deadline?: Date;
  }>;
}

interface Assignment {
  _id: string;
  status: string;
  feedbacks: Array<{
    _id: string;
    seen: boolean;
    createdAt: string;
  }>;
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
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [pendingFeedbackCount, setPendingFeedbackCount] = useState(0);
  const { toast } = useToast();
  const [totalApplication, setTotalApplication] = useState(0);
  const navigate = useNavigate();


  // Optimized version that fetches all unit materials at once
  const fetchDataOptimized = async (page = 1, limit = 'all') => {
    try {
      setLoading(true);

      // Fetch all applications
      const appRes = await axiosInstance.get(
        `/application-course?studentId=${user._id}&limit=all`
      );
      
      const appData = appRes.data?.data || {};
      const applicationsData = Array.isArray(appData.result) ? appData.result : [];

      // Get all unique course IDs from applications
      const courseIds = applicationsData.map((app: Application) => app.courseId._id);
      // console.log('Course IDs to fetch:', courseIds);

      // Fetch unit materials for all courses at once
      const unitMaterialPromises = courseIds.map(courseId => 
        axiosInstance.get(`/unit-material?courseId=${courseId}&limit=all`)
      );

      const unitMaterialResponses = await Promise.allSettled(unitMaterialPromises);
      
      // Create a map of courseId to assignment count
      const courseAssignmentCounts: { [key: string]: number } = {};
      
      unitMaterialResponses.forEach((response, index) => {
        const courseId = courseIds[index];
        if (response.status === 'fulfilled') {
          const unitMaterials: UnitMaterial[] = response.value.data?.data?.result || [];
          let assignmentCount = 0;
          
          unitMaterials.forEach((unitMaterial: UnitMaterial) => {
            if (unitMaterial.assignments && Array.isArray(unitMaterial.assignments)) {
              assignmentCount += unitMaterial.assignments.length;
            }
          });
          
          courseAssignmentCounts[courseId] = assignmentCount;
          // console.log(`Course ${courseId} has ${assignmentCount} assignments`);
        } else {
          console.error(`Failed to fetch unit materials for course ${courseId}:`, response.reason);
          courseAssignmentCounts[courseId] = 0;
        }
      });

      // Add assignment counts to applications
      const applicationsWithCounts = applicationsData.map((application: Application) => ({
        ...application,
        assignmentCount: courseAssignmentCounts[application.courseId._id] || 0
      }));

      setApplications(applicationsWithCounts);
      setTotalApplication(appData.meta?.total || 0);
      setTotalPages(appData.meta?.totalPage || 1);

      // Fetch pending feedback count with proper filtering
      try {
        const pendingFeedbackRes = await axiosInstance.get(
          `/assignment?status=feedback_given&status=resubmission_required&status=completed&limit=all&studentId=${user._id}`
        );
        const pendingData: Assignment[] = pendingFeedbackRes.data?.data?.result || [];
        
        // console.log('Raw pending feedback data:', pendingData);
        // console.log('Total assignments before filtering:', pendingData.length);
        
        // Apply the same filtering logic as in the feedback list
        const filteredPendingData = pendingData.filter(assignment => {
          if (assignment.status === 'completed') {
            const hasUnseenFeedback = assignment.feedbacks?.some(feedback => !feedback.seen);
            // console.log(`Assignment ${assignment._id} (${assignment.status}): hasUnseenFeedback = ${hasUnseenFeedback}`);
            return hasUnseenFeedback;
          }
          // console.log(`Assignment ${assignment._id} (${assignment.status}): including in count`);
          return true;
        });

        // console.log('Assignments after filtering:', filteredPendingData.length);
        // console.log('Filtered assignments:', filteredPendingData);

        const finalCount = filteredPendingData.length;
        setPendingFeedbackCount(finalCount);
        // console.log('Final pending feedback count:', finalCount);
        
      } catch (feedbackError) {
        console.error('Error fetching pending feedback:', feedbackError);
        setPendingFeedbackCount(0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Failed to fetch dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use the optimized version for better performance
    fetchDataOptimized(currentPage);
  }, [currentPage, entriesPerPage]);

  // Debug: Log current applications state
  useEffect(() => {
    if (applications.length > 0) {
      // console.log('Current applications with assignment counts:', applications);
      const totalAssignments = applications.reduce((total, app) => total + (app.assignmentCount || 0), 0);
      // console.log('Total assignments across all applications:', totalAssignments);
    }
  }, [applications]);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  const totalAssignments = applications.reduce((total, app) => total + (app.assignmentCount || 0), 0);

  return (
    <div className="flex-1 space-y-4">
      {/* Applied Courses Table */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="block overflow-x-auto rounded-md border border-gray-300 max-md:hidden">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Intake</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Course Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((application) => (
                    <TableRow key={application._id}>
                      <TableCell>
                        {application.courseId?.name || 'Unnamed'}
                      </TableCell>
                      <TableCell>
                        {application.intakeId?.termName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {moment(application.createdAt).format('MM-DD-YYYY')}
                      </TableCell>
                     
                      <TableCell>
                        <Badge
                          className={clsx(
                            'capitalize text-white',
                            application.status === 'applied' && 'bg-blue-500',
                            application.status === 'approved' && 'bg-green-500',
                            application.status === 'cancelled' && 'bg-red-500'
                          )}
                        >
                          {application.status === 'approved'
                            ? 'Enrolled'
                            : application.status === 'cancelled'
                              ? 'Rejected'
                              : application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {application.status === 'approved' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/courses/${application.courseId._id}/unit`
                                    )
                                  }
                                  className="bg-watney text-white hover:bg-watney/90"
                                >
                                  <FileText className="h-4 w-4" /> View
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Course Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <>Not Available</>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-gray-500"
                    >
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Assignments Card */}
        <Card
          onClick={() => navigate('/dashboard/student-assignments')}
          className="cursor-pointer rounded-xl border border-gray-200 transition-all"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Total Assignments
            </CardTitle>
            <div className="rounded-full bg-blue-50 p-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-gray-900">
              {totalAssignments}
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Assignment Feedback */}
        <Card
          onClick={() => navigate('/dashboard/student-assignments-feedback')}
          className="cursor-pointer rounded-xl border border-gray-200 transition-all"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">
              Pending Assignment Submission Feedback
            </CardTitle>
            <div className="rounded-full bg-blue-50 p-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold text-gray-900">
              {pendingFeedbackCount}
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">
              Assignments awaiting your review
            </p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}