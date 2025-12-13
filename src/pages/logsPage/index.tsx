import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { MoveLeft, Activity } from 'lucide-react'; // Added Activity icon for visual
import axiosInstance from '@/lib/axios';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';

function ApplicantLogsPage() {
  const navigate = useNavigate();
  const { userId } = useParams(); // Assuming route is /student/:userId/logs
  
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [studentName, setStudentName] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  const fetchStudentLogs = async (page: number, limit: number) => {
    if (!userId) return;
    setLoadingLogs(true);
    try {
      // Assumes your backend has an endpoint like GET /logs
      const res = await axiosInstance.get(`/logs`, {
        params: {
          userId,
          page,
          limit,
          sort: '-createdAt'
        }
      });

      const result = res.data.data.result || [];
      
      
      if (result.length > 0 && result[0].userId?.name) {
        setStudentName(result[0].userId.name);
      }

      const formattedLogs = result.map((log: any) => ({
        id: log._id,
        action: log.action,
        // Using createdAt from the timestamps: true in your model
        createdAt: moment(log.createdAt).format('DD MMM, YYYY'), 
      }));

      setLogs(formattedLogs);
      setTotalPages(res.data.data.meta?.totalPage || 1);
    } catch (error) {
      console.error('Failed to fetch student logs:', error);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchStudentLogs(currentPage, entriesPerPage);
  }, [userId, currentPage, entriesPerPage]);

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
           <Activity className="h-6 w-6 text-watney" />
           {studentName ? `${studentName}'s` : 'Applicant'} Activity Logs
        </h2>
        
        <Button
          className="bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate(-1)}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Content Section */}
      <div className="rounded-lg bg-white p-4 shadow-lg">
        {loadingLogs ? (
          <div className="flex justify-center py-12">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : logs.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Action</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {log.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

           {logs.length > 20 &&  ( <div className="mt-4">
                <DataTablePagination
                  pageSize={entriesPerPage}
                  setPageSize={setEntriesPerPage}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
            </div>)}
           
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Activity className="h-12 w-12 opacity-20 mb-2" />
            <p>No activity logs found for this applicant.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantLogsPage;