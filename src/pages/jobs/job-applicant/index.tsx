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
import { MoveLeft, ListTodo, History } from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';

// --- Interfaces ---

interface Applicant {
  _id?: string;
  title?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
  email?: string;
  // Progress Flags
  dbsDone?: boolean;
  medicalDone?: boolean;
  ecertDone?: boolean;
  bankDetailsDone?: boolean;
  checkListDone?: boolean;
}

interface CareerApplication {
  _id: string;
  applicantId?: Applicant;
  jobId?: {
    jobTitle?: string;
    createdAt?: string;
  };
  createdAt?: string;
}

export default function CareerApplicationsPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // --- State: Data & UI ---
  const [allApplications, setAllApplications] = useState<CareerApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [jobTitle, setJobTitle] = useState('');

  const fetchAllApplications = async (page: number, limit: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const [applicationsRes, jobRes] = await Promise.all([
        axiosInstance.get(`/application-job`, {
          params: {
            jobId: id,
            status: 'applied',
            page,
            limit
          }
        }),
        axiosInstance.get(`/jobs/${id}`)
      ]);

      const applicationsData = applicationsRes.data.data;
      setAllApplications(applicationsData.result || []);
      setTotalPages(applicationsData.meta.totalPage);
      setJobTitle(jobRes?.data?.data?.jobTitle || '');
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAllApplications(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage, id]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{jobTitle}</h2>
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('/dashboard/jobs')}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Table Container */}
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
                <TableHead>Applicant Email</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-center">Communication</TableHead>
                <TableHead className="text-right">Logs</TableHead>
                {/* <TableHead className="text-center">Migrate To PeoplePlanner</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map((app) => (
                <TableRow key={app._id}>
                  {/* Name */}
                  <TableCell className="font-medium">
                    <div>
                      <Link
                        to={`/dashboard/career-application/${app?._id}/${app.applicantId?._id}`}
                        className="underline"
                      >
                        <div className="text-blue-500">
                          {app.applicantId?.title} {app.applicantId?.firstName}{' '}
                          {app.applicantId?.initial} {app.applicantId?.lastName}
                        </div>
                      </Link>
                      {/* <span className="text-xs font-semibold text-gray-600">
                        {app.applicantId?.email ?? 'N/A'}
                      </span> */}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <Link
                        to={`/dashboard/career-application/${app?._id}/${app.applicantId?._id}`}
                    
                      >
                      <span className="text-sm font-semibold text-gray-600">
                        {app.applicantId?.email ?? 'N/A'}
                      </span>
                      </Link>
                     
                    </div>
                  </TableCell>

                  {/* Progress Button */}
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-watney hover:bg-watney hover:text-white"
                      onClick={() =>
                        navigate(
                          `/dashboard/career-application/${app._id}/${app.applicantId?._id}/progress`
                        )
                      }
                    >
                      <ListTodo className="h-4 w-4" />
                      Check
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/mail/${app.applicantId?._id}`
                                )
                              }
                            >
                              <ListTodo className="h-4 w-4 mr-2" /> Communication
                            </Button>
                  </TableCell>

                  {/* Logs View */}
                  <TableCell className="text-center">
                    <div className='flex justify-end'>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-watney hover:bg-watney hover:text-white"
                      onClick={() =>
                        navigate(
                          `/dashboard/career-application/${app?._id}/logs/${app.applicantId?._id}`
                        )
                      }
                      >
                      <History className=" h-4 w-4" /> View
                    </Button>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="mt-5">
            <DataTablePagination
              pageSize={entriesPerPage}
              setPageSize={setEntriesPerPage}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

    </div>
  );
}
