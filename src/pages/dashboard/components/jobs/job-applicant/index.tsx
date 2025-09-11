import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Briefcase, ClipboardPenLine, Eye, MoveLeft } from 'lucide-react';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";



interface CareerApplication {
  _id: string;
  applicantId?: {
    name?: string;
    email?: string;
    title?: string;
    firstName?: string;
    initial?: string;
    lastName?: string;
  };
  jobId?: { jobTitle?: string };
}

export default function CareerApplicationsPage() {
  const [allApplications, setAllApplications] = useState<CareerApplication[]>([]);

  const [loading, setLoading] = useState(true);


  const [searchTerm, setSearchTerm] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const {id} = useParams();
  const navigate = useNavigate();


  const fetchAllApplications = async (page, entriesPerPage, searchTerm = "") => {
  setLoading(true);
  try {
    // Parallel API calls using Promise.all
    const [applicationsRes, jobRes] = await Promise.all([
      axiosInstance.get(`/application-job?jobId=${id}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {}),
        },
      }),
      axiosInstance.get(`/jobs/${id}`),
    ]);

    // Handle applications data
    const applicationsData = applicationsRes.data.data;
    setAllApplications(applicationsData.result || []);
    setTotalPages(applicationsData.meta.totalPage);

    setJobTitle(jobRes?.data?.data?.jobTitle);

  } catch (error) {
    console.error('Error fetching applications or job details:', error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAllApplications(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);



  // Handle Search
  const handleSearch = () => {
     fetchAllApplications(currentPage, entriesPerPage,searchTerm);
  }


return (
    <div className="space-y-6">
      {/* Header with Search + Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h2 className="text-xl font-bold">{jobTitle}</h2>
          {/* <div className="flex flex-col items-start gap-4 sm:flex-row">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Applicant Name, Email or Job Title"
              className="w-full sm:w-[350px] h-8"
            />
            <Button
              size="sm"
              className="bg-watney w-[100px] text-white hover:bg-watney/90"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div> */}
        </div>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard/jobs')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Unified Table Container */}
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : allApplications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead className="w-32 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    {app.applicantId?.title} {app.applicantId?.firstName}{' '}
                    {app.applicantId?.initial} {app.applicantId?.lastName}
                  </TableCell>
                  <TableCell>{app.applicantId?.email ?? 'N/A'}</TableCell>
                  <TableCell>{app.jobId?.jobTitle ?? 'N/A'}</TableCell>


<TableCell className="text-center">
  <div className="flex flex-row gap-4">
    {/* Interview Button */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-watney hover:bg-watney/90 text-white border-none"
            size="icon"
            onClick={() =>
              navigate(
                `/dashboard/career-application/${app?._id}/${app.applicantId?._id}/interview`
              )
            }
          >
            <ClipboardPenLine className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Interview</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    {/* View Details Button */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="bg-watney hover:bg-watney/90 text-white border-none"
            size="icon"
            onClick={() =>
              navigate(
                `/dashboard/career-application/${app?._id}/${app.applicantId?._id}`
              )
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View Details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}