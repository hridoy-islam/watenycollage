import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Plus,
  ChevronDown,
  FileText,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  ExternalLink,
  Calendar,
  User,
  Pen,
  MoveLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';
import  DynamicPagination  from '@/components/shared/DynamicPagination';

// Interface matching your Mongoose Model
interface IConsentForm {
  _id: string;
  userId: string;
  statementId: string;
  title: string;
  type: 'consent' | 'capacity';
  signatureOption: 'now' | 'later';
  signature?: string; // This is the document URL
  reviewPeriod?: string;
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConsentPage() {
  const { suid:id } = useParams(); // This is the userId
  const navigate = useNavigate();
  const [consentForms, setConsentForms] = useState<IConsentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const user = useSelector((state: any) => state.auth?.user) || null;
// Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  // Dialog State
  const [selectedRecord, setSelectedRecord] = useState<IConsentForm | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchConsentForms = async ( page: number,
    entriesPerPage: number,
    searchTerm = '') => {
    if (!id) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/consent-form?userId=${id}`, {
        params: {
    
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setTotalPages(res.data?.data?.totalPages || 1);
      if (res.data?.data?.result) {
        setConsentForms(res.data.data.result);
      }
      const userRes = await axiosInstance.get(`/users/${id}`);
      setUserData(userRes.data?.data || userRes.data);
    } catch (error) {
      console.error('Failed to fetch consent forms', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchConsentForms();
  }, [id]);

  // Helper to format review period text
  const formatPeriod = (period?: string) => {
    if (!period) return 'N/A';
    if (period === '3months') return '3 Months';
    if (period === '6months') return '6 Months';
    if (period === '1year') return '1 Year';
    return period;
  };

  // Handle Edit Navigation
  const handleEdit = (e: React.MouseEvent, form: IConsentForm) => {
    e.stopPropagation(); // Prevent row click from opening dialog

    if (form.type === 'capacity') {
      navigate(`capacity-form/${form._id}`);
    } else {
      navigate(`consent-form/${form._id}`);
    }
  };

  // Handle Row Click
  const handleRowClick = (form: IConsentForm) => {
    setSelectedRecord(form);
    setIsDialogOpen(true);
  };

  return (
    <div className="">
      <div className="mx-auto space-y-6">
         {user?.role === 'admin' && (
        <h1 className="text-xl font-medium">
          {userData?.title} {userData?.firstName} {userData?.lastName}
        </h1>
      )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Consent Forms
            </h1>
          </div>

          <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => window.history.back()}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {/* Add Consent Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className=" text-white ">
                Add New Form
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white text-black">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  to="add-consent-form"
                  className="flex w-full items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Consent Form
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  to="add-capacity-form"
                  className="flex w-full items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Capacity Form
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-lg  bg-white shadow-sm">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <BlinkingDots size="large" color="bg-theme" />
            </div>
          </div>
        ) : consentForms.length === 0 ? (
          // Empty State
          <Card className="border-dashed py-16 shadow-none">
            <CardContent className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                <FileText className="h-10 w-10 text-orange-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Forms Recorded</h3>
                <p className="mx-auto max-w-sm text-muted-foreground">
                  You haven't added any Consent or Capacity forms yet for this
                  user. Click the button above to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Data Table
          <div className="rounded-md border-none  bg-white p-4 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="">
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Signature Status</TableHead>
                  <TableHead>Review Period</TableHead>
                  <TableHead>Next Review</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consentForms.map((form) => (
                  <TableRow
                    key={form._id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => handleRowClick(form)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-gray-900">
                          {form.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${
                          form.type === 'capacity'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-purple-200 bg-purple-50 text-purple-700'
                        }`}
                      >
                        {form.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {form.signatureOption === 'now' ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Signed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            To Sign Later
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatPeriod(form.reviewPeriod)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {form.nextReviewDate ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {format(
                              new Date(form.nextReviewDate),
                              'dd MMM yyyy'
                            )}
                          </span>
                          {new Date(form.nextReviewDate) < new Date() && (
                            <AlertCircle
                              className="h-4 w-4 text-red-500"
                              title="Review Overdue"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" onClick={(e) => handleEdit(e, form)}>
                        <Pen className="h-5 w-5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {consentForms.length > 30 && (
              <div className='pt-4'>

                          <DynamicPagination
                            pageSize={entriesPerPage}
                            setPageSize={setEntriesPerPage}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            />
                            </div>
                        )}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                {selectedRecord?.title}
              </DialogTitle>
              <DialogDescription>
                Detailed information for this {selectedRecord?.type} record.
              </DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid gap-6 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Record Type
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {selectedRecord.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Created Date
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(selectedRecord.createdAt), 'PPP')}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Review Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Review Cycle
                    </span>
                    <p className="text-sm font-medium">
                      {formatPeriod(selectedRecord.reviewPeriod)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Next Review Due
                    </span>
                    <p
                      className={`text-sm font-medium ${selectedRecord.nextReviewDate && new Date(selectedRecord.nextReviewDate) < new Date() ? 'text-red-600' : ''}`}
                    >
                      {selectedRecord.nextReviewDate
                        ? format(new Date(selectedRecord.nextReviewDate), 'PPP')
                        : 'Not Set'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Signature Section */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <Edit className="h-4 w-4" /> Signature Status
                  </h4>

                  <div className="rounded-lg border bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      {selectedRecord.signatureOption === 'now' ? (
                        <Badge variant="default" className="bg-green-600">
                          Signed on File
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500 text-amber-600"
                        >
                          Pending / Sign Later
                        </Badge>
                      )}
                    </div>

                    {selectedRecord.signature ? (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2"
                          asChild
                        >
                          <a
                            href={selectedRecord.signature}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Attached Document
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs italic text-muted-foreground">
                        No document currently attached to this record.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={(e) => {
                      setIsDialogOpen(false);
                      handleEdit(e as any, selectedRecord);
                    }}
                  >
                    Edit Record
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
