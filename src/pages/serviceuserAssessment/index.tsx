import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Search, Eye, Trash2, Pen, UserPlus } from 'lucide-react';
import moment from 'moment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import DynamicPagination from '@/components/shared/DynamicPagination';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

const PENDING_ASSESSMENT_KEY = 'pendingServiceUserAssessmentId';

export default function ServiceUserAssessmentPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const navigate = useNavigate();

  const fetchAssessments = async (search?: string) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: currentPage, limit: entriesPerPage };
      if (search) params.searchTerm = search;
      const res = await axiosInstance.get('/serviceuser-assessment', {
        params
      });
      setAssessments(res.data?.data?.result || []);
      setTotalPages(res.data?.data?.meta?.totalPage || 1);
    } catch {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [currentPage, entriesPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAssessments(searchTerm);
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/serviceuser-assessment/${id}`);
      toast.success('Assessment deleted');
      fetchAssessments();
    } catch {
      toast.error('Failed to delete assessment');
    }
  };

  const handleMakeServiceUser = (assessmentId: string) => {
    localStorage.setItem(PENDING_ASSESSMENT_KEY, assessmentId);
    navigate('/dashboard/people-planner/create-serviceuser');
  };

  return (
    <div className="space-y-6 rounded-md bg-white p-6 shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">Service User Assessments</h1>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              className="min-w-[300px] rounded-xl border px-3 py-1"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              className="bg-watney text-white hover:bg-watney/90"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
        <Button
          className="flex gap-2 bg-watney text-white hover:bg-watney/90"
          onClick={() => navigate('create')}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Assessment
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Assessor</TableHead>
            <TableHead>Date of Assessment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center">
                <BlinkingDots size="large" color="bg-watney" />
              </TableCell>
            </TableRow>
          ) : assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                No matching records found.
              </TableCell>
            </TableRow>
          ) : (
            assessments.map((assessment) => (
              <TableRow key={assessment._id}>
                <TableCell className='cursor-pointer' onClick={() => navigate(`${assessment._id}`)}>
                  {assessment.serviceUserIdNumber || 'N/A'}
                </TableCell>
                <TableCell
                  className="font-medium cursor-pointer"
                  onClick={() => navigate(`${assessment._id}`)}
                >
                  {assessment.myName || '—'}
                </TableCell>
                <TableCell className='cursor-pointer' onClick={() => navigate(`${assessment._id}`)}>
                  {assessment.assessorName || '—'}
                </TableCell>
                <TableCell>
                  {assessment.dateOfAssessment
                    ? moment(assessment.dateOfAssessment).format('DD/MM/YYYY')
                    : '—'}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!assessment.isServiceUser && (
                      <Button
                      size={'sm'}
                        onClick={() => handleMakeServiceUser(assessment._id)}
                        className="bg-watney h-9 rounded-md text-white hover:bg-watney/90"
                        title="Create a service user from this assessment"
                      >
                        Make Service User
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`${assessment._id}`)}
                      className="bg-watney text-white hover:bg-watney/90"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`${assessment._id}/edit`)}
                      className="bg-watney text-white hover:bg-watney/90"
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this assessment?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              assessment._id && handleDelete(assessment._id)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <>
          <DynamicPagination
            pageSize={entriesPerPage}
            setPageSize={setEntriesPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
