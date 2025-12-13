/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
  MoveLeft,
  Pen,
  Check,
  FileQuestion,
  FileJson,
  FileBadge,
  File,
  FileText,
  Trash,
  Eye
} from 'lucide-react';
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
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EcertPdf from './components/ecertPdf';
interface TEcert {
  _id?: string;
  title: string;
  status: 'active' | 'block';
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminEcertsPage() {
  const [ecerts, setEcerts] = useState<TEcert[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const navigate = useNavigate();

  const { id } = useParams();
  const fetchData = async (
    page: number,
    entriesPerPage: number,
    searchTerm: string = ''
  ) => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/ecert-form?userId=${id}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setEcerts(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching ecerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Ecert data.',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="font-semibold">
            Applicant Name: {ecerts[0]?.userId?.firstName}{' '}
            {ecerts[0]?.userId?.initial || ''}{' '}
            {ecerts[0]?.userId?.lastName || ''}{' '}
          </h1>
        </div>

        {/* ✅ ONLY "Back" button — NO "Add Ecert" */}
        <div className="flex flex-row items-center gap-4">
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate(-1)}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            className="border-none bg-watney text-white hover:bg-watney/90"
            onClick={() => navigate('edit')}
          >
            <Pen className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-2xl">
        {initialLoading && ecerts.length === 0 ? (
          <div className="flex justify-center py-6">
            <BlinkingDots size="large" color="bg-watney" />
          </div>
        ) : ecerts.length === 0 ? (
          <div className="flex justify-center py-6 text-gray-500">
            No Ecert records found.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="min-w-[300px]">Ecert Title</TableHead>

                  <TableHead className="w-32 text-right">View Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ecerts.map((ecert) => (
                  <TableRow key={ecert._id}>
                    <TableCell className="font-medium text-gray-800">
                      <span className="line-clamp-2">
                        {ecert.ecertId?.title}
                      </span>
                    </TableCell>

                    {/* Optional: Disable or remove action buttons */}
                    <TableCell className="space-x-3 text-center">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  if (ecert.document) {
                                    window.open(ecert.document, '_blank'); // Opens document in a new tab
                                  } else {
                                    toast({
                                      title: 'No Document',
                                      description:
                                        'No document available for this ecert.',
                                      className:
                                        'bg-red-500 border-none text-white'
                                    });
                                  }
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Document
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {ecerts.length > 50 && (
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* ❌ Removed EcertDialog and delete confirmation dialog */}
    </div>
  );
}
