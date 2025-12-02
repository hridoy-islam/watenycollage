import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Briefcase,
  Building,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'; // Added icons for status
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// Types
interface Job {
  _id: string;
  jobTitle: string;
  applicationDeadline: string | Date;
}

interface Application {
  _id: string;
  jobId: Job;
}

interface UserData {
  _id: string;
  name: string;
  role: string;
  dbsDone: boolean;
  medicalDone: boolean;
  ecertDone: boolean;
  bankDetailsDone: boolean;
  checkListDone: boolean;
}

interface ApplicantDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

interface TaskItemProps {
  title: string;
  isCompleted: boolean;
  navigateTo: string; // The route to navigate to for completion
}

const TaskItem: React.FC<TaskItemProps> = ({
  title,
  isCompleted,
  navigateTo
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (!isCompleted) {
      navigate(navigateTo);
    }
  };

  return (
    <div className="flex items-center justify-between p-6 ">
      <div className="flex items-center space-x-2">
        <div className="flex h-6 w-6 items-center justify-center">
          {isCompleted ? (
            <CheckCircle className="h-full w-full stroke-[2.5] text-green-500" />
          ) : (
            <Clock className="h-full w-full stroke-[2.5] text-yellow-500" />
          )}
        </div>

        <span
          className={`text-lg font-medium ${isCompleted ? 'text-green-500 ' : 'text-gray-800'}`}
        >
          {title}
        </span>
      </div>
      <Button
        variant={isCompleted ? 'outline' : 'default'}
        // disabled={isCompleted}
        onClick={isCompleted ? undefined : handleAction}
        className={
          isCompleted
            ? 'border-green-500 bg-green-500 text-white hover:bg-green-500'
            : 'bg-watney text-white hover:bg-watney/90'
        }
      >
        {isCompleted ? 'Completed' : `Let's Go`}
      </Button>
    </div>
  );
};

