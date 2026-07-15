import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import {
  Plus,
  Pen,
  Trash2,
  ArrowLeft,
  User,
  Stethoscope,
  Briefcase,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import DynamicPagination from '@/components/shared/DynamicPagination';
import moment from 'moment';

type ContractType = 'GP' | 'Personal' | 'Professional';

const contractTypeMeta: Record<
  ContractType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  GP: {
    label: 'GP',
    icon: <Stethoscope className="h-3.5 w-3.5" />,
    color: 'bg-blue-100 text-blue-800'
  },
  Personal: {
    label: 'Personal',
    icon: <User className="h-3.5 w-3.5" />,
    color: 'bg-green-100 text-green-800'
  },
  Professional: {
    label: 'Professional',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    color: 'bg-purple-100 text-purple-800'
  }
};

const contractTypeOrder: ContractType[] = ['GP', 'Personal', 'Professional'];

export default function ServiceUserEmergencyContractPage() {
  const { sid } = useParams<{ sid: string }>();
  const [userName, setUserName] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(1000);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!sid) return;
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${sid}`);
        const user = res.data?.data;
        if (user) {
          setUserName(
            `${user.title || ''} ${user.firstName || ''} ${user.lastName || ''}`.trim()
          );
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [sid]);

  useEffect(() => {
    if (!sid) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/serviceuser-emergency-contract', {
          params: { serviceUserId: sid, page: currentPage, limit: entriesPerPage }
        });
        setContracts(res.data?.data?.result || []);
        setTotalPages(res.data?.data?.meta?.totalPage || 1);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sid, currentPage, entriesPerPage]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/serviceuser-emergency-contract/${deletingId}`);
      setContracts((prev) => prev.filter((c) => c._id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getContractName = (item: any) => {
    return item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || '—';
  };

  // Group and sort contracts by type
  const getGroupedContracts = () => {
    const grouped: { type: ContractType; meta: typeof contractTypeMeta[ContractType]; contracts: any[] }[] = [];
    
    contractTypeOrder.forEach((type) => {
      const typeContracts = contracts.filter((c) => c.contractType === type);
      if (typeContracts.length > 0) {
        grouped.push({
          type,
          meta: contractTypeMeta[type],
          contracts: typeContracts
        });
      }
    });
    
    return grouped;
  };

  const groupedData = getGroupedContracts();

  return (
    <div className="w-full max-w-none">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="border-gray-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold text-black">
                  {userName
                    ? `${userName}'s Emergency Contracts`
                    : 'Emergency Contracts'}
                </CardTitle>
                <CardDescription className="mt-1 text-black">
                  Manage emergency contacts and important people
                </CardDescription>
              </div>
            </div>
            <Link to="create">
              <Button className="text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Emergency Contract
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <BlinkingDots size="large" color="bg-watney" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <User className="mb-4 h-16 w-16" />
              <p className="text-lg font-medium">No emergency contracts added yet.</p>
              <p className="mt-1 text-sm">
                Click "Add Emergency Contract" to get started.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-32 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedData.map((group) => (
                    <>
                     
                      
                      {/* Contract Rows */}
                      {group.contracts.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">
                            {getContractName(item)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`inline-flex items-center gap-1 ${group.meta.color}`}>
                              {group.meta.icon}
                              {group.meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {item.createdAt
                                ? moment(item.createdAt).format('DD/MM/YYYY')
                                : '—'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Link to={`${item._id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="bg-watney text-white hover:bg-watney/90"
                                >
                                  <Pen className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-red-500 text-white hover:bg-red-600"
                                onClick={() => handleDeleteClick(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="mt-5">
                  <DynamicPagination
                    pageSize={entriesPerPage}
                    setPageSize={setEntriesPerPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this emergency contract. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}