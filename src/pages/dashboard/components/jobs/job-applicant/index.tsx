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
import {
  Check,
  ClipboardPenLine,
  Eye,
  FilePlus,
  Mail,
  MoveLeft,
  Users
} from 'lucide-react';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface Applicant {
  _id?: string;
  email?: string;
  phone?: string;
  title?: string;
  firstName?: string;
  initial?: string;
  lastName?: string;
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
    applicationDeadline?: string;
    jobDetail?: string;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  seen?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CareerApplicationsPage() {
  const [allApplications, setAllApplications] = useState<CareerApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [recruitDialogOpen, setRecruitDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<CareerApplication | null>(null);
  const [recruitLoading, setRecruitLoading] = useState(false);
  const { toast } = useToast();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

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
      console.error('Error fetching applications or job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (id) {
      fetchAllApplications(currentPage, entriesPerPage);
    }
  }, [currentPage, entriesPerPage, id]);

  const handleRecruitClick = (application: CareerApplication) => {
    setSelectedApplication(application);
    setRecruitDialogOpen(true);
  };

  const confirmRecruit = async () => {
    if (!selectedApplication?._id) return;

    setRecruitLoading(true);
    try {
      await axiosInstance.patch(`/application-job/${selectedApplication._id}`, {
        status: 'recruit'
      });

      setAllApplications((prevApplications) =>
        prevApplications.filter((app) => app._id !== selectedApplication._id)
      );

      if (allApplications.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      toast({ title: 'Applicant has been successfully recruited' });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Failed to update application status. Please try again.';
      toast({
        title: message,
        className: 'bg-destructive text-white border-none'
      });
    } finally {
      setRecruitLoading(false);
      setRecruitDialogOpen(false);
      setSelectedApplication(null);
    }
  };

  const cancelRecruit = () => {
    setRecruitDialogOpen(false);
    setSelectedApplication(null);
  };

  // Helper to render check or empty box
  const renderStatusCell = (
    isDone?: boolean,
    type?: 'medical' | 'dbs' | 'ecert' | 'bank' | 'checklist',
    applicantId?: string
  ) => {
    if (!isDone) {
      return (
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 rounded border-2 border-gray-300 bg-white" />
        </div>
      );
    }

    const routeMap: Record<string, string> = {
      medical: `/dashboard/admin/medical-form/${applicantId}`,
      dbs: `/dashboard/admin/dbs-form/${applicantId}`,
      ecert: `/dashboard/admin/ecert-form/${applicantId}`,
      bank: `/dashboard/admin/bank-details/${applicantId}`,
      checklist: `/dashboard/admin/starter-checklist-form/${applicantId}`
    };

    return (
      <div className='flex flex-row items-center gap-2 cursor-pointer'         onClick={() => type && applicantId && navigate(routeMap[type])}
>

      <div
        className="flex h-5 w-5 cursor-pointer items-center justify-center rounded bg-watney"
        >
        <Check className="h-3.5 w-3.5 text-white" />
      </div>

      <div className='font-semibold'>

      view
      </div>
        </div>
    );
  };

  return (
    <div className="space-y-3">
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

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {loading ? (
          <div className="flex justify-end py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : allApplications.length === 0 ? (
          <div className="flex justify-end py-6 text-gray-500">
            No matching results found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead className="text-right">Medical Questioner</TableHead>
                <TableHead className="text-right">DBS</TableHead>
                <TableHead className="text-right">
                  Ecert Training Upload
                </TableHead>
                <TableHead className="text-right">Bank Details</TableHead>
                <TableHead className="text-right">Starter Checklist</TableHead>
                <TableHead className="text-right">Recruit</TableHead>
                <TableHead className="text-right">Referee</TableHead>
                <TableHead className="text-right">Interview</TableHead>
                <TableHead className="text-right">Mail</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>
                        {app.applicantId?.title} {app.applicantId?.firstName}{' '}
                        {app.applicantId?.initial} {app.applicantId?.lastName}
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {app.applicantId?.email ?? 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                 <TableCell>
  <div className="flex items-center justify-center">
    {renderStatusCell(
      app.applicantId?.medicalDone,
      'medical',
      app.applicantId?._id
    )}
  </div>
</TableCell>

<TableCell>
  <div className="flex items-center justify-center">
    {renderStatusCell(
      app.applicantId?.dbsDone,
      'dbs',
      app.applicantId?._id
    )}
  </div>
</TableCell>

<TableCell>
  <div className="flex items-center justify-center">
    {renderStatusCell(
      app.applicantId?.ecertDone,
      'ecert',
      app.applicantId?._id
    )}
  </div>
</TableCell>

<TableCell>
  <div className="flex items-center justify-center">
    {renderStatusCell(
      app.applicantId?.bankDetailsDone,
      'bank',
      app.applicantId?._id
    )}
  </div>
</TableCell>

<TableCell>
  <div className="flex items-center justify-center">
    {renderStatusCell(
      app.applicantId?.checkListDone,
      'checklist',
      app.applicantId?._id
    )}
  </div>
</TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() => handleRecruitClick(app)}
                              disabled={recruitLoading}
                            >
                              <FilePlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Recruit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/references/${app.applicantId?._id}`
                                )
                              }
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reference Details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
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
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/dashboard/career-application/${app?._id}/mail/${app.applicantId?._id}`
                                )
                              }
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send Mail</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="border-none bg-watney text-white hover:bg-watney/90"
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

        <DataTablePagination
          pageSize={entriesPerPage}
          setPageSize={setEntriesPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <AlertDialog open={recruitDialogOpen} onOpenChange={setRecruitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Recruitment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to recruit{' '}
              {selectedApplication?.applicantId?.firstName}{' '}
              {selectedApplication?.applicantId?.lastName}? Once confirmed, this
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelRecruit}
              disabled={recruitLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRecruit}
              disabled={recruitLoading}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {recruitLoading ? 'Processing...' : 'Confirm Recruit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