export function ApplicantDashboard({ user }: ApplicantDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplication, setTotalApplication] = useState(10);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const [applicationRes, jobRes, userRes] = await Promise.all([
        axiosInstance.get(
          `/application-job?applicantId=${user._id}&page=${page}&limit=${limit}`
        ),
        axiosInstance.get(`/jobs?page=${page}&limit=${limit}`),
        axiosInstance.get(`/users/${user._id}`)
      ]);

      const appliedJobs = Array.isArray(applicationRes.data.data?.result)
        ? applicationRes.data.data.result
        : [];

      const allJobsData = Array.isArray(jobRes.data.data?.result)
        ? jobRes.data.data.result
        : [];

      setUserData(userRes?.data?.data);

      const totalApplicationPages =
        applicationRes.data.data?.meta?.totalPage || 1;
      const totalJobPages = jobRes.data.data?.meta?.totalPage || 1;
      const totalApplicationCount = jobRes.data.data?.meta?.total || 1;
      setTotalApplication(totalApplicationCount);
      setApplications(appliedJobs);
      setTotalPages(Math.max(totalApplicationPages, totalJobPages));

      // Get applied job IDs
      const appliedJobIds = new Set(
        appliedJobs.map((app: Application) => app.jobId._id)
      );

      // Filter out applied jobs
      const availableJobs = allJobsData.filter(
        (job: Job) => !appliedJobIds.has(job._id)
      );

      setAllJobs(availableJobs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage, user._id]);

  const handleApply = (jobId: string) => {
    navigate(`/dashboard/job-application/${jobId}`);
  };

  const TaskStatusCard: React.FC<{ userData: UserData | null }> = ({
    userData
  }) => {
    const tasks = [
      {
        title: 'Complete Your Medical Questionnaire',
        key: 'medicalDone',
        navigateTo: `medical-form/${user?._id}`
      },
      {
        title: 'Complete Your DBS',
        key: 'dbsDone',
        navigateTo: `dbs-form/${user?._id}`
      },
      {
        title: 'Upload Your Ecert Training certificates',
        key: 'ecertDone',
        navigateTo: `ecert-form/${user?._id}`
      },
      {
        title: 'Complete Your Bank Details',
        key: 'bankDetailsDone',
        navigateTo: `bank-details/${user?._id}`
      },
      {
        title: 'Complete Your Starter Checklist',
        key: 'checkListDone',
        navigateTo: `starter-checklist-form/${user?._id}`
      }
    ];

    return (
      <Card className="">
        <CardContent className="p-0">
          <div className="space-y-0 divide-y divide-gray-100">
            {tasks?.map((task) => (
              <TaskItem
                key={task?.key}
                title={task?.title}
                isCompleted={userData[task.key as keyof UserData] as boolean} // Type assertion for dynamic key
                navigateTo={task.navigateTo}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !userData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-watney" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TaskStatusCard userData={userData} />
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="applied" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
              <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
            </TabsList>

            {/* Applied Jobs Tab */}
            <TabsContent
              value="applied"
              className="max-h-[96vh] space-y-4 overflow-y-auto"
            >
              {applications?.length > 0 ? (
                <>
                  {/* Table for md+ screens */}
                  <div className="hidden max-w-full overflow-x-auto md:block">
                    <Card>
                      <CardContent>
                        <Table className="">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Title</TableHead>
                              <TableHead className="text-right">
                                Application Deadline
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {applications?.map((application) => (
                              <TableRow key={application._id}>
                                <TableCell className="font-medium">
                                  {application.jobId?.jobTitle || 'Unnamed Job'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {application.jobId?.applicationDeadline
                                    ? moment(
                                        application.jobId.applicationDeadline
                                      ).format('DD MMM YYYY')
                                    : 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cards for small screens */}
                  <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
                    {applications.map((application) => (
                      <Card key={application._id}>
                        <CardHeader>
                          <CardTitle>
                            {application.jobId?.jobTitle || 'Unnamed Job'}
                          </CardTitle>
                          <CardDescription>
                            Deadline:{' '}
                            {application.jobId?.applicationDeadline
                              ? moment(
                                  application.jobId.applicationDeadline
                                ).format('MM-DD-YYYY')
                              : 'N/A'}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination for all screens */}
                  {/* <div className="mt-4 flex w-full max-md:scale-75 max-md:justify-center">
                    <DataTablePagination
                      pageSize={entriesPerPage}
                      setPageSize={setEntriesPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div> */}
                </>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No applications found.
                </p>
              )}
            </TabsContent>

            {/* All Jobs Tab */}
            <TabsContent
              value="all-jobs"
              className="max-h-[96vh] space-y-4 overflow-y-auto"
            >
              {loading ? (
                <BlinkingDots size="small" color="bg-gray-800" />
              ) : allJobs.length > 0 ? (
                <>
                  {/* Table for md+ screens */}
                  <div className="hidden max-w-full overflow-x-auto md:block">
                    <Card>
                      <CardContent>
                        <Table className="min-w-[700px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job Title</TableHead>
                              <TableHead>Application Deadline</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allJobs.map((job) => (
                              <TableRow key={job._id}>
                                <TableCell className="font-medium">
                                  {job.jobTitle || 'Unnamed Job'}
                                </TableCell>
                                <TableCell>
                                  {job.applicationDeadline
                                    ? moment(job.applicationDeadline).format(
                                        'MM-DD-YYYY'
                                      )
                                    : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    className="bg-watney text-white hover:bg-watney/90"
                                    onClick={() => handleApply(job._id)}
                                  >
                                    Apply
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cards for small screens */}
                  <div className="max-h-[96vh] space-y-4 overflow-y-auto md:hidden">
                    {allJobs.map((job) => (
                      <Card key={job._id}>
                        <CardHeader>
                          <CardTitle>{job.jobTitle || 'Unnamed Job'}</CardTitle>
                          <CardDescription>
                            Deadline:{' '}
                            {job.applicationDeadline
                              ? moment(job.applicationDeadline).format(
                                  'MM-DD-YYYY'
                                )
                              : 'N/A'}
                          </CardDescription>
                          <div className="mt-2 text-right">
                            <Button
                              size="sm"
                              className="bg-watney text-white hover:bg-watney/90"
                              onClick={() => handleApply(job._id)}
                            >
                              Apply
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination for all screens */}
                  <div className="mt-4 flex w-full max-md:scale-75 max-md:justify-center">
                    <DataTablePagination
                      pageSize={entriesPerPage}
                      setPageSize={setEntriesPerPage}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No jobs available at the moment.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
