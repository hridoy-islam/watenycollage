import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Eye } from 'lucide-react';
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

export default function NewApplicationListPage() {
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
      setInitialLoading(true);

      const params = {
        page,
        limit: entriesPerPage,
        ...(searchTerm && { searchTerm })
      };

      const response = await axiosInstance.get('/applications?seen=false', {
        params
      });

      const applicationsData = response.data.data.result;
      setApplications(applicationsData);
      setTotalPages(response.data.data.meta.totalPage);

      // Update each application as seen
      if (Array.isArray(applicationsData)) {
        const updateSeenPromises = applicationsData.map((application: any) =>
          axiosInstance.patch(`/applications/${application._id}`, {
            seen: true
          })
        );

        await Promise.allSettled(updateSeenPromises);
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

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Applications</h1>
        <Button
          className="bg-watney text-white hover:bg-watney/90 "
          onClick={() => navigate('/dashboard')}
        >
          {' '}
          <MoveLeft /> Back
        </Button>
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
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="">Course</TableHead>
                <TableHead className="">Intake</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell
                    onClick={() =>
                      navigate(`/dashboard/applications/${application._id}`)
                    }
                  >
                    {capitalize(application.personalDetailsData.title)}{' '}
                    {application?.personalDetailsData?.firstName}{' '}
                    {application?.personalDetailsData?.lastName}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(`/dashboard/applications/${application._id}`)
                    }
                  >
                    {capitalize(application.contactData.email)}{' '}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(`/dashboard/applications/${application._id}`)
                    }
                  >
                    {capitalize(application.contactData.contactNumber)}{' '}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(`/dashboard/applications/${application._id}`)
                    }
                  >
                    {capitalize(application.courseDetailsData.course)}{' '}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      navigate(`/dashboard/applications/${application._id}`)
                    }
                  >
                    {capitalize(application.courseDetailsData.intake)}{' '}
                  </TableCell>

                  <TableCell className="text-right">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyDocument(application)}
                    >
                      Copy Document
                    </Button>
                    <PDFGenerator application={application} /> */}

                    <div
                      className="cursor-pointer rounded-sm border border-gray-200 bg-white p-1 hover:bg-watney hover:text-white"
                      onClick={() =>
                        navigate(`/dashboard/applications/${application._id}`)
                      }
                    >
                      <Eye />
                    </div>
                  </TableCell>
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
