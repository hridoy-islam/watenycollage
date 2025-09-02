import { useEffect, useState } from 'react';
import { Plus, Pen, CopyCheck, CopyIcon, MoveLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import PDFGenerator from './components/PDFGenerator';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/shared/loader';
import moment from 'moment';

export default function ApplicationListPage() {
  const [applications, setApplications] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);

  const fetchData = async (
    page: number,
    entriesPerPage: number,
    searchTerm = ''
  ) => {
    try {
      const params: any = {
        page,
        limit: entriesPerPage,
        ...(searchTerm && { searchTerm })
      };

      let endpoint = '';

      if (user?.role === 'student') {
        endpoint = `/application-course?studentId=${user._id}`;
      } else if (user?.role === 'applicant') {
        endpoint = `/application-job?applicantId=${user._id}`;
      }

      if (initialLoading) setInitialLoading(true);

      const response = await axiosInstance.get(endpoint, { params });

      const applicationsData = response.data.data.result;
      setApplications(applicationsData);
      setTotalPages(response.data.data.meta.totalPage);

      if (user?.role === 'admin' && Array.isArray(applicationsData)) {
        const seenUpdatePromises = applicationsData.map((application: any) =>
          axiosInstance.patch(`/applications/${application._id}`, {
            seen: true
          })
        );
        await Promise.allSettled(seenUpdatePromises);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  const navigate = useNavigate();

  const handleRoute = () => {
    navigate('/dashboard/resume-upload');
  };

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  console.log(applications);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Applications</h1>
        <div className="flex items-center gap-2">
          <Button
            className="bg-watney text-white hover:bg-watney/90 "
            onClick={() => navigate('/dashboard')}
          >
            {' '}
            <MoveLeft /> Back
          </Button>
          {/* <Button className='bg-watney text-white hover:bg-watney/90 '  onClick={handleRoute}>New Application</Button> */}
        </div>
      </div>
      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading ? (
          <div className="flex justify-center py-6">
            <Loader />{' '}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {user.role === 'admin' && <TableHead>Full Name</TableHead>}
                {user.role === 'admin' && <TableHead>Email</TableHead>}
                {user.role === 'admin' && <TableHead>Phone</TableHead>}
                {(user.role === 'applicant' ||
                  user.role === 'admin') && (
                    <TableHead className="">Job Title</TableHead>
                  )}
                {(user.role === 'applicant' ||
                  user.role === 'admin') && (
                    <TableHead className="">Application Deadline</TableHead>
                  )}
                
                {(user.role === 'student' ||
                  user.role === 'admin') && (
                    <TableHead className="">Course</TableHead>
                  )}
                {(user.role === 'student' ||
                user.role === 'admin') && (
                    <TableHead className="">Intake</TableHead>
                  )}
                {user.role === 'admin' && (
                  <TableHead className="text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id}>
                  {user.role === 'admin' && (
                    <TableCell
                      // onClick={() =>
                      //   navigate(`/dashboard/applications/${application._id}`)
                      // }
                    >
                      {capitalize(application.applicantId.title)}{' '}
                      {application?.applicantId.firstName}{' '}
                      {application?.applicantId.lastName}
                    </TableCell>
                  )}
                  {user.role === 'admin' && (
                    <TableCell
                      // onClick={() =>
                      //   navigate(`/dashboard/applications/${application._id}`)
                      // }
                    >
                      {capitalize(application?.applicantId.email)}{' '}
                    </TableCell>
                  )}
                  {user.role === 'admin' && (
                    <TableCell
                      // onClick={() =>
                      //   navigate(`/dashboard/applications/${application._id}`)
                      // }
                    >
                      {capitalize(application.phone)}{' '}
                    </TableCell>
                  )}

                  {(user.role === 'applicant' || user.role === 'admin') && (
                    <TableCell
                      // onClick={() =>
                      //   navigate(`/dashboard/applications/${application._id}`)
                      // }
                    >
                      {capitalize(application.jobId?.jobTitle)}{' '}
                    </TableCell>
                  )}
                  {(user.role === 'applicant' || user.role === 'admin') && (
                    <TableCell
                      // onClick={() =>
                      //   navigate(`/dashboard/applications/${application._id}`)
                      // }
                    >
                      {moment(application.jobId?.applicationDeadline).format(
                        'MM-DD-YYYY'
                      )}{' '}
                    </TableCell>
                  )}
                  {(user.role === 'student' ||
                  user.role === 'admin') && (
                    <TableCell>
                       {capitalize(application.courseId?.name)}{' '}
                    </TableCell>
                  )}
                  {(user.role === 'student' ||
                  user.role === 'admin') && (
                    <TableCell>
                       {capitalize(application.intakeId?.termName)}{' '}
                    </TableCell>
                  )}

                  {user.role === 'admin' && (
                    <TableCell className="flex flex-row items-center justify-end gap-2 text-right">
                      {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDocument(application)}
                    >
                      <CopyIcon className='w-4'/>
                      Copy
                    </Button> */}
                      <div
                        className="cursor-pointer rounded-sm  bg-watney px-2 py-[6px] text-white hover:bg-watney/90 hover:text-white"
                        onClick={() =>
                          navigate(`/dashboard/applications/${application._id}`)
                        }
                      >
                        <Eye className="w-5 " />
                      </div>

                      <PDFGenerator application={application} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
