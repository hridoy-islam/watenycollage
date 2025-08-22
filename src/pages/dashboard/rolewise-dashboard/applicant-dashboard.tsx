

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
import { Briefcase, Building, Eye } from 'lucide-react';
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

interface ApplicantDashboardProps {
  user: {
    _id: string;
    name: string;
    role: string;
  };
}

export function ApplicantDashboard({ user }: ApplicantDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalApplication, setTotalApplication] = useState(10);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const [applicationRes, jobRes] = await Promise.all([
        axiosInstance.get(
          `/application-job?applicantId=${user._id}&page=${page}&limit=${limit}`
        ),
        axiosInstance.get(`/jobs?page=${page}&limit=${limit}`)
      ]);

      const appliedJobs = Array.isArray(applicationRes.data.data?.result)
        ? applicationRes.data.data.result
        : [];

      const allJobsData = Array.isArray(jobRes.data.data?.result)
        ? jobRes.data.data.result
        : [];

      const totalApplicationPages =
        applicationRes.data.data?.meta?.totalPage || 1;
      const totalJobPages = jobRes.data.data?.meta?.totalPage || 1;
      const totalApplication = jobRes.data.data?.meta?.total || 1;
      setTotalApplication(totalApplication);
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

 return (
   <div className="flex-1 space-y-4 p-4">
  {/* Stats Cards */}

  {/* Tabs */}
  <Tabs defaultValue="applied" className="space-y-4">
    <TabsList>
      <TabsTrigger value="applied">Jobs Applied</TabsTrigger>
      <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
    </TabsList>

    {/* Applied Jobs Tab */}
    <TabsContent value="applied" className="space-y-4 max-h-[96vh] overflow-y-auto"> 
      {loading ? (
        <BlinkingDots size="small" color="bg-white" />
      ) : applications.length > 0 ? (
        <>
          {/* Table for md+ screens */}
          <div className="hidden md:block overflow-x-auto max-w-full">
            <Card>
              <CardContent>
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead className='text-right'>Application Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell className="font-medium">
                          {application.jobId?.jobTitle || 'Unnamed Job'}
                        </TableCell>
                        <TableCell className='text-right'>
                          {application.jobId?.applicationDeadline
                            ? moment(application.jobId.applicationDeadline).format(
                                'MM-DD-YYYY'
                              )
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
          <div className="md:hidden space-y-4 max-h-[96vh] overflow-y-auto">
            {applications.map((application) => (
              <Card key={application._id}>
                <CardHeader>
                  <CardTitle>{application.jobId?.jobTitle || 'Unnamed Job'}</CardTitle>
                  <CardDescription>
                    Deadline:{" "}
                    {application.jobId?.applicationDeadline
                      ? moment(application.jobId.applicationDeadline).format('MM-DD-YYYY')
                      : 'N/A'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pagination for all screens */}
          <div className="mt-4 max-md:scale-75 w-full flex  max-md:justify-center">
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
        <p className="py-4 text-center text-gray-500">No applications found.</p>
      )}
    </TabsContent>

    {/* All Jobs Tab */}
    <TabsContent value="all-jobs" className="space-y-4 max-h-[96vh] overflow-y-auto">
      {loading ? (
        <BlinkingDots size="small" color="bg-white" />
      ) : allJobs.length > 0 ? (
        <>
          {/* Table for md+ screens */}
          <div className="hidden md:block overflow-x-auto max-w-full">
            <Card>
              <CardContent>
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Application Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allJobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">{job.jobTitle || 'Unnamed Job'}</TableCell>
                        <TableCell>
                          {job.applicationDeadline
                            ? moment(job.applicationDeadline).format('MM-DD-YYYY')
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
          <div className="md:hidden space-y-4 max-h-[96vh] overflow-y-auto">
            {allJobs.map((job) => (
              <Card key={job._id}>
                <CardHeader>
                  <CardTitle>{job.jobTitle || 'Unnamed Job'}</CardTitle>
                  <CardDescription>
                    Deadline: {job.applicationDeadline ? moment(job.applicationDeadline).format('MM-DD-YYYY') : 'N/A'}
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
          <div className="mt-4 max-md:scale-75 w-full flex max-md:justify-center">
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
        <p className="py-4 text-center text-gray-500">No jobs available at the moment.</p>
      )}
    </TabsContent>
  </Tabs>
</div>

  );
}
